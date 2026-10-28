export default class DashboardScreenCON {
  public static readonly HEADER_LABEL: string = "Expenses";
  public static readonly PERIOD_LABEL: string = "Week";

  // Negative offset between each card's natural (unscrolled) top position --
  // produces the stacked-deck peek look at rest. Combined with
  // TRANSACTION_CARD_HEIGHT to derive the scroll-driven stacking step in
  // DashboardScreenService.getTransactionCardStep(). Not part of
  // EdgeInsetsCON: it's a one-off visual treatment for this card-stacking
  // pattern, not a general-purpose spacing token.
  public static readonly TRANSACTION_CARD_OVERLAP: number = -35;

  // Fixed height every transaction card renders at. Required because cards
  // are absolutely positioned (so the sticky-pin scroll animation can control
  // their position via transform) -- absolute positioning can't rely on
  // intrinsic/content-driven sizing the way normal flow layout could.
  public static readonly TRANSACTION_CARD_HEIGHT: number = 280;

  // Subtle depth treatment so stacked/pinned cards read as physically on top
  // of each other. Dark, low-opacity border so it stays equally subtle across
  // every category color (a light border would disappear on the
  // already-light Games/Products/Food cards).
  public static readonly TRANSACTION_CARD_BORDER_COLOR: string = "rgba(0, 0, 0, 0.08)";

  // Grouped (rather than split into separate constants) since shadow is
  // inherently a set of properties applied together; elevation included
  // alongside the iOS shadow props so Android isn't left flat the day this
  // screen is opened there, even though this app is iOS-only for now.
  public static readonly TRANSACTION_CARD_SHADOW_STYLE = {
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  } as const;

  // Screen-space Y position (within the scrollable card area) where a card
  // locks in place once scrolled up far enough. 0 = flush with the top of
  // the scrollable region, directly below the header.
  public static readonly TRANSACTION_STACK_PIN_OFFSET: number = 0;

  // How much smaller (as a fraction of scale) a pinned card gets for every
  // subsequent card that locks in on top of it -- the "receding into the
  // stack" illusion. Capped by TRANSACTION_STACK_MAX_RECEDE_DEPTH so scale
  // never approaches 0 regardless of how many transactions exist.
  public static readonly TRANSACTION_STACK_RECEDE_SCALE_STEP: number = 0.05;

  // Maximum number of stacked-on-top cards a pinned card visually "feels" --
  // beyond this depth, further cards locking in on top no longer shrink it
  // further. Keeps scale bounded (never below roughly
  // 1 - MAX_RECEDE_DEPTH * RECEDE_SCALE_STEP) for arbitrarily long lists.
  public static readonly TRANSACTION_STACK_MAX_RECEDE_DEPTH: number = 3;

  // How much darker (as a fraction) the icon's circular background is than
  // the card's own background color -- icons sit on a darker tint of the
  // same color instead of a plain white circle.
  public static readonly TRANSACTION_ICON_BACKGROUND_DARKEN_AMOUNT: number = 0.12;
}
