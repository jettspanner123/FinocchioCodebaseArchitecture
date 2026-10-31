import { View, Text, Pressable } from "react-native";
import EdgeInsetsCON from "@/Constants/EdgeInsetsCON";
import DashboardScreenCON from "@/Features/DashboardScreen/Constants/DashboardScreenCON";
import ColorFactoryCON from "@/Constants/ColorFactoryCON";
import { Ionicons } from "@expo/vector-icons";

export default function DashboardScreenHeaderSectionComponent() {
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
                <Pressable
                    className="w-14 h-14 rounded-full bg-white items-center justify-center"
                    style={{ borderWidth: 1, borderColor: "rgba(0, 0, 0, 0.15)" }}
                    accessibilityLabel="Profile"
                    disabled
                >
                    <Ionicons
                        name="person-outline"
                        size={24}
                        color={ColorFactoryCON.INK}
                    />
                </Pressable>
                <Pressable
                    className="w-14 h-14 rounded-full bg-white items-center justify-center ml-2"
                    style={{ borderWidth: 1, borderColor: "rgba(0, 0, 0, 0.15)" }}
                    accessibilityLabel="Settings"
                    disabled
                >
                    <Ionicons
                        name="settings-outline"
                        size={24}
                        color={ColorFactoryCON.INK}
                    />
                </Pressable>
            </View>
        </View>
    )
}