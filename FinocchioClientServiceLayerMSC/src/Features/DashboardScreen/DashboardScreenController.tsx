import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  BackHandler,
  Pressable,
  Text,
  View,
  useWindowDimensions,
  type LayoutChangeEvent,
} from "react-native";
import Animated, {
  Extrapolation,
  interpolate,
  runOnJS,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import ApplicationRouteCON from "@/Constants/ApplicationRouteCON";
import ColorFactoryCON from "@/Constants/ColorFactoryCON";
import EdgeInsetsCON from "@/Constants/EdgeInsetsCON";
import BottomSheetHeaderSharedComponent from "@/Components/Shared/BottomSheetHeaderSharedComponent";
import BottomSheetSharedComponent from "@/Components/Shared/BottomSheetSharedComponent";
import DashboardScreenAddCategoryCardStaticComponent from "@/Features/DashboardScreen/Components/Static/DashboardScreenAddCategoryCardStaticComponent";
import DashboardScreenCategoryCardStaticComponent from "@/Features/DashboardScreen/Components/Static/DashboardScreenCategoryCardStaticComponent";
import DashboardScreenCategoryExpandOverlayStaticComponent from "@/Features/DashboardScreen/Components/Static/DashboardScreenCategoryExpandOverlayStaticComponent";
import DashboardScreenCON from "@/Features/DashboardScreen/Constants/DashboardScreenCON";
import type { DashboardMeasuredRectModel } from "@/Features/DashboardScreen/Models/DashboardScreenModel";
import DashboardScreenService from "@/Features/DashboardScreen/Services/DashboardScreenService";
import useThemeReactivityHook from "@/Hooks/useThemeReactivityHook";
import DashboardScreenTwinActionButtonsSectionComponent
  from "@/Features/DashboardScreen/Components/Sections/DashboardScreenTwinActionButtonsSectionComponent";
import DashboardScreenHeaderSectionComponent
  from "@/Features/DashboardScreen/Components/Sections/DashboardScreenHeaderSectionComponent";
import DashboardScreenSettingsThemeSelectorStaticComponent
  from "@/Features/DashboardScreen/Components/Static/DashboardScreenSettingsThemeSelectorStaticComponent";

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
  useThemeReactivityHook();
  const categories = DashboardScreenService.current.getCategories();
  const cardStep = DashboardScreenService.current.getCategoryCardStep();
  const { height: screenHeight } = useWindowDimensions();
  const headerSlideDistance = screenHeight;
  // Resolved to a plain number here, outside the worklet below -- see
  // DashboardScreenCategoryCardStaticComponent's comment on why a
  // DashboardScreenCON property must never be read directly inside a
  // useAnimatedStyle callback.
  const headerSlideAwayEndProgress =
    DashboardScreenCON.EXPAND_SLIDE_AWAY_END_PROGRESS;

  const scrollY = useSharedValue(0);
  const scrollHandler = useAnimatedScrollHandler((event) => {
    scrollY.value = event.contentOffset.y;
  });

  const [stackAreaHeight, setStackAreaHeight] = useState(0);
  const onStackAreaLayout = (event: LayoutChangeEvent) => {
    setStackAreaHeight(event.nativeEvent.layout.height);
  };

  const stackContentHeight =
    stackAreaHeight + Math.max(categories.length - 1, 0) * cardStep;
  const addCardTop = Math.max(
    stackAreaHeight -
      DashboardScreenCON.ADD_CARD_HEIGHT -
      EdgeInsetsCON.MD,
    0,
  );

  // Tap-to-expand sequence state. expandProgress/selectedIndex/expandedCardRect
  // are shared values so every card's worklet reacts to them directly without
  // a JS round-trip; isSequenceActive/selectedCategoryIndex are plain React
  // state because they drive things Reanimated can't (scrollEnabled, which
  // category's data the overlay renders, conditionally mounting the overlay).
  const expandProgress = useSharedValue(0);
  const selectedIndex = useSharedValue(-1);
  const expandedCardRect = useSharedValue<DashboardMeasuredRectModel>({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });
  const [isSequenceActive, setIsSequenceActive] = useState(false);
  const [selectedCategoryIndex, setSelectedCategoryIndex] = useState<
    number | null
  >(null);

  const [isProfileSheetOpen, setIsProfileSheetOpen] = useState(false);
  const [isSettingsSheetOpen, setIsSettingsSheetOpen] = useState(false);

  const resetSequence = (): void => {
    setIsSequenceActive(false);
    setSelectedCategoryIndex(null);
    selectedIndex.value = -1;
  };

  const handleCardTap = (index: number): void => {
    setSelectedCategoryIndex(index);
    setIsSequenceActive(true);
    expandProgress.value = withSpring(
      1,
      DashboardScreenCON.EXPAND_SPRING_CONFIG,
    );
  };

  const handleReverseTap = (): void => {
    expandProgress.value = withSpring(
      0,
      DashboardScreenCON.EXPAND_SPRING_CONFIG,
      (finished) => {
        if (finished) {
          runOnJS(resetSequence)();
        }
      },
    );
  };

  // Android hardware back button mirrors tapping the fullscreen card --
  // without this, back would exit the whole Expo Router stack mid-sequence.
  useEffect(() => {
    if (!isSequenceActive) {
      return;
    }
    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        handleReverseTap();
        return true;
      },
    );
    return () => subscription.remove();
  }, [isSequenceActive]);

  const headerAnimatedStyle = useAnimatedStyle(() => {
    const slideAwayTranslateY = interpolate(
      expandProgress.value,
      [0, headerSlideAwayEndProgress],
      [0, -headerSlideDistance],
      Extrapolation.CLAMP,
    );

    return {
      transform: [{ translateY: slideAwayTranslateY }],
    };
  });

  const selectedCategory =
    selectedCategoryIndex !== null ? categories[selectedCategoryIndex] : null;

  return (
    <View
      className="flex-1"
      style={{ backgroundColor: ColorFactoryCON.BACKGROUND, paddingInline: 8 }}
    >
      <Animated.View
        style={[{ paddingTop: EdgeInsetsCON.XXL }, headerAnimatedStyle]}
      >
        <DashboardScreenHeaderSectionComponent
          onProfilePress={() => setIsProfileSheetOpen(true)}
          onSettingsPress={() => setIsSettingsSheetOpen(true)}
          disabled={isSequenceActive}
        />

        <DashboardScreenTwinActionButtonsSectionComponent />
      </Animated.View>

      <View style={{ flex: 1 }} onLayout={onStackAreaLayout}>
        <Animated.ScrollView
          onScroll={scrollHandler}
          scrollEventThrottle={16}
          showsVerticalScrollIndicator={false}
          scrollEnabled={!isSequenceActive}
          contentContainerStyle={{
            paddingHorizontal: EdgeInsetsCON.LG,
            height: stackContentHeight,
          }}
        >
          {stackAreaHeight > 0 && (
            <DashboardScreenAddCategoryCardStaticComponent
              scrollY={scrollY}
              top={addCardTop}
              expandProgress={expandProgress}
              isSequenceActive={isSequenceActive}
              onPress={() => router.push(ApplicationRouteCON.CREATE_CATEGORY_SCREEN_ROUTE)}
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

      <BottomSheetSharedComponent
        visible={isProfileSheetOpen}
        onClose={() => setIsProfileSheetOpen(false)}
        fullHeight
        header={
          <BottomSheetHeaderSharedComponent
            title={DashboardScreenCON.PROFILE_SHEET_TITLE}
            leadingIconName="close"
            leadingAccessibilityLabel="Close"
            onLeadingPress={() => setIsProfileSheetOpen(false)}
          />
        }
      >
        <View style={{ padding: EdgeInsetsCON.LG }}>
          <Text style={{ color: ColorFactoryCON.SUBTLE_TEXT, fontSize: 16 }}>
            {DashboardScreenCON.PROFILE_SHEET_PLACEHOLDER}
          </Text>
        </View>
      </BottomSheetSharedComponent>

      <BottomSheetSharedComponent
        visible={isSettingsSheetOpen}
        onClose={() => setIsSettingsSheetOpen(false)}
        fullHeight
        header={
          <BottomSheetHeaderSharedComponent
            title={DashboardScreenCON.SETTINGS_SHEET_TITLE}
            leadingIconName="close"
            leadingAccessibilityLabel="Close"
            onLeadingPress={() => setIsSettingsSheetOpen(false)}
          />
        }
      >
        <DashboardScreenSettingsThemeSelectorStaticComponent />
      </BottomSheetSharedComponent>
    </View>
  );
}
