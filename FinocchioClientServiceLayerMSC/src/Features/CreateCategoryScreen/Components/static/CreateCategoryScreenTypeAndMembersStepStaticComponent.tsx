import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, Text, View, useWindowDimensions } from "react-native";
import Animated, { LinearTransition } from "react-native-reanimated";

import AccentActionButtonSharedComponent from "@/Components/Shared/AccentActionButtonSharedComponent";
import SubSectionSharedComponent from "@/Components/Shared/SubSectionSharedComponent";
import ColorFactoryCON from "@/Constants/ColorFactoryCON";
import EdgeInsetsCON from "@/Constants/EdgeInsetsCON";
import CreateCategoryScreenCON from "@/Features/CreateCategoryScreen/Constants/CreateCategoryScreenCON";
import { CreateCategoryScreenTypeEnum } from "@/Features/CreateCategoryScreen/Models/CreateCategoryScreenModel";
import type { DashboardCategoryMemberModel } from "@/Features/DashboardScreen/Models/DashboardScreenModel";
import useCardPressAnimationHook from "@/Hooks/useCardPressAnimationHook";
import useCardSelectionAnimationHook from "@/Hooks/useCardSelectionAnimationHook";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
const AnimatedIonicons = Animated.createAnimatedComponent(Ionicons);

interface CreateCategoryScreenTypeAndMembersStepStaticComponentProps {
  type: CreateCategoryScreenTypeEnum;
  onChangeType: (type: CreateCategoryScreenTypeEnum) => void;
  members: DashboardCategoryMemberModel[];
  onRemoveMember: (id: string) => void;
  onOpenAddMemberSheet: () => void;
}

const TYPE_VALUES = [CreateCategoryScreenTypeEnum.PERSONAL, CreateCategoryScreenTypeEnum.SHARED];
const TYPE_ICONS: Record<CreateCategoryScreenTypeEnum, keyof typeof Ionicons.glyphMap> = {
  [CreateCategoryScreenTypeEnum.PERSONAL]: "person-outline",
  [CreateCategoryScreenTypeEnum.SHARED]: "people-outline",
};
// Column within the single row -- used to position the sliding selection
// indicator analytically, same technique as CreateCategoryScreenBudgetStepStaticComponent.
const TYPE_GRID_COLUMNS: Record<CreateCategoryScreenTypeEnum, number> = {
  [CreateCategoryScreenTypeEnum.PERSONAL]: 0,
  [CreateCategoryScreenTypeEnum.SHARED]: 1,
};
const CARD_HEIGHT = 96;

// Type is fully controlled from CreateCategoryScreenController, defaulting to
// Personal -- always has a valid value, so no validation needed. Shared shows
// its member list (or an empty state) plus an Add Member button that opens a
// search bottom sheet; the sheet is a shell only this pass -- no results list
// or tap-to-add logic yet -- see grilling session 2026-11-02.
export default function CreateCategoryScreenTypeAndMembersStepStaticComponent({
  type,
  onChangeType,
  members,
  onRemoveMember,
  onOpenAddMemberSheet,
}: CreateCategoryScreenTypeAndMembersStepStaticComponentProps): React.JSX.Element {
  const { width: screenWidth } = useWindowDimensions();
  const gridContentWidth = screenWidth - EdgeInsetsCON.LG * 2;
  const cardWidth = (gridContentWidth - EdgeInsetsCON.SM) / 2;
  const selectedColumn = TYPE_GRID_COLUMNS[type];

  // Rules of Hooks forbid calling a hook inside the .map() below.
  const personalPress = useCardPressAnimationHook();
  const sharedPress = useCardPressAnimationHook();
  const typePressAnimations = {
    [CreateCategoryScreenTypeEnum.PERSONAL]: personalPress,
    [CreateCategoryScreenTypeEnum.SHARED]: sharedPress,
  };

  const personalSelection = useCardSelectionAnimationHook(type === CreateCategoryScreenTypeEnum.PERSONAL);
  const sharedSelection = useCardSelectionAnimationHook(type === CreateCategoryScreenTypeEnum.SHARED);
  const typeSelectionAnimations = {
    [CreateCategoryScreenTypeEnum.PERSONAL]: personalSelection,
    [CreateCategoryScreenTypeEnum.SHARED]: sharedSelection,
  };

  return (
    <View style={{ flex: 1 }}>
      <View style={{ position: "relative" }}>
        <Animated.View
          layout={LinearTransition.springify()}
          style={{
            position: "absolute",
            left: selectedColumn * (cardWidth + EdgeInsetsCON.SM),
            top: 0,
            width: cardWidth,
            height: CARD_HEIGHT,
            borderRadius: 24,
            backgroundColor: CreateCategoryScreenCON.CREATE_BUTTON_GREEN_DARK,
          }}
        />

        <View className="flex-row" style={{ gap: EdgeInsetsCON.SM }}>
          {TYPE_VALUES.map((typeValue) => {
            const isSelected = typeValue === type;
            const cardPress = typePressAnimations[typeValue];
            const cardSelection = typeSelectionAnimations[typeValue];
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
                    height: CARD_HEIGHT,
                    borderRadius: 24,
                    gap: EdgeInsetsCON.XS,
                  },
                  cardSelection.backgroundAnimatedStyle,
                  cardPress.animatedStyle,
                ]}
              >
                <AnimatedIonicons name={TYPE_ICONS[typeValue]} size={24} animatedProps={cardSelection.iconAnimatedProps} />
                <Animated.Text style={[{ fontSize: 14, fontWeight: "600" }, cardSelection.textAnimatedStyle]}>
                  {CreateCategoryScreenCON.TYPE_LABELS[typeValue]}
                </Animated.Text>
              </AnimatedPressable>
            );
          })}
        </View>
      </View>

      {type === CreateCategoryScreenTypeEnum.SHARED ? (
        <View style={{ marginTop: EdgeInsetsCON.LG }}>
          <SubSectionSharedComponent text={CreateCategoryScreenCON.MEMBERS_SECTION_HEADING} style={{ marginTop: 0 }} />

          {members.length === 0 ? (
            <View className="items-center bg-white rounded-xl" style={{ paddingVertical: EdgeInsetsCON.XXL, paddingHorizontal: 40 }}>
              <Ionicons name="people" size={24} color={ColorFactoryCON.SUBTLE_TEXT} />
              <Text
                style={{ color: ColorFactoryCON.INK, fontSize: 15, fontWeight: "600", marginTop: EdgeInsetsCON.XS, textAlign: "center" }}
              >
                {CreateCategoryScreenCON.EMPTY_MEMBERS_HEADING}
              </Text>
              <Text style={{ color: ColorFactoryCON.SUBTLE_TEXT, fontSize: 13, marginTop: EdgeInsetsCON.SM, textAlign: "center" }}>
                {CreateCategoryScreenCON.EMPTY_MEMBERS_DESCRIPTION}
              </Text>
            </View>
          ) : (
            <View style={{ gap: EdgeInsetsCON.SM }}>
              {members.map((member) => (
                <View
                  key={member.id}
                  className="flex-row items-center"
                  style={{
                    height: 56,
                    gap: EdgeInsetsCON.SM,
                    borderWidth: 1,
                    borderColor: "rgba(0, 0, 0, 0.1)",
                    borderRadius: 16,
                    paddingHorizontal: EdgeInsetsCON.MD,
                    backgroundColor: "#FFFFFF",
                  }}
                >
                  <View className="w-10 h-10 rounded-full items-center justify-center" style={{ backgroundColor: "rgba(0, 0, 0, 0.06)" }}>
                    <Text style={{ color: ColorFactoryCON.INK, fontSize: 13, fontWeight: "600" }}>{member.avatarInitials}</Text>
                  </View>
                  <Text style={{ flex: 1, color: ColorFactoryCON.INK, fontSize: 15 }} numberOfLines={1}>
                    {member.name}
                  </Text>
                  <Pressable
                    onPress={() => onRemoveMember(member.id)}
                    accessibilityRole="button"
                    accessibilityLabel={`Remove ${member.name}`}
                    hitSlop={8}
                  >
                    <Ionicons name="close" size={18} color={ColorFactoryCON.SUBTLE_TEXT} />
                  </Pressable>
                </View>
              ))}
            </View>
          )}

          <View style={{ marginTop: EdgeInsetsCON.LG }}>
            <AccentActionButtonSharedComponent
              label={CreateCategoryScreenCON.ADD_MEMBER_BUTTON_LABEL}
              iconName="add"
              backgroundColor={CreateCategoryScreenCON.CREATE_BUTTON_GREEN_DARK}
              width="full"
              onPress={onOpenAddMemberSheet}
            />
          </View>
        </View>
      ) : null}
    </View>
  );
}
