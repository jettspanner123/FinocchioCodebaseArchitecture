import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Text, View } from "react-native";
import Animated from "react-native-reanimated";

import SelectableInputRowSharedComponent from "@/Components/Shared/SelectableInputRowSharedComponent";
import SubSectionSharedComponent from "@/Components/Shared/SubSectionSharedComponent";
import TextInputSharedComponent from "@/Components/Shared/TextInputSharedComponent";
import ColorFactoryCON from "@/Constants/ColorFactoryCON";
import EdgeInsetsCON from "@/Constants/EdgeInsetsCON";
import CreateCategoryScreenCON from "@/Features/CreateCategoryScreen/Constants/CreateCategoryScreenCON";
import type { ShakeAnimationHookResult } from "@/Hooks/useShakeAnimationHook";

interface CreateCategoryScreenNameAndAppearanceStepStaticComponentProps {
  name: string;
  onChangeName: (name: string) => void;
  isNameInvalid: boolean;
  nameAnimatedStyle: ShakeAnimationHookResult["animatedStyle"];
  onOpenIconPicker: () => void;
  selectedIconName: keyof typeof Ionicons.glyphMap | null;
  isIconInvalid: boolean;
  iconAnimatedStyle: ShakeAnimationHookResult["animatedStyle"];
  onOpenColorPicker: () => void;
  selectedColor: string | null;
  isColorInvalid: boolean;
  colorAnimatedStyle: ShakeAnimationHookResult["animatedStyle"];
}

// e.g. "fast-food" -> "Fast Food"
export function formatIconLabel(iconName: string): string {
  return iconName
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

// Name, icon, and color are fully controlled from CreateCategoryScreenController
// -- the Continue button's validation (empty name / no icon / no color) lives
// there, and it owns the useShakeAnimationHook instance driving each field's
// animated style, so this component only renders what it's told. Icon and
// color both use SelectableInputRowSharedComponent since they're structurally
// identical "tap to open a picker" rows -- see grilling session 2026-11-03.
export default function CreateCategoryScreenNameAndAppearanceStepStaticComponent({
  name,
  onChangeName,
  isNameInvalid,
  nameAnimatedStyle,
  onOpenIconPicker,
  selectedIconName,
  isIconInvalid,
  iconAnimatedStyle,
  onOpenColorPicker,
  selectedColor,
  isColorInvalid,
  colorAnimatedStyle,
}: CreateCategoryScreenNameAndAppearanceStepStaticComponentProps): React.JSX.Element {
  return (
    <View style={{ flex: 1 }}>
      <Animated.View style={nameAnimatedStyle}>
        <TextInputSharedComponent
          placeholder="e.g. Groceries"
          value={name}
          onChangeText={onChangeName}
          accessibilityLabel="Category name"
          style={[
            { borderRadius: 9999 },
            isNameInvalid ? { borderColor: CreateCategoryScreenCON.VALIDATION_ERROR_RED } : null,
          ]}
          placeholderTextColor={isNameInvalid ? CreateCategoryScreenCON.VALIDATION_ERROR_RED : undefined}
        />
        {isNameInvalid ? (
          <Text
            style={{
              color: CreateCategoryScreenCON.VALIDATION_ERROR_RED,
              fontSize: 13,
              marginTop: EdgeInsetsCON.XS,
              paddingHorizontal: EdgeInsetsCON.LG,
            }}
          >
            {CreateCategoryScreenCON.NAME_REQUIRED_ERROR}
          </Text>
        ) : null}
      </Animated.View>

      <SubSectionSharedComponent text={CreateCategoryScreenCON.APPEARANCE_SECTION_HEADING} />

      <Animated.View style={iconAnimatedStyle}>
        <SelectableInputRowSharedComponent
          onPress={onOpenIconPicker}
          accessibilityLabel="Select icon"
          placeholder="Select an icon"
          isInvalid={isIconInvalid}
          invalidColor={CreateCategoryScreenCON.VALIDATION_ERROR_RED}
          selectedContent={
            selectedIconName ? (
              <View className="flex-row items-center" style={{ gap: EdgeInsetsCON.SM }}>
                <Ionicons name={selectedIconName} size={20} color={ColorFactoryCON.INK} />
                <Text style={{ color: ColorFactoryCON.INK, fontSize: 16 }}>{formatIconLabel(selectedIconName)}</Text>
              </View>
            ) : undefined
          }
        />
        {isIconInvalid ? (
          <Text
            style={{
              color: CreateCategoryScreenCON.VALIDATION_ERROR_RED,
              fontSize: 13,
              marginTop: EdgeInsetsCON.XS,
              paddingHorizontal: EdgeInsetsCON.LG,
            }}
          >
            {CreateCategoryScreenCON.ICON_REQUIRED_ERROR}
          </Text>
        ) : null}
      </Animated.View>

      <Animated.View style={[{ marginTop: EdgeInsetsCON.LG }, colorAnimatedStyle]}>
        <SelectableInputRowSharedComponent
          onPress={onOpenColorPicker}
          accessibilityLabel="Select color"
          placeholder="Select a color"
          isInvalid={isColorInvalid}
          invalidColor={CreateCategoryScreenCON.VALIDATION_ERROR_RED}
          selectedContent={
            selectedColor ? <View style={{ width: 24, height: 24, borderRadius: 9999, backgroundColor: selectedColor }} /> : undefined
          }
        />
        {isColorInvalid ? (
          <Text
            style={{
              color: CreateCategoryScreenCON.VALIDATION_ERROR_RED,
              fontSize: 13,
              marginTop: EdgeInsetsCON.XS,
              paddingHorizontal: EdgeInsetsCON.LG,
            }}
          >
            {CreateCategoryScreenCON.COLOR_REQUIRED_ERROR}
          </Text>
        ) : null}
      </Animated.View>
    </View>
  );
}
