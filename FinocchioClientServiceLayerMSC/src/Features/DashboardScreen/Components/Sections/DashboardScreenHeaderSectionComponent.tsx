import { View, Text, Pressable } from "react-native";
import Animated from "react-native-reanimated";
import EdgeInsetsCON from "@/Constants/EdgeInsetsCON";
import DashboardScreenCON from "@/Features/DashboardScreen/Constants/DashboardScreenCON";
import ColorFactoryCON from "@/Constants/ColorFactoryCON";
import useCardPressAnimationHook from "@/Hooks/useCardPressAnimationHook";
import { Ionicons } from "@expo/vector-icons";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface DashboardScreenHeaderSectionComponentProps {
    onProfilePress?: () => void;
    onSettingsPress?: () => void;
    disabled?: boolean;
}

export default function DashboardScreenHeaderSectionComponent({
    onProfilePress,
    onSettingsPress,
    disabled = false,
}: DashboardScreenHeaderSectionComponentProps) {
    // wobble: true -- these are small, playful icon buttons, not the plain
    // Budget/Type selectable cards this hook was originally built for, see
    // grilling session 2026-11-11.
    const profilePress = useCardPressAnimationHook({ wobble: true });
    const settingsPress = useCardPressAnimationHook({ wobble: true });

    const handleProfilePress = (): void => {
        if (disabled) {
            return;
        }
        onProfilePress?.();
    };

    const handleSettingsPress = (): void => {
        if (disabled) {
            return;
        }
        onSettingsPress?.();
    };

    return (
        <View
            className="flex-row items-center justify-between mt-8 px-2"
            style={{ marginBottom: EdgeInsetsCON.XL }}
        >
            <View>
                <Text style={{ color: ColorFactoryCON.SUBTLE_TEXT, fontSize: 16 }}>
                    {DashboardScreenCON.HEADER_LABEL}
                </Text>
                <Text
                    style={{
                        color: ColorFactoryCON.INK,
                        fontSize: 28,
                        fontWeight: "700",
                    }}
                >
                    {DashboardScreenCON.PERIOD_LABEL}
                </Text>
            </View>

            <View className="flex-row items-center">
                <AnimatedPressable
                    style={[
                        {
                            width: 52,
                            height: 52,
                            borderRadius: 9999,
                            alignItems: "center",
                            justifyContent: "center",
                            backgroundColor: ColorFactoryCON.SURFACE_RAISED,
                            borderWidth: 1,
                            borderColor: "rgba(0, 0, 0, 0.15)",
                        },
                        profilePress.animatedStyle,
                    ]}
                    accessibilityLabel="Profile"
                    accessibilityRole="button"
                    disabled={disabled}
                    onPress={handleProfilePress}
                    onPressIn={profilePress.onPressIn}
                    onPressOut={profilePress.onPressOut}
                >
                    <Ionicons
                        name="person-outline"
                        size={24}
                        color={ColorFactoryCON.INK}
                    />
                </AnimatedPressable>
                <AnimatedPressable
                    style={[
                        {
                            width: 52,
                            height: 52,
                            borderRadius: 9999,
                            alignItems: "center",
                            justifyContent: "center",
                            marginLeft: EdgeInsetsCON.SM,
                            backgroundColor: ColorFactoryCON.SURFACE_RAISED,
                            borderWidth: 1,
                            borderColor: "rgba(0, 0, 0, 0.15)",
                        },
                        settingsPress.animatedStyle,
                    ]}
                    accessibilityLabel="Settings"
                    accessibilityRole="button"
                    disabled={disabled}
                    onPress={handleSettingsPress}
                    onPressIn={settingsPress.onPressIn}
                    onPressOut={settingsPress.onPressOut}
                >
                    <Ionicons
                        name="settings-outline"
                        size={24}
                        color={ColorFactoryCON.INK}
                    />
                </AnimatedPressable>
            </View>
        </View>
    );
}
