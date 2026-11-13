import { BlurView } from "expo-blur";
import React, { useEffect, useState } from "react";
import {
  BackHandler,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  useWindowDimensions,
  type LayoutChangeEvent,
} from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  Extrapolation,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import ColorFactoryCON from "@/Constants/ColorFactoryCON";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
const BACKDROP_MAX_OPACITY = 0.35;
const BACKDROP_BLUR_INTENSITY = 20;

const RUBBERBAND_DIMENSION = 120;
const RUBBERBAND_CONSTANT = 0.55;
// Apple's "Designing Fluid Interfaces" rubber-banding formula -- progressive
// resistance when dragged past the fully-open position instead of a hard
// clamp (which reads as the UI freezing while the finger keeps moving), see
// apple-motion grilling session 2026-11-13.
// No default params -- Reanimated's worklet babel plugin workletizes a
// function's body, and a default-parameter *expression* referencing an
// outer-scope constant is not reliably captured into that closure. Every
// call site below passes all arguments explicitly instead.
function rubberband(overshoot: number, dimension: number, constant: number): number {
  "worklet";
  return (overshoot * dimension * constant) / (dimension + constant * Math.abs(overshoot));
}

const PROJECTION_DECELERATION_RATE = 0.998;
// Apple's exponential-decay momentum projection (not the physics-textbook
// v^2/(2*decel) form) -- projects where the release velocity would carry the
// sheet, so the close/snap-back decision is one continuous rule instead of
// two independently-OR'd position/velocity thresholds that can disagree.
function projectMomentum(velocity: number, decelerationRate: number): number {
  "worklet";
  return ((velocity / 1000) * decelerationRate) / (1 - decelerationRate);
}

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
//
// Split in two (apple-motion grilling session 2026-11-13): no gesture
// precedes the open/close useEffect below (a plain prop flip), so there's no
// momentum to justify overshoot there -- critically damped. The drag-release
// cases genuinely carry the finger's velocity, so they keep a little bounce.
const OPEN_CLOSE_SPRING_CONFIG = { duration: 500, dampingRatio: 1.0 } as const;
const GESTURE_SPRING_CONFIG = { duration: 500, dampingRatio: 0.85 } as const;

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
      translateY.value = withSpring(0, OPEN_CLOSE_SPRING_CONFIG);
      return;
    }

    if (isMounted && !isClosingFromGesture.value) {
      translateY.value = withSpring(closedPosition, OPEN_CLOSE_SPRING_CONFIG, (finished) => {
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
      const next = translateY.value + event.changeY;
      // Dragging past fully-open (next < 0) resists progressively instead of
      // hard-clamping at 0 -- a hard stop there reads as the sheet freezing
      // mid-drag while the finger keeps moving.
      translateY.value = next < 0 ? rubberband(next, RUBBERBAND_DIMENSION, RUBBERBAND_CONSTANT) : next;
    })
    .onEnd((event) => {
      // Project where the release velocity would carry the sheet, then pick
      // whichever snap point (open/closed) that projected rest position is
      // nearer to -- one continuous rule instead of a position threshold
      // OR'd with an independent velocity threshold.
      const projectedPosition = translateY.value + projectMomentum(event.velocityY, PROJECTION_DECELERATION_RATE);
      const pastThreshold = projectedPosition > closedPosition * 0.5;
      if (pastThreshold) {
        // Starts right here, same worklet, same frame -- not after waiting
        // for onClose() to round-trip through React state and back down as
        // a prop (see isClosingFromGesture's comment for why that matters).
        isClosingFromGesture.value = true;
        translateY.value = withSpring(
          closedPosition,
          { ...GESTURE_SPRING_CONFIG, velocity: event.velocityY },
          (finished) => {
            if (finished) {
              isClosingFromGesture.value = false;
              runOnJS(setIsMounted)(false);
            }
          },
        );
        runOnJS(onClose)();
      } else {
        translateY.value = withSpring(0, { ...GESTURE_SPRING_CONFIG, velocity: event.velocityY });
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
          { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, overflow: "hidden" },
          backdropAnimatedStyle,
        ]}
        onPress={onClose}
        accessibilityRole="button"
        accessibilityLabel="Close"
      >
        {/* Matches ConfirmationDialogSharedComponent's backdrop material --
            translucent/blurred layer instead of a flat opaque scrim, see
            apple-motion grilling session 2026-11-13. */}
        <BlurView
          intensity={BACKDROP_BLUR_INTENSITY}
          tint="dark"
          blurMethod="dimezisBlurView"
          style={StyleSheet.absoluteFill}
        />
        <View style={[StyleSheet.absoluteFill, { backgroundColor: ColorFactoryCON.SCRIM }]} />
      </AnimatedPressable>

      <Animated.View
        onLayout={handleLayout}
        style={[
          {
            position: "absolute",
            left: 0,
            right: 0,
            // Shifted down and over-heighted by RUBBERBAND_DIMENSION, both by
            // the same amount, so the visible top edge at rest is unchanged
            // (see apple-motion grilling session 2026-11-13): the extra strip
            // sits off-screen below the fold normally, and only scrolls into
            // view -- still filled with this sheet's own background, not a
            // gap exposing whatever's behind -- when rubber-banding pulls the
            // sheet up past fully-open.
            bottom: -RUBBERBAND_DIMENSION,
            paddingBottom: RUBBERBAND_DIMENSION,
            ...(fullHeight ? { height: screenHeight * 0.9 + RUBBERBAND_DIMENSION } : {}),
            maxHeight: screenHeight * 0.9 + RUBBERBAND_DIMENSION,
            backgroundColor: ColorFactoryCON.OVERLAY,
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
