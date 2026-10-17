declare module "virtual:demo-deck" {
  export const deck: import("../../live-deck/shared/deck-core.ts").PublicDeck;
  /** Correct option per quiz slide id, used only by the simulated reveal. */
  export const answers: Record<string, number>;
  export const joinUrl: string;
  export const qrSvg: string;
}
