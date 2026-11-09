# PRD — Functional, System-Wide Theming

**Status:** Awaiting approval (design tree fully settled via `/grill-me`, 2026-11-09)
**Scope owner:** App-wide color infrastructure (`ApplicationBaselineColorStateStore`, `ColorFactoryCON`), new preference-persistence layer, Settings bottom sheet (Phase 1 implementation target)
**Explicitly out of scope:** End-user accent-color customization (the original design file's separate "Accent Color" picker), account-level sync of the theme preference across devices, unifying category-identity colors (Travel's green, etc.) into the central store, and re-theming any screen other than the Settings bottom sheet. See §7.

## 1. Summary

The theme selector built in the Settings bottom sheet (`DashboardScreenSettingsThemeSelectorStaticComponent`) is currently **cosmetic only** — local `useState`, never touching the app's actual color system. This PRD makes it real: tapping Light/Dark/System actually changes the app's colors, the choice persists across cold starts, "System" follows the OS's actual appearance setting (live, while the app is open), and every color in the app has exactly one source of truth going forward.

This is **not a greenfield design** — it's the first real design work against two already-existing, already-binding commitments this project made and then left unimplemented:

- `ARCHITECTURE.md` §2 (v1 scope): *"Theming: light (default) and dark, both from v1."*
- `FinocchioClientServiceLayerMSC/CODING-RULES.md` §Styling: *"All colors are dynamically managed by `src/Store/ApplicationBaselineColorStateStore.ts` and exposed through `src/Constants/ColorFactoryCON.tsx`. Never hardcode a color string anywhere."*

Neither has been honored. A full-codebase survey (2026-11-09) found:

- The store's `DARK_PALETTE` is a **literal copy** of `LIGHT_PALETTE` — functionally, there is only one palette today.
- `ColorFactoryCON`'s colors are `static get` accessors reading `useApplicationBaselineColorStateStore.getState()` directly — **not a Zustand hook**. Even if theme-switching worked today, no already-rendered screen would visually update until it happened to re-render for an unrelated reason.
- **134 hardcoded literal colors** (98 hex + 36 `rgba(...)`) exist across ~19–21 files, roughly 2.7x the 49 call sites that actually go through `ColorFactoryCON` — in direct violation of the rule quoted above.
- **No persistence mechanism exists anywhere in this app** for user preferences (only `expo-secure-store`, which is auth-token-only). A theme choice resets to `"light"` on every cold start.
- **No OS theme detection exists** — `Appearance`/`useColorScheme` have zero real usage anywhere. "System" in the selector is a label with nothing behind it.

## 2. Why this approach (research summary)

Two different gaps need two different fixes, and conflating them would either violate an existing rule or balloon this into a full-app rewrite:

**Gap A — reactivity.** For theme switching to visibly update already-open screens, *something* has to cause a re-render when the store changes. The obvious fix (migrate every color-consuming component to a `useThemeColors()`-style hook) would require touching dozens of files *and* would contradict `CODING-RULES.md`'s own documented example (`ColorFactoryCON.INK` used as a **plain static property**, not a hook call). Confirmed via code inspection: this codebase has no evidence of `React.memo` anywhere blocking a render cascade. That means a single `useApplicationBaselineColorStateStore()` subscription placed once, near the root of the app, forces React's default cascade to re-render every descendant on any theme change — which re-executes every component's render function, which re-reads `ColorFactoryCON.INK` fresh, picking up the new value. Zero existing call sites change. This is the approach this PRD specifies (§4.3) — it fixes the bug without touching the rule.

**Gap B — scale.** Bringing every one of those 134 hardcoded colors under the central store in one pass would be a large, high-risk, all-or-nothing change blocking approval of the actually-wanted outcome (a working theme switcher). Scoping Phase 1 to the Settings bottom sheet (plus the `BottomSheetSharedComponent` shared container it sits inside of, since that's shared by every sheet in the app) gives a complete, working, reviewable slice — with every other screen's conversion explicitly tracked as follow-up work (§7), not silently deferred.

## 3. Scoping decisions (from grilling)

| # | Decision | Why |
|---|----------|-----|
| 1 | "I'll be changing colors in the future" means **the developer** adjusting palette values in code over time — not an end-user-facing accent-color picker. The system must make that easy (single source of truth), not expose color choice to end users. | User: confirmed directly; the Accent Color picker from the original design file is a separate, later feature. |
| 2 | Theme preference persists **locally on-device only** for now (AsyncStorage). Account-level sync across devices is explicitly deferred — tracked in a new TODO doc (§7.1), not built here. | User: "for now it should be persisted locally... create a todo file... so that we can do that later." Avoids opening a new backend endpoint/column as a side effect of this PRD. |
| 3 | **Phased rollout**, starting from the Settings bottom sheet only. Every other screen's conversion is listed as explicit follow-up work, not built in this pass. | User: "yes please, phase wise, starting from the bottom sheet only." Matches this project's own established PRD convention (`CREATE_CATEGORY_IMPROVEMENTS_PRD.md`/`DASHBOARD_IMPROVEMENTS_PRD.md` both track implemented-vs-deferred explicitly). |
| 4 | New `ApplicationUserPreferenceService` singleton (`src/Services/`), `async getPreference(key)` / `async setPreference(key, value)`, backed by `@react-native-async-storage/async-storage`. Keys live in a new `ApplicationUserPreferenceCON` (`src/Constants/`). | User's explicit naming/shape instruction. Async (not an in-memory-cache-with-sync-reads variant) to match `ApplicationSecureStorageService`'s existing exact shape in this same folder. |
| 5 | Reactivity is solved via **one root-level store subscription**, not a per-component hook migration. | See Gap A above — preserves `CODING-RULES.md`'s existing documented convention instead of amending it. |
| 6 | Category-identity colors (Travel's green, Home's purple, etc.) are **left alone** — not unified into the central store as part of this work. | User: confirmed. Established earlier in this project that identity colors are an orthogonal system from theme/surface colors — they don't change between light and dark. |
| 7 | The dropped `PHONE_STACK_DESIGN.md` "light stack" elevation idea (background darkest → card/surface lighter → sheet/modal lightest) is **revived** as the backbone of the new semantic token set. | User: confirmed. The underlying problem didn't go away — a real theme system needs exactly this kind of neutral surface-token model, and solving it twice under two different names would be wasted effort. |
| 8 | PRD location: `FinocchioAgentDocumentationNMSC/PRD/THEME_SYSTEM_PRD.md` (this file). Related future-work tracked at `FinocchioAgentDocumentationNMSC/TODO/THEME_PREFERENCE_ACCOUNT_SYNC_TODO.md`. | Matches this project's established documentation structure. |

## 4. Architecture design

### 4.1 Store: widen `theme` into preference + resolved theme

`ApplicationBaselineColorStateStoreInterface.ts`:

```ts
export type ThemePreferenceType = "light" | "dark" | "system";
export type ResolvedThemeType = "light" | "dark";

export default interface ApplicationBaselineColorStateStoreInterface {
  themePreference: ThemePreferenceType; // the user's explicit choice, persisted
  resolvedTheme: ResolvedThemeType;      // what's actually rendered right now
  colors: ApplicationColorPaletteType;
  setThemePreference: (preference: ThemePreferenceType, systemScheme: ResolvedThemeType) => void;
}
```

Why split `themePreference` from `resolvedTheme`: when the user picks "System," the store still needs a concrete `"light" | "dark"` to pick a palette with — `resolvedTheme` is that concrete value, recomputed whenever either the preference or the OS scheme changes. `setThemePreference` takes the current OS scheme as a parameter (rather than reading `Appearance` itself) so the store stays a plain, framework-agnostic Zustand store — the glue component in §4.3 is the only place that talks to `Appearance`.

`colors` keeps its exact current shape (`ApplicationColorPaletteType`), just resolved from `resolvedTheme` instead of the old `theme` field. `ColorFactoryCON.tsx` needs **zero changes** to its own getters' call sites — each still does `useApplicationBaselineColorStateStore.getState().colors.X`.

### 4.2 New semantic tokens (the revived elevation model)

`ApplicationColorPaletteType` gains these new keys (existing 11 keys untouched):

| Token | Purpose | Light value (proposed) | Dark value (proposed, estimated) |
|---|---|---|---|
| `SURFACE` | Card/content-level background — one level above `BACKGROUND` | `#FAFAFA` (off-white, *not* pure white — reserves true white exclusively for `OVERLAY`, per the elevation model's "can't get lighter than white" constraint worked out earlier) | `#232329` |
| `OVERLAY` | Bottom sheet / modal background — the lightest surface in the stack | `#FFFFFF` | `#2E2E36` |
| `ACCENT` | The app's single accent color, replacing `DashboardScreenCON.THEME_ACCENT_COLOR`'s hardcoded `#7C3AED` | `#7C3AED` | `#A78BFA` (lightened for dark-background contrast) |
| `BORDER_SUBTLE` | Replaces the most common `rgba(0, 0, 0, 0.06–0.1)` literal family seen across shared components | `rgba(0, 0, 0, 0.08)` | `rgba(255, 255, 255, 0.12)` |

`BACKGROUND`/`INK`/`SUBTLE_TEXT` keep their current light values; dark equivalents (also estimated, no design spec exists for this project yet — same caveat the existing `LIGHT_PALETTE` comment already carries for its own values):

| Token | Dark value (proposed, estimated) |
|---|---|
| `BACKGROUND` | `#17171C` |
| `INK` | `#F3F2F5` |
| `SUBTLE_TEXT` | `#9C9CAB` |

**Flag for explicit sign-off:** every dark-mode hex value above is estimated, not sourced from a design spec (none exists for dark mode in this project yet) — same situation `LIGHT_PALETTE`'s own code comment already documents for its original values. These are starting points, easy to replace later since they're each defined in exactly one place.

### 4.3 The reactivity fix — one subscribing component, not a hook migration

New component, `ApplicationThemeSyncComponent`, rendered once in `src/app/_layout.tsx` (`RootLayout`), doing three things:

1. **Forces the re-render cascade** (Gap A, §2): `useApplicationBaselineColorStateStore()` (full-store subscription, not a selector) — any store change re-renders this component and, by default React behavior, its entire subtree.
2. **Hydrates the persisted preference on cold start**: on mount, `await ApplicationUserPreferenceService.current.getPreference(ApplicationUserPreferenceCON.THEME_PREFERENCE_KEY)`; if a value exists, calls `setThemePreference` with it (plus the current `Appearance.getColorScheme()`).
3. **Tracks live OS changes**: `Appearance.addChangeListener` — when it fires and `themePreference === "system"`, calls `setThemePreference("system", newScheme)` so a system-mode user sees their phone's own light/dark switch (e.g. at sunset) reflected live, with no app restart.

This component renders `null` — it's pure plumbing, not UI.

**Documented constraint:** this approach relies on nothing in the render tree blocking React's default re-render cascade with `React.memo`/`PureComponent`. None exists today (confirmed). Any component added in the future that wraps itself in `React.memo` **must** independently subscribe to the color store (e.g. via a selector hook) if it needs to react to theme changes, or it will silently stop updating.

### 4.4 `ApplicationUserPreferenceService` + `ApplicationUserPreferenceCON`

`src/Services/ApplicationUserPreferenceService.ts` — same singleton shape as `ApplicationSecureStorageService`, generic (reusable for future preferences beyond theme, e.g. language — `ARCHITECTURE.md` already names both under the same "UI preferences" umbrella):

```ts
import AsyncStorage from "@react-native-async-storage/async-storage";

export default class ApplicationUserPreferenceService {
  public static current = new ApplicationUserPreferenceService();

  public async getPreference(key: string): Promise<string | null> {
    return AsyncStorage.getItem(key);
  }

  public async setPreference(key: string, value: string): Promise<void> {
    await AsyncStorage.setItem(key, value);
  }

  public async deletePreference(key: string): Promise<void> {
    await AsyncStorage.removeItem(key);
  }
}
```

`src/Constants/ApplicationUserPreferenceCON.ts`:

```ts
export default class ApplicationUserPreferenceCON {
  public static readonly THEME_PREFERENCE_KEY: string = "FINOCCHIO_THEME_PREFERENCE";
}
```

Used exactly as specified: `ApplicationUserPreferenceService.current.getPreference(ApplicationUserPreferenceCON.THEME_PREFERENCE_KEY)`.

**New native dependency:** `@react-native-async-storage/async-storage` requires a native module rebuild under this project's Expo dev-client workflow — the same class of step that was *skipped* earlier this session for `react-native-keyboard-controller` and caused a blank-screen crash. This time the rebuild must actually be performed (not deferred) before this feature can run on-device.

### 4.5 Theme selector component changes

`DashboardScreenSettingsThemeSelectorStaticComponent`:

- Drops its local `useState<ThemeOptionType>` entirely.
- Reads `themePreference` and a `setThemePreference`-wrapping handler from the store via a selector hook (this component *is* the control surface — a direct hook subscription here is correct and expected, not a violation of §4.3's "don't migrate call sites" principle, which is about passive color *consumption*, not this component's own interactive state).
- On selection: calls the store's `setThemePreference` **and** `ApplicationUserPreferenceService.current.setPreference(ApplicationUserPreferenceCON.THEME_PREFERENCE_KEY, theme)` so the choice survives the next cold start.
- Its own local `ThemeOptionType` type is deleted in favor of the store's `ThemePreferenceType`.
- The mini phone-mockup preview colors (`MOCKUP_LIGHT_*`/`MOCKUP_DARK_*`/`MOCKUP_SYSTEM_*`) are **explicitly exempt** from this conversion — they're illustrative preview content representing what light/dark mode looks like, not real app chrome, same reasoning as when they were first built.

### 4.6 Phase 1 conversion targets (what actually gets re-themed now)

Everything the Settings bottom sheet touches, to make it fully theme-reactive end to end:

- `BottomSheetSharedComponent` — its hardcoded `backgroundColor: "#FFFFFF"` sheet container becomes `ColorFactoryCON.OVERLAY`. Shared by every sheet in the app, so this one change also correctly re-themes the icon picker, add-member, and profile sheets as a side effect — not scope creep, just an unavoidable consequence of fixing a shared component.
- `DashboardScreenSettingsThemeSelectorStaticComponent`'s own card chrome — already partially compliant (`ColorFactoryCON.BACKGROUND`/`INK`/`SUBTLE_TEXT`); its one remaining violation, `DashboardScreenCON.THEME_ACCENT_COLOR`, is replaced by the new `ColorFactoryCON.ACCENT` token.
- `SubSectionSharedComponent` and `BottomSheetHeaderSharedComponent` — audited for any hardcoded colors as part of this pass, since both render inside the Settings sheet.

## 5. Verification

Same ritual as every change this project makes, plus one addition specific to this feature:

- `echo '/// <reference types="expo/types" />' > expo-env.d.ts && bunx tsc --noEmit`
- `rm -rf dist && bunx expo export --platform ios` (then `rm -rf dist`)
- **Manual on-device check** (this PRD's changes can't be fully verified by type-check/bundle-export alone, unlike this session's other work): open Settings, switch Light → Dark → System, confirm the sheet's own background/card/accent colors update live with no app restart; force-quit and relaunch, confirm the last choice is restored; toggle the OS-level appearance setting while on "System" and confirm the sheet updates live without restarting the app.

## 6. Risks

| Risk | Mitigation |
|---|---|
| Dark-mode hex values are estimated, not design-sourced | Flagged explicitly in §4.2; trivial to replace later since each is defined in exactly one place |
| New native dependency needs a real rebuild, not a skipped one | Called out explicitly in §4.4; this project already has one incident on record from skipping this step |
| Root-cascade reactivity silently breaks if a future component adds `React.memo` | Documented constraint in §4.3, for future code review to catch |
| 133 remaining hardcoded colors outside Phase 1's scope still violate `CODING-RULES.md` | Explicitly tracked as follow-up work (§7), not silently abandoned |

## 7. Explicitly out of scope / tracked for later

- **Account-level sync of theme preference** across a user's devices — tracked at `FinocchioAgentDocumentationNMSC/TODO/THEME_PREFERENCE_ACCOUNT_SYNC_TODO.md`.
- **End-user accent-color picker** (the original design file's separate "Accent Color" section) — not tracked yet; a future feature in its own right, not a follow-up to this PRD.
- **Unifying category-identity colors** (currently duplicated across `ColorFactoryCON.CARD_GAMES` etc., `CreateCategoryScreenCON`'s swatch array, and `DashboardScreenModel`'s mock data) — a separate, orthogonal cleanup; not part of theming since these colors don't change between light and dark.
- **Re-theming every other screen** (Dashboard's category cards/header/twin-action-buttons, the entire CreateCategoryScreen wizard, Login/SignUp, and every shared component not touched in §4.6) — each still has hardcoded colors per the 2026-11-09 survey. Intended as a series of future incremental passes, one or a few screens at a time, each verified the same way this PRD's Phase 1 is (§5), not one large follow-up effort.
