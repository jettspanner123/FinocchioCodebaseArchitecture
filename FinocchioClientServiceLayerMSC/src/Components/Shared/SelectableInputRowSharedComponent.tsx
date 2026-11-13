import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, Text } from "react-native";
import Animated, { interpolateColor, useAnimatedStyle, useSharedValue, withSequence, withTiming } from "react-native-reanimated";

import ColorFactoryCON from "@/Constants/ColorFactoryCON";
import EdgeInsetsCON from "@/Constants/EdgeInsetsCON";
import ApplicationPhysicalFeedback from "@/Services/ApplicationPhysicalFeedback";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

// Same timing/duration values as TextInputSharedComponent's press-flash/pop
// effect (colors are resolved fresh per-render inside the component body
// instead, see below, since they're theme-aware tokens) -- kept as a separate
// copy, not a shared hook, since this row has no focus state to compose the
// pop with (TextInputSharedComponent layers its pop on top of a focus-driven
// width; this row's resting width never changes).
const UNFOCUSED_BORDER_WIDTH = 1;
const PRESS_FLASH_IN_DURATION = 80;
const PRESS_FLASH_OUT_DURATION = 150;
const RELEASE_POP_BORDER_WIDTH_DELTA = 0.75;
const RELEASE_POP_DURATION = 100;
const RELEASE_SETTLE_DURATION = 150;
const DEFAULT_INVALID_COLOR = "#DC2626";

interface SelectableInputRowSharedComponentProps {
  // Rendered in place of `placeholder` once something is selected.
  selectedContent?: React.ReactNode;
  placeholder: string;
  isInvalid?: boolean;
  invalidColor?: string;
  onPress: () => void;
  accessibilityLabel?: string;
}

// App-wide, feature-agnostic "tap to open a picker" row, styled like a text
// input (same border/radius/height/background) and sharing its press-flash +
// border-pop tap feedback -- extracted so every such row (icon picker, color
// picker, ...) looks and feels identical by construction, see grilling
// session 2026-11-03.
export default function SelectableInputRowSharedComponent({
  selectedContent,
  placeholder,
  isInvalid = false,
  invalidColor = DEFAULT_INVALID_COLOR,
  onPress,
  accessibilityLabel,
}: SelectableInputRowSharedComponentProps): React.JSX.Element {
  const unfocusedBorderColor = ColorFactoryCON.BORDER_DEFAULT;
  const unpressedBackgroundColor = ColorFactoryCON.SURFACE;
  const pressedBackgroundColor = ColorFactoryCON.SURFACE_RAISED_ALT;

  const pressFlashProgress = useSharedValue(0);
  const releasePopDelta = useSharedValue(0);

  const handlePressIn = (): void => {
    void ApplicationPhysicalFeedback.current.haptic.triggerHaptic();
    pressFlashProgress.value = withTiming(1, { duration: PRESS_FLASH_IN_DURATION });
  };
  const handlePressOut = (): void => {
    pressFlashProgress.value = withTiming(0, { duration: PRESS_FLASH_OUT_DURATION });
    releasePopDelta.value = withSequence(
      withTiming(RELEASE_POP_BORDER_WIDTH_DELTA, { duration: RELEASE_POP_DURATION }),
      withTiming(0, { duration: RELEASE_SETTLE_DURATION }),
    );
  };

  const animatedStyle = useAnimatedStyle(() => ({
    borderWidth: UNFOCUSED_BORDER_WIDTH + releasePopDelta.value,
    backgroundColor: interpolateColor(pressFlashProgress.value, [0, 1], [unpressedBackgroundColor, pressedBackgroundColor]),
  }));

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? placeholder}
      style={[
        {
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          height: 56,
          borderRadius: 9999,
          borderColor: isInvalid ? invalidColor : unfocusedBorderColor,
          paddingHorizontal: EdgeInsetsCON.LG,
        },
        animatedStyle,
      ]}
    >
      {selectedContent ?? (
        <Text style={{ color: isInvalid ? invalidColor : ColorFactoryCON.SUBTLE_TEXT, fontSize: 16 }}>{placeholder}</Text>
      )}
      <Ionicons name="chevron-forward" size={18} color={ColorFactoryCON.SUBTLE_TEXT} />
    </AnimatedPressable>
  );
}
