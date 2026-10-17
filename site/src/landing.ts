import "../../live-deck/web/src/styles/base.css";
import "../../live-deck/web/src/styles/stage.css";
import "../../live-deck/web/src/styles/chrome.css";
import "./site.css";
import "./landing.css";
import { answers, deck, joinUrl, qrSvg } from "virtual:demo-deck";
import type { PublicDeck } from "../../live-deck/shared/deck-core.ts";
import type { PersistentEffect } from "../../live-deck/shared/effects.ts";
import { nextPosition, prevPosition, type Position } from "../../live-deck/shared/nav.ts";
import type { QuizView } from "../../live-deck/shared/protocol.ts";
import { PRESET_NAMES, type PresetName } from "../../live-deck/shared/themes.ts";
import { StageView } from "../../live-deck/web/src/render/stage-view.ts";
import { icon } from "../../live-deck/web/src/ui/icons.ts";
import { createReactionBar, floatReactions } from "../../live-deck/web/src/ui/reactions.ts";
import { bindCopyButtons } from "./copy.ts";

const $ = <T extends HTMLElement = HTMLElement>(sel: string, root: ParentNode = document) => root.querySelector<T>(sel)!;
const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

bindCopyButtons(document);
mountSession();
mountFileSection();

/* ---------------------------------------------------------------------------
 * Hero: one simulated session. The program monitor and the phone are two real
 * StageViews over the same public deck; the phone follows unless it explores.
 * ------------------------------------------------------------------------- */
function mountSession() {
  const console_ = $("#demo");
  const lamp = $("[data-role=lamp]", console_);
  const phoneLamp = $("[data-role=phone-lamp]", console_);
  const position = $("[data-role=position]", console_);
  const audience = $("[data-role=audience]", console_);
  const hint = $("[data-role=hint]", console_);
  const panel = $("[data-role=phone-panel]", console_);
  const nextKey = $<HTMLButtonElement>("[data-action=next]", console_);
  const prevKey = $<HTMLButtonElement>("[data-action=prev]", console_);
  const focusKey = $<HTMLButtonElement>("[data-action=focus]", console_);
  const zoomKey = $<HTMLButtonElement>("[data-action=zoom]", console_);
  const revealKey = $<HTMLButtonElement>("[data-action=reveal]", console_);
  const liveKey = $<HTMLButtonElement>("[data-mode=live]", console_);
  const exploreKey = $<HTMLButtonElement>("[data-mode=explore]", console_);
  prevKey.innerHTML = icon("prev");

  const opts = { joinUrl, qrSvg };
  const program = new StageView($("[data-role=program]", console_), deck, opts);
  const phone = new StageView($("[data-role=phone-stage]", console_), deck, opts);
  const floaters = Object.assign(document.createElement("div"), { className: "floaters" });
  $("[data-role=phone-stage]", console_).append(floaters);

  let onAir = false;
  let live = { slide: 0, step: 0 } as Position;
  let mine: Position = live;
  let exploring = false;
  let reached = 0;
  let effect: PersistentEffect | null = null;
  // Simulated room: votes arrive over a few seconds; the visitor is one more phone.
  const quiz = { view: null as QuizView | null, myVote: undefined as number | undefined, timer: 0 };

  const slideAt = (p: Position) => deck.slides[p.slide]!;
  const isQuiz = (p: Position) => slideAt(p).layout === "quiz";

  function setLamp(on: boolean) {
    lamp.dataset.state = on ? "on" : "standby";
    lamp.textContent = on ? "Al aire" : "En espera";
    phoneLamp.dataset.state = !on ? "off" : exploring ? "off" : "on";
    phoneLamp.textContent = !on ? "Sin señal" : exploring ? "Explorando" : "En vivo";
  }

  function paint() {
    program.show(live);
    program.setEffect(effect);
    program.setQuiz(isQuiz(live) ? quiz.view : null, { presenter: true });
    position.textContent = `${live.slide + 1} / ${deck.slides.length}`;
    prevKey.disabled = !onAir || (live.slide === 0 && live.step === 0);
    const last = nextPosition(deck.slides, live);
    nextKey.disabled = onAir && last.slide === live.slide && last.step === live.step;
    revealKey.hidden = !isQuiz(live);
    revealKey.disabled = !quiz.view || quiz.view.status === "revealed";
    const hasTargets = slideAt(live).elements.length > 0;
    focusKey.disabled = zoomKey.disabled = !onAir || !hasTargets;
    focusKey.setAttribute("aria-pressed", String(effect?.kind === "focus"));
    zoomKey.setAttribute("aria-pressed", String(effect?.kind === "zoom"));

    if (!exploring) mine = live;
    phone.show(mine);
    phone.setEffect(exploring ? null : effect);
    phone.setQuiz(isQuiz(mine) ? quiz.view : null, { myVote: quiz.myVote });
    liveKey.setAttribute("aria-pressed", String(!exploring));
    exploreKey.setAttribute("aria-pressed", String(exploring));
    exploreKey.disabled = !onAir;
    setLamp(onAir);
    paintPanel();
  }

  /* Phone panel: vote keys on a quiz, explore nav while exploring, reactions otherwise. */
  const reactions = createReactionBar((i) => floatReactions(floaters, deckReactions(i)));
  const deckReactions = (i: number) => [0, 1, 2, 3, 4, 5].map((k) => (k === i ? 1 : 0));

  function paintPanel() {
    panel.replaceChildren();
    if (exploring) {
      const back = button("key key-icon", icon("prev"), "Anterior", () => browse(-1));
      const fwd = button("key key-icon", icon("next"), "Siguiente", () => browse(1));
      const ret = button("key key-onair phone-return", "Volver al aire", undefined, () => setExploring(false));
      back.disabled = mine.slide === 0;
      fwd.disabled = mine.slide >= reached;
      panel.append(row("phone-explore", back, ret, fwd));
      return;
    }
    if (isQuiz(mine) && quiz.view) {
      const q = slideAt(mine).quiz!;
      const view = quiz.view;
      const list = row("phone-votes");
      q.options.forEach((label, i) => {
        const b = document.createElement("button");
        b.type = "button";
        b.className = "vote";
        b.setAttribute("aria-pressed", String(quiz.myVote === i));
        b.disabled = view.status !== "open";
        if (view.status === "revealed") b.classList.add(i === view.correctIndex ? "is-correct" : quiz.myVote === i ? "is-wrong" : "is-other");
        const share = view.counts && view.total ? `${Math.round((view.counts[i]! / view.total) * 100)}%` : "";
        b.innerHTML = `<span class="vote-key">${String.fromCharCode(65 + i)}</span><span>${escapeText(label)}</span><span class="vote-share">${share}</span>`;
        b.addEventListener("click", () => vote(i));
        list.append(b);
      });
      panel.append(list);
      return;
    }
    reactions.setEnabled(onAir);
    panel.append(reactions.el);
  }

  function goLive() {
    onAir = true;
    document.body.dataset.onair = "";
    nextKey.className = "key key-primary transport-main";
    nextKey.textContent = "Next";
    hint.textContent = "Click the slide to ripple on every screen";
    audience.textContent = "38";
    paint();
  }

  function move(to: Position) {
    if (to.slide !== live.slide) {
      effect = null;
      stopQuiz();
    }
    live = to;
    reached = Math.max(reached, live.slide);
    if (isQuiz(live) && !quiz.view) startQuiz(live);
    paint();
  }

  function startQuiz(p: Position) {
    const s = slideAt(p);
    const n = s.quiz!.options.length;
    const counts = new Array(n).fill(0) as number[];
    quiz.view = { slideId: s.id, status: "open", counts, total: 0, correctIndex: null, endsAt: null };
    quiz.myVote = undefined;
    // Weights lean toward the right answer, the way a room usually does.
    const weights = counts.map((_, i) => (i === answers[s.id] ? 5 : 1 + i));
    let left = 31;
    quiz.timer = window.setInterval(() => {
      if (!quiz.view || left <= 0) return stopTimer();
      const burst = Math.min(left, 1 + Math.floor(Math.random() * 3));
      for (let k = 0; k < burst; k++) quiz.view.counts![pick(weights)]! += 1;
      quiz.view.total += burst;
      left -= burst;
      repaintQuiz();
    }, reducedMotion() ? 60 : 280);
  }

  function vote(i: number) {
    const view = quiz.view;
    if (!view || view.status !== "open") return;
    if (quiz.myVote !== undefined) view.counts![quiz.myVote]! -= 1;
    else view.total += 1;
    view.counts![i]! += 1;
    quiz.myVote = i;
    repaintQuiz();
  }

  function reveal() {
    const view = quiz.view;
    if (!view) return;
    stopTimer();
    view.status = "revealed";
    view.correctIndex = answers[view.slideId] ?? null;
    repaintQuiz();
  }

  function repaintQuiz() {
    program.setQuiz(quiz.view, { presenter: true });
    if (isQuiz(mine)) phone.setQuiz(quiz.view, { myVote: quiz.myVote });
    revealKey.disabled = !quiz.view || quiz.view.status === "revealed";
    paintPanel();
  }

  function stopTimer() {
    window.clearInterval(quiz.timer);
  }

  function stopQuiz() {
    stopTimer();
    quiz.view = null;
    quiz.myVote = undefined;
  }

  function toggleEffect(kind: PersistentEffect["kind"]) {
    if (effect?.kind === kind) effect = null;
    else effect = { kind, target: { elementId: effectTarget(slideAt(live)) } };
    paint();
  }

  function setExploring(on: boolean) {
    exploring = on;
    if (on) mine = live;
    paint();
  }

  function browse(dir: 1 | -1) {
    const slide = Math.min(reached, Math.max(0, mine.slide + dir));
    // Exploring shows slides already presented, fully revealed.
    mine = { slide, step: 99 };
    if (slide === live.slide) mine = live;
    phone.show(mine);
    phone.setQuiz(null);
    paintPanel();
  }

  nextKey.addEventListener("click", () => (onAir ? move(nextPosition(deck.slides, live)) : goLive()));
  prevKey.addEventListener("click", () => move(prevPosition(deck.slides, live)));
  focusKey.addEventListener("click", () => toggleEffect("focus"));
  zoomKey.addEventListener("click", () => toggleEffect("zoom"));
  revealKey.addEventListener("click", reveal);
  liveKey.addEventListener("click", () => setExploring(false));
  exploreKey.addEventListener("click", () => setExploring(true));
  program.host.addEventListener("click", (e) => {
    const p = program.toSlidePoint(e.clientX, e.clientY);
    if (!p) return;
    program.ripple(p.x, p.y);
    if (!exploring) phone.ripple(p.x, p.y);
  });

  paint();
  // The session goes on air by itself once the console is in view, so the lamp warm-up plays.
  onceVisible(console_, () => window.setTimeout(() => !onAir && goLive(), reducedMotion() ? 0 : 1100));
}

/** The element an effect points at: the slide's main text, never decor. */
function effectTarget(slide: PublicDeck["slides"][number]): string {
  const texts = slide.elements.filter((e) => e.type === "text" || e.type === "chart" || e.type === "qr");
  const byId = texts.find((e) => e.id === "title" || e.id === "card" || e.id === "turn" || e.id === "l2");
  return (byId ?? texts[0] ?? slide.elements[0])!.id;
}

/* ---------------------------------------------------------------------------
 * "A slide is a file": the JSON of one slide next to its render, re-themed by
 * the preset picker.
 * ------------------------------------------------------------------------- */
function mountFileSection() {
  const slideIndex = deck.slides.findIndex((s) => s.id === "zero");
  const slide = deck.slides[slideIndex]!;
  $("[data-role=code]").innerHTML = highlightJson(JSON.stringify(slide, null, 2));

  const host = $("[data-role=file-stage]");
  const picker = $("[data-role=presets]");
  let view: StageView | null = null;
  const themed = (preset: PresetName): PublicDeck => ({ ...deck, theme: { preset }, slides: [slide] });

  function select(preset: PresetName) {
    picker.querySelectorAll("button").forEach((b) => b.setAttribute("aria-checked", String(b.dataset.preset === preset)));
    view?.destroy();
    view = new StageView(host, themed(preset));
    view.show({ slide: 0, step: 0 });
  }

  for (const name of PRESET_NAMES) {
    const b = button("key key-sm preset", name, undefined, () => select(name));
    b.dataset.preset = name;
    b.setAttribute("role", "radio");
    picker.append(b);
  }
  // Presets pull their own web fonts; render only when the section is near.
  onceVisible(host, () => select("brutalista"), "400px");
}

/* Helpers ------------------------------------------------------------------ */
function onceVisible(el: Element, run: () => void, rootMargin = "0px") {
  if (!("IntersectionObserver" in window)) return run();
  const io = new IntersectionObserver(
    (entries) => {
      if (!entries.some((e) => e.isIntersecting)) return;
      io.disconnect();
      run();
    },
    { rootMargin, threshold: 0.35 },
  );
  io.observe(el);
}

function pick(weights: number[]): number {
  let r = Math.random() * weights.reduce((a, b) => a + b, 0);
  for (let i = 0; i < weights.length; i++) if ((r -= weights[i]!) < 0) return i;
  return weights.length - 1;
}

function button(className: string, content: string, label: string | undefined, onClick: () => void) {
  const b = document.createElement("button");
  b.type = "button";
  b.className = className;
  if (content.startsWith("<svg")) b.innerHTML = content;
  else b.textContent = content;
  if (label) b.setAttribute("aria-label", label);
  b.addEventListener("click", onClick);
  return b;
}

function row(className: string, ...children: HTMLElement[]) {
  const el = document.createElement("div");
  el.className = className;
  el.append(...children);
  return el;
}

function escapeText(s: string) {
  return s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);
}

/** Minimal JSON tokenizer for the code view: keys, strings, numbers, literals. */
function highlightJson(src: string): string {
  return escapeText(src).replace(/(&quot;(?:[^&]|&(?!quot;))*?&quot;)(\s*:)?|\b(-?\d+(?:\.\d+)?)\b|\b(true|false|null)\b/g, (m, str, colon, num, lit) => {
    if (str) return colon ? `<span class="tk-key">${str}</span>${colon}` : `<span class="tk-str">${str}</span>`;
    if (num) return `<span class="tk-num">${num}</span>`;
    if (lit) return `<span class="tk-lit">${lit}</span>`;
    return m;
  });
}
