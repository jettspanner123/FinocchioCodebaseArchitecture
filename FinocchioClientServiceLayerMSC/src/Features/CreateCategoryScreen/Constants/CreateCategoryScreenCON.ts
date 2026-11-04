import { Ionicons } from "@expo/vector-icons";

export default class CreateCategoryScreenCON {
  public static readonly SCREEN_TITLE: string = "Create Category";

  // Curated set offered in the icon picker -- not the full Ionicons set,
  // which has no scroll/search UX built for it yet (see grilling session
  // 2026-11-01).
  public static readonly AVAILABLE_CATEGORY_ICONS: readonly (keyof typeof Ionicons.glyphMap)[] = [
    "restaurant", "fast-food", "pizza", "cafe", "wine", "beer", "ice-cream", "nutrition",
    "cart", "basket", "bag", "pricetag", "gift", "cash", "card", "wallet", "receipt",
    "home", "bed", "hammer", "construct", "build", "flash", "water", "wifi",
    "tv", "desktop", "laptop", "phone-portrait", "headset", "camera", "musical-notes", "film",
    "game-controller", "basketball", "football", "barbell", "bicycle", "car", "car-sport", "bus", "train", "airplane",
    "map", "school", "book", "briefcase", "medkit", "medical", "heart", "paw",
    "shirt", "umbrella", "person", "people",
  ];

  // Pre-approved palette for the color picker -- every color actually
  // rendered anywhere in the app today (the 5 real mock category colors from
  // DashboardScreenModel), excluding CREATE_BUTTON_GREEN_DARK (UI chrome, not
  // a category identity color) -- see grilling session 2026-11-03. All 5
  // already pair with ColorFactoryCON.INK as their text color in the real
  // mock data, so no separate text-color picker is needed.
  public static readonly AVAILABLE_CATEGORY_COLORS: readonly string[] = [
    "#E0C4F1",
    "#F4F5A8",
    "#C5CDF0",
    "#FFD6A5",
    "#BFF0D4",
  ];

  public static readonly COLOR_SWATCH_BORDER_WIDTH: number = 1.5;
  public static readonly COLOR_SWATCH_BORDER_COLOR: string = "rgba(28, 28, 40, 0.25)";

  // Muted explanatory copy shown via ScreenDescriptionSharedComponent above
  // each step's fields.
  public static readonly STEP_DESCRIPTIONS: readonly string[] = [
    "Give your category a name and pick an icon that represents it, so it's easy to recognize at a glance.",
    "Set a budget and how often it resets. We'll track your spending against this automatically.",
    "Choose whether this category is personal or shared, and add anyone you want splitting it with you.",
    "Review everything below, then create your category.",
  ];

  public static readonly TOTAL_STEPS: number = 4;

  // Review step's reset-cadence text -- a real category's card shows a
  // computed "Resets in N days" countdown, but a not-yet-created category has
  // no real creation/reset date to count down from, so the preview derives an
  // honest label from the period alone instead. Indexed by
  // CreateCategoryScreenBudgetPeriodEnum -- order matches the enum's
  // declaration order (see grilling session 2026-11-02).
  public static readonly REVIEW_CARD_PERIOD_RESET_LABELS: readonly string[] = [
    "Resets Daily",
    "Resets Weekly",
    "Resets Monthly",
    "Resets Yearly",
  ];

  // Persistent inline error text shown under an invalid field (see
  // CREATE_CATEGORY_IMPROVEMENTS_PRD.md #5) -- color/shake alone don't say
  // what's wrong or persist for someone who missed the shake.
  public static readonly NAME_REQUIRED_ERROR: string = "Name is required";
  public static readonly ICON_REQUIRED_ERROR: string = "Pick an icon to continue";
  public static readonly COLOR_REQUIRED_ERROR: string = "Pick a color to continue";
  public static readonly AMOUNT_REQUIRED_ERROR: string = "Enter a budget amount";

  public static readonly APPEARANCE_SECTION_HEADING: string = "Appearance";
  public static readonly BUDGET_PERIOD_SECTION_HEADING: string = "Budget Period";
  // Indexed by CreateCategoryScreenBudgetPeriodEnum -- order matches the
  // enum's declaration order.
  public static readonly BUDGET_PERIOD_LABELS: readonly string[] = ["Day", "Week", "Month", "Year"];
  // Rupees, matching DashboardScreenService.formatCurrency's single-currency
  // (INR) decision.
  public static readonly CURRENCY_SYMBOL: string = "₹";
  public static readonly AMOUNT_PLACEHOLDER: string = "0";

  // Indexed by CreateCategoryScreenTypeEnum -- order matches the enum's
  // declaration order.
  public static readonly TYPE_LABELS: readonly string[] = ["Personal", "Shared"];

  // Shared-members list (Type & Members step) -- member add/remove is local
  // state only this pass, no backend/search wiring yet (see grilling session
  // 2026-11-02).
  public static readonly MEMBERS_SECTION_HEADING: string = "Members";
  public static readonly EMPTY_MEMBERS_HEADING: string = "No members yet";
  public static readonly EMPTY_MEMBERS_DESCRIPTION: string = "Add people to split this category's budget with.";
  public static readonly ADD_MEMBER_BUTTON_LABEL: string = "Add Member";
  public static readonly ADD_MEMBER_SHEET_TITLE: string = "Add Member";
  public static readonly SEARCH_MEMBER_PLACEHOLDER: string = "Search by name";

  public static readonly PREVIOUS_BUTTON_LABEL: string = "Previous";
  public static readonly NEXT_BUTTON_LABEL: string = "Next";
  public static readonly FIRST_STEP_NEXT_BUTTON_LABEL: string = "Continue";
  public static readonly CREATE_BUTTON_LABEL: string = "Create";

  // Matches the "Travel" category card's green exactly (DashboardScreenModel's
  // MOCK_DASHBOARD_CATEGORIES), not a new color invented for this button.
  public static readonly CREATE_BUTTON_GREEN: string = "#BFF0D4";
  public static readonly CREATE_BUTTON_GREEN_DARK: string = "#123F36";
  // A lighter tint of CREATE_BUTTON_GREEN_DARK, for the border only -- icon
  // bg/text stay the full dark green.
  public static readonly CREATE_BUTTON_GREEN_BORDER: string = "#A0B2AF";

  // Tailwind red-600 (changed from red-300 2026-11-01, see
  // CREATE_CATEGORY_IMPROVEMENTS_PRD.md #2 -- red-300 was 1.90:1 on white,
  // red-600 verified at 4.83:1) -- border/text/icon tint for an invalid
  // field, paired with useShakeAnimationHook.
  public static readonly VALIDATION_ERROR_RED: string = "#DC2626";

  // Discard Confirmation Dialog
  public static readonly DISCARD_DIALOG_TITLE: string = "Discard Category?";
  public static readonly DISCARD_DIALOG_MESSAGE: string = "You have unsaved changes that will be lost.";
  public static readonly DISCARD_DIALOG_CONFIRM_LABEL: string = "Discard";
  public static readonly DISCARD_DIALOG_CANCEL_LABEL: string = "Keep Editing";
}
