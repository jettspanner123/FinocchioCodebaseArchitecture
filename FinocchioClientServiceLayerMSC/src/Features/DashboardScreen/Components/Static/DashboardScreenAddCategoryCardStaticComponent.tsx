import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, Text, View, useWindowDimensions } from "react-native";
import Animated, { Extrapolation, interpolate, useAnimatedStyle, type SharedValue } from "react-native-reanimated";

import EdgeInsetsCON from "@/Constants/EdgeInsetsCON";
import DashboardScreenCON from "@/Features/DashboardScreen/Constants/DashboardScreenCON";
import UIFontHelper from "@/Helpers/UIFontHelper";
import ApplicationPhysicalFeedback from "@/Services/ApplicationPhysicalFeedback";

interface DashboardScreenAddCategoryCardStaticComponentProps {
  scrollY: SharedValue<number>;
  top: number;
  expandProgress: SharedValue<number>;
  isSequenceActive: boolean;
  onPress?: () => void;
}

export default function DashboardScreenAddCategoryCardStaticComponent({
  scrollY,
  top,
  expandProgress,
  isSequenceActive,
  onPress,
}: DashboardScreenAddCategoryCardStaticComponentProps): React.JSX.Element {
  const { height: screenHeight } = useWindowDimensions();
  const slideAwayDistance = screenHeight + DashboardScreenCON.CATEGORY_CARD_HEIGHT + EdgeInsetsCON.XXL;

  const handlePress = async (): Promise<void> => {
    if (isSequenceActive) {
      return;
    }
    await ApplicationPhysicalFeedback.current.haptic.triggerHaptic();
    onPress?.();
  };

  // Counter-translate by scrollY keeps this card pinned stationary in screen space
  // at the bottom of the viewport while remaining a native child of the ScrollView
  // for rock-solid gesture and touch responder handling. Tap-to-expand's
  // slide-away offset is additive on top of that same translateY -- see
  // DashboardScreenCategoryCardStaticComponent for why these must be combined
  // in one worklet rather than two separate style objects.
  const animatedStyle = useAnimatedStyle(() => {
    const slideAwayTranslateY = interpolate(
      expandProgress.value,
      [0, DashboardScreenCON.EXPAND_SLIDE_AWAY_END_PROGRESS],
      [0, slideAwayDistance],
      Extrapolation.CLAMP,
    );

    return {
      transform: [{ translateY: scrollY.value + slideAwayTranslateY }],
    };
  });

  return (
    <Animated.View
      style={[
        {
          position: "absolute",
          top,
          left: 0,
          right: 0,
          height: DashboardScreenCON.CATEGORY_CARD_HEIGHT,
          zIndex: -1,
        },
        animatedStyle,
      ]}
    >
      <Pressable
        onPress={handlePress}
        disabled={isSequenceActive}
        accessibilityRole="button"
        accessibilityLabel={DashboardScreenCON.ADD_CARD_TITLE}
        style={{
          flex: 1,
          borderRadius: 50,
          borderWidth: 1,
          borderColor: "rgba(255, 255, 255, 0.12)",
          backgroundColor: DashboardScreenCON.ADD_CARD_BACKGROUND_COLOR,
          padding: EdgeInsetsCON.LG,
          alignItems: "center",
          justifyContent: "center",
          ...DashboardScreenCON.CATEGORY_CARD_SHADOW_STYLE,
        }}
      >
        <View
          className="w-16 h-16 rounded-full items-center justify-center mb-4"
          style={{
            backgroundColor: "rgba(255, 255, 255, 0.15)",
          }}
        >
          <Ionicons name="add" size={32} color="#FFFFFF" />
        </View>

        <Text
          style={{
            color: "#FFFFFF",
            fontSize: 30,
            fontFamily: UIFontHelper.current.getPirataOneFont(),
            textAlign: "center",
            marginBottom: 4,
          }}
        >
          {DashboardScreenCON.ADD_CARD_TITLE}
        </Text>

        <Text
          style={{
            color: "#FFFFFF",
            opacity: 0.7,
            fontSize: 14,
            textAlign: "center",
          }}
        >
          {DashboardScreenCON.ADD_CARD_SUBTITLE}
        </Text>
      </Pressable>
    </Animated.View>
  );
}
