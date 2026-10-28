import * as Haptics from "expo-haptics";

class ApplicationHapticFeedbackService {
  public async triggerHaptic(
    style: Haptics.ImpactFeedbackStyle = Haptics.ImpactFeedbackStyle.Light,
  ): Promise<void> {
    try {
      await Haptics.impactAsync(style);
    } catch {
      // Graceful fallback on devices/simulators where haptics are unavailable
    }
  }

  public async triggerNotification(
    type: Haptics.NotificationFeedbackType = Haptics.NotificationFeedbackType.Success,
  ): Promise<void> {
    try {
      await Haptics.notificationAsync(type);
    } catch {
      // Graceful fallback
    }
  }

  public async triggerSelection(): Promise<void> {
    try {
      await Haptics.selectionAsync();
    } catch {
      // Graceful fallback
    }
  }
}

// Singleton class providing central device haptics/physical feedback,
// strictly conforming to CODING-RULES.md.
export default class ApplicationPhysicalFeedback {
  public static current = new ApplicationPhysicalFeedback();

  public haptic = new ApplicationHapticFeedbackService();
}
