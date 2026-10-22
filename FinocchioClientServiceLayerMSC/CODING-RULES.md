# Coding Rules

Finocchio's frontend follows the same Model-Service-Controller (MSC) convention used across we.plm's other projects (AssetSphere, SignForge, PLMInfraRegister). This file is the project's own consolidated, internally-consistent version of that convention, adapted for React Native/Expo — the sibling projects are React web apps (Vite + TanStack Router), so this file resolves the places where their rules doc's prose didn't translate directly, or where the written rules and the sibling projects' real code actually disagreed. Where this file says something different from what you might expect from a generic React Native project, this file wins.

The project root for all paths below is `src/`, not `app/` — `src/app/` is reserved specifically for Expo Router's own route directory (see **Routes**), so "app/" is never used as a general path prefix here to avoid confusion between the two.

## General

- Always use TypeScript, never `any`. Everything should be fully typed, including component return types (`React.JSX.Element`).
- Use as much code splitting into components/controllers/services as you reasonably can — keep each file's scope need and clean.
- **Services, Helpers, Utilities, and Constants are always classes, exposed as a singleton** via a static `current` instance (never a loose exported function for these categories):

  ```typescript
  export default class SomeClass {
      public static current = new SomeClass();

      public isWorking(): boolean {
          return true;
      }
  }

  // Usage
  SomeClass.current.isWorking();
  ```

- **Screen Controllers and Components are plain functional components** (not classes) — this applies only to the class/singleton rule above, not to React components. See **Components**.
- **State Stores are Zustand hooks, not classes** — see **State Stores** below. This is a deliberate exception to the "everything is a class" rule: it's how every sibling project's real state stores actually work, and matches this project's own architecture decision (`ARCHITECTURE.md`) independently.

## State Stores

- App-wide reactive state lives in `src/Store/` (singular — matches the real folder name used across the sibling projects, not "Stores").
- Each store is a Zustand store created with `create<Interface>(...)`, default-exported as a hook named `use{Name}StateStore`. Its shape is defined in a matching `src/Store/Interface/{Name}StateStoreInterface.ts`.

  ```typescript
  // Definition: src/Store/AuthenticationStateStore.ts
  import { create } from "zustand";
  import type AuthenticationStateStoreInterface from "./Interface/AuthenticationStateStoreInterface";

  const useAuthenticationStateStore = create<AuthenticationStateStoreInterface>((set) => ({
      accessToken: null,
      isAuthenticated: false,
      setAccessToken: (token) => set({ accessToken: token, isAuthenticated: !!token }),
  }));

  export default useAuthenticationStateStore;

  // Usage
  const { accessToken, setAccessToken } = useAuthenticationStateStore();
  ```

## Global Types

- Shared types/interfaces/enums that are used across more than one feature (not specific to a single screen) live in `src/Types/`, one file per concept, named `{Name}Type.ts`. Do not create a monolithic `types.ts`.
- A type used by only one feature stays in that feature's own `Models/` folder instead (see **File Structure**) — only promote it to `src/Types/` once a second feature needs it.

## Styling

- Use NativeWind/Tailwind classes only — no inline styles, except where noted below.
- Take reference from `DESIGN.md` before writing any screen's visual layout (once that file exists — design work is a later phase for this project; until then, basic/unstyled components only, per explicit instruction).
- Write components to support both light and dark mode (not dark-only) — matches `ARCHITECTURE.md`'s decision to support both from v1.
- **All colors are dynamically managed by `src/Store/ApplicationBaselineColorStateStore.ts` and exposed through `src/Constants/ColorFactoryCON.tsx`. Never hardcode a color string anywhere.** If a new color token is needed, add it to `ApplicationBaselineColorStateStoreInterface.ts`, define its value in the active palettes, and expose a getter in `ColorFactoryCON.tsx`.

  ```typescript
  // Wrong
  <View style={{ backgroundColor: "#111111" }} />

  // Correct
  import ColorFactoryCON from "@/Constants/ColorFactoryCON";
  <View style={{ backgroundColor: ColorFactoryCON.INK }} />
  ```

- **All padding, margin, gap, and spacing values must come from `src/Constants/EdgeInsetsCON.tsx`. Never hardcode a numeric spacing value inline.** If the required value doesn't exist yet, add it there first.

  ```typescript
  // Wrong
  <View style={{ padding: 16, marginTop: 24 }} />

  // Correct
  import EdgeInsetsCON from "@/Constants/EdgeInsetsCON";
  <View style={{ padding: EdgeInsetsCON.LG, marginTop: EdgeInsetsCON.XL }} />
  ```

- If you genuinely need inline styles beyond NativeWind classes, create `src/Features/{ScreenName}Screen/Styles/{ScreenName}ScreenStyles.tsx` (PascalCase, ends with `*Styles`):

  ```typescript
  export default class HomeScreenStyles {
      public static BUTTON_STYLES = StyleSheet.create({
          BUTTON_WRAPPER: {}
      });
  }

  // Usage
  <View style={HomeScreenStyles.BUTTON_STYLES.BUTTON_WRAPPER}>
  ```

## Components

- Functional components with default exports only. Each file has exactly one component (plus, where relevant, co-located styles/constants per the rules above) — no other function or class in the same file.
- **Multi-Step Wizard / State Flow**: use a strongly typed TypeScript enum (defined in the feature's `Models/` folder) to track wizard steps or flow state, never hardcoded numbers.

## File Structure

Every feature screen lives in its own folder under `src/Features/`, named `{ScreenName}Screen` — **the folder name, and every file/component derived from it, always ends in `Screen`** (e.g. `LoginScreen`, `SignUpScreen`, `DashboardScreen` — never just `Login` or `Signup`).

```
src/Features/{ScreenName}Screen/
  {ScreenName}ScreenController.tsx      — root controller for this screen
  Components/static/                    — components used only within this screen
  Components/shared/                    — components used in more than one place within this feature
  Models/                               — enums/interfaces/structs specific to this screen
  Services/                             — this screen's service class(es)
  Constants/                            — this screen's constants class
```

- A component used only in one file goes in `Components/static/`, named `{ScreenName}{ComponentName}StaticComponent.tsx` (e.g. `src/Features/HomeScreen/Components/static/HomeScreenHeroSectionStaticComponent.tsx`).
- A component used in more than one file goes in `Components/shared/`, named `{ScreenName}{ComponentName}Component.tsx` — no "Shared" in the name itself, the folder already says that (e.g. `src/Features/HomeScreen/Components/shared/HomeScreenButtonComponent.tsx`).
- Every feature folder has its root controller: `src/Features/HomeScreen/HomeScreenController.tsx`.

## Naming

- A component containing other components should be named `*ScreenController` (PascalCase file and component name, e.g. `HomeScreenController.tsx`).
- A component containing no other components should be named `*Component` (PascalCase, e.g. `ButtonComponent.tsx`).
- **Constants**: `src/Constants/` (app-wide) or `src/Features/{ScreenName}Screen/Constants/` (screen-specific). File ends with `*CON`, PascalCase. All values `public static readonly`, in `SCREAMING_SNAKE_CASE`. No constants or static configuration (option lists, tab setups, static layout arrays) may live inline in a controller or component — always in a `*CON` file.

  ```typescript
  export default class HomeScreenCON {
    public static readonly PAGE_NAME: string = "HomeScreen";
  }

  // Usage
  const something = HomeScreenCON.PAGE_NAME;
  ```

- **Storage keys**: any key used with Expo SecureStore (or any other device storage) must be defined in a `*CON` file as a `SCREAMING_SNAKE_CASE` constant — never an inline string literal at the call site.

  ```typescript
  export default class ApplicationSecureStorageCON {
    public static readonly REFRESH_TOKEN_STORAGE_KEY: string = "FINOCCHIO_REFRESH_TOKEN";
  }
  ```

- **Controllers**: `src/Features/{ScreenName}Screen/{ScreenName}ScreenController.tsx`, PascalCase, ends with `*Controller`.
- **Helpers**: `src/Helpers/`, PascalCase, ends with `*Helper`, singleton class (`.current`).
- **Utilities**: `src/Utilities/`, PascalCase, ends with `*Utility`, singleton class (`.current`).

## Routes

Expo Router only treats files under its own configured router directory as real routes — for this project, that's `src/app/`. So route files physically live at `src/app/Routes/`, not plain `src/Routes/`, even though every other category above (`Features`, `Store`, `Services`, `Constants`) sits directly under `src/` rather than under `src/app/`.

- Route components live in `src/app/Routes/`, PascalCase, ending in `*ScreenRoute.tsx` (e.g. `src/app/Routes/DashboardScreenRoute.tsx`).
- The functional component name inside matches the file name exactly, and it does nothing but render the matching feature's Controller:

  ```typescript
  // File: src/app/Routes/MyTransactionsScreenRoute.tsx
  import MyTransactionsScreenController from "@/Features/MyTransactionsScreen/MyTransactionsScreenController";

  export default function MyTransactionsScreenRoute(): React.JSX.Element {
    return <MyTransactionsScreenController />;
  }
  ```

- `src/RootViewController.tsx` is the single place that decides which stack (unauthenticated vs. authenticated) is shown, based on auth state — `src/app/_layout.tsx` stays a thin wrapper that renders it. No sibling-project precedent exists for this exact file (they use a different router), but the principle (one real place for root navigation decisions, not scattered state wrappers) carries over regardless.

## Navigation

- **Always use `expo-router` native stack navigation** (`router.push('/Routes/...')`, `router.back()`). Never use custom state wrappers or manual animated unmounts to simulate screen switching — let Expo Router's native Stack navigator handle transitions.
- **All navigation route targets must be defined and referenced as string constants from `src/Constants/ApplicationRouteCON.tsx`.** Never hardcode a raw string path inside a controller. Reference `ApplicationRouteCON`'s corresponding static property instead (e.g. `ApplicationRouteCON.MY_TRANSACTIONS_SCREEN_ROUTE`).

## Sensory & Physical Feedback

- **All device haptics/vibration/system sounds go through `src/Services/ApplicationPhysicalFeedback.ts`.** Never import `expo-haptics` directly in a component or controller.

  ```typescript
  // Wrong
  import * as Haptics from "expo-haptics";
  await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

  // Correct
  import ApplicationPhysicalFeedback from "@/Services/ApplicationPhysicalFeedback";
  await ApplicationPhysicalFeedback.current.haptic.triggerHaptic();
  ```
