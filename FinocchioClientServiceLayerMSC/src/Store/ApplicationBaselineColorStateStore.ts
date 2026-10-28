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
  // Exact category colors provided 2026-10-28 (replacing the earlier
  // by-eye-estimated mockup colors). All four _TEXT entries are now the same
  // INK value -- every card uses black text/icons per that update, kept as
  // separate per-category keys rather than collapsing to one shared constant
  // so a future category can still diverge without a structural change here.
  CARD_GAMES: "#E0C4F1",
  CARD_GAMES_TEXT: "#1C1C28",
  CARD_PRODUCTS: "#F4F5A8",
  CARD_PRODUCTS_TEXT: "#1C1C28",
  CARD_ENTERTAINMENT: "#9E6CEB",
  CARD_ENTERTAINMENT_TEXT: "#1C1C28",
  CARD_FOOD: "#C5CDF0",
  CARD_FOOD_TEXT: "#1C1C28",
};

const DARK_PALETTE: ApplicationColorPaletteType = { ...LIGHT_PALETTE };

const useApplicationBaselineColorStateStore = create<ApplicationBaselineColorStateStoreInterface>((set) => ({
  theme: "light",
  colors: LIGHT_PALETTE,
  setTheme: (theme) => set({ theme, colors: theme === "dark" ? DARK_PALETTE : LIGHT_PALETTE }),
}));

export default useApplicationBaselineColorStateStore;
