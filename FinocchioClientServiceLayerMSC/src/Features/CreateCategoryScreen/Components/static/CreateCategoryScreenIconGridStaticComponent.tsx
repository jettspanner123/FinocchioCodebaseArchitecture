import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, View, useWindowDimensions } from "react-native";

import ColorFactoryCON from "@/Constants/ColorFactoryCON";
import EdgeInsetsCON from "@/Constants/EdgeInsetsCON";
import ApplicationPhysicalFeedback from "@/Services/ApplicationPhysicalFeedback";
import { formatIconLabel } from "@/Features/CreateCategoryScreen/Components/static/CreateCategoryScreenNameAndAppearanceStepStaticComponent";
import CreateCategoryScreenCON from "@/Features/CreateCategoryScreen/Constants/CreateCategoryScreenCON";

interface CreateCategoryScreenIconGridStaticComponentProps {
  selectedIconName: keyof typeof Ionicons.glyphMap | null;
  onSelect: (iconName: keyof typeof Ionicons.glyphMap) => void;
}

const GRID_COLUMNS = 4;

// Plain flex-wrapped View, not a FlatList -- the icon set is small/fixed, and
// this renders inside BottomSheetSharedComponent's own ScrollView, so a
// second virtualized list here would just trigger RN's nested-list warning
// for no real benefit.
export default function CreateCategoryScreenIconGridStaticComponent({
  selectedIconName,
  onSelect,
}: CreateCategoryScreenIconGridStaticComponentProps): React.JSX.Element {
  const { width: screenWidth } = useWindowDimensions();
  const cellSize =
    (screenWidth - EdgeInsetsCON.LG * 2 - EdgeInsetsCON.MD * (GRID_COLUMNS - 1)) / GRID_COLUMNS;

  return (
    <View
      className="flex-row flex-wrap"
      style={{ gap: EdgeInsetsCON.MD, padding: EdgeInsetsCON.LG }}
    >
      {CreateCategoryScreenCON.AVAILABLE_CATEGORY_ICONS.map((iconName) => {
        const isSelected = iconName === selectedIconName;
        return (
          <Pressable
            key={iconName}
            onPressIn={() => void ApplicationPhysicalFeedback.current.haptic.triggerHaptic()}
            onPress={() => onSelect(iconName)}
            accessibilityRole="button"
            accessibilityLabel={formatIconLabel(iconName)}
            accessibilityState={{ selected: isSelected }}
            style={{
              width: cellSize,
              height: cellSize,
              borderRadius: 9999,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: isSelected ? CreateCategoryScreenCON.CREATE_BUTTON_GREEN_DARK : ColorFactoryCON.CHIP_BACKGROUND,
            }}
          >
            <Ionicons name={iconName} size={24} color={isSelected ? "#FFFFFF" : ColorFactoryCON.INK} />
          </Pressable>
        );
      })}
    </View>
  );
}
