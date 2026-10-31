import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { View, useWindowDimensions } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import BottomSheetHeaderSharedComponent from "@/Components/Shared/BottomSheetHeaderSharedComponent";
import BottomSheetSharedComponent from "@/Components/Shared/BottomSheetSharedComponent";
import ScreenDescriptionSharedComponent from "@/Components/Shared/ScreenDescriptionSharedComponent";
import SecondaryActionButtonSharedComponent from "@/Components/Shared/SecondaryActionButtonSharedComponent";
import ColorFactoryCON from "@/Constants/ColorFactoryCON";
import EdgeInsetsCON from "@/Constants/EdgeInsetsCON";
import CreateCategoryScreenBudgetStepStaticComponent from "@/Features/CreateCategoryScreen/Components/static/CreateCategoryScreenBudgetStepStaticComponent";
import CreateCategoryScreenIconGridStaticComponent from "@/Features/CreateCategoryScreen/Components/static/CreateCategoryScreenIconGridStaticComponent";
import CreateCategoryScreenNameAndAppearanceStepStaticComponent from "@/Features/CreateCategoryScreen/Components/static/CreateCategoryScreenNameAndAppearanceStepStaticComponent";
import CreateCategoryScreenTypeAndMembersStepStaticComponent from "@/Features/CreateCategoryScreen/Components/static/CreateCategoryScreenTypeAndMembersStepStaticComponent";
import CreateCategoryScreenCON from "@/Features/CreateCategoryScreen/Constants/CreateCategoryScreenCON";
import { CreateCategoryScreenStepEnum } from "@/Features/CreateCategoryScreen/Models/CreateCategoryScreenModel";
import useShakeAnimationHook from "@/Hooks/useShakeAnimationHook";

const LAST_STEP = CreateCategoryScreenStepEnum.TYPE_AND_MEMBERS;
const PREVIOUS_BUTTON_SPRING_CONFIG = { duration: 450, dampingRatio: 0.85 } as const;

// Full screen (not a bottom sheet -- see grilling session 2026-10-31), 3-step
// wizard: Name+Appearance -> Budget -> Type+Members. Step content is all
// placeholder for now; this pass is just the shell (header, step state,
// Previous/Next/Create navigation). Header reuses
// BottomSheetHeaderSharedComponent as-is -- it was always generic, never
// actually coupled to the sheet despite its name.
export default function CreateCategoryScreenController(): React.JSX.Element {
  const insets = useSafeAreaInsets();
  const { width: screenWidth } = useWindowDimensions();
  const [currentStep, setCurrentStep] = useState<CreateCategoryScreenStepEnum>(
    CreateCategoryScreenStepEnum.NAME_AND_APPEARANCE,
  );
  const [isIconSheetOpen, setIsIconSheetOpen] = useState(false);
  const [name, setName] = useState("");
  const [selectedIconName, setSelectedIconName] = useState<keyof typeof Ionicons.glyphMap | null>(null);
  const [isNameInvalid, setIsNameInvalid] = useState(false);
  const [isIconInvalid, setIsIconInvalid] = useState(false);

  const isFirstStep = currentStep === CreateCategoryScreenStepEnum.NAME_AND_APPEARANCE;
  const isLastStep = currentStep === LAST_STEP;
  const hasValidationError = isNameInvalid || isIconInvalid;

  // Live-clear per field as soon as it becomes valid, rather than waiting
  // for the next Continue press to re-validate.
  useEffect(() => {
    if (name.trim().length > 0) {
      setIsNameInvalid(false);
    }
  }, [name]);
  useEffect(() => {
    if (selectedIconName) {
      setIsIconInvalid(false);
    }
  }, [selectedIconName]);

  const nameShake = useShakeAnimationHook();
  const iconShake = useShakeAnimationHook();
  const continueButtonShake = useShakeAnimationHook();

  // Previous always occupies its half of the row (same width on every page,
  // per the request that Next never grows/shrinks) -- on the first step it's
  // simply translated fully off the physical screen to the left rather than
  // unmounted, then slides in/out as isFirstStep changes. Next never moves;
  // only its label changes.
  const previousButtonTranslateX = useSharedValue(-screenWidth);
  useEffect(() => {
    previousButtonTranslateX.value = withSpring(isFirstStep ? -screenWidth : 0, PREVIOUS_BUTTON_SPRING_CONFIG);
  }, [isFirstStep, screenWidth, previousButtonTranslateX]);

  const previousButtonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: previousButtonTranslateX.value }],
  }));

  const goToPreviousStep = (): void => {
    if (!isFirstStep) {
      setCurrentStep(currentStep - 1);
    }
  };

  const goToNextStep = (): void => {
    if (isLastStep) {
      // TODO: wire up actual category creation once the backend feature and
      // step content exist -- this pass is the navigation shell only.
      return;
    }

    if (isFirstStep) {
      const nameInvalid = name.trim().length === 0;
      const iconInvalid = selectedIconName === null;
      if (nameInvalid || iconInvalid) {
        setIsNameInvalid(nameInvalid);
        setIsIconInvalid(iconInvalid);
        continueButtonShake.shake();
        if (nameInvalid) {
          nameShake.shake();
        }
        if (iconInvalid) {
          iconShake.shake();
        }
        return;
      }
    }

    setCurrentStep(currentStep + 1);
  };

  const renderStepContent = (): React.JSX.Element => {
    switch (currentStep) {
      case CreateCategoryScreenStepEnum.NAME_AND_APPEARANCE:
        return (
          <CreateCategoryScreenNameAndAppearanceStepStaticComponent
            name={name}
            onChangeName={setName}
            isNameInvalid={isNameInvalid}
            nameAnimatedStyle={nameShake.animatedStyle}
            onOpenIconPicker={() => setIsIconSheetOpen(true)}
            selectedIconName={selectedIconName}
            isIconInvalid={isIconInvalid}
            iconAnimatedStyle={iconShake.animatedStyle}
          />
        );
      case CreateCategoryScreenStepEnum.BUDGET:
        return <CreateCategoryScreenBudgetStepStaticComponent />;
      case CreateCategoryScreenStepEnum.TYPE_AND_MEMBERS:
        return <CreateCategoryScreenTypeAndMembersStepStaticComponent />;
    }
  };

  return (
    <View className="flex-1" style={{ backgroundColor: ColorFactoryCON.BACKGROUND, paddingTop: Math.max(insets.top - 16, 0) }}>
      <BottomSheetHeaderSharedComponent
        title={CreateCategoryScreenCON.SCREEN_TITLE}
        leadingIconName="chevron-back"
        leadingAccessibilityLabel="Back"
        onLeadingPress={() => router.back()}
      />

      <View style={{ flex: 1, paddingHorizontal: EdgeInsetsCON.LG }}>
        <ScreenDescriptionSharedComponent
          text={CreateCategoryScreenCON.STEP_DESCRIPTIONS[currentStep]}
          style={{ marginBottom: EdgeInsetsCON.LG }}
        />
        {renderStepContent()}
      </View>

      <View
        className="flex-row"
        style={{ gap: EdgeInsetsCON.SM, padding: EdgeInsetsCON.LG, paddingBottom: insets.bottom + EdgeInsetsCON.LG }}
      >
        <Animated.View style={[{ flex: 1 }, previousButtonAnimatedStyle]}>
          <SecondaryActionButtonSharedComponent
            label={CreateCategoryScreenCON.PREVIOUS_BUTTON_LABEL}
            width="full"
            paddingHorizontal={EdgeInsetsCON.XS}
            onPress={goToPreviousStep}
            leadingElement={
              <View className="w-12 h-12 rounded-full items-center justify-center" style={{ backgroundColor: "rgba(0, 0, 0, 0.06)" }}>
                <Ionicons name="chevron-back" size={18} color={ColorFactoryCON.INK} />
              </View>
            }
          />
        </Animated.View>
        <Animated.View style={[{ flex: 1 }, continueButtonShake.animatedStyle]}>
          <SecondaryActionButtonSharedComponent
            label={
              isLastStep
                ? CreateCategoryScreenCON.CREATE_BUTTON_LABEL
                : isFirstStep
                  ? CreateCategoryScreenCON.FIRST_STEP_NEXT_BUTTON_LABEL
                  : CreateCategoryScreenCON.NEXT_BUTTON_LABEL
            }
            width="full"
            paddingHorizontal={EdgeInsetsCON.XS}
            onPress={goToNextStep}
            backgroundColor={isLastStep ? CreateCategoryScreenCON.CREATE_BUTTON_GREEN : undefined}
            borderColor={
              hasValidationError
                ? CreateCategoryScreenCON.VALIDATION_ERROR_RED
                : isLastStep
                  ? CreateCategoryScreenCON.CREATE_BUTTON_GREEN_BORDER
                  : undefined
            }
            textColor={
              hasValidationError
                ? CreateCategoryScreenCON.VALIDATION_ERROR_RED
                : isLastStep
                  ? CreateCategoryScreenCON.CREATE_BUTTON_GREEN_DARK
                  : undefined
            }
            leadingElement={
              <View
                className="w-12 h-12 rounded-full items-center justify-center"
                style={{
                  backgroundColor: isLastStep ? CreateCategoryScreenCON.CREATE_BUTTON_GREEN_DARK : "rgba(0, 0, 0, 0.06)",
                }}
              >
                <Ionicons
                  name={isLastStep ? "checkmark" : "chevron-forward"}
                  size={18}
                  color={
                    hasValidationError
                      ? CreateCategoryScreenCON.VALIDATION_ERROR_RED
                      : isLastStep
                        ? CreateCategoryScreenCON.CREATE_BUTTON_GREEN
                        : ColorFactoryCON.INK
                  }
                />
              </View>
            }
          />
        </Animated.View>
      </View>

      <BottomSheetSharedComponent
        visible={isIconSheetOpen}
        onClose={() => setIsIconSheetOpen(false)}
        header={
          <BottomSheetHeaderSharedComponent
            title="Select Icon"
            leadingIconName="close"
            leadingAccessibilityLabel="Close"
            onLeadingPress={() => setIsIconSheetOpen(false)}
          />
        }
      >
        <CreateCategoryScreenIconGridStaticComponent
          selectedIconName={selectedIconName}
          onSelect={(iconName) => {
            setSelectedIconName(iconName);
            setIsIconSheetOpen(false);
          }}
        />
      </BottomSheetSharedComponent>
    </View>
  );
}
