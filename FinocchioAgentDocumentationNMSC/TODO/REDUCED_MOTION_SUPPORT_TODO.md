# TODO — Reduced-Motion Support

**Raised:** 2026-11-13, during the `apple-motion` grilling session on `BottomSheetSharedComponent.tsx`.
**Status:** Not started. Deliberately scoped out of that session's changes.

## What

Nothing in this codebase currently checks `AccessibilityInfo.isReduceMotionEnabled()` (or listens for `reduceMotionChanged`). Every spring-driven surface -- `BottomSheetSharedComponent`, `ConfirmationDialogSharedComponent`, the card press/selection animations, the step-progress dots -- always runs its full spring/scale/rotation motion regardless of the OS "Reduce Motion" setting.

## Why deferred

Doing this properly for one component (e.g. just the bottom sheet) while every other animated surface in the app keeps ignoring the setting would be a half-measure -- a user who turned Reduce Motion on would still get full springs everywhere except one sheet, which doesn't actually serve them. This is an app-wide concern, not a per-component tweak.

## Rough shape, for whoever picks this up

- A shared hook (e.g. `useReducedMotionHook`) wrapping `AccessibilityInfo.isReduceMotionEnabled()` + the change listener, following this project's existing `use*Hook` naming convention (`src/Hooks/`).
- Per the apple-motion skill: when reduced motion is on, swap slides/springs/overshoot for short opacity cross-fades; drop elastic/bounce entirely; keep color/opacity changes that aid comprehension.
- Needs its own scoping/grilling pass across every animated component before implementation -- this file is a pointer, not a design.
