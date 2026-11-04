import React from "react";
import { Text, type StyleProp, type TextStyle } from "react-native";

import ColorFactoryCON from "@/Constants/ColorFactoryCON";
import EdgeInsetsCON from "@/Constants/EdgeInsetsCON";

interface SubSectionSharedComponentProps {
  text: string;
  style?: StyleProp<TextStyle>;
}

// App-wide, feature-agnostic muted heading for a sub-section of a screen's
// content (e.g. "Budget Period", "Members") -- extracted from
// CreateCategoryScreenBudgetStepStaticComponent's original inline styling so
// every sub-section heading in the app stays visually identical by
// construction, see grilling session 2026-11-03.
export default function SubSectionSharedComponent({ text, style }: SubSectionSharedComponentProps): React.JSX.Element {
  return (
    <Text
      style={[
        {
          color: ColorFactoryCON.SUBTLE_TEXT,
          fontSize: 13,
          fontWeight: "600",
          marginTop: EdgeInsetsCON.LG,
          marginBottom: EdgeInsetsCON.SM
        },
        style,
      ]}
    >
      {text}
    </Text>
  );
}
