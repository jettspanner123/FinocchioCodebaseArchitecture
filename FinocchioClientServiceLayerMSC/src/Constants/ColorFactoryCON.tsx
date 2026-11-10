import useApplicationBaselineColorStateStore from "@/Store/ApplicationBaselineColorStateStore";

// Static getters, not a hook -- matches the pattern CODING-RULES.md documents
// (ColorFactoryCON.INK used directly in style props, no hook call at the call
// site). Each getter reads the store's live current snapshot via getState(),
// so it always reflects the latest theme even though it isn't a React hook.
export default class ColorFactoryCON {
  public static get BACKGROUND(): string {
    return useApplicationBaselineColorStateStore.getState().colors.BACKGROUND;
  }

  public static get INK(): string {
    return useApplicationBaselineColorStateStore.getState().colors.INK;
  }

  public static get SUBTLE_TEXT(): string {
    return useApplicationBaselineColorStateStore.getState().colors.SUBTLE_TEXT;
  }

  public static get SURFACE(): string {
    return useApplicationBaselineColorStateStore.getState().colors.SURFACE;
  }

  public static get OVERLAY(): string {
    return useApplicationBaselineColorStateStore.getState().colors.OVERLAY;
  }

  public static get SURFACE_RAISED(): string {
    return useApplicationBaselineColorStateStore.getState().colors.SURFACE_RAISED;
  }

  public static get SURFACE_RAISED_ALT(): string {
    return useApplicationBaselineColorStateStore.getState().colors.SURFACE_RAISED_ALT;
  }

  public static get ACCENT(): string {
    return useApplicationBaselineColorStateStore.getState().colors.ACCENT;
  }

  public static get BORDER_SUBTLE(): string {
    return useApplicationBaselineColorStateStore.getState().colors.BORDER_SUBTLE;
  }

  public static get SCRIM(): string {
    return useApplicationBaselineColorStateStore.getState().colors.SCRIM;
  }

  public static get CARD_GAMES(): string {
    return useApplicationBaselineColorStateStore.getState().colors.CARD_GAMES;
  }

  public static get CARD_GAMES_TEXT(): string {
    return useApplicationBaselineColorStateStore.getState().colors.CARD_GAMES_TEXT;
  }

  public static get CARD_PRODUCTS(): string {
    return useApplicationBaselineColorStateStore.getState().colors.CARD_PRODUCTS;
  }

  public static get CARD_PRODUCTS_TEXT(): string {
    return useApplicationBaselineColorStateStore.getState().colors.CARD_PRODUCTS_TEXT;
  }

  public static get CARD_ENTERTAINMENT(): string {
    return useApplicationBaselineColorStateStore.getState().colors.CARD_ENTERTAINMENT;
  }

  public static get CARD_ENTERTAINMENT_TEXT(): string {
    return useApplicationBaselineColorStateStore.getState().colors.CARD_ENTERTAINMENT_TEXT;
  }

  public static get CARD_FOOD(): string {
    return useApplicationBaselineColorStateStore.getState().colors.CARD_FOOD;
  }

  public static get CARD_FOOD_TEXT(): string {
    return useApplicationBaselineColorStateStore.getState().colors.CARD_FOOD_TEXT;
  }
}
