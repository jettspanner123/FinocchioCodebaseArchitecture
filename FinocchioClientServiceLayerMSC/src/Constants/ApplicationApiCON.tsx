export default class ApplicationApiCON {
  public static readonly BASE_URL: string = process.env.EXPO_PUBLIC_API_URL ?? "";

  public static readonly AUTHENTICATION_SIGN_UP_PATH: string = "/Api/V1/Authentication/SignUp";
  public static readonly AUTHENTICATION_LOGIN_PATH: string = "/Api/V1/Authentication/Login";
  public static readonly AUTHENTICATION_REFRESH_PATH: string = "/Api/V1/Authentication/Refresh";
  public static readonly AUTHENTICATION_LOGOUT_PATH: string = "/Api/V1/Authentication/Logout";
  public static readonly AUTHENTICATION_GOOGLE_SIGN_IN_PATH: string = "/Api/V1/Authentication/GoogleSignIn";
}
