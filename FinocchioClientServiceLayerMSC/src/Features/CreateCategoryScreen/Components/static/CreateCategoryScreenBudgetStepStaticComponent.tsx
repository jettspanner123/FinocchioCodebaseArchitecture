import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, Text, View, useWindowDimensions } from "react-native";
import Animated, { LinearTransition } from "react-native-reanimated";

import SubSectionSharedComponent from "@/Components/Shared/SubSectionSharedComponent";
import TextInputSharedComponent from "@/Components/Shared/TextInputSharedComponent";
import ColorFactoryCON from "@/Constants/ColorFactoryCON";
import EdgeInsetsCON from "@/Constants/EdgeInsetsCON";
import CreateCategoryScreenCON from "@/Features/CreateCategoryScreen/Constants/CreateCategoryScreenCON";
import { CreateCategoryScreenBudgetPeriodEnum } from "@/Features/CreateCategoryScreen/Models/CreateCategoryScreenModel";
import useCardPressAnimationHook, { type CardPressAnimationHookResult } from "@/Hooks/useCardPressAnimationHook";
import useCardSelectionAnimationHook from "@/Hooks/useCardSelectionAnimationHook";
import type { ShakeAnimationHookResult } from "@/Hooks/useShakeAnimationHook";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
const AnimatedIonicons = Animated.createAnimatedComponent(Ionicons);

interface CreateCategoryScreenBudgetStepStaticComponentProps {
  amount: string;
  onChangeAmount: (amount: string) => void;
  isAmountInvalid: boolean;
  amountAnimatedStyle: ShakeAnimationHookResult["animatedStyle"];
  period: CreateCategoryScreenBudgetPeriodEnum;
  onChangePeriod: (period: CreateCategoryScreenBudgetPeriodEnum) => void;
}

// 2x2 grid, row-major: [Day, Week] then [Month, Year].
const PERIOD_GRID_ROWS = [
  [CreateCategoryScreenBudgetPeriodEnum.DAY, CreateCategoryScreenBudgetPeriodEnum.WEEK],
  [CreateCategoryScreenBudgetPeriodEnum.MONTH, CreateCategoryScreenBudgetPeriodEnum.YEAR],
];

const PERIOD_ICONS: Record<CreateCategoryScreenBudgetPeriodEnum, keyof typeof Ionicons.glyphMap> = {
  [CreateCategoryScreenBudgetPeriodEnum.DAY]: "today-outline",
  [CreateCategoryScreenBudgetPeriodEnum.WEEK]: "calendar-outline",
  [CreateCategoryScreenBudgetPeriodEnum.MONTH]: "calendar-number-outline",
  [CreateCategoryScreenBudgetPeriodEnum.YEAR]: "hourglass-outline",
};

// Row/column within the 2x2 grid -- used to position the sliding selection
// indicator analytically (the grid is fixed-size, so no runtime measuring is
// needed, unlike the Dashboard's tap-to-expand overlay).
const PERIOD_GRID_POSITIONS: Record<CreateCategoryScreenBudgetPeriodEnum, { row: number; col: number }> = {
  [CreateCategoryScreenBudgetPeriodEnum.DAY]: { row: 0, col: 0 },
  [CreateCategoryScreenBudgetPeriodEnum.WEEK]: { row: 0, col: 1 },
  [CreateCategoryScreenBudgetPeriodEnum.MONTH]: { row: 1, col: 0 },
  [CreateCategoryScreenBudgetPeriodEnum.YEAR]: { row: 1, col: 1 },
};

const GRID_CARD_HEIGHT = 96;

// Amount and period are fully controlled from CreateCategoryScreenController,
// same pattern as step 1's Name/Icon. Period always has a valid value
// (defaults to Month), so it needs no validation; amount does.
export default function CreateCategoryScreenBudgetStepStaticComponent({
  amount,
  onChangeAmount,
  isAmountInvalid,
  amountAnimatedStyle,
  period,
  onChangePeriod,
}: CreateCategoryScreenBudgetStepStaticComponentProps): React.JSX.Element {
  // Matches the ScrollView's own horizontal padding (EdgeInsetsCON.LG on
  // each side, set in CreateCategoryScreenController) so the computed card
  // width lines up exactly with the cards' actual flex-rendered width.
  const { width: screenWidth } = useWindowDimensions();
  const gridContentWidth = screenWidth - EdgeInsetsCON.LG * 2;
  const gridCardWidth = (gridContentWidth - EdgeInsetsCON.SM) / 2;
  const selectedPosition = PERIOD_GRID_POSITIONS[period];

  // Rules of Hooks forbid calling a hook inside the .map() below -- call all
  // 4 up front, then index into this map by period value.
  const dayPress = useCardPressAnimationHook();
  const weekPress = useCardPressAnimationHook();
  const monthPress = useCardPressAnimationHook();
  const yearPress = useCardPressAnimationHook();
  const periodPressAnimations: Record<CreateCategoryScreenBudgetPeriodEnum, CardPressAnimationHookResult> = {
    [CreateCategoryScreenBudgetPeriodEnum.DAY]: dayPress,
    [CreateCategoryScreenBudgetPeriodEnum.WEEK]: weekPress,
    [CreateCategoryScreenBudgetPeriodEnum.MONTH]: monthPress,
    [CreateCategoryScreenBudgetPeriodEnum.YEAR]: yearPress,
  };

  // Same Rules-of-Hooks constraint as above -- call all 4 up front.
  const daySelection = useCardSelectionAnimationHook(period === CreateCategoryScreenBudgetPeriodEnum.DAY);
  const weekSelection = useCardSelectionAnimationHook(period === CreateCategoryScreenBudgetPeriodEnum.WEEK);
  const monthSelection = useCardSelectionAnimationHook(period === CreateCategoryScreenBudgetPeriodEnum.MONTH);
  const yearSelection = useCardSelectionAnimationHook(period === CreateCategoryScreenBudgetPeriodEnum.YEAR);
  const periodSelectionAnimations = {
    [CreateCategoryScreenBudgetPeriodEnum.DAY]: daySelection,
    [CreateCategoryScreenBudgetPeriodEnum.WEEK]: weekSelection,
    [CreateCategoryScreenBudgetPeriodEnum.MONTH]: monthSelection,
    [CreateCategoryScreenBudgetPeriodEnum.YEAR]: yearSelection,
  };

  return (
    <View style={{ flex: 1 }}>
      <Animated.View style={amountAnimatedStyle}>
        <TextInputSharedComponent
          placeholder={CreateCategoryScreenCON.AMOUNT_PLACEHOLDER}
          value={amount}
          onChangeText={onChangeAmount}
          keyboardType="numeric"
          accessibilityLabel="Budget amount"
          leftAdornment={
            <Text style={{ color: ColorFactoryCON.INK, fontSize: 16, fontWeight: "600" }}>
              {CreateCategoryScreenCON.CURRENCY_SYMBOL}
            </Text>
          }
          style={[
            { borderRadius: 9999 },
            isAmountInvalid ? { borderColor: CreateCategoryScreenCON.VALIDATION_ERROR_RED } : null,
          ]}
          placeholderTextColor={isAmountInvalid ? CreateCategoryScreenCON.VALIDATION_ERROR_RED : undefined}
        />
        {isAmountInvalid ? (
          <Text
            style={{
              color: CreateCategoryScreenCON.VALIDATION_ERROR_RED,
              fontSize: 13,
              marginTop: EdgeInsetsCON.XS,
              paddingHorizontal: EdgeInsetsCON.LG,
            }}
          >
            {CreateCategoryScreenCON.AMOUNT_REQUIRED_ERROR}
          </Text>
        ) : null}
      </Animated.View>

      <SubSectionSharedComponent text={CreateCategoryScreenCON.BUDGET_PERIOD_SECTION_HEADING} />

      <View style={{ position: "relative" }}>
        <Animated.View
          layout={LinearTransition.springify()}
          style={{
            position: "absolute",
            left: selectedPosition.col * (gridCardWidth + EdgeInsetsCON.SM),
            top: selectedPosition.row * (GRID_CARD_HEIGHT + EdgeInsetsCON.SM),
            width: gridCardWidth,
            height: GRID_CARD_HEIGHT,
            borderRadius: 24,
            backgroundColor: CreateCategoryScreenCON.CREATE_BUTTON_GREEN_DARK,
          }}
        />

        <View style={{ gap: EdgeInsetsCON.SM }}>
          {PERIOD_GRID_ROWS.map((row, rowIndex) => (
            <View key={rowIndex} className="flex-row" style={{ gap: EdgeInsetsCON.SM }}>
              {row.map((periodValue) => {
                const isSelected = periodValue === period;
                const cardPress = periodPressAnimations[periodValue];
                const cardSelection = periodSelectionAnimations[periodValue];
                return (
                  <AnimatedPressable
                    key={periodValue}
                    onPress={() => onChangePeriod(periodValue)}
                    onPressIn={cardPress.onPressIn}
                    onPressOut={cardPress.onPressOut}
                    accessibilityRole="button"
                    accessibilityState={{ selected: isSelected }}
                    style={[
                      {
                        flex: 1,
                        alignItems: "center",
                        justifyContent: "center",
                        height: GRID_CARD_HEIGHT,
                        borderRadius: 24,
                        gap: EdgeInsetsCON.XS,
                      },
                      cardSelection.backgroundAnimatedStyle,
                      cardPress.animatedStyle,
                    ]}
                  >
                    <AnimatedIonicons name={PERIOD_ICONS[periodValue]} size={24} animatedProps={cardSelection.iconAnimatedProps} />
                    <Animated.Text style={[{ fontSize: 14, fontWeight: "600" }, cardSelection.textAnimatedStyle]}>
                      {CreateCategoryScreenCON.BUDGET_PERIOD_LABELS[periodValue]}
                    </Animated.Text>
                  </AnimatedPressable>
                );
              })}
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}
