declare module "virtual:demo-deck" {
  interface Demo {
    deck: import("../../live-deck/shared/deck-core.ts").PublicDeck;
    /** Correct option per quiz slide id, used only by the simulated reveal. */
    answers: Record<string, number>;
    joinUrl: string;
    qrSvg: string;
  }
  export const demos: Record<"en" | "es", Demo>;
}
