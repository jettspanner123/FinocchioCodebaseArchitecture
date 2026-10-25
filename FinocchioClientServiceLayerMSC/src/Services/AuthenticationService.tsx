import ApplicationApiCON from "@/Constants/ApplicationApiCON";
import ApplicationSecureStorageCON from "@/Constants/ApplicationSecureStorageCON";
import ApplicationApiClientService from "@/Services/ApplicationApiClientService";
import ApplicationSecureStorageService from "@/Services/ApplicationSecureStorageService";
import useAuthenticationStateStore from "@/Store/AuthenticationStateStore";
import type { AuthenticatedSessionType } from "@/Types/AuthenticationType";

export default class AuthenticationService {
  public static current = new AuthenticationService();

  public async signUp(email: string, password: string): Promise<AuthenticatedSessionType> {
    const response = await ApplicationApiClientService.current.instance.post(ApplicationApiCON.AUTHENTICATION_SIGN_UP_PATH, {
      email,
      password,
    });

    return this.persistSession(response.data);
  }

  public async login(email: string, password: string): Promise<AuthenticatedSessionType> {
    const response = await ApplicationApiClientService.current.instance.post(ApplicationApiCON.AUTHENTICATION_LOGIN_PATH, {
      email,
      password,
    });

    return this.persistSession(response.data);
  }

  public async logout(): Promise<void> {
    const refreshToken = await ApplicationSecureStorageService.current.getItem(
      ApplicationSecureStorageCON.REFRESH_TOKEN_STORAGE_KEY,
    );

    try {
      await ApplicationApiClientService.current.instance.post(ApplicationApiCON.AUTHENTICATION_LOGOUT_PATH, {
        refresh_token: refreshToken,
      });
    } finally {
      await ApplicationSecureStorageService.current.deleteItem(ApplicationSecureStorageCON.REFRESH_TOKEN_STORAGE_KEY);
      useAuthenticationStateStore.getState().clearSession();
    }
  }

  private async persistSession(data: AuthenticatedSessionType): Promise<AuthenticatedSessionType> {
    await ApplicationSecureStorageService.current.setItem(ApplicationSecureStorageCON.REFRESH_TOKEN_STORAGE_KEY, data.RefreshToken);

    useAuthenticationStateStore.getState().setSession(data.AccessToken, data.User);

    return data;
  }
}
