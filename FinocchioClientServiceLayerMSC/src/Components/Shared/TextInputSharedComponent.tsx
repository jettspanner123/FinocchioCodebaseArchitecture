import React from "react";
import { Text, TextInput, View, type TextInputProps, type StyleProp, type ViewStyle } from "react-native";

import ColorFactoryCON from "@/Constants/ColorFactoryCON";
import EdgeInsetsCON from "@/Constants/EdgeInsetsCON";

interface TextInputSharedComponentProps extends TextInputProps {
  label?: string;
  containerStyle?: StyleProp<ViewStyle>;
}

// App-wide, feature-agnostic text input -- same src/Components/Shared/
// convention as SecondaryActionButtonSharedComponent/BottomSheet*. Extends
// RN's own TextInputProps directly (not a hand-picked subset) so every native
// TextInput capability (keyboardType, autoCapitalize, secureTextEntry, etc.)
// is available to any consumer without this component needing to know about
// it specifically.
export default function TextInputSharedComponent({
  label,
  containerStyle,
  style,
  placeholderTextColor,
  ...textInputProps
}: TextInputSharedComponentProps): React.JSX.Element {
  return (
    <View style={containerStyle}>
      {label ? (
        <Text style={{ color: ColorFactoryCON.SUBTLE_TEXT, fontSize: 13, marginBottom: EdgeInsetsCON.XS }}>{label}</Text>
      ) : null}
      <TextInput
        placeholderTextColor={placeholderTextColor ?? ColorFactoryCON.SUBTLE_TEXT}
        style={[
          {
            height: 56,
            borderWidth: 1,
            borderColor: "rgba(0, 0, 0, 0.15)",
            borderRadius: 16,
            paddingHorizontal: EdgeInsetsCON.LG,
            backgroundColor: "#FFFFFF",
            color: ColorFactoryCON.INK,
            fontSize: 16,
          },
          style,
        ]}
        {...textInputProps}
      />
    </View>
  );
}
