import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Text, View } from "react-native";
import Animated, { Extrapolation, interpolate, useAnimatedStyle, type SharedValue } from "react-native-reanimated";

import EdgeInsetsCON from "@/Constants/EdgeInsetsCON";
import DashboardScreenCON from "@/Features/DashboardScreen/Constants/DashboardScreenCON";
import type { DashboardCategoryModel } from "@/Features/DashboardScreen/Models/DashboardScreenModel";
import DashboardScreenService from "@/Features/DashboardScreen/Services/DashboardScreenService";
import UIFontHelper from "@/Helpers/UIFontHelper";

interface DashboardScreenCategoryCardStaticComponentProps {
  category: DashboardCategoryModel;
  index: number;
  isLastCard?: boolean;
  scrollY: SharedValue<number>;
}

export default function DashboardScreenCategoryCardStaticComponent({
  category,
  index,
  isLastCard = false,
  scrollY,
}: DashboardScreenCategoryCardStaticComponentProps): React.JSX.Element {
  const style = DashboardScreenService.current.resolveCategoryStyle(category);
  const formattedSpent = DashboardScreenService.current.formatCurrency(category.spentAmount);
  const formattedCap = DashboardScreenService.current.formatCurrency(category.budgetCap);
  const progress = DashboardScreenService.current.calculateProgress(category.spentAmount, category.budgetCap);
  const barColor = DashboardScreenService.current.resolveProgressBarColor(category.spentAmount, category.budgetCap);

  const cardStep = DashboardScreenService.current.getCategoryCardStep();
  const pinArrivalScrollY = index * cardStep - DashboardScreenCON.CATEGORY_STACK_PIN_OFFSET;

  // Breakpoints driving the "receding into the stack" scale: 1 while this
  // card hasn't been covered yet, stepping down once for every subsequent
  // card that locks in on top of it, capped at MAX_RECEDE_DEPTH levels.
  const recedeDepth = DashboardScreenCON.CATEGORY_STACK_MAX_RECEDE_DEPTH;
  const scaleInputRange = [pinArrivalScrollY];
  const scaleOutputRange = [1];
  for (let level = 1; level <= recedeDepth; level += 1) {
    scaleInputRange.push(pinArrivalScrollY + level * cardStep);
    scaleOutputRange.push(1 - level * DashboardScreenCON.CATEGORY_STACK_RECEDE_SCALE_STEP);
  }

  const animatedStyle = useAnimatedStyle(() => {
    const pinnedTranslateY = Math.max(scrollY.value - pinArrivalScrollY, 0);
    // The final card is the topmost card in the pinned deck -- it never has a
    // card stacked on top of it, so it strictly stays locked at full size (scale 1.0).
    const scale = isLastCard
      ? 1
      : interpolate(scrollY.value, scaleInputRange, scaleOutputRange, Extrapolation.CLAMP);

    return {
      transform: [{ translateY: pinnedTranslateY }, { scale }],
    };
  });

  return (
    <Animated.View
      style={[
        {
          position: "absolute",
          top: index * cardStep,
          left: 0,
          right: 0,
          height: DashboardScreenCON.CATEGORY_CARD_HEIGHT,
          zIndex: index,
          borderRadius: 24,
          borderWidth: 1,
          borderColor: DashboardScreenCON.CATEGORY_CARD_BORDER_COLOR,
          backgroundColor: style.backgroundColor,
          padding: EdgeInsetsCON.LG,
          justifyContent: "space-between",
          ...DashboardScreenCON.CATEGORY_CARD_SHADOW_STYLE,
        },
        animatedStyle,
      ]}
    >
      {/* Top Section: Category Icon, Name, and Shared/Personal badge with Member avatars */}
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center flex-1 pr-2">
          <View
            className="w-13 h-13 rounded-full items-center justify-center mr-3"
            style={{
              width: 52,
              height: 52,
              backgroundColor: style.iconBackgroundColor,
            }}
          >
            <Ionicons name={style.iconName} size={24} color={style.textColor} />
          </View>
          <Text
            numberOfLines={1}
            style={{
              color: style.textColor,
              fontSize: 26,
              fontFamily: UIFontHelper.current.getPirataOneFont(),
            }}
          >
            {category.name}
          </Text>
        </View>

        {category.categoryType === "Shared" ? (
          <View className="flex-row items-center">
            {category.members?.slice(0, 3).map((member, memberIdx) => (
              <View
                key={member.id}
                className="w-7 h-7 rounded-full items-center justify-center"
                style={{
                  backgroundColor: "#FFFFFF",
                  marginLeft: memberIdx > 0 ? -8 : 0,
                  borderWidth: 1.5,
                  borderColor: style.backgroundColor,
                }}
              >
                <Text style={{ fontSize: 11, fontWeight: "700", color: style.textColor }}>
                  {member.avatarInitials}
                </Text>
              </View>
            ))}
            <View
              className="rounded-full px-2 py-0.5 ml-1.5"
              style={{ backgroundColor: "rgba(28, 28, 40, 0.08)" }}
            >
              <Text style={{ fontSize: 11, fontWeight: "600", color: style.textColor }}>
                Shared
              </Text>
            </View>
          </View>
        ) : (
          <View
            className="rounded-full px-2.5 py-1"
            style={{ backgroundColor: "rgba(28, 28, 40, 0.08)" }}
          >
            <Text style={{ fontSize: 12, fontWeight: "600", color: style.textColor, opacity: 0.8 }}>
              Personal
            </Text>
          </View>
        )}
      </View>

      {/* Middle Section: Large Total Spent, Budget Cap, Progress Bar & Metrics */}
      <View className="my-auto py-2">
        <View className="flex-row items-baseline justify-between mb-2">
          <View className="flex-row items-baseline">
            <Text style={{ color: style.textColor, fontWeight: "700", fontSize: 32 }}>
              {formattedSpent}
            </Text>
            <Text style={{ color: style.textColor, opacity: 0.6, fontSize: 15, marginLeft: 6 }}>
              spent
            </Text>
          </View>
          <Text style={{ color: style.textColor, opacity: 0.7, fontSize: 14, fontWeight: "500" }}>
            Cap: {formattedCap}
          </Text>
        </View>

        {/* Progress Bar Track */}
        <View
          className="w-full h-3 rounded-full overflow-hidden"
          style={{ backgroundColor: DashboardScreenCON.PROGRESS_BAR_TRACK_COLOR }}
        >
          <View
            className="h-full rounded-full"
            style={{
              width: `${Math.min(progress.percentage, 100)}%`,
              backgroundColor: barColor,
            }}
          />
        </View>

        {/* Progress Sub-Row */}
        <View className="flex-row justify-between items-center mt-2.5">
          <Text style={{ color: style.textColor, fontWeight: "700", fontSize: 14 }}>
            {progress.percentage}% used
          </Text>
          <Text
            style={{
              color: progress.isOverCap ? DashboardScreenCON.PROGRESS_BAR_DANGER_COLOR : style.textColor,
              opacity: progress.isOverCap ? 1 : 0.7,
              fontWeight: progress.isOverCap ? "700" : "500",
              fontSize: 13,
            }}
          >
            {progress.isOverCap
              ? `${DashboardScreenService.current.formatCurrency(Math.abs(progress.remainingAmount))} over cap`
              : `${DashboardScreenService.current.formatCurrency(progress.remainingAmount)} left`}
          </Text>
        </View>
      </View>

      {/* Bottom Section: Transaction Count and Period Reset */}
      <View
        className="flex-row justify-between items-center pt-3"
        style={{ borderTopWidth: 1, borderTopColor: "rgba(0, 0, 0, 0.07)" }}
      >
        <View className="flex-row items-center">
          <Ionicons name="receipt-outline" size={15} color={style.textColor} style={{ opacity: 0.6, marginRight: 5 }} />
          <Text style={{ color: style.textColor, opacity: 0.75, fontSize: 13, fontWeight: "500" }}>
            {category.transactionCount} transactions
          </Text>
        </View>
        <Text style={{ color: style.textColor, opacity: 0.6, fontSize: 13 }}>
          {category.periodLabel}
        </Text>
      </View>
    </Animated.View>
  );
}
