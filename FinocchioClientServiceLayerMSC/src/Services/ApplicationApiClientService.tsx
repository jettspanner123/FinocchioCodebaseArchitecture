import axios, { type AxiosError, type AxiosInstance, type InternalAxiosRequestConfig } from "axios";

import ApplicationApiCON from "@/Constants/ApplicationApiCON";
import ApplicationSecureStorageCON from "@/Constants/ApplicationSecureStorageCON";
import ApplicationSecureStorageService from "@/Services/ApplicationSecureStorageService";
import useAuthenticationStateStore from "@/Store/AuthenticationStateStore";

interface RetriableRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

// Attaches the access token to every request, and on a 401, transparently
// refreshes it once and retries the original request -- a component never
// has to know a token expired mid-session.
export default class ApplicationApiClientService {
  public static current = new ApplicationApiClientService();

  public readonly instance: AxiosInstance;

  private refreshPromise: Promise<string | null> | null = null;

  private constructor() {
    this.instance = axios.create({ baseURL: ApplicationApiCON.BASE_URL });

    this.instance.interceptors.request.use((config) => {
      const { accessToken } = useAuthenticationStateStore.getState();

      if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }

      return config;
    });

    this.instance.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as RetriableRequestConfig | undefined;

        if (error.response?.status !== 401 || !originalRequest || originalRequest._retry) {
          throw error;
        }

        originalRequest._retry = true;

        const newAccessToken = await this.refreshAccessToken();

        if (!newAccessToken) {
          useAuthenticationStateStore.getState().clearSession();
          throw error;
        }

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        return this.instance.request(originalRequest);
      },
    );
  }

  // Multiple requests failing at once (e.g. a batch of calls right as the
  // access token expires) must only trigger one real refresh call, not one
  // per failed request -- concurrent callers share this same in-flight promise.
  private async refreshAccessToken(): Promise<string | null> {
    if (!this.refreshPromise) {
      this.refreshPromise = this.performRefresh().finally(() => {
        this.refreshPromise = null;
      });
    }

    return this.refreshPromise;
  }

  private async performRefresh(): Promise<string | null> {
    const refreshToken = await ApplicationSecureStorageService.current.getItem(
      ApplicationSecureStorageCON.REFRESH_TOKEN_STORAGE_KEY,
    );

    if (!refreshToken) {
      return null;
    }

    try {
      const response = await axios.post(`${ApplicationApiCON.BASE_URL}${ApplicationApiCON.AUTHENTICATION_REFRESH_PATH}`, {
        refresh_token: refreshToken,
      });

      const newAccessToken: string = response.data.AccessToken;
      const newRefreshToken: string = response.data.RefreshToken;

      await ApplicationSecureStorageService.current.setItem(
        ApplicationSecureStorageCON.REFRESH_TOKEN_STORAGE_KEY,
        newRefreshToken,
      );

      useAuthenticationStateStore.setState({ accessToken: newAccessToken });

      return newAccessToken;
    } catch {
      return null;
    }
  }
}
