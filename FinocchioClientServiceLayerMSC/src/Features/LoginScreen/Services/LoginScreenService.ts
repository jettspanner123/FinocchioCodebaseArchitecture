import { AxiosError } from "axios";

export default class LoginScreenService {
  public static current = new LoginScreenService();

  public extractErrorMessage(error: unknown): string {
    if (error instanceof AxiosError && typeof error.response?.data?.Message === "string") {
      return error.response.data.Message;
    }

    return "Something went wrong. Please try again.";
  }
}
