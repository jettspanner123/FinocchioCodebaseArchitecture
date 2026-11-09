import React, { useEffect, useState } from "react";
import { BackHandler, Pressable, ScrollView, View, useWindowDimensions, type LayoutChangeEvent } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  Extrapolation,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
const BACKDROP_MAX_OPACITY = 0.35;

interface BottomSheetSharedComponentProps {
  visible: boolean;
  onClose: () => void;
  // Rendered inside the drag-to-dismiss gesture region (e.g.
  // BottomSheetHeaderSharedComponent) -- stays fixed, never scrolls.
  header?: React.ReactNode;
  // Rendered in a ScrollView below the header -- not part of the drag
  // gesture at all, so it can scroll independently once content exceeds the
  // sheet's max height.
  children?: React.ReactNode;
  fullHeight?: boolean;
}

// Own spring config, not borrowed from any feature's constants -- keeps this
// component fully independent/reusable. Exact feel is a one-line tweak once
// we style this together.
const SPRING_CONFIG = { duration: 500, dampingRatio: 0.85 } as const;

// Basic/unstyled on purpose (see grilling session 2026-10-31): auto-sized to
// content (capped at 90% of screen height), dismissible via backdrop tap,
// Android back, or dragging the sheet down. No colors, radius, handle, or
// backdrop dimming yet -- that's a deliberately separate styling pass.
//
// `visible`/`onClose` are the only way in or out. Backdrop tap and the
// Android back button just call `onClose` and let the resulting
// `visible=false` prop drive the close animation via useEffect below -- a
// one-render round trip, imperceptible for a discrete tap. A velocity-past-
// threshold drag release can't afford that round trip (it would freeze
// mid-motion for its duration), so it starts the close spring itself,
// immediately, in the same gesture worklet, and only uses `onClose` to keep
// the parent's state in sync after the fact -- see isClosingFromGesture.
export default function BottomSheetSharedComponent({
  visible,
  onClose,
  header,
  children,
  fullHeight = false,
}: BottomSheetSharedComponentProps): React.JSX.Element | null {
  const { height: screenHeight } = useWindowDimensions();
  const [isMounted, setIsMounted] = useState(visible);
  const [sheetHeight, setSheetHeight] = useState(0);
  const translateY = useSharedValue(screenHeight);
  // Set the instant the pan gesture itself starts the close spring, so the
  // useEffect below -- which only finds out visible=false one React
  // render later, via onClose()'s round trip back down as a prop -- knows
  // not to redundantly start a second, velocity-less close animation on top
  // of the one already running. Without this, every gesture-driven dismiss
  // would freeze for exactly that round-trip's duration (a very visible
  // stutter) before the close motion actually continued.
  const isClosingFromGesture = useSharedValue(false);

  const closedPosition = sheetHeight > 0 ? sheetHeight : screenHeight;

  useEffect(() => {
    if (visible) {
      setIsMounted(true);
      translateY.value = withSpring(0, SPRING_CONFIG);
      return;
    }

    if (isMounted && !isClosingFromGesture.value) {
      translateY.value = withSpring(closedPosition, SPRING_CONFIG, (finished) => {
        if (finished) {
          runOnJS(setIsMounted)(false);
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  useEffect(() => {
    if (!isMounted) {
      return;
    }

    const subscription = BackHandler.addEventListener("hardwareBackPress", () => {
      onClose();
      return true;
    });
    return () => subscription.remove();
  }, [isMounted, onClose]);

  const handleLayout = (event: LayoutChangeEvent): void => {
    setSheetHeight(event.nativeEvent.layout.height);
  };

  const panGesture = Gesture.Pan()
    .onChange((event) => {
      translateY.value = Math.max(0, translateY.value + event.changeY);
    })
    .onEnd((event) => {
      const pastThreshold = translateY.value > closedPosition * 0.3 || event.velocityY > 800;
      if (pastThreshold) {
        // Starts right here, same worklet, same frame -- not after waiting
        // for onClose() to round-trip through React state and back down as
        // a prop (see isClosingFromGesture's comment for why that matters).
        isClosingFromGesture.value = true;
        translateY.value = withSpring(closedPosition, { ...SPRING_CONFIG, velocity: event.velocityY }, (finished) => {
          if (finished) {
            isClosingFromGesture.value = false;
            runOnJS(setIsMounted)(false);
          }
        });
        runOnJS(onClose)();
      } else {
        translateY.value = withSpring(0, { ...SPRING_CONFIG, velocity: event.velocityY });
      }
    });

  const sheetAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  // Tied directly to the same live `translateY` the drag gesture and the
  // open/close springs both drive -- so the backdrop fades in perfect sync
  // whether the sheet is animating closed on its own or being dragged down
  // by the user's finger in real time, not just at the two endpoints.
  const backdropAnimatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateY.value, [0, closedPosition], [BACKDROP_MAX_OPACITY, 0], Extrapolation.CLAMP),
  }));

  if (!isMounted) {
    return null;
  }

  return (
    <>
      <AnimatedPressable
        style={[
          { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "#000000" },
          backdropAnimatedStyle,
        ]}
        onPress={onClose}
        accessibilityRole="button"
        accessibilityLabel="Close"
      />

      <Animated.View
        onLayout={handleLayout}
        style={[
          {
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            ...(fullHeight ? { height: screenHeight * 0.9 } : {}),
            maxHeight: screenHeight * 0.9,
            backgroundColor: "#FFFFFF",
            borderTopLeftRadius: 30,
            borderTopRightRadius: 30,
            overflow: "hidden",
          },
          sheetAnimatedStyle,
        ]}
      >
        <GestureDetector gesture={panGesture}>
          <View>{header}</View>
        </GestureDetector>
        <ScrollView
          style={{ flex: fullHeight ? 1 : undefined, flexShrink: fullHeight ? undefined : 1 }}
          contentContainerStyle={fullHeight ? { flexGrow: 1 } : undefined}
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      </Animated.View>
    </>
  );
}
