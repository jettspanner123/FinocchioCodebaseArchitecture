import * as SecureStore from "expo-secure-store";

export default class ApplicationSecureStorageService {
  public static current = new ApplicationSecureStorageService();

  public async setItem(key: string, value: string): Promise<void> {
    await SecureStore.setItemAsync(key, value);
  }

  public async getItem(key: string): Promise<string | null> {
    return SecureStore.getItemAsync(key);
  }

  public async deleteItem(key: string): Promise<void> {
    await SecureStore.deleteItemAsync(key);
  }
}
