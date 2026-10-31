import React from "react";
import { Text, type StyleProp, type TextStyle } from "react-native";

import ColorFactoryCON from "@/Constants/ColorFactoryCON";

interface ScreenDescriptionSharedComponentProps {
  text: string;
  style?: StyleProp<TextStyle>;
}

// App-wide convention for muted, left-aligned explanatory paragraph copy at
// the top of a screen's content -- distinct from BottomSheetHeaderSharedComponent's
// subtitle, which is a short centered single-line caption coupled to the
// header layout.
export default function ScreenDescriptionSharedComponent({
  text,
  style,
}: ScreenDescriptionSharedComponentProps): React.JSX.Element {
  return (
    <Text style={[{ color: ColorFactoryCON.SUBTLE_TEXT, fontSize: 14, lineHeight: 20 }, style]}>{text}</Text>
  );
}
