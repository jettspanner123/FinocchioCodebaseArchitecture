import {View, Pressable, Text} from "react-native";
import {Ionicons} from "@expo/vector-icons";
import EdgeInsetsCON from "@/Constants/EdgeInsetsCON";
import ColorFactoryCON from "@/Constants/ColorFactoryCON";

export default function DashboardScreenTwinActionButtonsSectionComponent() {
    return (
        <View className="flex-row" style={{gap: EdgeInsetsCON.SM, marginBottom: EdgeInsetsCON.XL}}>
            <Pressable
                className="flex-1 flex-row justify-start items-center"
                style={{
                    height: 56,
                    paddingHorizontal: EdgeInsetsCON.XS,
                    borderWidth: 1,
                    borderColor: "rgba(0, 0, 0, 0.15)",
                    borderRadius: 9999,
                    backgroundColor: ColorFactoryCON.SURFACE_RAISED,
                }}
                disabled
                accessibilityRole="button"
                accessibilityLabel="Add Amount"
            >
                <View
                    className="w-12 h-12 rounded-full items-center justify-center"
                    style={{backgroundColor: ColorFactoryCON.SURFACE_RAISED_ALT}}
                >
                    <Ionicons name="add-outline" size={18} color={ColorFactoryCON.INK}/>
                </View>
                <Text
                    style={{
                        marginLeft: EdgeInsetsCON.SM,
                        fontSize: 14,
                        fontWeight: "600",
                        color: ColorFactoryCON.INK,
                    }}
                >
                    Add Amount
                </Text>
            </Pressable>
            <Pressable
                className="flex-1 flex-row items-center justify-start"
                style={{
                    height: 56,
                    borderWidth: 1,
                    paddingHorizontal: EdgeInsetsCON.XS,
                    borderColor: "rgba(0, 0, 0, 0.15)",
                    borderRadius: 9999,
                    backgroundColor: ColorFactoryCON.SURFACE_RAISED,
                }}
                disabled
                accessibilityRole="button"
                accessibilityLabel="Record Amount"
            >
                <View
                    className="w-12 h-12 rounded-full items-center justify-center"
                    style={{backgroundColor: ColorFactoryCON.SURFACE_RAISED_ALT}}
                >
                    <Ionicons
                        name="mic-outline"
                        size={18}
                        color={ColorFactoryCON.INK}
                    />
                </View>
                <Text
                    style={{
                        marginLeft: EdgeInsetsCON.SM,
                        fontSize: 14,
                        fontWeight: "600",
                        color: ColorFactoryCON.INK,
                    }}
                >
                    Record Amount
                </Text>
            </Pressable>
        </View>
    )
}