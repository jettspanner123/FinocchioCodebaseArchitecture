import type { Ionicons } from "@expo/vector-icons";

export type DashboardTransactionCategoryType = "Games" | "Products" | "Entertainment" | "Food";

export interface DashboardTransactionModel {
  id: string;
  category: DashboardTransactionCategoryType;
  merchantName: string;
  amount: number;
  dayLabel: string;
}

export interface DashboardCategoryStyleModel {
  backgroundColor: string;
  textColor: string;
  iconName: keyof typeof Ionicons.glyphMap;
}

// Static mock data -- establishes the visual design now; DashboardScreenService
// is the only thing that needs to change once the real Transactions backend
// feature exists.
export const MOCK_DASHBOARD_TRANSACTIONS: DashboardTransactionModel[] = [
  { id: "1", category: "Games", merchantName: "Play Station", amount: -281.5, dayLabel: "Monday" },
  { id: "2", category: "Products", merchantName: "Amazon", amount: -1234, dayLabel: "Tuesday" },
  { id: "3", category: "Entertainment", merchantName: "Spotify Family", amount: -26, dayLabel: "Wednesday" },
  { id: "4", category: "Food", merchantName: "Taco Bell", amount: -25.55, dayLabel: "Friday" },
];
