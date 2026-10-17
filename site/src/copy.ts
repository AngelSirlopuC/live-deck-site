import { icon } from "../../live-deck/web/src/ui/icons.ts";

const CHECK = '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>';

/**
 * Wires every `[data-copy]` element. A button copies its own value; a container
 * gets (or reuses) a `.command-copy` key that copies the container's value.
 */
export function bindCopyButtons(root: ParentNode) {
  const status = document.createElement("span");
  status.className = "visually-hidden";
  status.setAttribute("aria-live", "polite");
  document.body.append(status);

  root.querySelectorAll<HTMLElement>("[data-copy]").forEach((el) => {
    const value = el.dataset.copy!;
    let trigger = el instanceof HTMLButtonElement ? el : el.querySelector<HTMLButtonElement>(".command-copy");
    if (!trigger) {
      trigger = document.createElement("button");
      trigger.type = "button";
      trigger.className = "key key-icon command-copy";
      trigger.setAttribute("aria-label", "Copy");
      el.append(trigger);
    }
    const isIconKey = trigger.classList.contains("command-copy");
    if (isIconKey) trigger.innerHTML = icon("copy");
    const original = trigger.innerHTML;
    trigger.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(value);
      } catch {
        return;
      }
      status.textContent = "Copied to clipboard";
      trigger.classList.add("is-copied");
      if (isIconKey) trigger.innerHTML = CHECK;
      else trigger.dataset.label = trigger.textContent ?? "";
      if (!isIconKey) trigger.textContent = "Copied";
      window.setTimeout(() => {
        trigger.classList.remove("is-copied");
        if (isIconKey) trigger.innerHTML = original;
        else trigger.textContent = trigger.dataset.label ?? "";
        status.textContent = "";
      }, 1600);
    });
  });
}
