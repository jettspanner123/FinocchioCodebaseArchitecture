import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import React, { useEffect, useState } from "react";
import {
  BackHandler,
  Pressable,
  StyleSheet,
  Text,
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
  withDelay,
  withSpring,
} from "react-native-reanimated";

import ColorFactoryCON from "@/Constants/ColorFactoryCON";
import EdgeInsetsCON from "@/Constants/EdgeInsetsCON";
import ApplicationPhysicalFeedback from "@/Services/ApplicationPhysicalFeedback";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
const BACKDROP_MAX_OPACITY = 0.5;

export interface ConfirmationDialogActionInterface {
  label: string;
  iconName?: keyof typeof Ionicons.glyphMap;
  iconSize?: number;
  paddingHorizontal?: number;
  onPress: () => void;
  backgroundColor?: string;
  textColor?: string;
  borderColor?: string;
  testID?: string;
  accessibilityLabel?: string;
}

export interface ConfirmationDialogSharedComponentProps {
  visible: boolean;
  onClose: () => void;
  onDismissed?: () => void;
  title?: string;
  description?: string;
  actions?: ConfirmationDialogActionInterface[];
  children?: React.ReactNode;
  containerStyle?: StyleProp<ViewStyle>;
  backdropStyle?: StyleProp<ViewStyle>;
  dismissOnBackdropPress?: boolean;
  dismissOnBackPress?: boolean;
  accessibilityLabel?: string;
  testID?: string;
}

// App-wide, feature-agnostic confirmation dialog modal shell.
// Sits vertically centered in the viewport with a dark backdrop (#000000, max opacity 0.5).
//
// The dialog box card slides in from beyond the top screen bounds and dismisses
// back up in the same direction.
//
// Action buttons sit outside and just below the dialog box in a 50:50 row,
// animating independently by sliding in from outside the left and right screen bounds,
// and sliding back out on exit. Includes responsive press-down / press-up spring states
// and haptic physical feedback.
export default function ConfirmationDialogSharedComponent({
  visible,
  onClose,
  onDismissed,
  title,
  description,
  actions,
  children,
  containerStyle,
  backdropStyle,
  dismissOnBackdropPress = true,
  dismissOnBackPress = true,
  accessibilityLabel = "Confirmation dialog",
  testID,
}: ConfirmationDialogSharedComponentProps): React.JSX.Element | null {
  const { height: screenHeight, width: screenWidth } = useWindowDimensions();
  const [isMounted, setIsMounted] = useState(visible);

  // Dialog box position starts off-screen above the top bounds
  const translateY = useSharedValue(-screenHeight);

  // Action buttons start off-screen to the left and right
  const translateXButton1 = useSharedValue(-screenWidth);
  const translateXButton2 = useSharedValue(screenWidth);

  // Interactive press scale states for each button
  const pressScaleButton1 = useSharedValue(1);
  const pressScaleButton2 = useSharedValue(1);

  useEffect(() => {
    if (visible) {
      setIsMounted(true);
      translateY.value = withSpring(0);
      translateXButton1.value = withSpring(0);
      translateXButton2.value = withSpring(0);
      return;
    }

    if (isMounted) {
      translateXButton1.value = withSpring(-screenWidth);
      translateXButton2.value = withSpring(screenWidth);
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
  }, [visible, screenHeight, screenWidth]);

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

  const dialogBoxAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const button1AnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateXButton1.value }],
  }));

  const button2AnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateXButton2.value }],
  }));

  const pressAnimatedStyle1 = useAnimatedStyle(() => ({
    transform: [{ scale: pressScaleButton1.value }],
  }));

  const pressAnimatedStyle2 = useAnimatedStyle(() => ({
    transform: [{ scale: pressScaleButton2.value }],
  }));

  // Synchronized directly with live translateY so the backdrop fades in perfect sync
  // with the dialog's top-edge entry and exit motion
  const backdropAnimatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      translateY.value,
      [-screenHeight, 0],
      [0, 1],
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

  const handlePressIn = (index: number): void => {
    void ApplicationPhysicalFeedback.current.haptic.triggerHaptic();
    if (index === 0) {
      pressScaleButton1.value = withSpring(0.95, { damping: 15, stiffness: 300 });
    } else {
      pressScaleButton2.value = withSpring(0.95, { damping: 15, stiffness: 300 });
    }
  };

  const handlePressOut = (index: number): void => {
    if (index === 0) {
      pressScaleButton1.value = withSpring(1, { damping: 12, stiffness: 200 });
    } else {
      pressScaleButton2.value = withSpring(1, { damping: 12, stiffness: 200 });
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
            overflow: "hidden",
          },
          backdropAnimatedStyle,
          backdropStyle,
        ]}
      >
        <BlurView
          intensity={20}
          tint="dark"
          experimentalBlurMethod="dimezisBlurView"
          style={StyleSheet.absoluteFill}
        />
        <View
          style={[
            StyleSheet.absoluteFill,
            { backgroundColor: "rgba(0, 0, 0, 0.4)" },
          ]}
        />
      </AnimatedPressable>

      <View
        style={{
          width: "100%",
          maxWidth: 420,
          paddingHorizontal: EdgeInsetsCON.LG,
        }}
      >
        <Animated.View
          style={[
            {
              width: "100%",
            },
            dialogBoxAnimatedStyle,
          ]}
        >
          <View
            style={[
              {
                backgroundColor: "#FFFFFF",
                borderRadius: 18,
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
            {title ? (
              <>
                <Text
                  style={{
                    fontSize: 20,
                    fontWeight: "700",
                    color: ColorFactoryCON.INK,
                    textAlign: "center",
                  }}
                >
                  {title}
                </Text>
                <View
                  style={{
                    height: 1,
                    backgroundColor: "rgba(0, 0, 0, 0.08)",
                    marginVertical: EdgeInsetsCON.MD,
                  }}
                />
              </>
            ) : null}

            {description ? (
              <Text
                style={{
                  fontSize: 16,
                  lineHeight: 22,
                  color: ColorFactoryCON.SUBTLE_TEXT,
                  textAlign: "center",
                }}
              >
                {description}
              </Text>
            ) : null}

            {children}
          </View>
        </Animated.View>

        {actions && actions.length > 0 ? (
          <View
            style={{
              flexDirection: "row",
              gap: EdgeInsetsCON.SM,
              marginTop: EdgeInsetsCON.MD,
              width: "100%",
            }}
          >
            {actions.map((action, index) => {
              const buttonEntranceAnimatedStyle = index === 0 ? button1AnimatedStyle : button2AnimatedStyle;
              const buttonPressAnimatedStyle = index === 0 ? pressAnimatedStyle1 : pressAnimatedStyle2;
              const iconColor = action.textColor ?? ColorFactoryCON.INK;
              const iconSize = action.iconSize ?? 20;

              return (
                <Animated.View
                  key={action.label}
                  testID={action.testID}
                  style={[{ flex: 1 }, buttonEntranceAnimatedStyle]}
                >
                  <AnimatedPressable
                    onPress={action.onPress}
                    onPressIn={() => handlePressIn(index)}
                    onPressOut={() => handlePressOut(index)}
                    accessibilityRole="button"
                    accessibilityLabel={action.accessibilityLabel ?? action.label}
                    style={[
                      {
                        width: "100%",
                        borderRadius: 9999,
                        paddingVertical: 20,
                        paddingHorizontal: action.paddingHorizontal ?? 12,
                        backgroundColor: action.backgroundColor ?? "#FFFFFF",
                        borderWidth: action.borderColor ? 1 : 0,
                        borderColor: action.borderColor,
                        flexDirection: "row",
                        justifyContent: "center",
                        alignItems: "center",
                        columnGap: EdgeInsetsCON.SM,
                      },
                      buttonPressAnimatedStyle,
                    ]}
                  >
                    {action.iconName ? (
                      <Ionicons name={action.iconName} size={iconSize} color={iconColor} />
                    ) : null}
                    <Text
                      numberOfLines={1}
                      style={{
                        color: action.textColor ?? ColorFactoryCON.INK,
                        fontSize: 15,
                        fontWeight: "600",
                      }}
                    >
                      {action.label}
                    </Text>
                  </AnimatedPressable>
                </Animated.View>
              );
            })}
          </View>
        ) : null}
      </View>
    </View>
  );
}
