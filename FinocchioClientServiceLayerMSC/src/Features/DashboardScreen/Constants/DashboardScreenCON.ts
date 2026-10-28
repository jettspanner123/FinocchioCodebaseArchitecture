export default class DashboardScreenCON {
  public static readonly HEADER_LABEL: string = "Categories";
  public static readonly PERIOD_LABEL: string = "This Month";

  // Negative offset between each card's natural (unscrolled) top position --
  // produces the stacked-deck peek look at rest. Combined with
  // CATEGORY_CARD_HEIGHT to derive the scroll-driven stacking step in
  // DashboardScreenService.getCategoryCardStep(). Not part of
  // EdgeInsetsCON: it's a one-off visual treatment for this card-stacking
  // pattern, not a general-purpose spacing token.
  public static readonly CATEGORY_CARD_OVERLAP: number = -35;

  // Fixed height every category card renders at. Required because cards
  // are absolutely positioned (so the sticky-pin scroll animation can control
  // their position via transform) -- absolute positioning can't rely on
  // intrinsic/content-driven sizing the way normal flow layout could.
  public static readonly CATEGORY_CARD_HEIGHT: number = 350;

  // Subtle depth treatment so stacked/pinned cards read as physically on top
  // of each other. Dark, low-opacity border so it stays equally subtle across
  // every category color.
  public static readonly CATEGORY_CARD_BORDER_COLOR: string = "rgba(0, 0, 0, 0.08)";

  // Grouped since shadow is inherently a set of properties applied together;
  // elevation included alongside the iOS shadow props for Android compatibility.
  public static readonly CATEGORY_CARD_SHADOW_STYLE = {
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  } as const;

  // Screen-space Y position (within the scrollable card area) where a card
  // locks in place once scrolled up far enough. 0 = flush with the top of
  // the scrollable region, directly below the header.
  public static readonly CATEGORY_STACK_PIN_OFFSET: number = 0;

  // How much smaller (as a fraction of scale) a pinned card gets for every
  // subsequent card that locks in on top of it -- the "receding into the
  // stack" illusion. Capped by CATEGORY_STACK_MAX_RECEDE_DEPTH so scale
  // never approaches 0 regardless of how many categories exist.
  public static readonly CATEGORY_STACK_RECEDE_SCALE_STEP: number = 0.05;

  // Maximum number of stacked-on-top cards a pinned card visually "feels" --
  // beyond this depth, further cards locking in on top no longer shrink it
  // further.
  public static readonly CATEGORY_STACK_MAX_RECEDE_DEPTH: number = 3;

  // How much darker (as a fraction) the icon's circular background is than
  // the card's own background color -- icons sit on a darker tint of the
  // same color instead of a plain white circle.
  public static readonly CATEGORY_ICON_BACKGROUND_DARKEN_AMOUNT: number = 0.12;

  // Thresholds matching CONTEXT.md's 80% and 100% budget alert specifications
  public static readonly BUDGET_ALERT_WARNING_THRESHOLD: number = 0.8;
  public static readonly BUDGET_ALERT_DANGER_THRESHOLD: number = 1.0;

  // Progress bar colors
  public static readonly PROGRESS_BAR_DEFAULT_COLOR: string = "#1C1C28";
  public static readonly PROGRESS_BAR_WARNING_COLOR: string = "#F59E0B";
  public static readonly PROGRESS_BAR_DANGER_COLOR: string = "#EF4444";
  public static readonly PROGRESS_BAR_TRACK_COLOR: string = "rgba(28, 28, 40, 0.12)";
}
