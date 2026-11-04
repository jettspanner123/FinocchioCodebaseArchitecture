import React, { useEffect, useState } from "react";
import {
  BackHandler,
  Pressable,
  View,
  useWindowDimensions,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import Animated, {
  Extrapolation,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import EdgeInsetsCON from "@/Constants/EdgeInsetsCON";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
const BACKDROP_MAX_OPACITY = 0.35;

export interface ConfirmationDialogSharedComponentProps {
  visible: boolean;
  onClose: () => void;
  onDismissed?: () => void;
  children?: React.ReactNode;
  containerStyle?: StyleProp<ViewStyle>;
  backdropStyle?: StyleProp<ViewStyle>;
  dismissOnBackdropPress?: boolean;
  dismissOnBackPress?: boolean;
  accessibilityLabel?: string;
  testID?: string;
}

// App-wide, feature-agnostic confirmation dialog modal shell.
// Sits vertically centered in the viewport with a backdrop matching
// BottomSheetSharedComponent (#000000, max opacity 0.35).
//
// Slides in from beyond the top screen bounds and dismisses back in the same
// upward direction. Uses default withSpring physics (damping: 120, stiffness: 900,
// mass: 4), identical to LinearTransition.springify() used across the app's selector pills.
export default function ConfirmationDialogSharedComponent({
  visible,
  onClose,
  onDismissed,
  children,
  containerStyle,
  backdropStyle,
  dismissOnBackdropPress = true,
  dismissOnBackPress = true,
  accessibilityLabel = "Confirmation dialog",
  testID,
}: ConfirmationDialogSharedComponentProps): React.JSX.Element | null {
  const { height: screenHeight } = useWindowDimensions();
  const [isMounted, setIsMounted] = useState(visible);

  // Position starts off-screen above the top bounds
  const translateY = useSharedValue(-screenHeight);

  useEffect(() => {
    if (visible) {
      setIsMounted(true);
      translateY.value = withSpring(0);
      return;
    }

    if (isMounted) {
      translateY.value = withSpring(-screenHeight, undefined, (finished) => {
        if (finished) {
          runOnJS(setIsMounted)(false);
          if (onDismissed) {
            runOnJS(onDismissed)();
          }
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, screenHeight]);

  useEffect(() => {
    if (!isMounted || !dismissOnBackPress) {
      return;
    }

    const subscription = BackHandler.addEventListener("hardwareBackPress", () => {
      onClose();
      return true;
    });
    return () => subscription.remove();
  }, [isMounted, dismissOnBackPress, onClose]);

  const dialogAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  // Synchronized directly with live translateY so the backdrop fades in perfect sync
  // with the dialog's top-edge entry and exit motion
  const backdropAnimatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      translateY.value,
      [-screenHeight, 0],
      [0, BACKDROP_MAX_OPACITY],
      Extrapolation.CLAMP,
    ),
  }));

  if (!isMounted) {
    return null;
  }

  const handleBackdropPress = (): void => {
    if (dismissOnBackdropPress) {
      onClose();
    }
  };

  return (
    <View
      testID={testID}
      accessibilityRole="alert"
      accessibilityLabel={accessibilityLabel}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 100,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <AnimatedPressable
        onPress={handleBackdropPress}
        accessibilityRole="button"
        accessibilityLabel="Dismiss dialog"
        style={[
          {
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "#000000",
          },
          backdropAnimatedStyle,
          backdropStyle,
        ]}
      />

      <Animated.View
        style={[
          {
            width: "100%",
            maxWidth: 420,
            paddingHorizontal: EdgeInsetsCON.LG,
          },
          dialogAnimatedStyle,
        ]}
      >
        <View
          style={[
            {
              backgroundColor: "#FFFFFF",
              borderRadius: 24,
              borderWidth: 1,
              borderColor: "rgba(0, 0, 0, 0.1)",
              padding: EdgeInsetsCON.LG,
              shadowColor: "#000000",
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.12,
              shadowRadius: 16,
              elevation: 8,
            },
            containerStyle,
          ]}
        >
          {children}
        </View>
      </Animated.View>
    </View>
  );
}
