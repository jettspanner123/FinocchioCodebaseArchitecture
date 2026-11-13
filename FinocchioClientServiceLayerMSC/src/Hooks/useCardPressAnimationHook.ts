import { useSharedValue, useAnimatedStyle, withSequence, withTiming } from "react-native-reanimated";

import ApplicationPhysicalFeedback from "@/Services/ApplicationPhysicalFeedback";

const PRESS_IN_SCALE = 0.97;
const PRESS_IN_DURATION = 100;
const RELEASE_POP_SCALE = 1.05;
const RELEASE_POP_DURATION = 100;
const RELEASE_SETTLE_DURATION = 150;
// Wobble is opt-in (see `wobble` option) -- same press-in/release-pop/settle
// timing as scale above, so the two dimensions stay perfectly in sync, just
// tilting instead of (or alongside) resizing. Not applied to existing
// consumers (Budget/Type cards) by default, see grilling session 2026-11-11.
const WOBBLE_PRESS_IN_DEGREES = -4;
const WOBBLE_RELEASE_POP_DEGREES = 4;

interface UseCardPressAnimationHookOptions {
  wobble?: boolean;
}

// Reusable tappable-card feedback: haptic + slight scale-down on press-in,
// a brief pop past 1 before settling back on release. Shared across any card
// that looks/behaves like CreateCategoryScreen's Budget-period and Type
// cards (see grilling session 2026-11-02). `wobble: true` additionally tilts
// the element a few degrees on press/release, for elements that want a more
// playful feel than scale alone (see grilling session 2026-11-11).
export default function useCardPressAnimationHook(options?: UseCardPressAnimationHookOptions) {
  const wobble = options?.wobble ?? false;
  const scale = useSharedValue(1);
  const rotation = useSharedValue(0);

  const onPressIn = (): void => {
    void ApplicationPhysicalFeedback.current.haptic.triggerHaptic();
    scale.value = withTiming(PRESS_IN_SCALE, { duration: PRESS_IN_DURATION });
    if (wobble) {
      rotation.value = withTiming(WOBBLE_PRESS_IN_DEGREES, { duration: PRESS_IN_DURATION });
    }
  };

  const onPressOut = (): void => {
    scale.value = withSequence(
      withTiming(RELEASE_POP_SCALE, { duration: RELEASE_POP_DURATION }),
      withTiming(1, { duration: RELEASE_SETTLE_DURATION }),
    );
    if (wobble) {
      rotation.value = withSequence(
        withTiming(WOBBLE_RELEASE_POP_DEGREES, { duration: RELEASE_POP_DURATION }),
        withTiming(0, { duration: RELEASE_SETTLE_DURATION }),
      );
    }
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { rotate: `${rotation.value}deg` }],
  }));

  return { animatedStyle, onPressIn, onPressOut };
}

export type CardPressAnimationHookResult = ReturnType<typeof useCardPressAnimationHook>;
