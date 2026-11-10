import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Text, View } from "react-native";

import ColorFactoryCON from "@/Constants/ColorFactoryCON";
import EdgeInsetsCON from "@/Constants/EdgeInsetsCON";
import CreateCategoryScreenCON from "@/Features/CreateCategoryScreen/Constants/CreateCategoryScreenCON";
import {
  CreateCategoryScreenBudgetPeriodEnum,
  CreateCategoryScreenTypeEnum,
} from "@/Features/CreateCategoryScreen/Models/CreateCategoryScreenModel";
import DashboardScreenCON from "@/Features/DashboardScreen/Constants/DashboardScreenCON";
import type { DashboardCategoryMemberModel } from "@/Features/DashboardScreen/Models/DashboardScreenModel";
import DashboardScreenService from "@/Features/DashboardScreen/Services/DashboardScreenService";

interface CreateCategoryScreenCardPreviewStaticComponentProps {
  name: string;
  backgroundColor: string;
  amount: string;
  period: CreateCategoryScreenBudgetPeriodEnum;
  type: CreateCategoryScreenTypeEnum;
  members: DashboardCategoryMemberModel[];
}

// A static, non-interactive twin of DashboardScreenCategoryCardStaticComponent's
// visuals -- not the real component, since that one is fused with the
// Dashboard's scroll-stack/tap-to-expand animation (5 required SharedValue
// props, absolutely positioned, no "static mode"). Built fresh instead of
// forked so this preview carries zero Reanimated/worklet coupling -- see
// grilling session 2026-11-02. No menu icon, no press feedback, no category
// icon glyph (the real card computes one but never actually renders it --
// showing it here would make the preview diverge from what the category will
// actually look like on Dashboard today, not less).
export default function CreateCategoryScreenCardPreviewStaticComponent({
  name,
  backgroundColor,
  amount,
  period,
  type,
  members,
}: CreateCategoryScreenCardPreviewStaticComponentProps): React.JSX.Element {
  // Every pre-approved color pairs with the same INK text color in the real
  // mock data (see grilling session 2026-11-03), so no separate text-color
  // picker/field is needed.
  const textColor = ColorFactoryCON.INK;

  const budgetCap = parseFloat(amount) || 0;
  const progress = DashboardScreenService.current.calculateProgress(0, budgetCap);
  const barColor = DashboardScreenService.current.resolveProgressBarColor(0, budgetCap);

  return (
    <View
      style={{
        height: DashboardScreenCON.CATEGORY_CARD_HEIGHT,
        borderRadius: 24,
        borderWidth: 1.5,
        borderColor: ColorFactoryCON.BORDER_STRONG,
        backgroundColor,
        padding: EdgeInsetsCON.LG,
        ...DashboardScreenCON.CATEGORY_CARD_SHADOW_STYLE,
      }}
    >
      {/* Top Section: member avatars only -- no menu icon (nothing for it to
          open in a preview), no fallback placeholder avatar when there are no
          members yet (matches the real card's fix, see grilling session
          2026-11-02). */}
      <View className="flex-row items-center pb-3" style={{ borderBottomWidth: 1, borderBottomColor: "rgba(0, 0, 0, 0.07)" }}>
        {members.length > 0
          ? members.slice(0, 3).map((member, memberIndex) => (
              <View
                key={member.id}
                className="w-14 h-14 rounded-full items-center justify-center"
                style={{
                  backgroundColor: "#FFFFFF",
                  marginLeft: memberIndex > 0 ? -16 : 0,
                  borderWidth: 1,
                  borderColor: backgroundColor,
                }}
              >
                <Text style={{ fontSize: 16, fontWeight: "700", color: textColor }}>{member.avatarInitials}</Text>
              </View>
            ))
          : null}
      </View>

      {/* Middle Section: name, Personal/Shared badge, progress bar & metrics */}
      <View className="py-3">
        <View className="flex-row items-center justify-between mb-2">
          <Text numberOfLines={1} style={{ color: textColor, fontWeight: "700", fontSize: 28, flexShrink: 1 }}>
            {name}
          </Text>

          {type === CreateCategoryScreenTypeEnum.SHARED ? (
            <View className="rounded-full px-2 py-0.5" style={{ backgroundColor: "rgba(28, 28, 40, 0.08)" }}>
              <Text style={{ fontSize: 11, fontWeight: "600", color: textColor }}>Shared</Text>
            </View>
          ) : (
            <View className="rounded-full px-2.5 py-1" style={{ backgroundColor: "rgba(28, 28, 40, 0.08)" }}>
              <Text style={{ fontSize: 12, fontWeight: "600", color: textColor, opacity: 0.8 }}>Personal</Text>
            </View>
          )}
        </View>

        <View
          className="w-full rounded-full overflow-hidden"
          style={{ height: 18, backgroundColor: DashboardScreenCON.PROGRESS_BAR_TRACK_COLOR }}
        >
          <View className="h-full rounded-full" style={{ width: `${Math.min(progress.percentage, 100)}%`, backgroundColor: barColor }} />
        </View>

        <View className="flex-row justify-between items-center mt-2.5">
          <Text style={{ color: textColor, fontWeight: "700", fontSize: 14 }}>{progress.percentage}% used</Text>
          <Text style={{ color: textColor, opacity: 0.7, fontWeight: "500", fontSize: 13 }}>
            {DashboardScreenService.current.formatCurrency(progress.remainingAmount)} left
          </Text>
        </View>
      </View>

      {/* Bottom Section: transaction count (always 0 -- category doesn't
          exist yet) and the reset cadence derived from the chosen period,
          since there's no real creation date yet to compute a real
          "Resets in N days" countdown from -- see grilling session
          2026-11-02. */}
      <View className="flex-row justify-between items-center pt-3" style={{ borderTopWidth: 1, borderTopColor: "rgba(0, 0, 0, 0.07)" }}>
        <View className="flex-row items-center">
          <Ionicons name="receipt-outline" size={15} color={textColor} style={{ opacity: 0.6, marginRight: 5 }} />
          <Text style={{ color: textColor, opacity: 0.75, fontSize: 13, fontWeight: "500" }}>0 transactions</Text>
        </View>
        <Text style={{ color: textColor, opacity: 0.75, fontSize: 13 }}>
          {CreateCategoryScreenCON.REVIEW_CARD_PERIOD_RESET_LABELS[period]}
        </Text>
      </View>
    </View>
  );
}
