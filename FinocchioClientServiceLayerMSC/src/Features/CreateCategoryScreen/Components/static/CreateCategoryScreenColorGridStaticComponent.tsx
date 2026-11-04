import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, View, useWindowDimensions } from "react-native";

import EdgeInsetsCON from "@/Constants/EdgeInsetsCON";
import CreateCategoryScreenCON from "@/Features/CreateCategoryScreen/Constants/CreateCategoryScreenCON";
import ApplicationPhysicalFeedback from "@/Services/ApplicationPhysicalFeedback";

interface CreateCategoryScreenColorGridStaticComponentProps {
  selectedColor: string | null;
  onSelect: (color: string) => void;
}

const GRID_COLUMNS = 4;

// Same grid structure/cell sizing as CreateCategoryScreenIconGridStaticComponent
// -- a swatch's own fill IS its content, so (unlike the icon grid) selection
// is shown with a checkmark overlay rather than a background-color swap, see
// grilling session 2026-11-03.
export default function CreateCategoryScreenColorGridStaticComponent({
  selectedColor,
  onSelect,
}: CreateCategoryScreenColorGridStaticComponentProps): React.JSX.Element {
  const { width: screenWidth } = useWindowDimensions();
  const cellSize = (screenWidth - EdgeInsetsCON.LG * 2 - EdgeInsetsCON.MD * (GRID_COLUMNS - 1)) / GRID_COLUMNS;

  return (
    <View className="flex-row flex-wrap" style={{ gap: EdgeInsetsCON.MD, padding: EdgeInsetsCON.LG }}>
      {CreateCategoryScreenCON.AVAILABLE_CATEGORY_COLORS.map((color, index) => {
        const isSelected = color === selectedColor;
        return (
          <Pressable
            key={color}
            onPressIn={() => void ApplicationPhysicalFeedback.current.haptic.triggerHaptic()}
            onPress={() => onSelect(color)}
            accessibilityRole="button"
            accessibilityLabel={`Color option ${index + 1}`}
            accessibilityState={{ selected: isSelected }}
            style={{
              width: cellSize,
              height: cellSize,
              borderRadius: 9999,
              borderWidth: CreateCategoryScreenCON.COLOR_SWATCH_BORDER_WIDTH,
              borderColor: CreateCategoryScreenCON.COLOR_SWATCH_BORDER_COLOR,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: color,
            }}
          >
            {isSelected ? <Ionicons name="checkmark" size={24} color="#FFFFFF" /> : null}
          </Pressable>
        );
      })}
    </View>
  );
}
