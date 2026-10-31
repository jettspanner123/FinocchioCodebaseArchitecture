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

  // Muted explanatory copy shown via ScreenDescriptionSharedComponent above
  // each step's fields.
  public static readonly STEP_DESCRIPTIONS: readonly string[] = [
    "Give your category a name and pick an icon that represents it, so it's easy to recognize at a glance.",
    "Set a budget and how often it resets. We'll track your spending against this automatically.",
    "Choose whether this category is personal or shared, and add anyone you want splitting it with you.",
  ];

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

  // Tailwind red-300 -- border/text/icon tint for an invalid field, paired
  // with useShakeAnimationHook.
  public static readonly VALIDATION_ERROR_RED: string = "#FCA5A5";
}
