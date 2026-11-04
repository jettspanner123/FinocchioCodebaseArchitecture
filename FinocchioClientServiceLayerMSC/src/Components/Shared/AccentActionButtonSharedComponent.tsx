import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, Text, View, type GestureResponderEvent } from "react-native";

import EdgeInsetsCON from "@/Constants/EdgeInsetsCON";
import ApplicationPhysicalFeedback from "@/Services/ApplicationPhysicalFeedback";

const ACCENT_CONTENT_COLOR = "#FFFFFF";

interface AccentActionButtonSharedComponentProps {
  label: string;
  iconName: keyof typeof Ionicons.glyphMap;
  backgroundColor: string;
  onPress?: (event: GestureResponderEvent) => void;
  disabled?: boolean;
  width?: "full" | "content";
  height?: number;
  accessibilityLabel?: string;
}

// App-wide, feature-agnostic filled "accent" pill button -- icon and label
// centered together as one unit (unlike SecondaryActionButtonSharedComponent,
// which always left-aligns its leading icon), content always white since an
// accent button is, by definition, a solid saturated fill -- see grilling
// session 2026-11-03.
export default function AccentActionButtonSharedComponent({
  label,
  iconName,
  backgroundColor,
  onPress,
  disabled = false,
  width = "content",
  height = 56,
  accessibilityLabel,
}: AccentActionButtonSharedComponentProps): React.JSX.Element {
  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      onPressIn={() => {
        if (!disabled) {
          void ApplicationPhysicalFeedback.current.haptic.triggerHaptic();
        }
      }}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled }}
      style={{
        height,
        width: width === "full" ? "100%" : undefined,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        columnGap: EdgeInsetsCON.XS,
        borderRadius: 9999,
        paddingHorizontal: EdgeInsetsCON.LG,
        backgroundColor,
        opacity: disabled ? 0.4 : 1,
        overflow: "hidden",
      }}
    >
      {({ pressed }) => (
        <>
          <Ionicons name={iconName} size={20} color={ACCENT_CONTENT_COLOR} />
          <Text style={{ color: ACCENT_CONTENT_COLOR, fontSize: 14, fontWeight: "600" }}>{label}</Text>

          {/* Pressed-state feedback lives in this children render-prop, not
              `style` -- NativeWind's JSX transform silently drops a `style`
              prop that's a function, see SecondaryActionButtonSharedComponent's
              identical comment. */}
          {pressed ? (
            <View
              pointerEvents="none"
              style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0, 0, 0, 0.1)" }}
            />
          ) : null}
        </>
      )}
    </Pressable>
  );
}
