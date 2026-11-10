import { create } from "zustand";

import type ApplicationBaselineColorStateStoreInterface from "./Interface/ApplicationBaselineColorStateStoreInterface";
import type { ApplicationColorPaletteType, ResolvedThemeType } from "./Interface/ApplicationBaselineColorStateStoreInterface";

// Colors estimated by eye from the first Dashboard design mockup
// (download.jpg, 2026-10-27) -- not exact brand/design-spec values. Replace
// with real hex codes if/when a design spec provides them.
//
// SURFACE/SURFACE_RAISED/OVERLAY/INK/SUBTLE_TEXT values below are explicit
// user-provided decisions from the screen-by-screen color review (grilling
// session 2026-11-10, Settings bottom sheet), matching Apple HIG system
// colors (systemGroupedBackground/systemBackground/systemGray) -- not
// estimates. ACCENT (Apple's own system blue) and BORDER_SUBTLE were left to
// my judgment, chosen to match that same convention. Category colors
// (CARD_*) are deliberately identical across both palettes -- they're
// identity colors, not theme-dependent surface colors (THEME_SYSTEM_PRD.md §3
// decision 6).
const LIGHT_PALETTE: ApplicationColorPaletteType = {
  BACKGROUND: "#F3EFFB",
  INK: "#000000",
  SUBTLE_TEXT: "#8A8A8E",
  // "Page" level inside a sheet (iOS systemGroupedBackground) -- SURFACE
  // (below) is the card sitting ON TOP of this, not the other way around.
  OVERLAY: "#F2F2F7",
  // Card/content level -- iOS systemBackground. Intentionally "louder"
  // (pure white) than OVERLAY's muted gray, matching the real iOS Settings
  // app's own grouped-table visual hierarchy.
  SURFACE: "#FFFFFF",
  // Raised chip/button background -- reads as "lighter than SURFACE" even
  // where SURFACE is already pure white (can't literally exceed white).
  SURFACE_RAISED: "#FFFFFF",
  SURFACE_RAISED_ALT: "#E5E5EA",
  ACCENT: "#007AFF",
  BORDER_SUBTLE: "rgba(0, 0, 0, 0.08)",
  // Theme-aware again (black in light, white in dark) -- same 0.7 opacity in
  // both, see grilling session 2026-11-10.
  BORDER_STRONG: "rgba(0, 0, 0, 0.7)",
  SCRIM: "#000000",
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

const DARK_PALETTE: ApplicationColorPaletteType = {
  ...LIGHT_PALETTE,
  BACKGROUND: "#000000",
  INK: "#FFFFFF",
  SUBTLE_TEXT: "#989899",
  OVERLAY: "#1C1C1E",
  SURFACE: "#000000",
  SURFACE_RAISED: "#2C2C2E",
  SURFACE_RAISED_ALT: "#3A3A3C",
  ACCENT: "#0A84FF",
  BORDER_SUBTLE: "rgba(255, 255, 255, 0.05)",
  BORDER_STRONG: "rgba(255, 255, 255, 0.7)",
};

function resolvePalette(resolvedTheme: ResolvedThemeType): ApplicationColorPaletteType {
  return resolvedTheme === "dark" ? DARK_PALETTE : LIGHT_PALETTE;
}

const useApplicationBaselineColorStateStore = create<ApplicationBaselineColorStateStoreInterface>((set) => ({
  themePreference: "system",
  resolvedTheme: "light",
  colors: LIGHT_PALETTE,
  setThemePreference: (preference, systemScheme) => {
    const resolvedTheme = preference === "system" ? systemScheme : preference;
    set({ themePreference: preference, resolvedTheme, colors: resolvePalette(resolvedTheme) });
  },
}));

export default useApplicationBaselineColorStateStore;
