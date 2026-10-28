import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { BackHandler, Pressable, Text, View, useWindowDimensions, type LayoutChangeEvent } from "react-native";
import Animated, {
  Extrapolation,
  interpolate,
  runOnJS,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import ColorFactoryCON from "@/Constants/ColorFactoryCON";
import EdgeInsetsCON from "@/Constants/EdgeInsetsCON";
import DashboardScreenAddCategoryCardStaticComponent from "@/Features/DashboardScreen/Components/static/DashboardScreenAddCategoryCardStaticComponent";
import DashboardScreenCategoryCardStaticComponent from "@/Features/DashboardScreen/Components/static/DashboardScreenCategoryCardStaticComponent";
import DashboardScreenCategoryExpandOverlayStaticComponent from "@/Features/DashboardScreen/Components/static/DashboardScreenCategoryExpandOverlayStaticComponent";
import DashboardScreenCON from "@/Features/DashboardScreen/Constants/DashboardScreenCON";
import type { DashboardMeasuredRectModel } from "@/Features/DashboardScreen/Models/DashboardScreenModel";
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
//
// Tap-to-expand "zoom" sequence (see
// FinocchioAgentDocumentationNMSC/PRD/CATEGORY_CARD_EXPAND_PRD.md): tapping a
// category card slides every other element off-screen and expands the
// tapped card to fill the screen, standing in for navigating to a real
// per-category detail screen that doesn't exist yet. Everything is driven by
// one `expandProgress` shared value (0 = resting stack, 1 = fully expanded)
// animated via a single spring per direction -- see the PRD for why a single
// continuous progress value is used instead of separately-timed animations.
export default function DashboardScreenController(): React.JSX.Element {
  const categories = DashboardScreenService.current.getCategories();
  const cardStep = DashboardScreenService.current.getCategoryCardStep();
  const { height: screenHeight } = useWindowDimensions();
  const headerSlideDistance = screenHeight;

  const scrollY = useSharedValue(0);
  const scrollHandler = useAnimatedScrollHandler((event) => {
    scrollY.value = event.contentOffset.y;
  });

  const [stackAreaHeight, setStackAreaHeight] = useState(0);
  const onStackAreaLayout = (event: LayoutChangeEvent) => {
    setStackAreaHeight(event.nativeEvent.layout.height);
  };

  const stackContentHeight = stackAreaHeight + Math.max(categories.length - 1, 0) * cardStep;
  const addCardTop = Math.max(stackAreaHeight - DashboardScreenCON.CATEGORY_CARD_HEIGHT - EdgeInsetsCON.MD, 0);

  // Tap-to-expand sequence state. expandProgress/selectedIndex/expandedCardRect
  // are shared values so every card's worklet reacts to them directly without
  // a JS round-trip; isSequenceActive/selectedCategoryIndex are plain React
  // state because they drive things Reanimated can't (scrollEnabled, which
  // category's data the overlay renders, conditionally mounting the overlay).
  const expandProgress = useSharedValue(0);
  const selectedIndex = useSharedValue(-1);
  const expandedCardRect = useSharedValue<DashboardMeasuredRectModel>({ x: 0, y: 0, width: 0, height: 0 });
  const [isSequenceActive, setIsSequenceActive] = useState(false);
  const [selectedCategoryIndex, setSelectedCategoryIndex] = useState<number | null>(null);

  const resetSequence = (): void => {
    setIsSequenceActive(false);
    setSelectedCategoryIndex(null);
    selectedIndex.value = -1;
  };

  const handleCardTap = (index: number): void => {
    setSelectedCategoryIndex(index);
    setIsSequenceActive(true);
    expandProgress.value = withSpring(1, DashboardScreenCON.EXPAND_SPRING_CONFIG);
  };

  const handleReverseTap = (): void => {
    expandProgress.value = withSpring(0, DashboardScreenCON.EXPAND_SPRING_CONFIG, (finished) => {
      if (finished) {
        runOnJS(resetSequence)();
      }
    });
  };

  // Android hardware back button mirrors tapping the fullscreen card --
  // without this, back would exit the whole Expo Router stack mid-sequence.
  useEffect(() => {
    if (!isSequenceActive) {
      return;
    }
    const subscription = BackHandler.addEventListener("hardwareBackPress", () => {
      handleReverseTap();
      return true;
    });
    return () => subscription.remove();
  }, [isSequenceActive]);

  const headerAnimatedStyle = useAnimatedStyle(() => {
    const slideAwayTranslateY = interpolate(
      expandProgress.value,
      [0, DashboardScreenCON.EXPAND_SLIDE_AWAY_END_PROGRESS],
      [0, -headerSlideDistance],
      Extrapolation.CLAMP,
    );

    return {
      transform: [{ translateY: slideAwayTranslateY }],
    };
  });

  const selectedCategory = selectedCategoryIndex !== null ? categories[selectedCategoryIndex] : null;

  return (
    <View className="flex-1" style={{ backgroundColor: ColorFactoryCON.BACKGROUND, paddingInline: 5 }}>
      <Animated.View style={[{ paddingHorizontal: EdgeInsetsCON.LG, paddingTop: EdgeInsetsCON.XXL }, headerAnimatedStyle]}>
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
      </Animated.View>

      <View style={{ flex: 1 }} onLayout={onStackAreaLayout}>
        <Animated.ScrollView
          onScroll={scrollHandler}
          scrollEventThrottle={16}
          showsVerticalScrollIndicator={false}
          scrollEnabled={!isSequenceActive}
          contentContainerStyle={{ paddingHorizontal: EdgeInsetsCON.LG, height: stackContentHeight }}
        >
          {stackAreaHeight > 0 && (
            <DashboardScreenAddCategoryCardStaticComponent
              scrollY={scrollY}
              top={addCardTop}
              expandProgress={expandProgress}
              isSequenceActive={isSequenceActive}
            />
          )}

          {categories.map((category, index) => (
            <DashboardScreenCategoryCardStaticComponent
              key={category.id}
              category={category}
              index={index}
              isLastCard={index === categories.length - 1}
              scrollY={scrollY}
              expandProgress={expandProgress}
              selectedIndex={selectedIndex}
              expandedCardRect={expandedCardRect}
              isSequenceActive={isSequenceActive}
              onTap={handleCardTap}
              onReverseTap={handleReverseTap}
            />
          ))}
        </Animated.ScrollView>
      </View>

      {isSequenceActive && selectedCategory ? (
        <DashboardScreenCategoryExpandOverlayStaticComponent
          category={selectedCategory}
          expandProgress={expandProgress}
          expandedCardRect={expandedCardRect}
          onPress={handleReverseTap}
        />
      ) : null}
    </View>
  );
}
