import React from "react";
import { Pressable, useWindowDimensions } from "react-native";
import Animated, { Extrapolation, interpolate, useAnimatedStyle, type SharedValue } from "react-native-reanimated";

import DashboardScreenCON from "@/Features/DashboardScreen/Constants/DashboardScreenCON";
import type { DashboardCategoryModel, DashboardMeasuredRectModel } from "@/Features/DashboardScreen/Models/DashboardScreenModel";

interface DashboardScreenCategoryExpandOverlayStaticComponentProps {
  category: DashboardCategoryModel;
  expandProgress: SharedValue<number>;
  expandedCardRect: SharedValue<DashboardMeasuredRectModel>;
  onPress: () => void;
}

// Decoupled "clone" layer, not the real in-stack card morphing itself: the
// real card (DashboardScreenCategoryCardStaticComponent) stays put and only
// fades its own content out. This overlay starts exactly coincident with the
// real card's measured position/size/color (so the handoff is invisible --
// same color, same bounds) and is the only thing that actually grows to
// fullscreen. Decoupling avoids re-deriving screen coordinates through the
// ScrollView's own scroll-offset math a second time -- measure() already
// gives true screen coordinates, and this overlay renders outside the
// ScrollView entirely (see DashboardScreenController), so those coordinates
// apply directly. See CATEGORY_CARD_EXPAND_PRD.md §4 and §7.
export default function DashboardScreenCategoryExpandOverlayStaticComponent({
  category,
  expandProgress,
  expandedCardRect,
  onPress,
}: DashboardScreenCategoryExpandOverlayStaticComponentProps): React.JSX.Element {
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();

  const animatedStyle = useAnimatedStyle(() => {
    const rect = expandedCardRect.value;
    const growthRange = [DashboardScreenCON.EXPAND_GROWTH_START_PROGRESS, 1];

    return {
      top: interpolate(expandProgress.value, growthRange, [rect.y, 0], Extrapolation.CLAMP),
      left: interpolate(expandProgress.value, growthRange, [rect.x, 0], Extrapolation.CLAMP),
      width: interpolate(expandProgress.value, growthRange, [rect.width, screenWidth], Extrapolation.CLAMP),
      height: interpolate(expandProgress.value, growthRange, [rect.height, screenHeight], Extrapolation.CLAMP),
      borderRadius: interpolate(expandProgress.value, growthRange, [24, 0], Extrapolation.CLAMP),
    };
  });

  return (
    <Animated.View
      style={[
        {
          position: "absolute",
          zIndex: 999,
          backgroundColor: category.backgroundColor,
          overflow: "hidden",
        },
        animatedStyle,
      ]}
    >
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={`Collapse ${category.name}`}
        style={{ flex: 1 }}
      />
    </Animated.View>
  );
}
