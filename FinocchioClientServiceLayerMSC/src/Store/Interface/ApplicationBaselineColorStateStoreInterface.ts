export interface ApplicationColorPaletteType {
  BACKGROUND: string;
  INK: string;
  SUBTLE_TEXT: string;
  // Elevation tokens (THEME_SYSTEM_PRD.md §4.2) -- SURFACE is card/content
  // level (one step lighter than BACKGROUND), OVERLAY is the sheet/modal
  // level (lightest of all; reserved for true white in light mode so SURFACE
  // has somewhere to sit below it), ACCENT is the single app-wide accent
  // color (replaces DashboardScreenCON.THEME_ACCENT_COLOR's hardcoded hex),
  // BORDER_SUBTLE replaces the most common `rgba(0,0,0,0.06-0.1)` literal
  // family seen across shared components.
  SURFACE: string;
  // A raised chip/button background that reads as lighter than SURFACE even
  // where SURFACE is already pure white (can't literally exceed white) --
  // used by SecondaryActionButtonSharedComponent's default background, see
  // grilling session 2026-11-10.
  SURFACE_RAISED: string;
  // Distinct from SURFACE_RAISED, for a shape nested inside an
  // already-SURFACE_RAISED element (e.g. an icon-circle inside a pill) where
  // reusing SURFACE_RAISED again would make it invisible against its own
  // parent, see grilling session 2026-11-10.
  SURFACE_RAISED_ALT: string;
  OVERLAY: string;
  ACCENT: string;
  BORDER_SUBTLE: string;
  // Between BORDER_SUBTLE and BORDER_STRONG -- for input boxes specifically,
  // which wanted a touch more definition than BORDER_SUBTLE gives buttons/
  // sheets, without going as heavy as BORDER_STRONG's category-card weight,
  // see grilling session 2026-11-11.
  BORDER_DEFAULT: string;
  // A more visible border for elements that need to read as clearly
  // differentiated from their background (category cards) -- deliberately
  // its own token, not a bumped BORDER_SUBTLE, since BORDER_SUBTLE stays
  // subtle for buttons/sheets elsewhere, see grilling session 2026-11-10.
  BORDER_STRONG: string;
  // Bottom-sheet/modal dimming backdrop -- deliberately identical across both
  // palettes (a black scrim is a universal convention, not theme-dependent),
  // same precedent as CARD_GAMES etc. being centralized despite not varying
  // by theme, see grilling session 2026-11-10.
  SCRIM: string;
  // Neutral, low-contrast chip/circle background (icon-picker unselected
  // cells, icon-circles, avatar circles) -- light stays the original subtle
  // rgba(0,0,0,0.06); dark needs a meaningfully more opaque value since that
  // same subtle tint is nearly invisible against an already-dark background,
  // see grilling session 2026-11-11.
  CHIP_BACKGROUND: string;
  CARD_GAMES: string;
  CARD_GAMES_TEXT: string;
  CARD_PRODUCTS: string;
  CARD_PRODUCTS_TEXT: string;
  CARD_ENTERTAINMENT: string;
  CARD_ENTERTAINMENT_TEXT: string;
  CARD_FOOD: string;
  CARD_FOOD_TEXT: string;
}

// The user's explicit choice (persisted) vs. what's actually rendered right
// now -- "system" has no palette of its own, it just means "follow resolvedTheme,
// which follows the OS." See THEME_SYSTEM_PRD.md §4.1.
export type ThemePreferenceType = "light" | "dark" | "system";
export type ResolvedThemeType = "light" | "dark";

export default interface ApplicationBaselineColorStateStoreInterface {
  themePreference: ThemePreferenceType;
  resolvedTheme: ResolvedThemeType;
  colors: ApplicationColorPaletteType;
  // `systemScheme` is passed in rather than read from `Appearance` here, so
  // this store stays a plain, framework-agnostic Zustand store -- only
  // ApplicationThemeSyncComponent talks to `Appearance` directly.
  setThemePreference: (preference: ThemePreferenceType, systemScheme: ResolvedThemeType) => void;
}
