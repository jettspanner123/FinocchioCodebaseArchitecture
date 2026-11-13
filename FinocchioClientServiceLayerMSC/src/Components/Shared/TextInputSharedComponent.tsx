import React from "react";
import { Text, TextInput, View, type TextInputProps, type StyleProp, type ViewStyle } from "react-native";
import Animated, {
  interpolate,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from "react-native-reanimated";

import ColorFactoryCON from "@/Constants/ColorFactoryCON";
import EdgeInsetsCON from "@/Constants/EdgeInsetsCON";
import ApplicationPhysicalFeedback from "@/Services/ApplicationPhysicalFeedback";

interface TextInputSharedComponentProps extends TextInputProps {
  label?: string;
  containerStyle?: StyleProp<ViewStyle>;
  // Fixed, non-editable content before the input (e.g. a currency symbol).
  // Lives inside the same bordered pill as the input, not a separate box.
  leftAdornment?: React.ReactNode;
}

const UNFOCUSED_BORDER_WIDTH = 1;
const FOCUSED_BORDER_WIDTH = 1.5;
const FOCUS_TRANSITION_DURATION = 150;

// Tap feedback -- deliberately not scale (wrong for a field someone's
// actively typing in, see grilling session 2026-11-02): press-in flashes the
// background, release pops the border width past its current target (whatever
// the focus animation above has it heading toward) then settles, mirroring
// useCardPressAnimationHook's exact choreography on different properties.
const PRESS_FLASH_IN_DURATION = 80;
const PRESS_FLASH_OUT_DURATION = 150;
const RELEASE_POP_BORDER_WIDTH_DELTA = 0.75;
const RELEASE_POP_DURATION = 100;
const RELEASE_SETTLE_DURATION = 150;

// App-wide, feature-agnostic text input -- same src/Components/Shared/
// convention as SecondaryActionButtonSharedComponent/BottomSheet*. Extends
// RN's own TextInputProps directly (not a hand-picked subset) so every native
// TextInput capability (keyboardType, autoCapitalize, secureTextEntry, etc.)
// is available to any consumer without this component needing to know about
// it specifically.
//
// Border/radius/background live on the wrapping pill View, not the TextInput
// itself, so leftAdornment can share the same bordered pill rather than
// sitting in its own separate box. `style` is typed as TextStyle (inherited
// from TextInputProps) but only ever receives border/background overrides in
// practice (see CreateCategoryScreenNameAndAppearanceStepStaticComponent), so
// applying it to the wrapper is a deliberate, pragmatic loosening, not a
// mistake.
//
// Border animates on focus/blur instead of snapping -- a scale/press effect
// (like the selectable cards use) is wrong for a field someone's actively
// typing in, so this animates border color/width instead. `style`'s own
// border override (e.g. the validation-error red) stays last in the array,
// so it still wins over the focus color whenever a field is invalid, with no
// extra coordination needed -- see grilling session 2026-11-02.
export default function TextInputSharedComponent({
  label,
  containerStyle,
  style,
  placeholderTextColor,
  // iOS-only native Clear button (text-fields.md: "Display a Clear button in
  // the trailing end of a text field") -- no cross-platform equivalent exists
  // for this specific native affordance, so Android gets no change here.
  clearButtonMode = "while-editing",
  leftAdornment,
  onFocus,
  onBlur,
  onPressIn,
  onPressOut,
  ...textInputProps
}: TextInputSharedComponentProps): React.JSX.Element {
  // Resolved to a plain string here, outside the worklet below --
  // ColorFactoryCON.INK is a getter backed by a Zustand store, which can't be
  // read from the UI-thread worklet closure -- see useCardSelectionAnimationHook's
  // identical comment on why a CON/store value must never be read directly
  // inside a Reanimated worklet.
  const focusedBorderColor = ColorFactoryCON.INK;
  const unfocusedBorderColor = ColorFactoryCON.BORDER_DEFAULT;
  const unpressedBackgroundColor = ColorFactoryCON.SURFACE;
  const pressedBackgroundColor = ColorFactoryCON.SURFACE_RAISED_ALT;

  const focusProgress = useSharedValue(0);
  const handleFocus: TextInputProps["onFocus"] = (event) => {
    focusProgress.value = withTiming(1, { duration: FOCUS_TRANSITION_DURATION });
    onFocus?.(event);
  };
  const handleBlur: TextInputProps["onBlur"] = (event) => {
    focusProgress.value = withTiming(0, { duration: FOCUS_TRANSITION_DURATION });
    onBlur?.(event);
  };

  const pressFlashProgress = useSharedValue(0);
  const releasePopDelta = useSharedValue(0);
  const handlePressIn: TextInputProps["onPressIn"] = (event) => {
    void ApplicationPhysicalFeedback.current.haptic.triggerHaptic();
    pressFlashProgress.value = withTiming(1, { duration: PRESS_FLASH_IN_DURATION });
    onPressIn?.(event);
  };
  const handlePressOut: TextInputProps["onPressOut"] = (event) => {
    pressFlashProgress.value = withTiming(0, { duration: PRESS_FLASH_OUT_DURATION });
    releasePopDelta.value = withSequence(
      withTiming(RELEASE_POP_BORDER_WIDTH_DELTA, { duration: RELEASE_POP_DURATION }),
      withTiming(0, { duration: RELEASE_SETTLE_DURATION }),
    );
    onPressOut?.(event);
  };

  const focusAnimatedStyle = useAnimatedStyle(() => ({
    borderColor: interpolateColor(focusProgress.value, [0, 1], [unfocusedBorderColor, focusedBorderColor]),
    borderWidth:
      interpolate(focusProgress.value, [0, 1], [UNFOCUSED_BORDER_WIDTH, FOCUSED_BORDER_WIDTH]) + releasePopDelta.value,
    backgroundColor: interpolateColor(pressFlashProgress.value, [0, 1], [unpressedBackgroundColor, pressedBackgroundColor]),
  }));

  return (
    <View style={containerStyle}>
      {label ? (
        <Text style={{ color: ColorFactoryCON.SUBTLE_TEXT, fontSize: 13, marginBottom: EdgeInsetsCON.XS }}>{label}</Text>
      ) : null}
      <Animated.View
        style={[
          {
            flexDirection: "row",
            alignItems: "center",
            height: 56,
            borderRadius: 16,
            paddingHorizontal: EdgeInsetsCON.LG,
          },
          focusAnimatedStyle,
          style as StyleProp<ViewStyle>,
        ]}
      >
        {leftAdornment}
        <TextInput
          placeholderTextColor={placeholderTextColor ?? ColorFactoryCON.SUBTLE_TEXT}
          clearButtonMode={clearButtonMode}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          style={{
            flex: 1,
            height: "100%",
            marginLeft: leftAdornment ? EdgeInsetsCON.SM : 0,
            color: ColorFactoryCON.INK,
            fontSize: 16,
          }}
          {...textInputProps}
        />
      </Animated.View>
    </View>
  );
}
