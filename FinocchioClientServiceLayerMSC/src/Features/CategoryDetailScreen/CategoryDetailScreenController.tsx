import { useLocalSearchParams } from "expo-router";
import React from "react";
import { View } from "react-native";

import ColorFactoryCON from "@/Constants/ColorFactoryCON";
import DashboardScreenService from "@/Features/DashboardScreen/Services/DashboardScreenService";

// Placeholder -- no real content yet, see grilling session 2026-11-15. The
// category is looked up here (not passed in full via route params) so the
// screen always reflects this category's current data, not a snapshot
// taken at the moment it was tapped.
export default function CategoryDetailScreenController(): React.JSX.Element {
  const { categoryId } = useLocalSearchParams<{ categoryId?: string }>();
  const category = categoryId ? DashboardScreenService.current.getCategoryById(categoryId) : undefined;

  return (
    <View
      className="flex-1"
      style={{ backgroundColor: category?.backgroundColor ?? ColorFactoryCON.BACKGROUND }}
    />
  );
}
