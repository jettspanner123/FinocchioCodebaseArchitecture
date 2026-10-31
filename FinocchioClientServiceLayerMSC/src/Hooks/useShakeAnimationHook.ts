import * as Haptics from "expo-haptics";
import { useCallback } from "react";
import { runOnJS, useAnimatedStyle, useSharedValue, withSequence, withTiming } from "react-native-reanimated";

import ApplicationPhysicalFeedback from "@/Services/ApplicationPhysicalFeedback";

const SHAKE_AMPLITUDE = 8;
const SHAKE_LEG_DURATION = 65;

function triggerShakeHaptic(): void {
  void ApplicationPhysicalFeedback.current.haptic.triggerHaptic(Haptics.ImpactFeedbackStyle.Medium);
}

// Reusable "invalid field" shake: 3 oscillations (6 direction changes) over
// ~400ms, with a haptic pulse on each turn -- per grilling session
// 2026-11-01, this exact interaction belongs on every future form's
// validation errors, not just CreateCategoryScreen's.
export default function useShakeAnimationHook() {
  const translateX = useSharedValue(0);

  const shake = useCallback(() => {
    const leg = (toValue: number) =>
      withTiming(toValue, { duration: SHAKE_LEG_DURATION }, (finished) => {
        if (finished) {
          runOnJS(triggerShakeHaptic)();
        }
      });

    translateX.value = withSequence(
      leg(-SHAKE_AMPLITUDE),
      leg(SHAKE_AMPLITUDE),
      leg(-SHAKE_AMPLITUDE),
      leg(SHAKE_AMPLITUDE),
      leg(-SHAKE_AMPLITUDE),
      leg(0),
    );
  }, [translateX]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return { shake, animatedStyle };
}

export type ShakeAnimationHookResult = ReturnType<typeof useShakeAnimationHook>;
