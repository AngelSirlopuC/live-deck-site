// Site locale, read from <html lang>. The language switch remembers the
// visitor's choice; a first visit to the English landing from a Spanish
// browser goes to the Spanish landing.

export type Locale = "en" | "es";

export const locale: Locale = document.documentElement.lang.startsWith("es") ? "es" : "en";

const KEY = "live-deck-site:lang";

function stored(): Locale | null {
  try {
    const v = localStorage.getItem(KEY);
    return v === "en" || v === "es" ? v : null;
  } catch {
    return null;
  }
}

/** Remembers the language picked in the switch. */
export function bindLanguageSwitch(root: ParentNode = document) {
  root.querySelectorAll<HTMLAnchorElement>("[data-lang]").forEach((a) =>
    a.addEventListener("click", () => {
      try {
        localStorage.setItem(KEY, a.dataset.lang!);
      } catch {
        /* storage blocked: the link still works */
      }
    }),
  );
}

/** On the English landing only: send first-time Spanish-speaking visitors to /es/. */
export function suggestSpanish(spanishUrl: string) {
  if (locale !== "en" || stored()) return;
  const langs = navigator.languages?.length ? navigator.languages : [navigator.language];
  if (langs[0]?.toLowerCase().startsWith("es")) location.replace(spanishUrl);
}

/** Picks the string for the page locale. */
export const t = <T>(strings: Record<Locale, T>): T => strings[locale];
