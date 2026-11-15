import {Ionicons} from "@expo/vector-icons";
import React from "react";
import {Pressable, Text, View} from "react-native";
import Animated, {
    interpolateColor,
    useAnimatedStyle,
    useSharedValue,
    withTiming,
    type SharedValue,
} from "react-native-reanimated";

import ColorFactoryCON from "@/Constants/ColorFactoryCON";
import EdgeInsetsCON from "@/Constants/EdgeInsetsCON";
import DashboardScreenCON from "@/Features/DashboardScreen/Constants/DashboardScreenCON";
import DashboardScreenService from "@/Features/DashboardScreen/Services/DashboardScreenService";
import ApplicationPhysicalFeedback from "@/Services/ApplicationPhysicalFeedback";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface DashboardScreenAddCategoryCardStaticComponentProps {
    scrollY: SharedValue<number>;
    top: number;
    onPress?: () => void;
}

export default function DashboardScreenAddCategoryCardStaticComponent({
                                                                          scrollY,
                                                                          top,
                                                                          onPress,
                                                                      }: DashboardScreenAddCategoryCardStaticComponentProps): React.JSX.Element {
    // Slightly darker than SURFACE_RAISED itself (not SURFACE_RAISED reused
    // as-is), see grilling session 2026-11-11.
    const restingBackgroundColor = DashboardScreenService.current.darkenHexColor(
        ColorFactoryCON.SURFACE_RAISED,
        DashboardScreenCON.ADD_CARD_BACKGROUND_DARKEN_AMOUNT,
    );
    // SURFACE_RAISED_ALT happens to be darker than SURFACE_RAISED in light
    // mode and lighter than it in dark mode -- exactly preserves this card's
    // original "press lightens it" dark-mode feel while giving light mode the
    // more conventional "press darkens it" direction, see grilling session
    // 2026-11-11.
    const pressedBackgroundColor = ColorFactoryCON.SURFACE_RAISED_ALT;
    const pressInDuration = DashboardScreenCON.ADD_CARD_PRESS_IN_DURATION;
    const pressOutDuration = DashboardScreenCON.ADD_CARD_PRESS_OUT_DURATION;

    const pressProgress = useSharedValue(0);

    const handlePressIn = (): void => {
        void ApplicationPhysicalFeedback.current.haptic.triggerHaptic();
        pressProgress.value = withTiming(1, { duration: pressInDuration });
    };

    const handlePressOut = (): void => {
        pressProgress.value = withTiming(0, { duration: pressOutDuration });
    };

    const handlePress = (): void => {
        onPress?.();
    };

    // Counter-translate by scrollY keeps this card pinned stationary in screen space
    // at the bottom of the viewport while remaining a native child of the ScrollView
    // for rock-solid gesture and touch responder handling.
    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{translateY: scrollY.value}],
    }));

    const cardBackgroundAnimatedStyle = useAnimatedStyle(() => ({
        backgroundColor: interpolateColor(
            pressProgress.value,
            [0, 1],
            [restingBackgroundColor, pressedBackgroundColor],
        ),
    }));

    return (
        <Animated.View
            style={[
                {
                    position: "absolute",
                    top,
                    left: 0,
                    right: 0,
                    height: DashboardScreenCON.ADD_CARD_HEIGHT,
                    zIndex: -1,
                },
                animatedStyle,
            ]}
        >
            <AnimatedPressable
                onPress={handlePress}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                accessibilityRole="button"
                accessibilityLabel={DashboardScreenCON.ADD_CARD_TITLE}
                style={[
                    {
                        flex: 1,
                        borderRadius: 50,
                        borderWidth: 1,
                        borderColor: ColorFactoryCON.BORDER_SUBTLE,
                        padding: EdgeInsetsCON.LG,
                        alignItems: "center",
                        justifyContent: "center",
                        ...DashboardScreenCON.CATEGORY_CARD_SHADOW_STYLE,
                    },
                    cardBackgroundAnimatedStyle,
                ]}
            >
                <View
                    className="w-16 h-16 rounded-full items-center justify-center mb-4"
                    style={{
                        backgroundColor: ColorFactoryCON.SURFACE_RAISED_ALT,
                        marginTop: EdgeInsetsCON.XXL,
                    }}
                >
                    <Ionicons name="add" size={32} color={ColorFactoryCON.INK}/>
                </View>

                <Text
                    style={{
                        color: ColorFactoryCON.INK,
                        fontSize: 30,
                        fontWeight: "700",
                        textAlign: "center",
                        marginBottom: 4,
                    }}
                >
                    {DashboardScreenCON.ADD_CARD_TITLE}
                </Text>

                <Text
                    style={{
                        color: ColorFactoryCON.INK,
                        opacity: 0.7,
                        fontSize: 14,
                        textAlign: "center",
                    }}
                >
                    {DashboardScreenCON.ADD_CARD_SUBTITLE}
                </Text>
            </AnimatedPressable>
        </Animated.View>
    );
}
