import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, Text, View } from "react-native";
import Animated from "react-native-reanimated";

import ColorFactoryCON from "@/Constants/ColorFactoryCON";
import EdgeInsetsCON from "@/Constants/EdgeInsetsCON";
import CreateCategoryScreenCON from "@/Features/CreateCategoryScreen/Constants/CreateCategoryScreenCON";
import { CreateCategoryScreenTypeEnum } from "@/Features/CreateCategoryScreen/Models/CreateCategoryScreenModel";
import useCardPressAnimationHook from "@/Hooks/useCardPressAnimationHook";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface CreateCategoryScreenTypeAndMembersStepStaticComponentProps {
  type: CreateCategoryScreenTypeEnum;
  onChangeType: (type: CreateCategoryScreenTypeEnum) => void;
}

const TYPE_VALUES = [CreateCategoryScreenTypeEnum.PERSONAL, CreateCategoryScreenTypeEnum.SHARED];
const TYPE_ICONS: Record<CreateCategoryScreenTypeEnum, keyof typeof Ionicons.glyphMap> = {
  [CreateCategoryScreenTypeEnum.PERSONAL]: "person-outline",
  [CreateCategoryScreenTypeEnum.SHARED]: "people-outline",
};

// Type is fully controlled from CreateCategoryScreenController, defaulting to
// Personal -- always has a valid value, so no validation needed. No real
// friends/contacts/invite system exists anywhere in this app yet, so Shared
// shows an honest "coming soon" message rather than a mocked searchable
// friends list or free-text invite chips that don't actually invite anyone --
// see grilling session 2026-11-02.
export default function CreateCategoryScreenTypeAndMembersStepStaticComponent({
  type,
  onChangeType,
}: CreateCategoryScreenTypeAndMembersStepStaticComponentProps): React.JSX.Element {
  // Rules of Hooks forbid calling a hook inside the .map() below.
  const personalPress = useCardPressAnimationHook();
  const sharedPress = useCardPressAnimationHook();
  const typePressAnimations = {
    [CreateCategoryScreenTypeEnum.PERSONAL]: personalPress,
    [CreateCategoryScreenTypeEnum.SHARED]: sharedPress,
  };

  return (
    <View style={{ flex: 1 }}>
      <View className="flex-row" style={{ gap: EdgeInsetsCON.SM }}>
        {TYPE_VALUES.map((typeValue) => {
          const isSelected = typeValue === type;
          const cardPress = typePressAnimations[typeValue];
          return (
            <AnimatedPressable
              key={typeValue}
              onPress={() => onChangeType(typeValue)}
              onPressIn={cardPress.onPressIn}
              onPressOut={cardPress.onPressOut}
              accessibilityRole="button"
              accessibilityState={{ selected: isSelected }}
              style={[
                {
                  flex: 1,
                  alignItems: "center",
                  justifyContent: "center",
                  height: 96,
                  borderRadius: 24,
                  gap: EdgeInsetsCON.XS,
                  backgroundColor: isSelected ? CreateCategoryScreenCON.CREATE_BUTTON_GREEN_DARK : "rgba(0, 0, 0, 0.06)",
                },
                cardPress.animatedStyle,
              ]}
            >
              <Ionicons name={TYPE_ICONS[typeValue]} size={24} color={isSelected ? "#FFFFFF" : ColorFactoryCON.INK} />
              <Text style={{ color: isSelected ? "#FFFFFF" : ColorFactoryCON.INK, fontSize: 14, fontWeight: "600" }}>
                {CreateCategoryScreenCON.TYPE_LABELS[typeValue]}
              </Text>
            </AnimatedPressable>
          );
        })}
      </View>

      {type === CreateCategoryScreenTypeEnum.SHARED ? (
        <View
          className="items-center justify-center"
          style={{
            marginTop: EdgeInsetsCON.LG,
            padding: EdgeInsetsCON.LG,
            borderRadius: 16,
            borderWidth: 1,
            borderColor: "rgba(0, 0, 0, 0.1)",
            backgroundColor: "#FFFFFF",
          }}
        >
          <Ionicons name="people-outline" size={24} color={ColorFactoryCON.SUBTLE_TEXT} />
          <Text style={{ color: ColorFactoryCON.SUBTLE_TEXT, fontSize: 14, marginTop: EdgeInsetsCON.XS, textAlign: "center" }}>
            {CreateCategoryScreenCON.SHARED_MEMBERS_COMING_SOON_MESSAGE}
          </Text>
        </View>
      ) : null}
    </View>
  );
}
