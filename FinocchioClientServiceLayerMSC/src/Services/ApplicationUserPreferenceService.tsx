import AsyncStorage from "@react-native-async-storage/async-storage";

// Generic local key-value preference store -- not theme-specific, reusable
// for any future "UI preference" (ARCHITECTURE.md names theme and language
// under the same umbrella). Same singleton/method shape as
// ApplicationSecureStorageService, just backed by AsyncStorage instead of
// SecureStore since preferences aren't secrets. See THEME_SYSTEM_PRD.md §4.4.
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
