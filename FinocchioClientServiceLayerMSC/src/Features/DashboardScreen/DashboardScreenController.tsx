import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
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
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  Extrapolation,
  interpolate,
  runOnJS,
  useAnimatedReaction,
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

// Duplicated from BottomSheetSharedComponent rather than extracted into a
// shared src/Helpers/ file -- CODING-RULES.md requires Helpers to be
// singleton classes accessed via `.current`, but Reanimated's worklet babel
// plugin can't reliably serialize a live reference to a class into a
// worklet's closure (the exact bug class already hit once in this file's
// sibling component, see DashboardScreenCategoryCardStaticComponent's
// comment on DashboardScreenCON-in-worklet). Two small pure functions aren't
// worth inventing a new exception to that convention for.
// No default parameters -- see BottomSheetSharedComponent's identical
// comment on why a worklet function's default-parameter expression isn't
// reliably captured into its closure. Every call site passes all arguments.
function rubberband(overshoot: number, dimension: number, constant: number): number {
  "worklet";
  return (overshoot * dimension * constant) / (dimension + constant * Math.abs(overshoot));
}

function projectMomentum(velocity: number, decelerationRate: number): number {
  "worklet";
  return ((velocity / 1000) * decelerationRate) / (1 - decelerationRate);
}

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
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const headerSlideDistance = screenHeight;
  // Resolved to a plain number here, outside the worklet below -- see
  // DashboardScreenCategoryCardStaticComponent's comment on why a
  // DashboardScreenCON property must never be read directly inside a
  // useAnimatedStyle callback.
  const headerSlideAwayEndProgress =
    DashboardScreenCON.EXPAND_SLIDE_AWAY_END_PROGRESS;
  const growthStartProgress = DashboardScreenCON.EXPAND_GROWTH_START_PROGRESS;

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
  // Mirrors whether the overlay's own growth/shrink has reached (or is past)
  // growthStartProgress, i.e. whether it's currently the thing that needs to
  // paint over everything else -- NOT whether the reverse spring has fully
  // "finished" (which lags well behind when the motion visually settles,
  // since a damped spring keeps running under the hood through its
  // oscillation tail). Below that threshold the overlay is already
  // pixel-coincident with the real card (same rect), so there's nothing to
  // gain by keeping it mounted, and every reason not to: the real card
  // underneath already has the correct, never-changing zIndex, so
  // unmounting the overlay right then restores correct stacking order the
  // instant things look done, in both directions, symmetrically -- see
  // apple-motion grilling session 2026-11-13.
  const [isOverlayGrown, setIsOverlayGrown] = useState(false);

  useAnimatedReaction(
    () => expandProgress.value >= growthStartProgress,
    (isGrown, previousIsGrown) => {
      if (isGrown !== previousIsGrown) {
        runOnJS(setIsOverlayGrown)(isGrown);
      }
    },
  );

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

  // `velocity` defaults to 0 for the existing non-gesture callers (overlay
  // tap, Android back) -- the edge-swipe gesture below passes its own
  // release velocity so the settle spring continues at the finger's speed
  // instead of starting from rest.
  const handleReverseTap = (velocity: number = 0): void => {
    expandProgress.value = withSpring(
      0,
      { ...DashboardScreenCON.EXPAND_SPRING_CONFIG, velocity },
      (finished) => {
        if (finished) {
          runOnJS(resetSequence)();
        }
      },
    );
  };

  // Edge-swipe-to-collapse -- mirrors the native swipe-from-the-left-edge-
  // to-go-back gesture's exact trigger zone (see the GestureDetector View
  // below), but drives this screen's own collapse animation instead of a
  // screen transition. Alongside, not instead of, tap-to-reverse. Drags
  // expandProgress directly from its own current live value (never a
  // separate drag-progress value), so every other element already keyed to
  // expandProgress (cards sliding back up, header returning) reverses in
  // perfect lockstep for free -- see CATEGORY_CARD_EXPAND_PRD.md's "single
  // master progress value" section and apple-motion grilling session
  // 2026-11-13.
  //
  // Resolved to plain values here, outside the worklets below -- see
  // DashboardScreenCategoryCardStaticComponent's comment on why a
  // DashboardScreenCON property must never be read directly inside a
  // worklet.
  const expandSpringConfig = DashboardScreenCON.EXPAND_SPRING_CONFIG;
  const edgeSwipeRubberbandDimension =
    DashboardScreenCON.EXPAND_EDGE_SWIPE_RUBBERBAND_DIMENSION;
  const edgeSwipeRubberbandConstant =
    DashboardScreenCON.EXPAND_EDGE_SWIPE_RUBBERBAND_CONSTANT;
  const edgeSwipeDecelerationRate =
    DashboardScreenCON.EXPAND_EDGE_SWIPE_PROJECTION_DECELERATION_RATE;
  const edgeSwipeCommitThreshold =
    DashboardScreenCON.EXPAND_EDGE_SWIPE_COMMIT_THRESHOLD;

  // A quick tap within the edge zone should still collapse (tap-to-reverse
  // must keep working everywhere, including this strip) -- Gesture.Race
  // below lets whichever of Tap/Pan actually recognizes first win, exactly
  // like Gesture Handler's own standard pattern for "tap OR drag in the same
  // hit area."
  const edgeSwipeTapGesture = Gesture.Tap().onEnd(() => {
    runOnJS(handleReverseTap)();
  });

  const edgeSwipePanGesture = Gesture.Pan()
    .onChange((event) => {
      // Moving the finger right (positive changeX) collapses (progress ->
      // 0); dragging past either end resists progressively instead of
      // hard-clamping -- same rubber-banding formula as
      // BottomSheetSharedComponent, just rescaled to progress-units.
      const next = expandProgress.value - event.changeX / screenWidth;
      if (next < 0) {
        expandProgress.value = -rubberband(-next, edgeSwipeRubberbandDimension, edgeSwipeRubberbandConstant);
      } else if (next > 1) {
        expandProgress.value = 1 + rubberband(next - 1, edgeSwipeRubberbandDimension, edgeSwipeRubberbandConstant);
      } else {
        expandProgress.value = next;
      }
    })
    .onEnd((event) => {
      // Velocity converted from px/s to progress-units/s (divided by the
      // same screenWidth used above) before projecting/handing off --
      // expandProgress has no inherent pixel scale of its own.
      const progressVelocity = -event.velocityX / screenWidth;
      const projectedProgress =
        expandProgress.value + projectMomentum(progressVelocity, edgeSwipeDecelerationRate);
      if (projectedProgress < edgeSwipeCommitThreshold) {
        runOnJS(handleReverseTap)(progressVelocity);
      } else {
        expandProgress.value = withSpring(1, { ...expandSpringConfig, velocity: progressVelocity });
      }
    });

  const edgeSwipeGesture = Gesture.Race(edgeSwipeTapGesture, edgeSwipePanGesture);

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
      {/* True edge-to-edge, matching how Apple's own zoom transitions hide
          chrome while expanded -- animated so it fades rather than snapping. */}
      <StatusBar hidden={isSequenceActive} animated />

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

      {isSequenceActive && selectedCategory && isOverlayGrown ? (
        <DashboardScreenCategoryExpandOverlayStaticComponent
          category={selectedCategory}
          expandProgress={expandProgress}
          expandedCardRect={expandedCardRect}
          onPress={() => handleReverseTap()}
        />
      ) : null}

      {isSequenceActive ? (
        <GestureDetector gesture={edgeSwipeGesture}>
          <View
            style={{
              position: "absolute",
              top: 0,
              bottom: 0,
              // The root View above has paddingInline: 8 -- offsetting by
              // that same amount here so this zone's left edge lands flush
              // with the true physical screen edge, not 8px inset from it
              // (absolute positioning resolves against the padding box).
              left: -8,
              width: DashboardScreenCON.EXPAND_EDGE_SWIPE_ZONE_WIDTH,
              zIndex: 1000,
            }}
          />
        </GestureDetector>
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
