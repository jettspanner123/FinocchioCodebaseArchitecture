import React from "react";
import { Appearance, Pressable, Text, View, useWindowDimensions } from "react-native";
import Animated, { LinearTransition } from "react-native-reanimated";

import SubSectionSharedComponent from "@/Components/Shared/SubSectionSharedComponent";
import ColorFactoryCON from "@/Constants/ColorFactoryCON";
import EdgeInsetsCON from "@/Constants/EdgeInsetsCON";
import ApplicationUserPreferenceCON from "@/Constants/ApplicationUserPreferenceCON";
import DashboardScreenCON from "@/Features/DashboardScreen/Constants/DashboardScreenCON";
import ApplicationPhysicalFeedback from "@/Services/ApplicationPhysicalFeedback";
import ApplicationUserPreferenceService from "@/Services/ApplicationUserPreferenceService";
import useApplicationBaselineColorStateStore from "@/Store/ApplicationBaselineColorStateStore";
import type { ThemePreferenceType } from "@/Store/Interface/ApplicationBaselineColorStateStoreInterface";

interface ThemeOptionItemModel {
  id: ThemePreferenceType;
  label: string;
}

// Order matches SETTINGS_BOTTOM_SHEET_ELEMENTS_DC.html's own Light/Dark/System
// layout -- see grilling session 2026-11-08.
const THEME_OPTIONS: ThemeOptionItemModel[] = [
  { id: "light", label: "Light" },
  { id: "dark", label: "Dark" },
  { id: "system", label: "System" },
];

// Mini phone-mockup content colors -- literal 1:1 port of the design file's
// own illustrative light/dark screenshot colors, independent of this app's
// own theme system (see grilling session 2026-11-08, Q3).
const MOCKUP_LIGHT_FRAME_BG = "#e5e7eb";
const MOCKUP_LIGHT_NOTCH = "#1f2937";
const MOCKUP_LIGHT_STATUS_BAR_BG = "#FFFFFF";
const MOCKUP_LIGHT_STATUS_BAR_DASH = "#9ca3af";
const MOCKUP_LIGHT_STATUS_DOT = "#3b82f6";
const MOCKUP_LIGHT_CARD_BG = "#FFFFFF";
const MOCKUP_LIGHT_CARD_LINE_1 = "#4b5563";
const MOCKUP_LIGHT_CARD_LINE_2 = "#d1d5db";
const MOCKUP_LIGHT_ACCENT_BG = "#dbeafe";
const MOCKUP_LIGHT_ACCENT_LINE = "#2563eb";
const MOCKUP_LIGHT_ACCENT_DOT = "#2563eb";
const MOCKUP_LIGHT_HOME_INDICATOR = "#9ca3af";

const MOCKUP_DARK_FRAME_BG = "#09090b";
const MOCKUP_DARK_NOTCH = "#27272a";
const MOCKUP_DARK_STATUS_BAR_BG = "#18181b";
const MOCKUP_DARK_STATUS_BAR_DASH = "#71717a";
const MOCKUP_DARK_STATUS_DOT = "#aac7ff";
const MOCKUP_DARK_CARD_BG = "#18181b";
const MOCKUP_DARK_CARD_LINE_1 = "#f4f4f5";
const MOCKUP_DARK_CARD_LINE_2 = "#52525b";
const MOCKUP_DARK_ACCENT_BG = "#002957";
const MOCKUP_DARK_ACCENT_LINE = "#aac7ff";
const MOCKUP_DARK_ACCENT_DOT = "#3e90ff";
const MOCKUP_DARK_HOME_INDICATOR = "#52525b";

// System's content rows have no card-bg box of their own (transparent, so the
// split frame shows through) -- matches the HTML exactly, see grilling
// session 2026-11-08.
const MOCKUP_SYSTEM_NOTCH = "#1f2937";
const MOCKUP_SYSTEM_STATUS_BAR_DASH = "#6b7280";
const MOCKUP_SYSTEM_STATUS_DOT = "#aac7ff";
const MOCKUP_SYSTEM_CARD_LINE_1 = "#e4e2e4";
const MOCKUP_SYSTEM_CARD_LINE_2 = "#6b7280";
const MOCKUP_SYSTEM_ACCENT_LINE = "#aac7ff";
const MOCKUP_SYSTEM_ACCENT_DOT = "#3e90ff";
const MOCKUP_SYSTEM_HOME_INDICATOR = "#6b7280";

const MOCKUP_RADIUS = 16;
const MOCKUP_ROW_RADIUS = 3;
const MOCKUP_ASPECT_RATIO = 16 / 9;
const GRID_COLUMNS = 3;
// Padding of the bordered card wrapping this whole block (padding: MD on all
// sides) -- needed here too so the computed card width matches what the grid
// row actually has available, same technique as CreateCategoryScreenBudgetStepStaticComponent's
// gridCardWidth (see grilling session 2026-11-08: aspectRatio + width:"100%"
// inside a flex row with `gap` blew up to an enormous height in Yoga --
// explicit pixel sizing, like every other card grid in this app already
// uses, is the fix).
const CARD_CONTAINER_PADDING = EdgeInsetsCON.MD;

// Three stacked rows inside a phone-mockup frame: a status bar, a text card,
// and an accent block -- 1:1 structure from the HTML, sized to this app's own
// scale rather than literally converted Tailwind values (see grilling session
// 2026-11-08, Q4).
function MockupContentRows({
  statusBarBg,
  statusBarDash,
  statusDot,
  cardBg,
  cardLine1,
  cardLine2,
  accentBg,
  accentLine,
  accentDot,
}: {
  statusBarBg?: string;
  statusBarDash: string;
  statusDot: string;
  cardBg?: string;
  cardLine1: string;
  cardLine2: string;
  accentBg?: string;
  accentLine: string;
  accentDot: string;
}): React.JSX.Element {
  return (
    <View style={{ gap: EdgeInsetsCON.XS, paddingHorizontal: 2 }}>
      <View
        style={{
          height: 10,
          backgroundColor: statusBarBg,
          borderRadius: MOCKUP_ROW_RADIUS,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: 3,
        }}
      >
        <View style={{ width: 10, height: 3, borderRadius: 2, backgroundColor: statusBarDash }} />
        <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: statusDot }} />
      </View>
      <View
        style={{
          height: 24,
          backgroundColor: cardBg,
          borderRadius: MOCKUP_ROW_RADIUS,
          justifyContent: "center",
          gap: 2,
          paddingHorizontal: 3,
        }}
      >
        <View style={{ width: "75%", height: 3, borderRadius: 2, backgroundColor: cardLine1 }} />
        <View style={{ width: "50%", height: 3, borderRadius: 2, backgroundColor: cardLine2 }} />
      </View>
      <View
        style={{
          height: 16,
          backgroundColor: accentBg,
          borderRadius: MOCKUP_ROW_RADIUS,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: 3,
        }}
      >
        <View style={{ width: "40%", height: 3, borderRadius: 2, backgroundColor: accentLine }} />
        <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: accentDot }} />
      </View>
    </View>
  );
}

function ThemeMockupFrame({ optionId }: { optionId: ThemePreferenceType }): React.JSX.Element {
  if (optionId === "system") {
    return (
      <View style={{ flex: 1, position: "relative", borderRadius: 12, overflow: "hidden" }}>
        <View style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, flexDirection: "row" }}>
          <View style={{ flex: 1, backgroundColor: MOCKUP_LIGHT_FRAME_BG }} />
          <View style={{ flex: 1, backgroundColor: MOCKUP_DARK_FRAME_BG }} />
        </View>
        <View style={{ flex: 1, justifyContent: "space-between" }}>
          <View style={{ width: 24, height: 4, borderRadius: 2, backgroundColor: MOCKUP_SYSTEM_NOTCH, alignSelf: "center" }} />
          <MockupContentRows
            statusBarDash={MOCKUP_SYSTEM_STATUS_BAR_DASH}
            statusDot={MOCKUP_SYSTEM_STATUS_DOT}
            cardLine1={MOCKUP_SYSTEM_CARD_LINE_1}
            cardLine2={MOCKUP_SYSTEM_CARD_LINE_2}
            accentLine={MOCKUP_SYSTEM_ACCENT_LINE}
            accentDot={MOCKUP_SYSTEM_ACCENT_DOT}
          />
          <View style={{ width: 32, height: 2, borderRadius: 1, backgroundColor: MOCKUP_SYSTEM_HOME_INDICATOR, alignSelf: "center" }} />
        </View>
      </View>
    );
  }

  const isDark = optionId === "dark";
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: isDark ? MOCKUP_DARK_FRAME_BG : MOCKUP_LIGHT_FRAME_BG,
        justifyContent: "space-between",
        borderRadius: 12
      }}
    >
      <View
        style={{
          width: 24,
          height: 4,
          borderRadius: 2,
          backgroundColor: isDark ? MOCKUP_DARK_NOTCH : MOCKUP_LIGHT_NOTCH,
          alignSelf: "center",
        }}
      />
      <MockupContentRows
        statusBarBg={isDark ? MOCKUP_DARK_STATUS_BAR_BG : MOCKUP_LIGHT_STATUS_BAR_BG}
        statusBarDash={isDark ? MOCKUP_DARK_STATUS_BAR_DASH : MOCKUP_LIGHT_STATUS_BAR_DASH}
        statusDot={isDark ? MOCKUP_DARK_STATUS_DOT : MOCKUP_LIGHT_STATUS_DOT}
        cardBg={isDark ? MOCKUP_DARK_CARD_BG : MOCKUP_LIGHT_CARD_BG}
        cardLine1={isDark ? MOCKUP_DARK_CARD_LINE_1 : MOCKUP_LIGHT_CARD_LINE_1}
        cardLine2={isDark ? MOCKUP_DARK_CARD_LINE_2 : MOCKUP_LIGHT_CARD_LINE_2}
        accentBg={isDark ? MOCKUP_DARK_ACCENT_BG : MOCKUP_LIGHT_ACCENT_BG}
        accentLine={isDark ? MOCKUP_DARK_ACCENT_LINE : MOCKUP_LIGHT_ACCENT_LINE}
        accentDot={isDark ? MOCKUP_DARK_ACCENT_DOT : MOCKUP_LIGHT_ACCENT_DOT}
      />
      <View
        style={{
          width: 32,
          height: 2,
          borderRadius: 1,
          backgroundColor: isDark ? MOCKUP_DARK_HOME_INDICATOR : MOCKUP_LIGHT_HOME_INDICATOR,
          alignSelf: "center",
        }}
      />
    </View>
  );
}

// 3-card phone-mockup grid, 1:1 from the "Interface Theme" block in
// SETTINGS_BOTTOM_SHEET_ELEMENTS_DC.html -- the header row (title + "{Theme}
// Active" badge) and the per-card checkmark radio indicator were both
// explicitly dropped, see grilling session 2026-11-09. Card chrome
// (border/label colors) is mapped to this app's own ColorFactoryCON system
// instead of the HTML's own dark Material tokens -- those are an artifact of
// the design file being captured in dark mode, not a deliberate instruction
// (see grilling session 2026-11-08, Q3). Now fully functional (THEME_SYSTEM_PRD.md):
// selecting a theme here actually changes the app's colors and persists
// across cold starts, see ApplicationThemeSyncComponent.
export default function DashboardScreenSettingsThemeSelectorStaticComponent(): React.JSX.Element {
  // Real store state now, not local useState -- this IS the control surface
  // for the theme system, so a direct hook subscription here is correct and
  // expected (not a violation of ApplicationThemeSyncComponent's "don't
  // migrate passive color-consumption call sites" principle), see
  // THEME_SYSTEM_PRD.md §4.5.
  const selectedTheme = useApplicationBaselineColorStateStore((state) => state.themePreference);
  const setThemePreference = useApplicationBaselineColorStateStore((state) => state.setThemePreference);

  // Explicit pixel sizing, not aspectRatio -- matches every other card grid
  // in this app (Icon grid, Budget's 2x2, Type cards), none of which use
  // aspectRatio, see grilling session 2026-11-08.
  const { width: screenWidth } = useWindowDimensions();
  const gridContentWidth = screenWidth - EdgeInsetsCON.LG * 2 - CARD_CONTAINER_PADDING * 2;
  const cardWidth = (gridContentWidth - EdgeInsetsCON.SM * (GRID_COLUMNS - 1)) / GRID_COLUMNS;
  const cardHeight = cardWidth * MOCKUP_ASPECT_RATIO;
  const selectedIndex = THEME_OPTIONS.findIndex((option) => option.id === selectedTheme);

  const handleSelectTheme = (theme: ThemePreferenceType): void => {
    void ApplicationPhysicalFeedback.current.haptic.triggerHaptic();
    const systemScheme = Appearance.getColorScheme() === "dark" ? "dark" : "light";
    setThemePreference(theme, systemScheme);
    void ApplicationUserPreferenceService.current.setPreference(ApplicationUserPreferenceCON.THEME_PREFERENCE_KEY, theme);
  };

  return (
    <View
      style={{
        paddingHorizontal: EdgeInsetsCON.LG,
        paddingTop: EdgeInsetsCON.MD,
        paddingBottom: EdgeInsetsCON.XXL,
      }}
    >
      <SubSectionSharedComponent text={DashboardScreenCON.SETTINGS_APPEARANCE_TITLE} />

      <View
        style={{
          backgroundColor: ColorFactoryCON.SURFACE,
          borderRadius: 24,
          borderWidth: 1,
          borderColor: ColorFactoryCON.BORDER_SUBTLE,
          padding: EdgeInsetsCON.MD,
        }}
      >
        <View style={{ position: "relative" }}>
          {/* Single sliding selection fill -- solid accent color, deliberately
              covering the selected card's mockup content underneath (explicit
              choice, see grilling session 2026-11-09: flagged that this hides
              the phone-mockup for whichever card is selected, confirmed
              wanted anyway). */}
          <Animated.View
            layout={LinearTransition.springify()}
            pointerEvents="none"
            style={{
              position: "absolute",
              left: selectedIndex * (cardWidth + EdgeInsetsCON.SM),
              top: 0,
              width: cardWidth,
              height: cardHeight,
              borderRadius: MOCKUP_RADIUS,
              backgroundColor: ColorFactoryCON.ACCENT,
            }}
          />

          <View style={{ flexDirection: "row", gap: EdgeInsetsCON.SM }}>
            {THEME_OPTIONS.map((option) => {
              const isSelected = selectedTheme === option.id;

              return (
                <View key={option.id} style={{ width: cardWidth, alignItems: "center" }}>
                  <Pressable
                    onPress={() => handleSelectTheme(option.id)}
                    accessibilityRole="radio"
                    accessibilityState={{ selected: isSelected }}
                    accessibilityLabel={`${option.label} theme`}
                    style={{
                      width: cardWidth,
                      height: cardHeight,
                      borderRadius: MOCKUP_RADIUS,
                      overflow: "hidden",
                      padding: 4,
                    }}
                  >
                    {({ pressed }) => (
                      <View style={{ flex: 1, transform: [{ scale: pressed ? 0.96 : 1 }] }}>
                        <ThemeMockupFrame optionId={option.id} />
                      </View>
                    )}
                  </Pressable>

                  <Text
                    style={{
                      marginTop: EdgeInsetsCON.XS,
                      fontSize: 14,
                      fontWeight: isSelected ? "700" : "500",
                      color: isSelected ? ColorFactoryCON.ACCENT : ColorFactoryCON.SUBTLE_TEXT,
                    }}
                  >
                    {option.label}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>
      </View>
    </View>
  );
}
