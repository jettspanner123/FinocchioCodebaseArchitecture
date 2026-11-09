import React, { useEffect } from "react";
import { Appearance } from "react-native";

import ApplicationUserPreferenceCON from "@/Constants/ApplicationUserPreferenceCON";
import ApplicationUserPreferenceService from "@/Services/ApplicationUserPreferenceService";
import useApplicationBaselineColorStateStore from "@/Store/ApplicationBaselineColorStateStore";
import type { ThemePreferenceType } from "@/Store/Interface/ApplicationBaselineColorStateStoreInterface";

const VALID_THEME_PREFERENCES: ThemePreferenceType[] = ["light", "dark", "system"];

function isThemePreferenceType(value: string): value is ThemePreferenceType {
  return (VALID_THEME_PREFERENCES as string[]).includes(value);
}

interface ApplicationThemeSyncComponentProps {
  children: React.ReactNode;
}

// Wraps the rest of the app (src/app/_layout.tsx) -- MUST be an ancestor of
// everything else, not a sibling. Does two things (THEME_SYSTEM_PRD.md §4.3):
//
// 1. Subscribes to the full color store (not a selector), so any theme
//    change re-renders this component and, by React's default behavior, its
//    entire subtree. CORRECTION (2026-11-10): this subtree-cascade does NOT
//    reach into whatever screen is actually mounted inside <Stack> --
//    expo-router's <Stack> is built on React Navigation, which internally
//    memoizes each screen's rendered content at the navigator boundary,
//    confirmed by direct report (theme changes weren't reflecting in an
//    already-open screen). Every screen controller must additionally call
//    useThemeReactivityHook() itself (src/Hooks/useThemeReactivityHook.ts) to
//    guarantee its own re-render -- this component's cascade alone is
//    insufficient for anything rendered inside <Stack>.
// 2. Hydrates the persisted theme preference on cold start, and keeps
//    "system" mode live-synced to actual OS appearance changes while the app
//    is open.
export default function ApplicationThemeSyncComponent({
  children,
}: ApplicationThemeSyncComponentProps): React.JSX.Element {
  // Full-store subscription, not a selector -- any theme change re-renders
  // this component (and, by cascade, everything below it).
  const { setThemePreference } = useApplicationBaselineColorStateStore();

  useEffect(() => {
    void (async () => {
      const storedPreference = await ApplicationUserPreferenceService.current.getPreference(
        ApplicationUserPreferenceCON.THEME_PREFERENCE_KEY,
      );
      const systemScheme = Appearance.getColorScheme() === "dark" ? "dark" : "light";
      if (storedPreference && isThemePreferenceType(storedPreference)) {
        setThemePreference(storedPreference, systemScheme);
      } else {
        setThemePreference("system", systemScheme);
      }
    })();
  }, [setThemePreference]);

  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      const currentPreference = useApplicationBaselineColorStateStore.getState().themePreference;
      if (currentPreference === "system") {
        setThemePreference("system", colorScheme === "dark" ? "dark" : "light");
      }
    });
    return () => subscription.remove();
  }, [setThemePreference]);

  return <>{children}</>;
}
