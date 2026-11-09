# TODO — Sync Theme Preference Across Devices

**Raised:** 2026-11-09, during `THEME_SYSTEM_PRD.md`'s scoping.
**Status:** Not started. Deliberately deferred out of that PRD's Phase 1.

## What

`THEME_SYSTEM_PRD.md` persists the user's theme preference (Light/Dark/System) **locally only**, via `ApplicationUserPreferenceService` (AsyncStorage). Each device remembers its own choice independently — there's no sync across a user's devices.

This TODO tracks doing that properly later: when a logged-in user changes their theme preference on one device, it should be reflected the next time they open the app on another device signed into the same account.

## Why deferred

Account-level sync means a new backend column/endpoint on the Rails side (`FinocchioOrchestratorServiceLayerMSC`) and a real request/response round trip, which is a materially different and larger piece of work than "make the switcher work on one device." Bundling it into the theming PRD would have blocked approval of the smaller, immediately-useful piece behind the larger one.

## Rough shape, for whoever picks this up

- A new column on the user record (e.g. `theme_preference`) or a small `user_preferences` table if more than one synced preference is expected eventually (`ARCHITECTURE.md` already names theme *and* language under the same "UI preferences" umbrella — worth designing for both, not just theme, if this gets picked up).
- An API endpoint to read/write it, following this project's `/Api/V1/{PascalCaseResource}/{PascalCaseAction}` convention and PascalCase JSON response shape.
- Client-side: `ApplicationUserPreferenceService` already exists as the local-storage layer by the time this is picked up — this becomes a second, remote-backed layer that reconciles with it (likely: remote value wins on login/app-foreground, local value is the offline fallback and gets pushed up when connectivity returns).
- Needs its own scoping/grilling pass before implementation — this file is a pointer, not a design.
