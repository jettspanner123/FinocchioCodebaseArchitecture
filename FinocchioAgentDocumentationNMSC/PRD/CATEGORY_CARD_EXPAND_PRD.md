# PRD — Category Card Tap-to-Expand "Zoom" Animation

**Status:** Approved for implementation (design tree fully settled via `/grill-me`, 2026-10-29)
**Scope owner:** Dashboard screen, category card stack only
**Explicitly out of scope:** Building the real `CategoryDetailScreen` this animation will eventually lead to — this PRD covers the *animation mechanism* only, built so it can be handed a real destination later without being rebuilt.

## 1. Summary

When a user taps any category card in the Dashboard's stacked/pinned card list, the screen performs a single continuous, physically-consistent animated sequence:

1. Every element **except** the tapped card (the other category cards, the black "Create Category" card, and the header) slides off-screen.
2. Shortly after, the tapped card itself expands to fill the entire device screen.
3. As it expands, the tapped card's internal content (icon, name, progress bar, everything) fades out, leaving a plain fullscreen rectangle in the card's own background color.
4. Tapping anywhere on that fullscreen rectangle reverses the entire sequence, exactly mirrored, back to the normal dashboard stack.

This stands in for navigating to a real per-category detail screen. That screen doesn't exist yet, so for now the "destination" is simulated: expand = "arrived," tap-again = "go back," since there's nowhere real to go yet.

## 2. Why this approach (research summary)

This is modeled on iOS 18's zoom navigation transition (tap a cell, it morphs to fill the screen) — the reference point named during scoping. Two technically legitimate ways exist to build "a view expands to fill the screen" in Reanimated 4.7.1 (confirmed against the installed version's own docs, not assumed from memory):

- **Reanimated's Shared Element Transition API** (`sharedTransitionTag`) — designed for a view morphing into a *different mounted screen/route* during navigation. Not applicable here, because per the scoping decision below, there is no second screen yet.
- **Local `measure()` + shared-value-driven transform** — the tapped card's current on-screen rect is measured at tap time, and a single shared value animates its position/size/content from "where it is now" to "fullscreen." This is the correct technique for an effect that stays on one screen, and is what this PRD specifies.

Neither is a hack; they're suited to different problems, and the scoping decision (not building the destination screen now) determines which applies.

## 3. Scoping decisions (from grilling)

| # | Decision | Why |
|---|----------|-----|
| 1 | Leads to a real `CategoryDetailScreen` conceptually, but that screen is **not built now**. Implementation stays entirely local to `DashboardScreenController` — no new Expo Router route. | User: "this feature is really an animation rather than a feature" + confirmed the destination page "is not yet made." Avoids scope creep into designing a whole new screen as a side effect. |
| 2 | Reversal: **tap anywhere on the fullscreen card** reverses the entire sequence. Android hardware back button does the same while expanded. No swipe-to-dismiss gesture in this pass. | Simplest, most discoverable interaction; swipe gestures are a separate feature. |
| 3 | The black "Create Category" card **also slides away** in phase 1, same as the category cards. | Leaving it in place while everything else animates would read as a bug. |
| 4 | The dashboard's `ScrollView` is **scroll-disabled** for the entire duration of the sequence (tap → expanded → reverse), re-enabled only once fully back to the resting stack. | Prevents scroll input from fighting the animation or changing scroll position mid-sequence — explicit "handle all edge cases" requirement. |
| 5 | Spring feel: Reanimated `withSpring` duration-based mode, **`{ duration: 600, dampingRatio: 0.82 }`**, used for every motion in the sequence (forward and reverse, every element). | Translates "mature, slow, slight bounce, liquid" into concrete values: 600ms reads as unhurried; `dampingRatio` just under 1 gives one soft overshoot-and-settle, not a wobbly multi-bounce. One shared config = consistent feel everywhere, easy to retune as one number. |
| 6 | Reverse sequence is a **full mirror** of forward — same spring, same phasing, time-reversed. Not a fast/simplified debug-only reverse. | User confirmed "nothing should just appear or disappear instantly" applies to reverse too; "for debugging purposes" explains *why* tap-reverses-it exists (no real destination yet), not a request to cut animation quality. |
| 7 | PRD location: `FinocchioAgentDocumentationNMSC/PRD/CATEGORY_CARD_EXPAND_PRD.md` (this file). | User's explicit choice — new top-level docs folder, not mixed into the frontend's own `CODING-RULES.md`-governed file structure. |

## 4. The animation model — single master progress value

Everything in this sequence is driven by **one shared value per active sequence**, not several independently-timed animations. This is the core technical decision that keeps the whole thing smooth and avoids seams between "phases":

```ts
const expandProgress = useSharedValue(0); // 0 = resting stack, 1 = fully expanded fullscreen
```

- **Forward** (on tap): `expandProgress.value = withSpring(1, { duration: 600, dampingRatio: 0.82 })`
- **Reverse** (on tap-while-expanded): `expandProgress.value = withSpring(0, { duration: 600, dampingRatio: 0.82 })`

Every element's motion is expressed as an `interpolate()` of this **same** `expandProgress` value, each keyed to a different sub-range of `[0, 1]`. This means:

- Nothing is a separately-scheduled `setTimeout`/`withDelay` running alongside an unrelated spring — there is exactly one spring per direction, and "phase timing" is just where each element's interpolation window sits inside that one spring's `[0, 1]` journey.
- The "wait about 0.25s" from the original spec becomes: the non-tapped elements' slide-away fully completes by `expandProgress ≈ 0.35–0.4` (roughly the first third of the spring's ~600ms perceptual duration, ≈ 210–240ms) — matching "about 0.25s" without hardcoding a disconnected timer.
- A small overlap (tapped card's expand starts at `expandProgress ≈ 0.3`, before the others have *fully* finished at 0.4) is deliberate — a hard sequential cut would read as two separate animations glued together, not one continuous motion. This directly serves "nothing should just appear or disappear instantly."

### Per-element interpolation windows

| Element | Property | Input range (`expandProgress`) | Output |
|---|---|---|---|
| Every non-tapped category card + the Add-Category card | `translateY` (added on top of their existing pin/recede transform — see §6) | `[0, 0.4]` | `0 → +slideDistance` (downward, off bottom of screen) |
| Header (avatar row + "Categories"/"This Month") | `translateY` | `[0, 0.4]` | `0 → -slideDistance` (upward, off top of screen) |
| Tapped card's **content** (icon, name, badge, progress bar, footer — everything inside it) | `opacity` | `[0, 0.25]` | `1 → 0` |
| Tapped card's **container** | `top`/`left`/`width`/`height` (or equivalent transform), `borderRadius` | `[0.3, 1]` | current measured rect, `borderRadius: 24` → `{x:0, y:0, width: screenWidth, height: screenHeight}`, `borderRadius: 0` |

`slideDistance` = screen height (via `useWindowDimensions()`) plus the card's own height plus a small margin, so cards with shadows/borders are guaranteed fully off-screen, not just technically past the viewport edge — a shadow peeking back on-screen at the bottom would be a visible glitch.

Content fades out *fast and early* (by 25% progress) specifically so the tapped card's text/icons never visibly stretch or distort mid-expand — they're already gone before the shape has moved far.

## 5. Interaction & state machine

A sequence has exactly one JS-thread boolean that mirrors the animation for things Reanimated can't drive directly (native props like `scrollEnabled` aren't animatable):

```ts
const [isSequenceActive, setIsSequenceActive] = useState(false);
const selectedIndex = useSharedValue(-1); // -1 = none selected
```

- **Tap on a resting card** (`isSequenceActive === false`): set `selectedIndex.value = index`, `setIsSequenceActive(true)`, start the forward spring.
- **Tap on the fullscreen card** (`isSequenceActive === true`, and it's specifically the expanded card's own full-screen overlay receiving the tap — nothing else is interactable while expanded): start the reverse spring. On the reverse spring's completion callback (via `runOnJS`), set `setIsSequenceActive(false)` and `selectedIndex.value = -1`.
- **Taps on anything else while `isSequenceActive === true`**: no-op. Practically unreachable anyway (other cards are off-screen and the scroll is locked), but the guard exists for safety (e.g., a stray touch during the brief overlap window).
- **Android hardware back button while expanded**: wired to the same reverse handler as tapping the fullscreen card (`BackHandler` from `react-native`, active only while `isSequenceActive`).
- **`scrollEnabled={!isSequenceActive}`** on the `Animated.ScrollView` — locks scrolling for the full duration of both directions.

## 6. Critical implementation pitfall to avoid

The existing sticky-pin-and-recede scroll animation (already shipped, must not regress) already produces a `transform: [{ translateY }, { scale }]` style per card via its own `useAnimatedStyle`. **React Native does not merge `transform` arrays across separate style objects in a style array** — if this expand feature's slide-away/expand transform is added as a *second* `useAnimatedStyle` appended to the same `style={[...]}` array, its `transform` array will silently **replace**, not combine with, the pin/recede transform, breaking the existing scroll animation the moment this feature is added.

**Resolution:** the slide-away/expand transform must be computed in the **same** `useAnimatedStyle` worklet that already computes the pin/recede transform (or the two sets of transform values explicitly combined into one array before returning), so a card's final transform is always `[pin/recede translateY] + [slide-away/expand translateY] + [pin/recede scale] + [expand-driven borderRadius/size change]` as one coherent set, never two competing style objects. This is the single most important thing to get right for "no aspect of the existing animation should break."

## 7. Fullscreen geometry

- Target rect is the **true device screen bounds** (`useWindowDimensions()`, `{x: 0, y: 0, width: screenWidth, height: screenHeight}`), edge-to-edge including behind the status bar/notch — matching how Apple's own zoom transitions go full-bleed, per the original "like the zoom animation in Apple apps" reference.
- The tapped card's **starting** rect is captured via `measure()` (`useAnimatedRef` on each card) at tap time, not computed analytically from scroll position/index math — `measure()` automatically reflects wherever the card actually is on screen right now (mid-pin-transition, fully pinned, receded/scaled, anywhere), which is simpler and more robust than re-deriving that from the existing pin/recede formulas a second time.
- The expanding card's `zIndex` is bumped to a very high value for the duration of the sequence (so it paints over the header, other cards, and the add-category card while expanding) and restored once fully reversed.
- No ancestor in the current view hierarchy sets `overflow: hidden`, so the expanding card can render beyond the `ScrollView`'s own bounds (covering the header area, eventually the whole screen) without needing a `Modal`/portal. **This must be re-verified against the actual styles at implementation time** — if any ancestor is found to clip, the fallback is wrapping the expanded-card layer in a transparent `Modal`, not restructuring the whole feature.

## 8. Accessibility

Reanimated's `withSpring` defaults `reduceMotion` to `ReduceMotion.System` — devices with the "Reduce Motion" accessibility setting enabled will automatically get a simplified/instant version of this animation at the library level, with no extra code required.

## 9. Explicit non-goals for this pass

- No real `CategoryDetailScreen` content.
- No swipe-to-dismiss gesture.
- No special "fast debug" reverse mode — reverse is full quality, always.
- No changes to the existing pin/recede stacking animation's own feel or timing, only to how its output is combined with this feature's transform (§6).
