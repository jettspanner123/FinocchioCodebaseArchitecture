export default class DashboardScreenCON {
  public static readonly HEADER_LABEL: string = "Expenses";
  public static readonly PERIOD_LABEL: string = "Week";

  // Negative marginTop applied to every transaction card after the first, so
  // each one slides up and overlaps the bottom of the card before it --
  // produces the stacked-deck look from the reference mockup. Not part of
  // EdgeInsetsCON: it's a one-off visual treatment for this card-stacking
  // pattern, not a general-purpose spacing token.
  public static readonly TRANSACTION_CARD_OVERLAP: number = -35;
}
