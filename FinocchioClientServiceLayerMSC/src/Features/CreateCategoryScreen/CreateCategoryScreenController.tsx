import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import { BackHandler, Keyboard, Platform, ScrollView, View, useWindowDimensions } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withTiming } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import BottomSheetHeaderSharedComponent from "@/Components/Shared/BottomSheetHeaderSharedComponent";
import BottomSheetSharedComponent from "@/Components/Shared/BottomSheetSharedComponent";
import ConfirmationDialogSharedComponent from "@/Components/Shared/ConfirmationDialogSharedComponent";
import ScreenDescriptionSharedComponent from "@/Components/Shared/ScreenDescriptionSharedComponent";
import SecondaryActionButtonSharedComponent from "@/Components/Shared/SecondaryActionButtonSharedComponent";
import StepProgressIndicatorSharedComponent from "@/Components/Shared/StepProgressIndicatorSharedComponent";
import TextInputSharedComponent from "@/Components/Shared/TextInputSharedComponent";
import ColorFactoryCON from "@/Constants/ColorFactoryCON";
import EdgeInsetsCON from "@/Constants/EdgeInsetsCON";
import CreateCategoryScreenBudgetStepStaticComponent from "@/Features/CreateCategoryScreen/Components/static/CreateCategoryScreenBudgetStepStaticComponent";
import CreateCategoryScreenColorGridStaticComponent from "@/Features/CreateCategoryScreen/Components/static/CreateCategoryScreenColorGridStaticComponent";
import CreateCategoryScreenIconGridStaticComponent from "@/Features/CreateCategoryScreen/Components/static/CreateCategoryScreenIconGridStaticComponent";
import CreateCategoryScreenNameAndAppearanceStepStaticComponent from "@/Features/CreateCategoryScreen/Components/static/CreateCategoryScreenNameAndAppearanceStepStaticComponent";
import CreateCategoryScreenReviewStepStaticComponent from "@/Features/CreateCategoryScreen/Components/static/CreateCategoryScreenReviewStepStaticComponent";
import CreateCategoryScreenTypeAndMembersStepStaticComponent from "@/Features/CreateCategoryScreen/Components/static/CreateCategoryScreenTypeAndMembersStepStaticComponent";
import CreateCategoryScreenCON from "@/Features/CreateCategoryScreen/Constants/CreateCategoryScreenCON";
import {
  CreateCategoryScreenBudgetPeriodEnum,
  CreateCategoryScreenStepEnum,
  CreateCategoryScreenTypeEnum,
} from "@/Features/CreateCategoryScreen/Models/CreateCategoryScreenModel";
import type { DashboardCategoryMemberModel } from "@/Features/DashboardScreen/Models/DashboardScreenModel";
import useShakeAnimationHook from "@/Hooks/useShakeAnimationHook";

const LAST_STEP = CreateCategoryScreenStepEnum.REVIEW;
// Iconpicker's dismiss duration guess, matching the keyboard-sync row's own
// fallback -- see grilling session 2026-11-02.
const KEYBOARD_DISMISS_DURATION = 250;

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
  const [isColorSheetOpen, setIsColorSheetOpen] = useState(false);
  const [name, setName] = useState("");
  const [selectedIconName, setSelectedIconName] = useState<keyof typeof Ionicons.glyphMap | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [isNameInvalid, setIsNameInvalid] = useState(false);
  const [isIconInvalid, setIsIconInvalid] = useState(false);
  const [isColorInvalid, setIsColorInvalid] = useState(false);
  const [amount, setAmount] = useState("");
  const [period, setPeriod] = useState(CreateCategoryScreenBudgetPeriodEnum.MONTH);
  const [isAmountInvalid, setIsAmountInvalid] = useState(false);
  const [type, setType] = useState(CreateCategoryScreenTypeEnum.PERSONAL);
  const [members, setMembers] = useState<DashboardCategoryMemberModel[]>([]);
  const [isMemberSheetOpen, setIsMemberSheetOpen] = useState(false);
  const [memberSearchQuery, setMemberSearchQuery] = useState("");
  const [isDiscardDialogOpen, setIsDiscardDialogOpen] = useState(false);
  const shouldNavigateOnDismiss = useRef(false);

  const isFirstStep = currentStep === CreateCategoryScreenStepEnum.NAME_AND_APPEARANCE;
  const isLastStep = currentStep === LAST_STEP;
  const hasValidationError = isNameInvalid || isIconInvalid || isColorInvalid || isAmountInvalid;

  const isFormDirty =
    name.trim().length > 0 ||
    selectedIconName !== null ||
    selectedColor !== null ||
    amount.trim().length > 0 ||
    members.length > 0 ||
    currentStep !== CreateCategoryScreenStepEnum.NAME_AND_APPEARANCE;

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
  useEffect(() => {
    if (selectedColor) {
      setIsColorInvalid(false);
    }
  }, [selectedColor]);
  useEffect(() => {
    if (parseFloat(amount) > 0) {
      setIsAmountInvalid(false);
    }
  }, [amount]);

  const nameShake = useShakeAnimationHook();
  const iconShake = useShakeAnimationHook();
  const colorShake = useShakeAnimationHook();
  const amountShake = useShakeAnimationHook();
  const continueButtonShake = useShakeAnimationHook();

  // Drives both the button-row keyboard-sync transform (below) and the
  // header's dismiss-keyboard button's enabled state. Reanimated's own
  // useAnimatedKeyboard hook is deprecated "due to persistent bugs on iOS
  // 26" (its own docs) and caused a silent, uncatchable blank-screen crash
  // on this exact screen -- see grilling session 2026-11-02. Keyboard.addListener
  // is the plain, zero-native-dependency fallback: it can't track the OS
  // keyboard animation frame-for-frame, but it actually renders.
  const keyboardHeight = useSharedValue(0);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  // Plain JS-thread mirror of keyboardHeight.value -- needed because
  // ScrollView's contentContainerStyle.paddingBottom (below) is a prop, not
  // an animatable style, so it's set directly rather than through Reanimated.
  const [keyboardHeightValue, setKeyboardHeightValue] = useState(0);
  useEffect(() => {
    const showEvent = Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent = Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

    const showSubscription = Keyboard.addListener(showEvent, (event) => {
      keyboardHeight.value = withTiming(event.endCoordinates.height, { duration: event.duration || 250 });
      setIsKeyboardVisible(true);
      setKeyboardHeightValue(event.endCoordinates.height);
    });
    const hideSubscription = Keyboard.addListener(hideEvent, (event) => {
      keyboardHeight.value = withTiming(0, { duration: event.duration || 250 });
      setIsKeyboardVisible(false);
      setKeyboardHeightValue(0);
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, [keyboardHeight]);

  // Previous always occupies its half of the row (same width on every page,
  // per the request that Next never grows/shrinks) -- on the first step it's
  // simply translated fully off the physical screen to the left rather than
  // unmounted, then slides in/out as isFirstStep changes. Next never moves;
  // only its label changes.
  const previousButtonTranslateX = useSharedValue(-screenWidth);
  useEffect(() => {
    // No config object -- withSpring's own defaults (damping: 120, stiffness:
    // 900, mass: 4) are identical to LinearTransition.springify()'s defaults,
    // used by the Budget Period/Type selection pill -- see grilling session
    // 2026-11-02.
    previousButtonTranslateX.value = withSpring(isFirstStep ? -screenWidth : 0);
  }, [isFirstStep, screenWidth, previousButtonTranslateX]);

  const previousButtonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: previousButtonTranslateX.value }],
  }));

  // Subtracting LG (not insets.bottom) means the row lands with a snug LG
  // gap above the keyboard, since the safe-area inset baked into the row's
  // own bottom padding is irrelevant once the keyboard covers that area --
  // see grilling session 2026-11-02.
  //
  // Resolved to a plain number here, outside the worklet below -- Reanimated's
  // worklet closure capture doesn't reliably serialize a live reference to an
  // ES6 class (EdgeInsetsCON) the way it does a plain number -- see
  // DashboardScreenCategoryCardStaticComponent's identical comment; this was
  // the actual cause of the blank-screen crash, not useAnimatedKeyboard.
  const buttonRowBottomGap = EdgeInsetsCON.LG;
  const buttonRowKeyboardAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: -Math.max(keyboardHeight.value - buttonRowBottomGap, 0) }],
  }));

  // Shared by every bottom sheet this screen opens (icon picker, add member)
  // -- dismiss an open keyboard first so the sheet doesn't fight it for
  // screen space, then open once the dismiss animation's had time to finish.
  const openSheetAfterKeyboardDismiss = (setOpen: (open: boolean) => void): void => {
    if (isKeyboardVisible) {
      Keyboard.dismiss();
      setTimeout(() => setOpen(true), KEYBOARD_DISMISS_DURATION);
      return;
    }
    setOpen(true);
  };

  const openIconPicker = (): void => openSheetAfterKeyboardDismiss(setIsIconSheetOpen);
  const openColorPicker = (): void => openSheetAfterKeyboardDismiss(setIsColorSheetOpen);
  const openMemberSheet = (): void => openSheetAfterKeyboardDismiss(setIsMemberSheetOpen);

  const removeMember = (id: string): void => {
    setMembers((previousMembers) => previousMembers.filter((member) => member.id !== id));
  };

  const handleBackPress = (): void => {
    if (isFormDirty) {
      setIsDiscardDialogOpen(true);
    } else {
      router.back();
    }
  };

  const handleConfirmDiscard = (): void => {
    shouldNavigateOnDismiss.current = true;
    setIsDiscardDialogOpen(false);
  };

  const handleDialogDismissed = (): void => {
    if (shouldNavigateOnDismiss.current) {
      shouldNavigateOnDismiss.current = false;
      router.back();
    }
  };

  useEffect(() => {
    const subscription = BackHandler.addEventListener("hardwareBackPress", () => {
      if (isIconSheetOpen || isColorSheetOpen || isMemberSheetOpen) {
        return false;
      }
      if (isDiscardDialogOpen) {
        return false;
      }
      if (isFormDirty) {
        setIsDiscardDialogOpen(true);
        return true;
      }
      return false;
    });

    return () => subscription.remove();
  }, [isFormDirty, isIconSheetOpen, isColorSheetOpen, isMemberSheetOpen, isDiscardDialogOpen]);

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
      const colorInvalid = selectedColor === null;
      if (nameInvalid || iconInvalid || colorInvalid) {
        setIsNameInvalid(nameInvalid);
        setIsIconInvalid(iconInvalid);
        setIsColorInvalid(colorInvalid);
        continueButtonShake.shake();
        if (nameInvalid) {
          nameShake.shake();
        }
        if (iconInvalid) {
          iconShake.shake();
        }
        if (colorInvalid) {
          colorShake.shake();
        }
        return;
      }
    }

    if (currentStep === CreateCategoryScreenStepEnum.BUDGET) {
      const amountInvalid = !(parseFloat(amount) > 0);
      if (amountInvalid) {
        setIsAmountInvalid(true);
        continueButtonShake.shake();
        amountShake.shake();
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
            onOpenIconPicker={openIconPicker}
            selectedIconName={selectedIconName}
            isIconInvalid={isIconInvalid}
            iconAnimatedStyle={iconShake.animatedStyle}
            onOpenColorPicker={openColorPicker}
            selectedColor={selectedColor}
            isColorInvalid={isColorInvalid}
            colorAnimatedStyle={colorShake.animatedStyle}
          />
        );
      case CreateCategoryScreenStepEnum.BUDGET:
        return (
          <CreateCategoryScreenBudgetStepStaticComponent
            amount={amount}
            onChangeAmount={setAmount}
            isAmountInvalid={isAmountInvalid}
            amountAnimatedStyle={amountShake.animatedStyle}
            period={period}
            onChangePeriod={setPeriod}
          />
        );
      case CreateCategoryScreenStepEnum.TYPE_AND_MEMBERS:
        return (
          <CreateCategoryScreenTypeAndMembersStepStaticComponent
            type={type}
            onChangeType={setType}
            members={members}
            onRemoveMember={removeMember}
            onOpenAddMemberSheet={openMemberSheet}
          />
        );
      case CreateCategoryScreenStepEnum.REVIEW:
        return (
          <CreateCategoryScreenReviewStepStaticComponent
            name={name}
            backgroundColor={selectedColor ?? CreateCategoryScreenCON.CREATE_BUTTON_GREEN}
            amount={amount}
            period={period}
            type={type}
            members={members}
          />
        );
    }
  };

  return (
    <View className="flex-1" style={{ backgroundColor: ColorFactoryCON.BACKGROUND, paddingTop: Math.max(insets.top - 16, 0) }}>
      <BottomSheetHeaderSharedComponent
        title={CreateCategoryScreenCON.SCREEN_TITLE}
        leadingIconName="chevron-back"
        leadingAccessibilityLabel="Back"
        onLeadingPress={handleBackPress}
        trailingActions={[
          {
            icon: <MaterialIcons name="keyboard-hide" size={24} color={ColorFactoryCON.INK} />,
            onPress: () => Keyboard.dismiss(),
            accessibilityLabel: "Dismiss keyboard",
            disabled: !isKeyboardVisible,
          },
        ]}
      />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingHorizontal: EdgeInsetsCON.LG,
          flexGrow: 1,
          // Matches exactly how far the button row shifts up (keyboardHeight
          // - LG, same formula as buttonRowKeyboardAnimatedStyle below) so
          // scrolled content can clear the row's new, higher position instead
          // of being covered by it -- the row moves via transform, which
          // doesn't affect this ScrollView's own flex-allocated height.
          paddingBottom: Math.max(keyboardHeightValue - buttonRowBottomGap, 0),
        }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <ScreenDescriptionSharedComponent
          text={CreateCategoryScreenCON.STEP_DESCRIPTIONS[currentStep]}
          style={{ marginBottom: EdgeInsetsCON.LG }}
        />
        {renderStepContent()}
      </ScrollView>

      <Animated.View
        style={[
          { gap: EdgeInsetsCON.LG, padding: EdgeInsetsCON.LG, paddingBottom: insets.bottom + EdgeInsetsCON.LG },
          buttonRowKeyboardAnimatedStyle,
        ]}
      >
        <StepProgressIndicatorSharedComponent
          currentStep={currentStep}
          totalSteps={CreateCategoryScreenCON.TOTAL_STEPS}
          activeColor={CreateCategoryScreenCON.CREATE_BUTTON_GREEN_DARK}
        />

        <View className="flex-row" style={{ gap: EdgeInsetsCON.SM }}>
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
      </Animated.View>

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

      <BottomSheetSharedComponent
        visible={isColorSheetOpen}
        onClose={() => setIsColorSheetOpen(false)}
        header={
          <BottomSheetHeaderSharedComponent
            title="Select Color"
            leadingIconName="close"
            leadingAccessibilityLabel="Close"
            onLeadingPress={() => setIsColorSheetOpen(false)}
          />
        }
      >
        <CreateCategoryScreenColorGridStaticComponent
          selectedColor={selectedColor}
          onSelect={(color) => {
            setSelectedColor(color);
            setIsColorSheetOpen(false);
          }}
        />
      </BottomSheetSharedComponent>

      {/* Shell only this pass -- header + search bar, nothing else. No
          results list or tap-to-add logic yet -- see grilling session
          2026-11-02. */}
      <BottomSheetSharedComponent
        visible={isMemberSheetOpen}
        onClose={() => setIsMemberSheetOpen(false)}
        header={
          <BottomSheetHeaderSharedComponent
            title={CreateCategoryScreenCON.ADD_MEMBER_SHEET_TITLE}
            leadingIconName="close"
            leadingAccessibilityLabel="Close"
            onLeadingPress={() => setIsMemberSheetOpen(false)}
          />
        }
      >
        <TextInputSharedComponent
          placeholder={CreateCategoryScreenCON.SEARCH_MEMBER_PLACEHOLDER}
          value={memberSearchQuery}
          onChangeText={setMemberSearchQuery}
          leftAdornment={<Ionicons name="search" size={18} color={ColorFactoryCON.SUBTLE_TEXT} />}
          containerStyle={{ padding: EdgeInsetsCON.LG }}
          accessibilityLabel="Search members"
        />
      </BottomSheetSharedComponent>

      <ConfirmationDialogSharedComponent
        visible={isDiscardDialogOpen}
        onClose={() => setIsDiscardDialogOpen(false)}
        onDismissed={handleDialogDismissed}
        title={CreateCategoryScreenCON.DISCARD_DIALOG_TITLE}
        description={CreateCategoryScreenCON.DISCARD_DIALOG_MESSAGE}
        actions={[
          {
            label: CreateCategoryScreenCON.DISCARD_DIALOG_CANCEL_LABEL,
            iconName: "create",
            onPress: () => setIsDiscardDialogOpen(false),
            backgroundColor: "#FFFFFF",
            textColor: ColorFactoryCON.INK,
            borderColor: "rgba(0, 0, 0, 0.15)",
          },
          {
            label: CreateCategoryScreenCON.DISCARD_DIALOG_CONFIRM_LABEL,
            iconName: "trash",
            onPress: handleConfirmDiscard,
            backgroundColor: CreateCategoryScreenCON.VALIDATION_ERROR_RED,
            textColor: "#FFFFFF",
            borderColor: CreateCategoryScreenCON.VALIDATION_ERROR_RED,
          },
        ]}
      />
    </View>
  );
}
