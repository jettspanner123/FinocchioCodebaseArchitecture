import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Text, View } from "react-native";

import EdgeInsetsCON from "@/Constants/EdgeInsetsCON";
import DashboardScreenCON from "@/Features/DashboardScreen/Constants/DashboardScreenCON";
import type { DashboardTransactionModel } from "@/Features/DashboardScreen/Models/DashboardScreenModel";
import DashboardScreenService from "@/Features/DashboardScreen/Services/DashboardScreenService";

interface DashboardScreenTransactionCardStaticComponentProps {
  transaction: DashboardTransactionModel;
  isFirst: boolean;
}

export default function DashboardScreenTransactionCardStaticComponent({
  transaction,
  isFirst,
}: DashboardScreenTransactionCardStaticComponentProps): React.JSX.Element {
  const style = DashboardScreenService.current.resolveCategoryStyle(transaction.category);
  const formattedAmount = DashboardScreenService.current.formatCurrency(transaction.amount);

  return (
    <View
      className="rounded-3xl flex-row items-center justify-between"
      style={{
        backgroundColor: style.backgroundColor,
        padding: EdgeInsetsCON.LG,
        marginTop: isFirst ? 0 : DashboardScreenCON.TRANSACTION_CARD_OVERLAP,
      }}
    >
      <View className="flex-row items-center flex-1">
        <View className="w-10 h-10 rounded-full bg-white items-center justify-center" style={{ marginRight: EdgeInsetsCON.MD }}>
          <Ionicons name={style.iconName} size={18} color={style.backgroundColor} />
        </View>

        <View className="flex-1">
          <Text style={{ color: style.textColor, opacity: 0.7, fontSize: 12 }}>{transaction.category}</Text>
          <Text style={{ color: style.textColor, fontWeight: "600", fontSize: 16 }}>{transaction.merchantName}</Text>
        </View>
      </View>

      <View className="items-end">
        <Text style={{ color: style.textColor, opacity: 0.7, fontSize: 12 }}>{transaction.dayLabel}</Text>
        <Text style={{ color: style.textColor, fontWeight: "600", fontSize: 16 }}>{formattedAmount}</Text>
      </View>
    </View>
  );
}
