import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { Pressable, Text, View } from "react-native";
import Animated, { Extrapolation, interpolate, useAnimatedStyle, type SharedValue } from "react-native-reanimated";

import ApplicationRouteCON from "@/Constants/ApplicationRouteCON";
import ColorFactoryCON from "@/Constants/ColorFactoryCON";
import EdgeInsetsCON from "@/Constants/EdgeInsetsCON";
import DashboardScreenCON from "@/Features/DashboardScreen/Constants/DashboardScreenCON";
import type { DashboardCategoryModel } from "@/Features/DashboardScreen/Models/DashboardScreenModel";
import DashboardScreenService from "@/Features/DashboardScreen/Services/DashboardScreenService";
import useCardPressAnimationHook from "@/Hooks/useCardPressAnimationHook";

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
  const pressAnimation = useCardPressAnimationHook();

  const style = DashboardScreenService.current.resolveCategoryStyle(category);
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

  const handlePress = (): void => {
    router.push({
      pathname: ApplicationRouteCON.CATEGORY_DETAIL_SCREEN_ROUTE,
      params: { categoryId: category.id },
    });
  };

  const cardAnimatedStyle = useAnimatedStyle(() => {
    const pinnedTranslateY = Math.max(scrollY.value - pinArrivalScrollY, 0);
    // The final card is the topmost card in the pinned deck -- it never has a
    // card stacked on top of it, so it strictly stays locked at full size (scale 1.0).
    const recedeScale = isLastCard
      ? 1
      : interpolate(scrollY.value, scaleInputRange, scaleOutputRange, Extrapolation.CLAMP);

    return {
      transform: [{ translateY: pinnedTranslateY }, { scale: recedeScale * pressAnimation.scale.value }],
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
          borderWidth: 1.5,
          borderColor: ColorFactoryCON.BORDER_STRONG,
          backgroundColor: style.backgroundColor,
          padding: EdgeInsetsCON.LG,
          ...DashboardScreenCON.CATEGORY_CARD_BOX_SHADOW_STYLE,
        },
        cardAnimatedStyle,
      ]}
    >
      <Pressable
        onPress={handlePress}
        onPressIn={pressAnimation.onPressIn}
        onPressOut={pressAnimation.onPressOut}
        style={{ flex: 1 }}
      >
        <View style={{ flex: 1 }}>
          {/* Top Section: Category Icon, Name, and Shared/Personal badge with Member avatars */}
          <View
            className="flex-row items-center justify-between pb-3"
            style={{ borderBottomWidth: 1, borderBottomColor: "rgba(0, 0, 0, 0.07)" }}
          >
            <View
              className="flex-row items-center"
              accessible
              accessibilityLabel={
                category.members && category.members.length > 0
                  ? `Shared with ${category.members.map((member) => member.name).join(", ")}`
                  : "Personal category"
              }
            >
              {/* No fallback placeholder avatar when there are no members --
                  it used to render a hardcoded "V" circle, which read as
                  leftover test data rather than a real category state (see
                  grilling session 2026-11-02). Personal categories (and any
                  Shared category with nobody added yet) simply show no
                  avatar row. */}
              {category.members && category.members.length > 0
                ? category.members.slice(0, 3).map((member, memberIdx) => (
                    <View
                      key={member.id}
                      className="w-14 h-14 rounded-full items-center justify-center"
                      style={{
                        backgroundColor: "#FFFFFF",
                        marginLeft: memberIdx > 0 ? -16 : 0,
                        borderWidth: 1,
                        borderColor: style.backgroundColor,
                      }}
                    >
                      <Text style={{ fontSize: 16, fontWeight: "700", color: style.textColor }}>
                        {member.avatarInitials}
                      </Text>
                    </View>
                  ))
                : null}
            </View>

            <Pressable hitSlop={8} accessibilityRole="button" accessibilityLabel="More options">
              <Ionicons name="ellipsis-horizontal-outline" size={20} color={style.textColor} />
            </Pressable>
          </View>

          {/* Middle Section: Large Total Spent, Budget Cap, Progress Bar & Metrics */}
          <View className="py-3">
            <View className="flex-row items-center justify-between mb-2">
              <Text numberOfLines={1} style={{ color: style.textColor, fontWeight: "700", fontSize: 28, flexShrink: 1 }}>
                {category.name}
              </Text>

              {category.categoryType === "Shared" ? (
                <View className="rounded-full px-2 py-0.5" style={{ backgroundColor: "rgba(28, 28, 40, 0.08)" }}>
                  <Text style={{ fontSize: 11, fontWeight: "600", color: style.textColor }}>Shared</Text>
                </View>
              ) : (
                <View className="rounded-full px-2.5 py-1" style={{ backgroundColor: "rgba(28, 28, 40, 0.08)" }}>
                  <Text style={{ fontSize: 12, fontWeight: "600", color: style.textColor, opacity: 0.8 }}>Personal</Text>
                </View>
              )}
            </View>

            {/* Progress Bar Track */}
            <View
              className="w-full rounded-full overflow-hidden"
              style={{ height: 18, backgroundColor: DashboardScreenCON.PROGRESS_BAR_TRACK_COLOR }}
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
              <Text style={{ color: style.textColor, fontWeight: "700", fontSize: 14 }}>{progress.percentage}% used</Text>
              <Text
                style={{
                  color: progress.isOverCap ? DashboardScreenCON.PROGRESS_BAR_DANGER_TEXT_COLOR : style.textColor,
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
          <View className="flex-row justify-between items-center pt-3" style={{ borderTopWidth: 1, borderTopColor: "rgba(0, 0, 0, 0.07)" }}>
            <View className="flex-row items-center">
              <Ionicons name="receipt-outline" size={15} color={style.textColor} style={{ opacity: 0.6, marginRight: 5 }} />
              <Text style={{ color: style.textColor, opacity: 0.75, fontSize: 13, fontWeight: "500" }}>
                {category.transactionCount} transactions
              </Text>
            </View>
            <Text style={{ color: style.textColor, opacity: 0.75, fontSize: 13 }}>{category.periodLabel}</Text>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}
