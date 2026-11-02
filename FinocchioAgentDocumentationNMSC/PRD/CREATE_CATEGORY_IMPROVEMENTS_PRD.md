# PRD — CreateCategoryScreen Accessibility & Craft Improvements

**Status:** Implemented 2026-11-01, except item 6 (bottom sheet grabber), explicitly declined by the project owner and left as a deferred, not-yet-decided follow-up.
**Scope owner:** `CreateCategoryScreen` feature, its icon-picker bottom sheet, and the shared components it depends on (`BottomSheetSharedComponent`, `TextInputSharedComponent`). One fix (item 1) touches the global `ColorFactoryCON.SUBTLE_TEXT` token, which is also used on the Dashboard.
**Explicitly out of scope:** Budget and Type & Members step content (still placeholders, nothing to review yet), iPad/iPhone Duo layout, device-verified VoiceOver/Reduce Motion testing (fixes are code-level, not device-confirmed).

## 1. Summary

A design review of `CreateCategoryScreen` (full screen + icon-picker bottom sheet) was run using the `apple-look` skill (HIG-grounded review). It surfaced several real accessibility and craft issues, backed by actual computed WCAG contrast ratios from this codebase's hex values (not estimated). This PRD lists every finding that survived verification and the fix plan for each.

## 2. Correction from the original review

The original review flagged `useShakeAnimationHook`'s shake animation as ignoring the system's Reduce Motion accessibility setting. This was verified against Reanimated 4.7.1's actual documentation (Context7, not memory) before being added here: `withTiming` and `withSpring` both default to `reduceMotion: ReduceMotion.System`, meaning the shake **already** auto-disables under Reduce Motion, consistent with `CATEGORY_CARD_EXPAND_PRD.md § 8`'s note about `withSpring`. That finding is dropped — no code change needed for it.

## 3. Scoping decisions (from grilling)

| # | Decision | Why |
|---|----------|-----|
| 1 | Fix `ColorFactoryCON.SUBTLE_TEXT`'s actual hex value globally, not just override it locally inside `CreateCategoryScreen`. | Same contrast bug exists everywhere the token is used (e.g. Dashboard). A local-only fix would leave the root cause unpatched elsewhere. |
| 2 | Continue button stays always-tappable (shake-on-submit), not disabled-until-valid. | Shake-on-submit is more informative than a silently disabled button (which doesn't say *why*); fixing its accessibility gaps (contrast, labels, persistent error text) is sufficient — adding a disabled state on top would be redundant once those are fixed. |
| 3 | Add persistent inline error text under each invalid field with fixed copy ("Name is required" / "Pick an icon to continue"), not just color + a one-time shake. | Color and a transient animation alone don't explain *what's* wrong or persist for someone who missed the shake. |

## 4. Issues & fixes

### Critical

1. **`SUBTLE_TEXT` contrast failure.** `#8A8A99` on white = 3.40:1; on the screen background `#F3EFFB` = 3.00:1 — both below the 4.5:1 floor (`accessibility.md › Vision`) for text under 18pt. Affects placeholder text on both fields and `ScreenDescriptionSharedComponent`'s body copy on every step.
   **Fix:** Change `ApplicationBaselineColorStateStore`'s `SUBTLE_TEXT` from `#8A8A99` to `#6B6B7A` — verified 4.62:1 against `#F3EFFB` and 5.23:1 against white (both pass).

2. **`VALIDATION_ERROR_RED` contrast failure.** `#FCA5A5` (Tailwind red-300) on white = 1.90:1 — severely fails, used exactly in the state meant to be most legible (invalid placeholders, Continue button's error text/icon).
   **Fix:** Change `CreateCategoryScreenCON.VALIDATION_ERROR_RED` from `#FCA5A5` to `#DC2626` (Tailwind red-600) — verified 4.83:1 on white.

3. **No accessibility labels** on the Name `TextInput`, the Icon-field `Pressable`, or any of the 55 icon-grid cell `Pressable`s — VoiceOver can't identify any of them, inconsistent with `SecondaryActionButtonSharedComponent`'s existing diligence elsewhere in the same screen.
   **Fix:** Add `accessibilityLabel="Category name"` to the Name input; `accessibilityRole="button" accessibilityLabel="Select icon"` to the Icon field; `accessibilityLabel={formatIconLabel(iconName)}` to each grid cell.

4. **Icon-grid selection conveyed by color alone**, no `accessibilityState`. Fails `accessibility.md › Vision`'s "convey information with more than color alone."
   **Fix:** Add `accessibilityState={{ selected: isSelected }}` to each grid cell.

5. **No persistent error message.** Only color + a one-time shake signal invalidity, with no text saying what's wrong (`feedback.md › Best practices`).
   **Fix:** Render "Name is required" / "Pick an icon to continue" under each invalid field (per scoping decision 3), in the corrected error red, visible only while that field is invalid.

### High

6. **Sheet's drag-to-dismiss region is header-only, with no grabber** indicating a drag affordance exists (`sheets.md › Mobile`: *"Include a grabber in a resizable sheet... works with VoiceOver."*).
   **Fix:** Add a small grabber bar to `BottomSheetSharedComponent`, inside the existing gesture region, above the `header` slot. Generic fix — benefits every future sheet built on this component, not just this one.
   **Status: Skipped — explicitly declined by the project owner (2026-11-01).** Not implemented; `BottomSheetSharedComponent` is unchanged.

### Medium

7. **Icon-grid cell gap (8pt) is under Apple's ~12pt recommendation** around bezel-adjacent elements (`accessibility.md › Mobility`).
   **Fix:** Bump `CreateCategoryScreenIconGridStaticComponent`'s grid gap from `EdgeInsetsCON.SM` to `EdgeInsetsCON.MD`.

8. **No Clear button on the Name text field** (`text-fields.md › Mobile`: *"Display a Clear button in the trailing end of a text field."*).
   **Fix:** Set `clearButtonMode="while-editing"` as `TextInputSharedComponent`'s default (RN's built-in iOS-only native affordance — zero custom UI needed; no Android equivalent exists natively, left as-is).

## 5. Implementation order

Each step is independent enough to land and verify (`tsc` + `expo export`) on its own:

1. `SUBTLE_TEXT` global token fix (§4.1)
2. `VALIDATION_ERROR_RED` fix (§4.2)
3. Accessibility labels + selected state (§4.3, §4.4)
4. Persistent inline error messages (§4.5)
5. Bottom sheet grabber (§4.6)
6. Icon-grid gap bump (§4.7)
7. Text field Clear button (§4.8)

Per explicit instruction, each step is proposed to the project owner before being implemented — this PRD is the full list, not a pre-approval to execute all seven unattended.

## 6. Non-goals

- Budget / Type & Members step content.
- iPad / iPhone Duo layout.
- Disabling the Continue button when invalid (explicitly decided against, §3.2).
- Device-verified VoiceOver or Reduce Motion testing — these are code-level fixes matching HIG guidance and Reanimated's documented defaults, not confirmed on a physical device/simulator in this pass.
