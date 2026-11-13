import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, Text, View, type GestureResponderEvent } from "react-native";
import Animated from "react-native-reanimated";

import ColorFactoryCON from "@/Constants/ColorFactoryCON";
import EdgeInsetsCON from "@/Constants/EdgeInsetsCON";
import useCardPressAnimationHook from "@/Hooks/useCardPressAnimationHook";
import ApplicationPhysicalFeedback from "@/Services/ApplicationPhysicalFeedback";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface SecondaryActionButtonSharedComponentProps {
  label?: string;
  iconName?: keyof typeof Ionicons.glyphMap;
  leadingElement?: React.ReactNode;
  trailingIconName?: keyof typeof Ionicons.glyphMap;
  trailingElement?: React.ReactNode;
  onPress?: (event: GestureResponderEvent) => void;
  disabled?: boolean;
  width?: "full" | "content";
  height?: number;
  backgroundColor?: string;
  pressedBackgroundColor?: string;
  borderColor?: string;
  borderWidth?: number;
  // Non-circle mode only -- circle mode always uses 0 so the icon can be
  // perfectly centered. Exposed (rather than hardcoded) so a caller can match
  // this to its own leadingElement's size for equal left/top/bottom insets
  // around it -- the component can't compute that automatically since
  // leadingElement is an opaque ReactNode of whatever size the caller chose.
  paddingHorizontal?: number;
  textColor?: string;
  fontSize?: number;
  iconSize?: number;
  iconColor?: string;
  accessibilityLabel?: string;
  // Opt-in scale press feedback (useCardPressAnimationHook, no wobble --
  // this is a utility action, not a playful nav icon) in place of the
  // default static pressed-tint overlay. Default off, zero behavior change
  // for existing callers -- see apple-motion grilling session 2026-11-13.
  animated?: boolean;
}

// App-wide, feature-agnostic button -- lives outside any one Feature's own
// Components/shared/ on purpose, since it's meant to be reused across
// screens, not just within one (see src/Components/Shared/ convention
// established 2026-10-31 for exactly this category of component).
//
// No `label` -> circle/icon-only mode (diameter = `height`, `width` prop
// ignored since a circle can't sensibly stretch full-width without becoming
// an oval; only one of leading/trailing renders since a circle has room for
// one piece of content).
export default function SecondaryActionButtonSharedComponent({
  label,
  iconName,
  leadingElement,
  trailingIconName,
  trailingElement,
  onPress,
  disabled = false,
  width = "content",
  height = 56,
  backgroundColor = ColorFactoryCON.SURFACE_RAISED,
  pressedBackgroundColor,
  borderColor = ColorFactoryCON.BORDER_SUBTLE,
  borderWidth = 1,
  paddingHorizontal = EdgeInsetsCON.MD,
  textColor = ColorFactoryCON.INK,
  fontSize = 14,
  iconSize = 24,
  iconColor,
  accessibilityLabel,
  animated = false,
}: SecondaryActionButtonSharedComponentProps): React.JSX.Element {
  const isCircleMode = !label;
  const resolvedIconColor = iconColor ?? textColor;
  // Always called, regardless of `animated` -- Rules of Hooks; the returned
  // shared values simply go unused on the non-animated path.
  const pressAnimation = useCardPressAnimationHook();

  const leading = leadingElement ?? (iconName ? <Ionicons name={iconName} size={iconSize} color={resolvedIconColor} /> : null);
  const trailing = isCircleMode
    ? null
    : (trailingElement ?? (trailingIconName ? <Ionicons name={trailingIconName} size={iconSize} color={resolvedIconColor} /> : null));

  const handlePressIn = (): void => {
    if (disabled) {
      return;
    }
    if (animated) {
      // The hook already fires its own haptic -- the explicit call below
      // (non-animated path) would double up.
      pressAnimation.onPressIn();
    } else {
      void ApplicationPhysicalFeedback.current.haptic.triggerHaptic();
    }
  };
  const handlePressOut = (): void => {
    if (!disabled && animated) {
      pressAnimation.onPressOut();
    }
  };

  const content = (
    <>
      {leading}
      {label ? (
        // Centered within whatever space is left after leading/trailing,
        // not left-aligned immediately next to the icon -- flex:1 here
        // claims exactly that remaining space, and alignItems centers the
        // Text within it regardless of how wide the icon or button is.
        <View style={{ flex: 1, alignItems: "flex-start" }}>
          <Text numberOfLines={1} style={{ color: textColor, fontSize, fontWeight: "600" }}>
            {label}
          </Text>
        </View>
      ) : null}
      {trailing}
    </>
  );

  return (
    <AnimatedPressable
      onPress={disabled ? undefined : onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled }}
      style={[
        {
          height,
          width: isCircleMode ? height : width === "full" ? "100%" : undefined,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: isCircleMode ? "center" : "flex-start",
          columnGap: isCircleMode ? 0 : EdgeInsetsCON.SM,
          borderRadius: 9999,
          borderWidth,
          borderColor,
          paddingHorizontal: isCircleMode ? 0 : paddingHorizontal,
          backgroundColor,
          opacity: disabled ? 0.4 : 1,
          overflow: "hidden",
        },
        animated ? pressAnimation.animatedStyle : undefined,
      ]}
    >
      {animated
        ? content
        : // Pressed-state feedback lives entirely in this children
          // render-prop, not the `style` prop -- NativeWind's JSX transform
          // processes `style` on every element and silently drops it when
          // given a function instead of a plain object/array, which is
          // exactly what made this button render with no styling at all
          // when `style` was `({ pressed }) => ({...})`. `children` isn't
          // part of that style/className merging, so the function-as-render-
          // prop form is safe here.
          ({ pressed }: { pressed: boolean }) => (
            <>
              {content}
              {pressed ? (
                <View
                  pointerEvents="none"
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    borderRadius: 9999,
                    backgroundColor: pressedBackgroundColor ?? "rgba(0, 0, 0, 0.06)",
                  }}
                />
              ) : null}
            </>
          )}
    </AnimatedPressable>
  );
}
