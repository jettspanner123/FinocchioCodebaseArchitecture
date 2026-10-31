import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, Text, View, useWindowDimensions } from "react-native";
import Animated, {
  Extrapolation,
  interpolate,
  measure,
  runOnUI,
  useAnimatedRef,
  useAnimatedStyle,
  type SharedValue,
} from "react-native-reanimated";

import EdgeInsetsCON from "@/Constants/EdgeInsetsCON";
import DashboardScreenCON from "@/Features/DashboardScreen/Constants/DashboardScreenCON";
import type { DashboardCategoryModel, DashboardMeasuredRectModel } from "@/Features/DashboardScreen/Models/DashboardScreenModel";
import DashboardScreenService from "@/Features/DashboardScreen/Services/DashboardScreenService";

interface DashboardScreenCategoryCardStaticComponentProps {
  category: DashboardCategoryModel;
  index: number;
  isLastCard?: boolean;
  scrollY: SharedValue<number>;
  expandProgress: SharedValue<number>;
  selectedIndex: SharedValue<number>;
  expandedCardRect: SharedValue<DashboardMeasuredRectModel>;
  isSequenceActive: boolean;
  onTap: (index: number) => void;
  onReverseTap: () => void;
}

// Tap-to-expand (see CATEGORY_CARD_EXPAND_PRD.md): this card never animates
// itself to fullscreen -- a separate DashboardScreenCategoryExpandOverlayStaticComponent
// handles the actual growth, starting exactly coincident with this card's
// measured position/color so the handoff is invisible. This component only
// does two things for the sequence: (1) if it's NOT the tapped card, slides
// away like every other non-selected element; (2) if it IS the tapped card,
// fades its own content out, otherwise staying exactly where the existing
// pin/recede animation already puts it. Both are additive on top of the
// existing scroll-stacking transform, in the SAME useAnimatedStyle worklet --
// RN doesn't merge `transform` arrays across separate style objects, so
// combining them in a second style object would silently break the
// pin/recede animation instead of adding to it.
export default function DashboardScreenCategoryCardStaticComponent({
  category,
  index,
  isLastCard = false,
  scrollY,
  expandProgress,
  selectedIndex,
  expandedCardRect,
  isSequenceActive,
  onTap,
  onReverseTap,
}: DashboardScreenCategoryCardStaticComponentProps): React.JSX.Element {
  const animatedRef = useAnimatedRef<Animated.View>();
  const { height: screenHeight } = useWindowDimensions();
  const slideAwayDistance = screenHeight + DashboardScreenCON.CATEGORY_CARD_HEIGHT + EdgeInsetsCON.XXL;
  // Resolved to plain numbers here, outside the worklets below -- Reanimated's
  // worklet closure capture doesn't reliably serialize a live reference to an
  // ES6 class (DashboardScreenCON) the way it does a plain number, which
  // silently broke every one of this screen's new slide-away/fade worklets
  // until this was fixed (confirmed via isolation testing on-device).
  const slideAwayEndProgress = DashboardScreenCON.EXPAND_SLIDE_AWAY_END_PROGRESS;
  const contentFadeEndProgress = DashboardScreenCON.EXPAND_CONTENT_FADE_END_PROGRESS;

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
    if (selectedIndex.value === index) {
      onReverseTap();
      return;
    }
    if (isSequenceActive) {
      return;
    }

    runOnUI((targetIndex: number) => {
      "worklet";
      const measured = measure(animatedRef);
      if (measured) {
        expandedCardRect.value = {
          x: measured.pageX,
          y: measured.pageY,
          width: measured.width,
          height: measured.height,
        };
      }
      selectedIndex.value = targetIndex;
    })(index);

    onTap(index);
  };

  const cardAnimatedStyle = useAnimatedStyle(() => {
    const isSelected = selectedIndex.value === index;

    const pinnedTranslateY = Math.max(scrollY.value - pinArrivalScrollY, 0);
    // The final card is the topmost card in the pinned deck -- it never has a
    // card stacked on top of it, so it strictly stays locked at full size (scale 1.0).
    const recedeScale = isLastCard
      ? 1
      : interpolate(scrollY.value, scaleInputRange, scaleOutputRange, Extrapolation.CLAMP);

    const slideAwayTranslateY = isSelected
      ? 0
      : interpolate(expandProgress.value, [0, slideAwayEndProgress], [0, slideAwayDistance], Extrapolation.CLAMP);

    return {
      transform: [{ translateY: pinnedTranslateY + slideAwayTranslateY }, { scale: recedeScale }],
    };
  });

  const contentAnimatedStyle = useAnimatedStyle(() => {
    const isSelected = selectedIndex.value === index;
    const opacity = isSelected
      ? interpolate(expandProgress.value, [0, contentFadeEndProgress], [1, 0], Extrapolation.CLAMP)
      : 1;

    return { opacity };
  });

  return (
    <Animated.View
      ref={animatedRef}
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
          ...DashboardScreenCON.CATEGORY_CARD_SHADOW_STYLE,
        },
        cardAnimatedStyle,
      ]}
    >
      <Pressable onPress={handlePress} style={{ flex: 1 }}>
        <Animated.View style={[{ flex: 1 }, contentAnimatedStyle]}>
          {/* Top Section: Category Icon, Name, and Shared/Personal badge with Member avatars */}
          <View
            className="flex-row items-center justify-between pb-3"
            style={{ borderBottomWidth: 1, borderBottomColor: "rgba(0, 0, 0, 0.07)" }}
          >
            <View className="flex-row items-center">
              {category.members && category.members.length > 0 ? (
                category.members.slice(0, 3).map((member, memberIdx) => (
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
              ) : (
                <View
                  className="w-14 h-14 rounded-full items-center justify-center"
                  style={{ backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "rgba(0, 0, 0, 0.15)" }}
                >
                  <Text style={{ fontSize: 16, fontWeight: "700", color: style.textColor }}>V</Text>
                </View>
              )}
            </View>

            <Pressable hitSlop={8}>
              <Ionicons name="ellipsis-horizontal" size={20} color={style.textColor} />
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
          <View className="flex-row justify-between items-center pt-3" style={{ borderTopWidth: 1, borderTopColor: "rgba(0, 0, 0, 0.07)" }}>
            <View className="flex-row items-center">
              <Ionicons name="receipt-outline" size={15} color={style.textColor} style={{ opacity: 0.6, marginRight: 5 }} />
              <Text style={{ color: style.textColor, opacity: 0.75, fontSize: 13, fontWeight: "500" }}>
                {category.transactionCount} transactions
              </Text>
            </View>
            <Text style={{ color: style.textColor, opacity: 0.6, fontSize: 13 }}>{category.periodLabel}</Text>
          </View>
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
}
