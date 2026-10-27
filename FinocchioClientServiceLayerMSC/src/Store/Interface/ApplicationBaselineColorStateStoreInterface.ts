export interface ApplicationColorPaletteType {
  BACKGROUND: string;
  INK: string;
  SUBTLE_TEXT: string;
  CARD_GAMES: string;
  CARD_GAMES_TEXT: string;
  CARD_PRODUCTS: string;
  CARD_PRODUCTS_TEXT: string;
  CARD_ENTERTAINMENT: string;
  CARD_ENTERTAINMENT_TEXT: string;
  CARD_FOOD: string;
  CARD_FOOD_TEXT: string;
}

export default interface ApplicationBaselineColorStateStoreInterface {
  theme: "light" | "dark";
  colors: ApplicationColorPaletteType;
  setTheme: (theme: "light" | "dark") => void;
}
