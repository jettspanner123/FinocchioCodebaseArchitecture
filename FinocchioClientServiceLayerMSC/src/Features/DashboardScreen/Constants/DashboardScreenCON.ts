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

  // Grouped since shadow is inherently a set of properties applied together;
  // elevation included alongside the iOS shadow props for Android compatibility.
  // Also used by DashboardScreenAddCategoryCardStaticComponent (not a real
  // category card) -- kept as-is for that card; CATEGORY_CARD_BOX_SHADOW_STYLE
  // below is the real category cards' own shadow, deliberately separate so
  // changing one doesn't affect the other.
  public static readonly CATEGORY_CARD_SHADOW_STYLE = {
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  } as const;

  // box-shadow: rgba(0, 0, 0, 0.35) 0px 5px 15px -- explicit spec, see
  // grilling session 2026-11-10. Used by the real category cards and their
  // Create Category preview counterpart, not the Add-Category CTA card
  // (see CATEGORY_CARD_SHADOW_STYLE above). elevation is an approximation --
  // Android has no exact blur-radius equivalent.
  public static readonly CATEGORY_CARD_BOX_SHADOW_STYLE = {
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.35,
    shadowRadius: 15,
    elevation: 10,
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

  // Progress bar colors -- always PROGRESS_BAR_DEFAULT_COLOR for the fill,
  // regardless of spend ratio (amber/red conditional coloring explicitly
  // removed, see grilling session 2026-11-11; the ratio-based thresholds and
  // warning/danger fill colors that drove it are gone too, now dead).
  public static readonly PROGRESS_BAR_DEFAULT_COLOR: string = "#1C1C28";
  // For the "over cap" TEXT only, not the bar fill (see
  // DASHBOARD_IMPROVEMENTS_PRD.md #1) -- the old PROGRESS_BAR_DANGER_COLOR
  // (#EF4444, since removed) scored as low as 2.39:1 as text against some
  // category backgrounds; this darker red (Tailwind red-800) verified at
  // 5.28:1+ against all 5 current categories.
  public static readonly PROGRESS_BAR_DANGER_TEXT_COLOR: string = "#991B1B";
  public static readonly PROGRESS_BAR_TRACK_COLOR: string = "rgba(28, 28, 40, 0.12)";

  // Add Category Card
  public static readonly ADD_CARD_TITLE: string = "Create Category";
  public static readonly ADD_CARD_SUBTITLE: string = "Set up a personal or shared budget";
  public static readonly ADD_CARD_PRESS_IN_DURATION: number = 100;
  public static readonly ADD_CARD_PRESS_OUT_DURATION: number = 200;
  // How much darker (as a fraction) this card's resting background is than
  // ColorFactoryCON.SURFACE_RAISED itself -- same darkenHexColor technique as
  // CATEGORY_ICON_BACKGROUND_DARKEN_AMOUNT, see grilling session 2026-11-11.
  public static readonly ADD_CARD_BACKGROUND_DARKEN_AMOUNT: number = 0.06;
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

  // Edge-swipe-to-collapse gesture -- mirrors the native swipe-from-the-left-
  // edge-to-go-back gesture's exact trigger zone, but drives this screen's
  // own collapse animation (expandProgress) instead of a screen transition.
  // Alongside, not instead of, tap-to-reverse -- see apple-motion grilling
  // session 2026-11-13.
  public static readonly EXPAND_EDGE_SWIPE_ZONE_WIDTH: number = 20;
  // expandProgress is a unitless 0->1 value, not pixels -- these are the
  // progress-space equivalents of BottomSheetSharedComponent's rubberband/
  // momentum-projection constants. RUBBERBAND_CONSTANT and the deceleration
  // rate are dimensionless shape parameters, so the same values carry the
  // same "feel" regardless of scale; RUBBERBAND_DIMENSION is rescaled from
  // that component's 120px into an equivalent fraction of the drag range.
  public static readonly EXPAND_EDGE_SWIPE_RUBBERBAND_DIMENSION: number = 0.15;
  public static readonly EXPAND_EDGE_SWIPE_RUBBERBAND_CONSTANT: number = 0.55;
  public static readonly EXPAND_EDGE_SWIPE_PROJECTION_DECELERATION_RATE: number = 0.998;
  public static readonly EXPAND_EDGE_SWIPE_COMMIT_THRESHOLD: number = 0.5;
  // The other cards + header stay put for the first this-many pixels of
  // drag, then start returning -- waiting for raw expandProgress itself to
  // cross EXPAND_SLIDE_AWAY_END_PROGRESS (reached only after ~60% of the
  // full screen width's worth of drag, since the gesture starts at
  // progress=1) read as far too sluggish for something the user's own
  // finger is directly driving. See DashboardScreenController's
  // cardsReturnProgress for the remap this feeds.
  public static readonly EXPAND_EDGE_SWIPE_CARD_RETURN_DISTANCE_PX: number = 20;

  // Profile & Settings Bottom Sheets
  public static readonly PROFILE_SHEET_TITLE: string = "Profile";
  public static readonly SETTINGS_SHEET_TITLE: string = "Settings";
  public static readonly PROFILE_SHEET_PLACEHOLDER: string = "Profile settings and details will appear here.";
  public static readonly SETTINGS_SHEET_PLACEHOLDER: string = "Application preferences and settings will appear here.";

  // Settings Appearance & Theme Selector
  public static readonly SETTINGS_APPEARANCE_TITLE: string = "Appearance";
}
