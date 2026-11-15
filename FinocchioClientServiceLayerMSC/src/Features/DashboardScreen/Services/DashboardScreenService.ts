import DashboardScreenCON from "@/Features/DashboardScreen/Constants/DashboardScreenCON";
import {
  MOCK_DASHBOARD_CATEGORIES,
  type DashboardCategoryModel,
  type DashboardCategoryStyleModel,
} from "@/Features/DashboardScreen/Models/DashboardScreenModel";

export default class DashboardScreenService {
  public static current = new DashboardScreenService();

  // Returns static mock category data for now -- swap this method's body for a real
  // API/WatermelonDB query once the Categories backend/sync feature exists.
  public getCategories(): DashboardCategoryModel[] {
    return MOCK_DASHBOARD_CATEGORIES;
  }

  public getCategoryById(id: string): DashboardCategoryModel | undefined {
    return MOCK_DASHBOARD_CATEGORIES.find((category) => category.id === id);
  }

  // Vertical distance between each card's natural (unscrolled) top position.
  // Shared by the controller (total scroll distance) and the card component
  // (its own pin-arrival scroll position) so the two never drift.
  public getCategoryCardStep(): number {
    return DashboardScreenCON.CATEGORY_CARD_HEIGHT + DashboardScreenCON.CATEGORY_CARD_OVERLAP;
  }

  public resolveCategoryStyle(category: DashboardCategoryModel): DashboardCategoryStyleModel {
    return {
      backgroundColor: category.backgroundColor,
      textColor: category.textColor,
      iconName: category.iconName,
      iconBackgroundColor: this.darkenHexColor(
        category.backgroundColor,
        DashboardScreenCON.CATEGORY_ICON_BACKGROUND_DARKEN_AMOUNT,
      ),
    };
  }

  public calculateProgress(
    spentAmount: number,
    budgetCap: number,
  ): { percentage: number; ratio: number; remainingAmount: number; isOverCap: boolean } {
    if (budgetCap <= 0) {
      return { percentage: 0, ratio: 0, remainingAmount: 0, isOverCap: false };
    }

    const ratio = spentAmount / budgetCap;
    const percentage = Math.round(ratio * 100);
    const remainingAmount = budgetCap - spentAmount;
    const isOverCap = remainingAmount < 0;

    return {
      percentage,
      ratio,
      remainingAmount,
      isOverCap,
    };
  }

  // Always the same dark fill regardless of spend ratio -- the amber
  // (warning) / red (danger) conditional coloring was explicitly removed,
  // see grilling session 2026-11-11. The "X over cap" text's own red
  // (PROGRESS_BAR_DANGER_TEXT_COLOR) is unrelated and untouched.
  public resolveProgressBarColor(_spentAmount: number, _budgetCap: number): string {
    return DashboardScreenCON.PROGRESS_BAR_DEFAULT_COLOR;
  }

  public darkenHexColor(hex: string, amount: number): string {
    const sanitized = hex.replace("#", "");
    const r = parseInt(sanitized.substring(0, 2), 16);
    const g = parseInt(sanitized.substring(2, 4), 16);
    const b = parseInt(sanitized.substring(4, 6), 16);
    const toDarkenedHexChannel = (channel: number) =>
      Math.max(0, Math.round(channel * (1 - amount)))
        .toString(16)
        .padStart(2, "0");
    return `#${toDarkenedHexChannel(r)}${toDarkenedHexChannel(g)}${toDarkenedHexChannel(b)}`.toUpperCase();
  }

  // Rupees, matching ARCHITECTURE.md's single-currency (INR) decision
  public formatCurrency(amount: number): string {
    const sign = amount < 0 ? "-" : "";
    return `${sign}₹${Math.abs(amount).toLocaleString("en-IN")}`;
  }
}
