import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Text, View } from "react-native";

import SecondaryActionButtonSharedComponent from "@/Components/Shared/SecondaryActionButtonSharedComponent";
import ColorFactoryCON from "@/Constants/ColorFactoryCON";
import EdgeInsetsCON from "@/Constants/EdgeInsetsCON";

export interface BottomSheetHeaderTrailingActionModel {
  iconName: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  accessibilityLabel?: string;
}

interface BottomSheetHeaderSharedComponentProps {
  title: string;
  leadingIconName?: keyof typeof Ionicons.glyphMap;
  onLeadingPress?: () => void;
  leadingAccessibilityLabel?: string;
  trailingActions?: BottomSheetHeaderTrailingActionModel[];
}

// Generic enough for any sheet/modal, not just bottom sheets -- leading is a
// single optional action (dismiss "X", back chevron, or none), trailing is a
// list for however many actions a given sheet needs (empty is fine). Both
// reuse SecondaryActionButtonSharedComponent's circle mode rather than
// hand-rolled buttons, so this header always matches whatever that component
// looks like app-wide.
//
// Title is centered against the FULL header width, not just the space left
// over after the leading button -- the leading and trailing slots are both
// reserved at ACTION_BUTTON_SIZE width regardless of whether they're empty,
// so the title's position doesn't shift depending on what buttons a given
// sheet happens to have.
const ACTION_BUTTON_SIZE = 50;

export default function BottomSheetHeaderSharedComponent({
  title,
  leadingIconName,
  onLeadingPress,
  leadingAccessibilityLabel,
  trailingActions = [],
}: BottomSheetHeaderSharedComponentProps): React.JSX.Element {
  return (
    <View className="flex-row items-center justify-between" style={{ padding: EdgeInsetsCON.LG }}>
      <View style={{ minWidth: ACTION_BUTTON_SIZE }}>
        {leadingIconName ? (
          <SecondaryActionButtonSharedComponent
            iconName={leadingIconName}
            onPress={onLeadingPress}
            height={ACTION_BUTTON_SIZE}
            accessibilityLabel={leadingAccessibilityLabel}
          />
        ) : null}
      </View>

      <View style={{ flex: 1 }}>
        <Text
          numberOfLines={1}
          style={{ textAlign: "center", fontSize: 18, fontWeight: "700", color: ColorFactoryCON.INK }}
        >
          {title}
        </Text>
      </View>

      <View className="flex-row items-center justify-end" style={{ minWidth: ACTION_BUTTON_SIZE, gap: EdgeInsetsCON.SM }}>
        {trailingActions.map((action, index) => (
          <SecondaryActionButtonSharedComponent
            key={index}
            iconName={action.iconName}
            onPress={action.onPress}
            height={ACTION_BUTTON_SIZE}
            accessibilityLabel={action.accessibilityLabel}
          />
        ))}
      </View>
    </View>
  );
}
