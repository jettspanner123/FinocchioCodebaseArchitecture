import { useEffect } from "react";
import { interpolateColor, useAnimatedProps, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";

import ColorFactoryCON from "@/Constants/ColorFactoryCON";

const TRANSITION_DURATION = 200;
const SELECTED_COLOR = "#FFFFFF";
const UNSELECTED_BACKGROUND = "rgba(0, 0, 0, 0.06)";
const SELECTED_BACKGROUND = "transparent";

// Animates a selectable card's background + icon/text color between
// selected/unselected, instead of the instant snap a plain conditional style
// gives you. Pairs with a sliding selection-indicator pill (see
// CreateCategoryScreenBudgetStepStaticComponent) -- this only smooths each
// individual card's own colors as selection moves away from or onto it.
export default function useCardSelectionAnimationHook(isSelected: boolean) {
  // Resolved to a plain string here, outside the worklets below --
  // ColorFactoryCON.INK is a getter backed by a Zustand store, which can't be
  // read from the UI-thread worklet closure -- see DashboardScreenCategoryCardStaticComponent's
  // identical comment on why a CON/store value must never be read directly
  // inside a Reanimated worklet.
  const unselectedColor = ColorFactoryCON.INK;

  const progress = useSharedValue(isSelected ? 1 : 0);
  useEffect(() => {
    progress.value = withTiming(isSelected ? 1 : 0, { duration: TRANSITION_DURATION });
  }, [isSelected, progress]);

  const backgroundAnimatedStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(progress.value, [0, 1], [UNSELECTED_BACKGROUND, SELECTED_BACKGROUND]),
  }));

  const textAnimatedStyle = useAnimatedStyle(() => ({
    color: interpolateColor(progress.value, [0, 1], [unselectedColor, SELECTED_COLOR]),
  }));

  // Ionicons/MaterialIcons take `color` as a prop, not a style key, so it
  // animates through useAnimatedProps + Animated.createAnimatedComponent,
  // not useAnimatedStyle.
  const iconAnimatedProps = useAnimatedProps(() => ({
    color: interpolateColor(progress.value, [0, 1], [unselectedColor, SELECTED_COLOR]),
  }));

  return { backgroundAnimatedStyle, textAnimatedStyle, iconAnimatedProps };
}
