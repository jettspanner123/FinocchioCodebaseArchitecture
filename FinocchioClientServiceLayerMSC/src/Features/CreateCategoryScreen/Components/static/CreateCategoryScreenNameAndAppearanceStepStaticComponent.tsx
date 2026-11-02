import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, Text, View } from "react-native";
import Animated from "react-native-reanimated";

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
}

// e.g. "fast-food" -> "Fast Food"
export function formatIconLabel(iconName: string): string {
  return iconName
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

// Name and selected icon are fully controlled from CreateCategoryScreenController
// -- the Continue button's validation (empty name / no icon) lives there, and
// it owns the useShakeAnimationHook instance driving each field's
// nameAnimatedStyle/iconAnimatedStyle, so this component only renders what
// it's told. Color is intentionally skipped entirely for this pass, per
// explicit instruction.
export default function CreateCategoryScreenNameAndAppearanceStepStaticComponent({
  name,
  onChangeName,
  isNameInvalid,
  nameAnimatedStyle,
  onOpenIconPicker,
  selectedIconName,
  isIconInvalid,
  iconAnimatedStyle,
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

      <Animated.View style={[{ marginTop: EdgeInsetsCON.LG }, iconAnimatedStyle]}>
        <Pressable
          onPress={onOpenIconPicker}
          accessibilityRole="button"
          accessibilityLabel="Select icon"
          className="flex-row items-center justify-between"
          style={{
            height: 56,
            borderWidth: 1,
            borderColor: isIconInvalid ? CreateCategoryScreenCON.VALIDATION_ERROR_RED : "rgba(0, 0, 0, 0.15)",
            borderRadius: 9999,
            paddingHorizontal: EdgeInsetsCON.LG,
            backgroundColor: "#FFFFFF",
          }}
        >
          {selectedIconName ? (
            <View className="flex-row items-center" style={{ gap: EdgeInsetsCON.SM }}>
              <Ionicons name={selectedIconName} size={20} color={ColorFactoryCON.INK} />
              <Text style={{ color: ColorFactoryCON.INK, fontSize: 16 }}>{formatIconLabel(selectedIconName)}</Text>
            </View>
          ) : (
            <Text
              style={{
                color: isIconInvalid ? CreateCategoryScreenCON.VALIDATION_ERROR_RED : ColorFactoryCON.SUBTLE_TEXT,
                fontSize: 16,
              }}
            >
              Select an icon
            </Text>
          )}
          <Ionicons name="chevron-forward" size={18} color={ColorFactoryCON.SUBTLE_TEXT} />
        </Pressable>
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
    </View>
  );
}
