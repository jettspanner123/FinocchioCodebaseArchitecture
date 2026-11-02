# PRD — DashboardScreen Accessibility & Craft Improvements

**Status:** Implemented 2026-11-01 (items 1–4, 7, 8 in §3). Items 5, 6, 9, 10 remain explicitly deferred/needs-confirmation, as scoped.
**Scope owner:** `DashboardScreen` feature (header section, twin action buttons, category cards, add-category card). Item 1 touches `DashboardScreenCON`'s progress-bar color constants, used only within this feature.
**Explicitly out of scope:** The tap-to-expand "zoom" sequence itself — already covered, reviewed, and approved in `CATEGORY_CARD_EXPAND_PRD.md`; not re-litigated here except where this review found something new (see §6).

## 1. Summary

A design review of `DashboardScreen` (header, twin action buttons, category card stack, add-category card) was run using the `apple-look` skill. It found genuine, computed contrast failures on live text (not the already-reviewed tap-to-expand animation), a real-vs-indistinguishable-from-working set of disabled buttons, missing accessibility labels, and an icon-style inconsistency. This PRD lists every finding that survived follow-up grilling and the fix plan.

## 2. Scoping decisions (from grilling)

| # | Decision | Why |
|---|----------|-----|
| 1 | Split `PROGRESS_BAR_DANGER_COLOR` into two constants: keep `#EF4444` for the progress-bar fill, add a separate, darker red for the "over cap" text. | The bar fill doesn't carry a contrast requirement (a decorative fill next to already-accessible text); darkening it too would mute the "over budget" visual signal for no accessibility benefit. |
| 2 | Do **not** add a visual disabled treatment to Profile, Settings, Add Amount, or Record Amount, and do **not** pursue the "..." menu's possible dead-tap-zone this pass. | Explicit decision: leave these as an accepted "not wired yet" temporary state, same category as `CreateCategoryScreen`'s still-placeholder Budget/Type & Members steps. |

## 3. Issues & fixes

### Critical

1. **`PROGRESS_BAR_DANGER_COLOR` (`#EF4444`) used as "over cap" text** scores 2.39–3.31:1 against 4 of the 5 current category backgrounds — below 4.5:1 everywhere, below even the 3:1 bold-text floor on 4 of 5 (`accessibility.md › Vision`).
   **Fix:** Add `PROGRESS_BAR_DANGER_TEXT_COLOR = "#991B1B"` (Tailwind red-800) to `DashboardScreenCON`, verified 5.28:1–7.31:1 against all 5 current category backgrounds. Use it only where the danger color is applied to the "over cap" `Text` in `DashboardScreenCategoryCardStaticComponent.tsx`; `DashboardScreenService.resolveProgressBarColor()` keeps returning `#EF4444` for the bar fill, unchanged.

2. **`periodLabel` text (`"Resets in 6 days"`) at `opacity: 0.6`** scores 4.02–4.28:1 against at least 2 of 5 category backgrounds — fails 4.5:1.
   **Fix:** Change `opacity: 0.6` to `opacity: 0.75` in `DashboardScreenCategoryCardStaticComponent.tsx` — matches its sibling `"X transactions"` text, already verified at 5.70–7.31:1 across all 5 category colors. No new value introduced.

3. **No accessibility labels** on the card's "..." menu (`Ionicons name="ellipsis-horizontal"`, icon-only), the member-avatar clusters (initials or the "V" fallback convey information visually only), or the `TwinActionButtonsSectionComponent`'s two `Pressable`s.
   **Fix:**
   - "..." menu: `accessibilityRole="button" accessibilityLabel="More options"`.
   - Avatar cluster: `accessibilityLabel` summarizing membership, e.g. `` `Shared with ${members.map(m => m.name).join(", ")}` `` when members exist, `"Personal category"` for the single-"V" fallback.
   - Add Amount / Record Amount: `accessibilityRole="button" accessibilityLabel="Add Amount"` / `"Record Amount"`.

### High

4. **Icon style inconsistency.** Outline icons (`person-outline`, `settings-outline`, `mic-outline`, `receipt-outline`) mixed with filled icons (`add`, `ellipsis-horizontal`) among the screen's UI-chrome controls (`icons.md › Best practices`: *"Maintain visual consistency across all interface icons... consistent... stroke thickness."*). Category icons (`home`, `barbell`, `briefcase`, `restaurant`, `airplane`) are a deliberately separate "content identity" set, already filled-style consistent with `CreateCategoryScreen`'s 55-icon curated set — not touched.
   **Fix:** Change `add` → `add-outline` (`TwinActionButtonsSectionComponent`) and `ellipsis-horizontal` → `ellipsis-horizontal-outline` (`DashboardScreenCategoryCardStaticComponent`), so every non-category-identity icon on the screen is consistently outline-style, matching `person-outline`/`settings-outline`/`mic-outline`/`receipt-outline`.

5. **Category background colors are hardcoded hex literals** per category, disconnected from `ColorFactoryCON`'s own named `CARD_*` tokens (value/name mismatches: `CARD_GAMES`'s hex is used for "Home," `CARD_PRODUCTS`'s for "Gym"; `CARD_ENTERTAINMENT` unused; Dining/Travel match no token at all). No dark-mode path exists since `ApplicationBaselineColorStateStore`'s dark palette is still a placeholder copy of light.
   **Status: Deferred, not fixed this pass.** This is a structural data/token-architecture change (how category colors are assigned and stored), not a visible bug today — fixing the naming mismatch without real dark-mode values wouldn't change anything users see. Revisit once real dark-mode colors exist.

6. **Possible dead-tap-zone**: the "..." menu `Pressable` is nested inside the card's own full-area `Pressable` with no `onPress` of its own — in React Native, a touchable with no handler can still claim the touch responder.
   **Status: Deferred, not pursued this pass** (scoping decision 2) — needs on-device verification before any fix is decided.

### Medium (code-quality, noticed during this audit)

7. `TwinActionButtonsSectionComponent`'s `paddingHorizontal: 5` is a magic number outside `EdgeInsetsCON`'s scale (`XS=4`, `SM=8`), inconsistent with this codebase's own spacing-token rule.
   **Fix:** Change to `EdgeInsetsCON.XS` (4) — matches the precedent set by `CreateCategoryScreenController`'s analogous full-width-pill-with-leading-icon-circle buttons, which use `EdgeInsetsCON.XS` for the same reason (icon circle floats near the edge).

8. The second `TwinActionButtons` button's four individual corner-radius properties (`borderTopLeftRadius: 9999`, etc.) are functionally identical to the first button's single `borderRadius: 9999`.
   **Fix:** Collapse to `borderRadius: 9999`, matching its sibling.

### Low

9. The "Shared" badge text sits at exactly 11pt, the accessibility floor with no margin. Not fixed this pass — noted for awareness only.
10. `DashboardScreenHeaderSectionComponent`'s `mt-8` (32px) may stack with the parent's own `paddingTop: EdgeInsetsCON.XXL` (32px) for 64px of top spacing before any heading text. **Status: Needs confirmation before touching** — could be deliberate extra breathing room; not removed without an explicit answer on whether it's intentional.

## 4. Implementation order

1. `PROGRESS_BAR_DANGER_TEXT_COLOR` split (§3.1)
2. `periodLabel` opacity fix (§3.2)
3. Accessibility labels (§3.3)
4. Icon style consistency (§3.4)
5. `paddingHorizontal` token fix (§3.7)
6. Redundant border-radius collapse (§3.8)

Items 5 and 6 (§3) and 9–10 are explicitly deferred/needs-confirmation, not part of the execution list above.

## 5. Non-goals

- Re-litigating the tap-to-expand sequence's own mechanics, timing, or accessibility (already covered in `CATEGORY_CARD_EXPAND_PRD.md`).
- Adding visual disabled states to Profile/Settings/Add Amount/Record Amount (scoping decision 2).
- Restructuring the category color/token system or building real dark-mode values (§3.5).
- Investigating/fixing the "..." menu's possible dead-tap-zone (§3.6) — needs on-device verification first.
- Device-verified VoiceOver testing — fixes are code-level, matching HIG guidance and computed contrast values, not confirmed on a physical device/simulator in this pass.
