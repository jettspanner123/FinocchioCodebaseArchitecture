import React from "react";
import { Pressable, useWindowDimensions } from "react-native";
import Animated, { Extrapolation, interpolate, useAnimatedStyle, type SharedValue } from "react-native-reanimated";

import ColorFactoryCON from "@/Constants/ColorFactoryCON";
import DashboardScreenCON from "@/Features/DashboardScreen/Constants/DashboardScreenCON";
import type { DashboardCategoryModel, DashboardMeasuredRectModel } from "@/Features/DashboardScreen/Models/DashboardScreenModel";

// Must match DashboardScreenCategoryCardStaticComponent's own category-card
// border width exactly, so the handoff at the start of growth is invisible.
const CARD_BORDER_WIDTH = 1.5;

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
  // Resolved to a plain number here, outside the worklet below -- see
  // DashboardScreenCategoryCardStaticComponent's comment on why a
  // DashboardScreenCON property must never be read directly inside a
  // useAnimatedStyle callback.
  const growthStartProgress = DashboardScreenCON.EXPAND_GROWTH_START_PROGRESS;
  // Same reasoning as above -- ColorFactoryCON's getters read a Zustand
  // store and can't be called from inside a UI-thread worklet closure.
  const borderColor = ColorFactoryCON.BORDER_STRONG;

  // Scale-based growth, not interpolating width/height/top/left to the
  // exact screen rect -- the card keeps its own proportions and uniformly
  // scales up until it's large enough to COVER the screen (same idea as
  // CSS's object-fit: cover), rather than being stretched non-uniformly to
  // exactly fill it. Whichever dimension doesn't match the screen's aspect
  // ratio ends up overflowing past that edge -- there's nothing beyond the
  // device's own physical edge for it to be visible against, so no explicit
  // clipping container is needed. See grilling session 2026-11-14.
  const animatedStyle = useAnimatedStyle(() => {
    const rect = expandedCardRect.value;
    const growthRange = [growthStartProgress, 1];
    const coverScale = Math.max(screenWidth / rect.width, screenHeight / rect.height);
    // transform: scale applies around the view's own center by default --
    // this additional translate moves that center from the card's original
    // position to the screen's center, in lockstep with the scale, so the
    // grown card ends up covering the screen symmetrically rather than
    // just ballooning from a corner.
    const rectCenterX = rect.x + rect.width / 2;
    const rectCenterY = rect.y + rect.height / 2;
    const screenCenterX = screenWidth / 2;
    const screenCenterY = screenHeight / 2;
    const scale = interpolate(expandProgress.value, growthRange, [1, coverScale], Extrapolation.CLAMP);

    return {
      top: rect.y,
      left: rect.x,
      width: rect.width,
      height: rect.height,
      borderRadius: interpolate(expandProgress.value, growthRange, [24, 0], Extrapolation.CLAMP),
      // Set width divided by the current scale, not a flat CARD_BORDER_WIDTH
      // -- transform: scale visually stretches everything painted on this
      // box, borders included, so a fixed width would thicken into
      // something heavier than the real card's border by the time this
      // covers the whole screen. Dividing by scale keeps it reading as a
      // constant ~1.5px throughout, persisting all the way to fullscreen
      // rather than fading out, per explicit request.
      borderWidth: CARD_BORDER_WIDTH / scale,
      borderColor,
      transform: [
        {
          translateX: interpolate(expandProgress.value, growthRange, [0, screenCenterX - rectCenterX], Extrapolation.CLAMP),
        },
        {
          translateY: interpolate(expandProgress.value, growthRange, [0, screenCenterY - rectCenterY], Extrapolation.CLAMP),
        },
        { scale },
      ],
    };
  });

  return (
    <Animated.View
      style={[
        {
          position: "absolute",
          // Mounted/unmounted exactly in sync with whether it's needed (see
          // DashboardScreenController's isOverlayGrown) rather than held at
          // a constant zIndex for the whole sequence -- this is simpler and
          // more robust than trying to get a live zIndex change to re-sort
          // correctly against siblings on an already-mounted native view.
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
