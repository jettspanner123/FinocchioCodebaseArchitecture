import { router } from "expo-router";
import React, { useState } from "react";
import { Text, View, type LayoutChangeEvent } from "react-native";
import Animated, { useAnimatedScrollHandler, useSharedValue } from "react-native-reanimated";

import ApplicationRouteCON from "@/Constants/ApplicationRouteCON";
import ColorFactoryCON from "@/Constants/ColorFactoryCON";
import EdgeInsetsCON from "@/Constants/EdgeInsetsCON";
import BottomSheetHeaderSharedComponent from "@/Components/Shared/BottomSheetHeaderSharedComponent";
import BottomSheetSharedComponent from "@/Components/Shared/BottomSheetSharedComponent";
import DashboardScreenAddCategoryCardStaticComponent from "@/Features/DashboardScreen/Components/Static/DashboardScreenAddCategoryCardStaticComponent";
import DashboardScreenCategoryCardStaticComponent from "@/Features/DashboardScreen/Components/Static/DashboardScreenCategoryCardStaticComponent";
import DashboardScreenCON from "@/Features/DashboardScreen/Constants/DashboardScreenCON";
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
// Tapping a category card navigates to CategoryDetailScreen via the normal
// Expo Router stack (plain push, default platform transition) -- the earlier
// custom tap-to-expand "zoom" sequence (measure/overlay/edge-swipe gesture)
// was fully removed, see grilling session 2026-11-15.
export default function DashboardScreenController(): React.JSX.Element {
  useThemeReactivityHook();
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

  const stackContentHeight =
    stackAreaHeight + Math.max(categories.length - 1, 0) * cardStep;
  const addCardTop = Math.max(
    stackAreaHeight -
      DashboardScreenCON.ADD_CARD_HEIGHT -
      EdgeInsetsCON.MD,
    0,
  );

  const [isProfileSheetOpen, setIsProfileSheetOpen] = useState(false);
  const [isSettingsSheetOpen, setIsSettingsSheetOpen] = useState(false);

  return (
    <View
      className="flex-1"
      style={{ backgroundColor: ColorFactoryCON.BACKGROUND, paddingInline: 8 }}
    >
      <View style={{ paddingTop: EdgeInsetsCON.XXL }}>
        <DashboardScreenHeaderSectionComponent
          onProfilePress={() => setIsProfileSheetOpen(true)}
          onSettingsPress={() => setIsSettingsSheetOpen(true)}
        />

        <DashboardScreenTwinActionButtonsSectionComponent />
      </View>

      <View style={{ flex: 1 }} onLayout={onStackAreaLayout}>
        <Animated.ScrollView
          onScroll={scrollHandler}
          scrollEventThrottle={16}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: EdgeInsetsCON.LG,
            height: stackContentHeight,
          }}
        >
          {stackAreaHeight > 0 && (
            <DashboardScreenAddCategoryCardStaticComponent
              scrollY={scrollY}
              top={addCardTop}
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
            />
          ))}
        </Animated.ScrollView>
      </View>

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
