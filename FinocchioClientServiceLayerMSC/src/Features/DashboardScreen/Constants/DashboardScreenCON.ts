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
  public static readonly CATEGORY_CARD_HEIGHT: number = 275;

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
  // For the "over cap" TEXT only, not the bar fill (see
  // DASHBOARD_IMPROVEMENTS_PRD.md #1) -- PROGRESS_BAR_DANGER_COLOR scored as
  // low as 2.39:1 as text against some category backgrounds; this darker red
  // (Tailwind red-800) verified at 5.28:1+ against all 5 current categories.
  public static readonly PROGRESS_BAR_DANGER_TEXT_COLOR: string = "#991B1B";
  public static readonly PROGRESS_BAR_TRACK_COLOR: string = "rgba(28, 28, 40, 0.12)";

  // Add Category Card
  public static readonly ADD_CARD_TITLE: string = "Create Category";
  public static readonly ADD_CARD_SUBTITLE: string = "Set up a personal or shared budget";
  public static readonly ADD_CARD_BACKGROUND_COLOR: string = "#1C1C28";
  // Deliberately its own constant, not CATEGORY_CARD_HEIGHT -- this card isn't
  // part of the pinned stack sizing math, so growing it doesn't inflate every
  // category card too.
  public static readonly ADD_CARD_HEIGHT: number = 410;

  // Tap-to-expand "zoom" animation (see
  // FinocchioAgentDocumentationNMSC/PRD/CATEGORY_CARD_EXPAND_PRD.md). One
  // spring config drives every motion in the sequence (forward and reverse)
  // via a single 0->1 expandProgress shared value -- duration-based so
  // "dampingRatio" directly expresses "slight bounce" (1 = none, <1 = bouncy).
  public static readonly EXPAND_SPRING_CONFIG = {
    duration: 600,
    dampingRatio: 0.82,
  } as const;

  // Per-element windows within expandProgress's 0->1 journey -- see PRD §4
  // for why these are interpolation windows of one spring rather than
  // separate timers.
  public static readonly EXPAND_SLIDE_AWAY_END_PROGRESS: number = 0.4;
  public static readonly EXPAND_CONTENT_FADE_END_PROGRESS: number = 0.25;
  public static readonly EXPAND_GROWTH_START_PROGRESS: number = 0.3;
}
