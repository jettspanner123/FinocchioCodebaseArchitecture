import React, { useEffect } from "react";
import { View } from "react-native";
import Animated, { interpolate, interpolateColor, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";

import ColorFactoryCON from "@/Constants/ColorFactoryCON";
import EdgeInsetsCON from "@/Constants/EdgeInsetsCON";

interface StepProgressIndicatorSharedComponentProps {
  currentStep: number;
  totalSteps: number;
  // Feature-agnostic on purpose -- defaults to INK rather than hardcoding any
  // one feature's accent color, since this is a generic multi-step-wizard
  // component, not specific to CreateCategoryScreen.
  activeColor?: string;
}

const DOT_SIZE = 8;
const PILL_WIDTH = 24;
const SHAPE_TRANSITION_DURATION = 250;
const COLOR_TRANSITION_DURATION = 250;

interface StepProgressDotProps {
  isCurrent: boolean;
  isCompleted: boolean;
  activeColor: string;
}

// Its own component, not an inline element inside the .map() below --
// totalSteps is a runtime prop, not a fixed count like the Budget-period/Type
// cards' 4-or-2, so each dot can't be given its own explicitly-named
// useSharedValue call the way those did. Rendering each as a separate
// component instance instead sidesteps that entirely: each instance gets
// exactly one consistent hook call across its own re-renders, which Rules of
// Hooks is fine with regardless of how many sibling instances exist.
function StepProgressDot({ isCurrent, isCompleted, activeColor }: StepProgressDotProps): React.JSX.Element {
  const isActive = isCompleted || isCurrent;
  // Resolved fresh per-render, not a module-level constant -- a black-tinted
  // color (the old hardcoded value) is mathematically indistinguishable from
  // a pure-black dark-mode page background at any opacity; BORDER_DEFAULT
  // already flips to white-tinted in dark mode, see grilling session
  // 2026-11-11.
  const unselectedDotColor = ColorFactoryCON.BORDER_DEFAULT;
  const shapeProgress = useSharedValue(isCurrent ? 1 : 0);
  const colorProgress = useSharedValue(isActive ? 1 : 0);

  useEffect(() => {
    shapeProgress.value = withTiming(isCurrent ? 1 : 0, { duration: SHAPE_TRANSITION_DURATION });
  }, [isCurrent, shapeProgress]);
  useEffect(() => {
    colorProgress.value = withTiming(isActive ? 1 : 0, { duration: COLOR_TRANSITION_DURATION });
  }, [isActive, colorProgress]);

  const animatedStyle = useAnimatedStyle(() => ({
    width: interpolate(shapeProgress.value, [0, 1], [DOT_SIZE, PILL_WIDTH]),
    backgroundColor: interpolateColor(colorProgress.value, [0, 1], [unselectedDotColor, activeColor]),
  }));

  return <Animated.View style={[{ height: DOT_SIZE, borderRadius: DOT_SIZE / 2 }, animatedStyle]} />;
}

// Purely decorative stepper -- no tap-to-jump (see grilling session
// 2026-11-02). The current step's dot animates into a wider pill; completed
// steps stay filled dots; upcoming steps stay neutral -- both the shape and
// color transitions are animated, not an instant snap, whenever currentStep
// changes.
export default function StepProgressIndicatorSharedComponent({
  currentStep,
  totalSteps,
  activeColor = ColorFactoryCON.INK,
}: StepProgressIndicatorSharedComponentProps): React.JSX.Element {
  return (
    <View className="flex-row items-center justify-center" style={{ gap: EdgeInsetsCON.SM }}>
      {Array.from({ length: totalSteps }, (_, index) => (
        <StepProgressDot
          key={index}
          isCurrent={index === currentStep}
          isCompleted={index < currentStep}
          activeColor={activeColor}
        />
      ))}
    </View>
  );
}
