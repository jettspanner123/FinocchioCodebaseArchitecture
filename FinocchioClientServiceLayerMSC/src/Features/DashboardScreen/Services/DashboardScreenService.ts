import ColorFactoryCON from "@/Constants/ColorFactoryCON";
import DashboardScreenCON from "@/Features/DashboardScreen/Constants/DashboardScreenCON";
import {
  MOCK_DASHBOARD_TRANSACTIONS,
  type DashboardCategoryStyleModel,
  type DashboardTransactionCategoryType,
  type DashboardTransactionModel,
} from "@/Features/DashboardScreen/Models/DashboardScreenModel";

export default class DashboardScreenService {
  public static current = new DashboardScreenService();

  // Returns static mock data for now -- swap this method's body for a real
  // API/WatermelonDB query once the Transactions backend feature exists;
  // nothing else in this screen needs to change.
  public getWeeklyTransactions(): DashboardTransactionModel[] {
    return MOCK_DASHBOARD_TRANSACTIONS;
  }

  // Vertical distance between each card's natural (unscrolled) top position.
  // Single source of truth shared by the controller (total scroll distance)
  // and the card component (its own pin-arrival scroll position), so the two
  // never drift out of sync.
  public getTransactionCardStep(): number {
    return DashboardScreenCON.TRANSACTION_CARD_HEIGHT + DashboardScreenCON.TRANSACTION_CARD_OVERLAP;
  }

  public resolveCategoryStyle(category: DashboardTransactionCategoryType): DashboardCategoryStyleModel {
    switch (category) {
      case "Games":
        return { backgroundColor: ColorFactoryCON.CARD_GAMES, textColor: ColorFactoryCON.CARD_GAMES_TEXT, iconName: "game-controller" };
      case "Products":
        return { backgroundColor: ColorFactoryCON.CARD_PRODUCTS, textColor: ColorFactoryCON.CARD_PRODUCTS_TEXT, iconName: "bag" };
      case "Entertainment":
        return {
          backgroundColor: ColorFactoryCON.CARD_ENTERTAINMENT,
          textColor: ColorFactoryCON.CARD_ENTERTAINMENT_TEXT,
          iconName: "musical-notes",
        };
      case "Food":
        return { backgroundColor: ColorFactoryCON.CARD_FOOD, textColor: ColorFactoryCON.CARD_FOOD_TEXT, iconName: "fast-food" };
    }
  }

  // Rupees, matching ARCHITECTURE.md's single-currency (INR) decision -- the
  // design mockup this screen is based on showed $ amounts, deliberately not
  // copied literally since the currency was already decided elsewhere.
  public formatCurrency(amount: number): string {
    const sign = amount < 0 ? "-" : "";
    return `${sign}₹${Math.abs(amount).toLocaleString("en-IN")}`;
  }
}
