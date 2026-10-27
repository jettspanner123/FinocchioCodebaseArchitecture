import { create } from "zustand";

import type ApplicationBaselineColorStateStoreInterface from "./Interface/ApplicationBaselineColorStateStoreInterface";
import type { ApplicationColorPaletteType } from "./Interface/ApplicationBaselineColorStateStoreInterface";

// Colors estimated by eye from the first Dashboard design mockup
// (download.jpg, 2026-10-27) -- not exact brand/design-spec values. Replace
// with real hex codes if/when a design spec provides them. Dark palette is a
// placeholder copy of light until real dark-mode values exist (ARCHITECTURE.md
// requires both light and dark from v1, but this mockup only showed one).
const LIGHT_PALETTE: ApplicationColorPaletteType = {
  BACKGROUND: "#F3EFFB",
  INK: "#1C1C28",
  SUBTLE_TEXT: "#8A8A99",
  CARD_GAMES: "#F0D9F0",
  CARD_GAMES_TEXT: "#1C1C28",
  CARD_PRODUCTS: "#EEE896",
  CARD_PRODUCTS_TEXT: "#1C1C28",
  CARD_ENTERTAINMENT: "#8E7CC3",
  CARD_ENTERTAINMENT_TEXT: "#FFFFFF",
  CARD_FOOD: "#C6DFF0",
  CARD_FOOD_TEXT: "#1C1C28",
};

const DARK_PALETTE: ApplicationColorPaletteType = { ...LIGHT_PALETTE };

const useApplicationBaselineColorStateStore = create<ApplicationBaselineColorStateStoreInterface>((set) => ({
  theme: "light",
  colors: LIGHT_PALETTE,
  setTheme: (theme) => set({ theme, colors: theme === "dark" ? DARK_PALETTE : LIGHT_PALETTE }),
}));

export default useApplicationBaselineColorStateStore;
