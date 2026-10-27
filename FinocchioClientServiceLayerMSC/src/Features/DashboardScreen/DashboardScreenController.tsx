import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

import ColorFactoryCON from "@/Constants/ColorFactoryCON";
import EdgeInsetsCON from "@/Constants/EdgeInsetsCON";
import DashboardScreenTransactionCardStaticComponent from "@/Features/DashboardScreen/Components/static/DashboardScreenTransactionCardStaticComponent";
import DashboardScreenCON from "@/Features/DashboardScreen/Constants/DashboardScreenCON";
import DashboardScreenService from "@/Features/DashboardScreen/Services/DashboardScreenService";

// Logout intentionally has no home in this screen yet -- it belongs on a
// real Settings/Profile screen that doesn't exist, not bolted onto an avatar
// tap here as a guess. Top bar elements (avatars, +, Week dropdown) are
// static placeholders for this design-system pass, not wired to navigation.
export default function DashboardScreenController(): React.JSX.Element {
  const transactions = DashboardScreenService.current.getWeeklyTransactions();

  return (
    <View className="flex-1" style={{ backgroundColor: ColorFactoryCON.BACKGROUND }}>
      <ScrollView contentContainerStyle={{ padding: EdgeInsetsCON.LG, paddingTop: EdgeInsetsCON.XXL }}>
        <View className="flex-row items-center justify-between" style={{ marginBottom: EdgeInsetsCON.XL }}>
          <View className="flex-row items-center">
            <View
              className="w-9 h-9 rounded-full bg-white items-center justify-center"
              style={{ borderWidth: 2, borderColor: ColorFactoryCON.BACKGROUND }}
            >
              <Ionicons name="person" size={16} color={ColorFactoryCON.SUBTLE_TEXT} />
            </View>
            <View
              className="w-9 h-9 rounded-full bg-white items-center justify-center -ml-3"
              style={{ borderWidth: 2, borderColor: ColorFactoryCON.BACKGROUND }}
            >
              <Ionicons name="person" size={16} color={ColorFactoryCON.SUBTLE_TEXT} />
            </View>
            <Pressable className="w-9 h-9 rounded-full bg-white items-center justify-center ml-2" disabled>
              <Ionicons name="add" size={18} color={ColorFactoryCON.INK} />
            </Pressable>
          </View>

          <Pressable className="flex-row items-center" disabled>
            <Ionicons name="chevron-down" size={18} color={ColorFactoryCON.INK} />
          </Pressable>
        </View>

        <Text style={{ color: ColorFactoryCON.SUBTLE_TEXT, fontSize: 16 }}>{DashboardScreenCON.HEADER_LABEL}</Text>
        <Text className="mb-6" style={{ color: ColorFactoryCON.INK, fontSize: 40, fontWeight: "700" }}>
          {DashboardScreenCON.PERIOD_LABEL}
        </Text>

        {transactions.map((transaction) => (
          <DashboardScreenTransactionCardStaticComponent key={transaction.id} transaction={transaction} />
        ))}
      </ScrollView>
    </View>
  );
}
