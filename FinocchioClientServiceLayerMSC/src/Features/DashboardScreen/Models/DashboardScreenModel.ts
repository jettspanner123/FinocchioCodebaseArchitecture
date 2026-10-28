import type { Ionicons } from "@expo/vector-icons";

export type DashboardCategoryType = "Personal" | "Shared";

export interface DashboardCategoryMemberModel {
  id: string;
  name: string;
  avatarInitials: string;
}

export interface DashboardCategoryModel {
  id: string;
  name: string;
  categoryType: DashboardCategoryType;
  spentAmount: number;
  budgetCap: number;
  transactionCount: number;
  periodLabel: string;
  iconName: keyof typeof Ionicons.glyphMap;
  backgroundColor: string;
  textColor: string;
  members?: DashboardCategoryMemberModel[];
}

export interface DashboardCategoryStyleModel {
  backgroundColor: string;
  textColor: string;
  iconName: keyof typeof Ionicons.glyphMap;
  iconBackgroundColor: string;
}

// Static mock data -- establishes the visual design and category showcase;
// DashboardScreenService is the only thing that needs to change once real
// Category/WatermelonDB domain queries exist.
export const MOCK_DASHBOARD_CATEGORIES: DashboardCategoryModel[] = [
  {
    id: "1",
    name: "Home",
    categoryType: "Shared",
    spentAmount: 13000,
    budgetCap: 20000,
    transactionCount: 18,
    periodLabel: "Resets in 6 days",
    iconName: "home",
    backgroundColor: "#E0C4F1",
    textColor: "#1C1C28",
    members: [
      { id: "m1", name: "Alex", avatarInitials: "A" },
      { id: "m2", name: "Sarah", avatarInitials: "S" },
      { id: "m3", name: "Dev", avatarInitials: "D" },
    ],
  },
  {
    id: "2",
    name: "Gym",
    categoryType: "Personal",
    spentAmount: 2000,
    budgetCap: 5000,
    transactionCount: 4,
    periodLabel: "Resets in 6 days",
    iconName: "barbell",
    backgroundColor: "#F4F5A8",
    textColor: "#1C1C28",
  },
  {
    id: "3",
    name: "Office",
    categoryType: "Shared",
    spentAmount: 8500,
    budgetCap: 10000,
    transactionCount: 24,
    periodLabel: "Resets in 6 days",
    iconName: "briefcase",
    backgroundColor: "#C5CDF0",
    textColor: "#1C1C28",
    members: [
      { id: "m4", name: "Mark", avatarInitials: "M" },
      { id: "m5", name: "Priya", avatarInitials: "P" },
      { id: "m6", name: "Sam", avatarInitials: "S" },
      { id: "m7", name: "Leo", avatarInitials: "L" },
    ],
  },
  {
    id: "4",
    name: "Dining",
    categoryType: "Personal",
    spentAmount: 15300,
    budgetCap: 15000,
    transactionCount: 31,
    periodLabel: "Resets in 6 days",
    iconName: "restaurant",
    backgroundColor: "#FFD6A5",
    textColor: "#1C1C28",
  },
  {
    id: "5",
    name: "Travel",
    categoryType: "Shared",
    spentAmount: 5000,
    budgetCap: 20000,
    transactionCount: 3,
    periodLabel: "Resets in 6 days",
    iconName: "airplane",
    backgroundColor: "#BFF0D4",
    textColor: "#1C1C28",
    members: [
      { id: "m8", name: "Rohan", avatarInitials: "R" },
      { id: "m9", name: "Maya", avatarInitials: "M" },
    ],
  },
];
