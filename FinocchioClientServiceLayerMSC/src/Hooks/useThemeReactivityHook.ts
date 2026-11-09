import useApplicationBaselineColorStateStore from "@/Store/ApplicationBaselineColorStateStore";

// Call this once per screen controller. Subscribes the screen to the theme
// store so it re-renders whenever the theme changes.
//
// ApplicationThemeSyncComponent's single root-level subscription (at
// src/app/_layout.tsx) was originally built to make this unnecessary via
// React's default re-render cascade -- but expo-router's <Stack> is built on
// React Navigation, which internally memoizes each screen's rendered content
// for its own performance reasons. That blocks the cascade at the navigator
// boundary: the root re-renders, but the actual mounted screen underneath
// doesn't. Confirmed by direct report (theme changes not reflecting in an
// already-open screen), grilling session 2026-11-10.
//
// Every screen controller needs this call, not just ones that currently show
// theme-aware content -- any screen could gain some later, and there'd be no
// other signal that it's missing this.
export default function useThemeReactivityHook(): void {
  useApplicationBaselineColorStateStore((state) => state.resolvedTheme);
}
