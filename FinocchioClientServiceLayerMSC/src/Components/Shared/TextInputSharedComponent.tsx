import React from "react";
import { Text, TextInput, View, type TextInputProps, type StyleProp, type ViewStyle } from "react-native";

import ColorFactoryCON from "@/Constants/ColorFactoryCON";
import EdgeInsetsCON from "@/Constants/EdgeInsetsCON";

interface TextInputSharedComponentProps extends TextInputProps {
  label?: string;
  containerStyle?: StyleProp<ViewStyle>;
  // Fixed, non-editable content before the input (e.g. a currency symbol).
  // Lives inside the same bordered pill as the input, not a separate box.
  leftAdornment?: React.ReactNode;
}

// App-wide, feature-agnostic text input -- same src/Components/Shared/
// convention as SecondaryActionButtonSharedComponent/BottomSheet*. Extends
// RN's own TextInputProps directly (not a hand-picked subset) so every native
// TextInput capability (keyboardType, autoCapitalize, secureTextEntry, etc.)
// is available to any consumer without this component needing to know about
// it specifically.
//
// Border/radius/background live on the wrapping pill View, not the TextInput
// itself, so leftAdornment can share the same bordered pill rather than
// sitting in its own separate box. `style` is typed as TextStyle (inherited
// from TextInputProps) but only ever receives border/background overrides in
// practice (see CreateCategoryScreenNameAndAppearanceStepStaticComponent), so
// applying it to the wrapper is a deliberate, pragmatic loosening, not a
// mistake.
export default function TextInputSharedComponent({
  label,
  containerStyle,
  style,
  placeholderTextColor,
  // iOS-only native Clear button (text-fields.md: "Display a Clear button in
  // the trailing end of a text field") -- no cross-platform equivalent exists
  // for this specific native affordance, so Android gets no change here.
  clearButtonMode = "while-editing",
  leftAdornment,
  ...textInputProps
}: TextInputSharedComponentProps): React.JSX.Element {
  return (
    <View style={containerStyle}>
      {label ? (
        <Text style={{ color: ColorFactoryCON.SUBTLE_TEXT, fontSize: 13, marginBottom: EdgeInsetsCON.XS }}>{label}</Text>
      ) : null}
      <View
        className="flex-row items-center"
        style={[
          {
            height: 56,
            borderWidth: 1,
            borderColor: "rgba(0, 0, 0, 0.15)",
            borderRadius: 16,
            paddingHorizontal: EdgeInsetsCON.LG,
            backgroundColor: "#FFFFFF",
          },
          style as StyleProp<ViewStyle>,
        ]}
      >
        {leftAdornment}
        <TextInput
          placeholderTextColor={placeholderTextColor ?? ColorFactoryCON.SUBTLE_TEXT}
          clearButtonMode={clearButtonMode}
          style={{
            flex: 1,
            height: "100%",
            marginLeft: leftAdornment ? EdgeInsetsCON.SM : 0,
            color: ColorFactoryCON.INK,
            fontSize: 16,
          }}
          {...textInputProps}
        />
      </View>
    </View>
  );
}
