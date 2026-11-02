import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, Text, View } from "react-native";
import Animated from "react-native-reanimated";

import TextInputSharedComponent from "@/Components/Shared/TextInputSharedComponent";
import ColorFactoryCON from "@/Constants/ColorFactoryCON";
import EdgeInsetsCON from "@/Constants/EdgeInsetsCON";
import CreateCategoryScreenCON from "@/Features/CreateCategoryScreen/Constants/CreateCategoryScreenCON";
import { CreateCategoryScreenBudgetPeriodEnum } from "@/Features/CreateCategoryScreen/Models/CreateCategoryScreenModel";
import useCardPressAnimationHook, { type CardPressAnimationHookResult } from "@/Hooks/useCardPressAnimationHook";
import type { ShakeAnimationHookResult } from "@/Hooks/useShakeAnimationHook";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

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

      <Text
        style={{
          color: ColorFactoryCON.SUBTLE_TEXT,
          fontSize: 13,
          fontWeight: "600",
          marginTop: EdgeInsetsCON.LG,
          marginBottom: EdgeInsetsCON.XS,
        }}
      >
        {CreateCategoryScreenCON.BUDGET_PERIOD_SECTION_HEADING}
      </Text>

      <View style={{ gap: EdgeInsetsCON.SM }}>
        {PERIOD_GRID_ROWS.map((row, rowIndex) => (
          <View key={rowIndex} className="flex-row" style={{ gap: EdgeInsetsCON.SM }}>
            {row.map((periodValue) => {
              const isSelected = periodValue === period;
              const cardPress = periodPressAnimations[periodValue];
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
                      height: 96,
                      borderRadius: 24,
                      gap: EdgeInsetsCON.XS,
                      backgroundColor: isSelected ? CreateCategoryScreenCON.CREATE_BUTTON_GREEN_DARK : "rgba(0, 0, 0, 0.06)",
                    },
                    cardPress.animatedStyle,
                  ]}
                >
                  <Ionicons
                    name={PERIOD_ICONS[periodValue]}
                    size={24}
                    color={isSelected ? "#FFFFFF" : ColorFactoryCON.INK}
                  />
                  <Text style={{ color: isSelected ? "#FFFFFF" : ColorFactoryCON.INK, fontSize: 14, fontWeight: "600" }}>
                    {CreateCategoryScreenCON.BUDGET_PERIOD_LABELS[periodValue]}
                  </Text>
                </AnimatedPressable>
              );
            })}
          </View>
        ))}
      </View>
    </View>
  );
}
