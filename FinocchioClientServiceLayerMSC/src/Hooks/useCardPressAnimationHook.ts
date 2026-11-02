import { useSharedValue, useAnimatedStyle, withSequence, withTiming } from "react-native-reanimated";

import ApplicationPhysicalFeedback from "@/Services/ApplicationPhysicalFeedback";

const PRESS_IN_SCALE = 0.97;
const PRESS_IN_DURATION = 100;
const RELEASE_POP_SCALE = 1.05;
const RELEASE_POP_DURATION = 100;
const RELEASE_SETTLE_DURATION = 150;

// Reusable tappable-card feedback: haptic + slight scale-down on press-in,
// a brief pop past 1 before settling back on release. Shared across any card
// that looks/behaves like CreateCategoryScreen's Budget-period and Type
// cards (see grilling session 2026-11-02).
export default function useCardPressAnimationHook() {
  const scale = useSharedValue(1);

  const onPressIn = (): void => {
    void ApplicationPhysicalFeedback.current.haptic.triggerHaptic();
    scale.value = withTiming(PRESS_IN_SCALE, { duration: PRESS_IN_DURATION });
  };

  const onPressOut = (): void => {
    scale.value = withSequence(
      withTiming(RELEASE_POP_SCALE, { duration: RELEASE_POP_DURATION }),
      withTiming(1, { duration: RELEASE_SETTLE_DURATION }),
    );
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return { animatedStyle, onPressIn, onPressOut };
}

export type CardPressAnimationHookResult = ReturnType<typeof useCardPressAnimationHook>;
