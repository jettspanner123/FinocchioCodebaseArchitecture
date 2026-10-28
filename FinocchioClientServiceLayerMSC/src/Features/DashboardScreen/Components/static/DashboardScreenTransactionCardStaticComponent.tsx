import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Text, View } from "react-native";
import Animated, { Extrapolation, interpolate, useAnimatedStyle, type SharedValue } from "react-native-reanimated";

import EdgeInsetsCON from "@/Constants/EdgeInsetsCON";
import DashboardScreenCON from "@/Features/DashboardScreen/Constants/DashboardScreenCON";
import type { DashboardTransactionModel } from "@/Features/DashboardScreen/Models/DashboardScreenModel";
import DashboardScreenService from "@/Features/DashboardScreen/Services/DashboardScreenService";
import UIFontHelper from "@/Helpers/UIFontHelper";

interface DashboardScreenTransactionCardStaticComponentProps {
  transaction: DashboardTransactionModel;
  index: number;
  scrollY: SharedValue<number>;
}

// Not actually a plain "static" presentational component anymore in the
// no-hooks sense -- it owns the scroll-driven pin/recede animation for
// itself, since useAnimatedStyle must be called from a component, not a
// static Service method. It stays free of local state and business logic
// (category colors, currency formatting still come from DashboardScreenService),
// which is the property "static" is actually guarding here.
export default function DashboardScreenTransactionCardStaticComponent({
  transaction,
  index,
  scrollY,
}: DashboardScreenTransactionCardStaticComponentProps): React.JSX.Element {
  const style = DashboardScreenService.current.resolveCategoryStyle(transaction.category);
  const formattedAmount = DashboardScreenService.current.formatCurrency(transaction.amount);

  const cardStep = DashboardScreenService.current.getTransactionCardStep();
  const pinArrivalScrollY = index * cardStep - DashboardScreenCON.TRANSACTION_STACK_PIN_OFFSET;

  // Breakpoints driving the "receding into the stack" scale: 1 while this
  // card hasn't been covered yet, stepping down once for every subsequent
  // card that locks in on top of it, capped at MAX_RECEDE_DEPTH levels so
  // scale stays bounded no matter how long the real transaction list gets.
  const receiveDepth = DashboardScreenCON.TRANSACTION_STACK_MAX_RECEDE_DEPTH;
  const scaleInputRange = [pinArrivalScrollY];
  const scaleOutputRange = [1];
  for (let level = 1; level <= receiveDepth; level += 1) {
    scaleInputRange.push(pinArrivalScrollY + level * cardStep);
    scaleOutputRange.push(1 - level * DashboardScreenCON.TRANSACTION_STACK_RECEDE_SCALE_STEP);
  }

  const animatedStyle = useAnimatedStyle(() => {
    // Cards scroll normally (native scroll handles that) until this point is
    // reached, then this counter-translate holds them in place on screen
    // regardless of further scrolling -- the "sticky pin" effect.
    const pinnedTranslateY = Math.max(scrollY.value - pinArrivalScrollY, 0);
    const scale = interpolate(scrollY.value, scaleInputRange, scaleOutputRange, Extrapolation.CLAMP);

    return {
      transform: [{ translateY: pinnedTranslateY }, { scale }],
    };
  });

  return (
    <Animated.View
      style={[
        {
          position: "absolute",
          top: index * cardStep,
          left: 0,
          right: 0,
          height: DashboardScreenCON.TRANSACTION_CARD_HEIGHT,
          zIndex: index,
          borderRadius: 24,
          borderWidth: 1,
          borderColor: DashboardScreenCON.TRANSACTION_CARD_BORDER_COLOR,
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: style.backgroundColor,
          padding: EdgeInsetsCON.LG,
          ...DashboardScreenCON.TRANSACTION_CARD_SHADOW_STYLE,
        },
        animatedStyle,
      ]}
    >
      <View className="flex-row items-start justify-between">
        <View
          className="w-[4rem] h-[4rem] rounded-full items-center justify-center"
          style={{ backgroundColor: style.iconBackgroundColor }}
        >
          <Ionicons name={style.iconName} size={23} color={style.textColor} />
        </View>

      </View>

      <View className="flex-row items-end justify-between">
        <View>
          <Text style={{ color: style.textColor, opacity: 0.7, fontSize: 20, fontFamily: UIFontHelper.current.getPirataOneFont() }}>
            {transaction.category}
          </Text>
          <Text style={{ color: style.textColor, fontWeight: "600", fontSize: 30 }}>{transaction.merchantName}</Text>
        </View>

        <View>
          <Text
            style={{
              color: style.textColor,
              opacity: 0.7,
              fontSize: 20,
              textAlign: "end",
              fontFamily: UIFontHelper.current.getPirataOneFont(),
            }}
          >
            {transaction.dayLabel}
          </Text>
          <Text style={{ color: style.textColor, fontWeight: "600", fontSize: 30 }}>{formattedAmount}</Text>
        </View>
      </View>
    </Animated.View>
  );
}
