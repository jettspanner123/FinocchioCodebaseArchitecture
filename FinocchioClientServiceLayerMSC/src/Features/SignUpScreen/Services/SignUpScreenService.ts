import { AxiosError } from "axios";

export default class SignUpScreenService {
  public static current = new SignUpScreenService();

  public extractErrorMessage(error: unknown): string {
    if (error instanceof AxiosError) {
      const data = error.response?.data as { Message?: string; Errors?: Record<string, string[]> } | undefined;

      const firstFieldError = data?.Errors ? Object.values(data.Errors)[0]?.[0] : undefined;

      return firstFieldError ?? data?.Message ?? "Something went wrong. Please try again.";
    }

    return "Something went wrong. Please try again.";
  }
}
