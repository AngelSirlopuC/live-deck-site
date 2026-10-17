import "../../live-deck/web/src/styles/base.css";
import "../../live-deck/web/src/styles/chrome.css";
import "./site.css";
import "./docs.css";
import { bindCopyButtons } from "./copy.ts";

bindCopyButtons(document);

// Mobile: the sidebar folds behind the Menu key.
const toggle = document.querySelector<HTMLButtonElement>(".side-toggle");
const sidebar = document.getElementById("sidebar");
if (toggle && sidebar) {
  const set = (open: boolean) => {
    toggle.setAttribute("aria-expanded", String(open));
    document.body.classList.toggle("side-open", open);
  };
  toggle.addEventListener("click", () => set(toggle.getAttribute("aria-expanded") !== "true"));
  sidebar.addEventListener("click", (e) => (e.target as HTMLElement).closest("a") && set(false));
  document.addEventListener("keydown", (e) => e.key === "Escape" && set(false));
}

// On-page TOC: light the section currently being read.
const links = [...document.querySelectorAll<HTMLAnchorElement>(".toc a")];
const targets = links.map((a) => document.getElementById(decodeURIComponent(a.hash.slice(1)))).filter((t): t is HTMLElement => !!t);
if (targets.length && "IntersectionObserver" in window) {
  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        links.forEach((a) => a.toggleAttribute("aria-current", a.hash === `#${entry.target.id}`));
      }
    },
    { rootMargin: "-20% 0px -70% 0px" },
  );
  targets.forEach((t) => io.observe(t));
}
