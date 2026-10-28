// Returns font-family name strings for use in `{ fontFamily: ... }` style
// objects. Does not load fonts itself -- loading happens once, globally, via
// useFonts() in src/app/_layout.tsx (a React hook, so it can't live on a
// static singleton like this one); this helper only hands back the string
// name the loaded font registers under.
export default class UIFontHelper {
  public static current = new UIFontHelper();

  public getPirataOneFont(): string {
    return "PirataOne_400Regular";
  }
}
