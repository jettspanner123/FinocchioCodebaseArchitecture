import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { Pressable, Text, View, type LayoutChangeEvent } from "react-native";
import Animated, { useAnimatedScrollHandler, useSharedValue } from "react-native-reanimated";

import ColorFactoryCON from "@/Constants/ColorFactoryCON";
import EdgeInsetsCON from "@/Constants/EdgeInsetsCON";
import DashboardScreenAddCategoryCardStaticComponent from "@/Features/DashboardScreen/Components/static/DashboardScreenAddCategoryCardStaticComponent";
import DashboardScreenCategoryCardStaticComponent from "@/Features/DashboardScreen/Components/static/DashboardScreenCategoryCardStaticComponent";
import DashboardScreenCON from "@/Features/DashboardScreen/Constants/DashboardScreenCON";
import DashboardScreenService from "@/Features/DashboardScreen/Services/DashboardScreenService";

// Top bar elements (avatars, +, filter dropdown) are static placeholders
// for this design-system pass, not wired to navigation.
//
// Only the card area scrolls -- the header above it is outside the
// Animated.ScrollView entirely, not just visually fixed. Cards are
// absolutely positioned and pin to the top of this region via a
// scroll-driven Reanimated transform (see DashboardScreenCategoryCardStaticComponent);
// contentContainerStyle's height is sized to give exactly enough scroll range
// for all cards to stack cleanly.
//
// The black Add Category Card sits beneath the category cards at the bottom
// of the viewport, staying pinned/stationary via counter-translation as cards scroll up.
export default function DashboardScreenController(): React.JSX.Element {
  const categories = DashboardScreenService.current.getCategories();
  const cardStep = DashboardScreenService.current.getCategoryCardStep();

  const scrollY = useSharedValue(0);
  const scrollHandler = useAnimatedScrollHandler((event) => {
    scrollY.value = event.contentOffset.y;
  });

  const [stackAreaHeight, setStackAreaHeight] = useState(0);
  const onStackAreaLayout = (event: LayoutChangeEvent) => {
    setStackAreaHeight(event.nativeEvent.layout.height);
  };

  const stackContentHeight = stackAreaHeight + Math.max(categories.length - 1, 0) * cardStep;
  const addCardTop = Math.max(
    stackAreaHeight - DashboardScreenCON.CATEGORY_CARD_HEIGHT - EdgeInsetsCON.MD,
    0,
  );

  return (
    <View className="flex-1" style={{ backgroundColor: ColorFactoryCON.BACKGROUND, paddingInline: 5 }}>
      <View style={{ paddingHorizontal: EdgeInsetsCON.LG, paddingTop: EdgeInsetsCON.XXL }}>
        <View className="flex-row items-center justify-between" style={{ marginBottom: EdgeInsetsCON.XL }}>
          <View className="flex-row items-center">
            <View
              className="w-9 h-9 rounded-full bg-white items-center justify-center"
              style={{ borderWidth: 2, borderColor: ColorFactoryCON.BACKGROUND }}
            >
              <Ionicons name="person" size={16} color={ColorFactoryCON.SUBTLE_TEXT} />
            </View>
            <View
              className="w-9 h-9 rounded-full bg-white items-center justify-center -ml-3"
              style={{ borderWidth: 2, borderColor: ColorFactoryCON.BACKGROUND }}
            >
              <Ionicons name="person" size={16} color={ColorFactoryCON.SUBTLE_TEXT} />
            </View>
            <Pressable className="w-9 h-9 rounded-full bg-white items-center justify-center ml-2" disabled>
              <Ionicons name="add" size={18} color={ColorFactoryCON.INK} />
            </Pressable>
          </View>

          <Pressable className="flex-row items-center" disabled>
            <Ionicons name="chevron-down" size={18} color={ColorFactoryCON.INK} />
          </Pressable>
        </View>

        <Text style={{ color: ColorFactoryCON.SUBTLE_TEXT, fontSize: 16 }}>{DashboardScreenCON.HEADER_LABEL}</Text>
        <Text className="mb-6" style={{ color: ColorFactoryCON.INK, fontSize: 40, fontWeight: "700" }}>
          {DashboardScreenCON.PERIOD_LABEL}
        </Text>
      </View>

      <View style={{ flex: 1 }} onLayout={onStackAreaLayout}>
        <Animated.ScrollView
          onScroll={scrollHandler}
          scrollEventThrottle={16}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: EdgeInsetsCON.LG, height: stackContentHeight }}
        >
          {stackAreaHeight > 0 && (
            <DashboardScreenAddCategoryCardStaticComponent
              scrollY={scrollY}
              top={addCardTop}
            />
          )}

          {categories.map((category, index) => (
            <DashboardScreenCategoryCardStaticComponent
              key={category.id}
              category={category}
              index={index}
              isLastCard={index === categories.length - 1}
              scrollY={scrollY}
            />
          ))}
        </Animated.ScrollView>
      </View>
    </View>
  );
}
