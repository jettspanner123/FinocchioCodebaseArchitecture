import { GoogleSignin, isErrorWithCode, isSuccessResponse, statusCodes } from "@react-native-google-signin/google-signin";

import ApplicationGoogleAuthCON from "@/Constants/ApplicationGoogleAuthCON";

// Thin wrapper around the native Google Sign-In SDK -- configure() is called
// once at app startup (see src/app/_layout.tsx), signIn() is called when the
// user taps "Continue with Google". Explicit iosClientId/webClientId passed
// here rather than relying on the library's "automatic detection", matching
// this project's preference for explicit config over implicit magic.
export default class ApplicationGoogleAuthService {
  public static current = new ApplicationGoogleAuthService();

  public configure(): void {
    GoogleSignin.configure({
      iosClientId: ApplicationGoogleAuthCON.IOS_CLIENT_ID,
      webClientId: ApplicationGoogleAuthCON.WEB_CLIENT_ID,
    });
  }

  // Returns the Google ID token to send to the backend for verification, or
  // null if the user cancelled the sign-in flow (not an error -- the caller
  // should just quietly do nothing in that case). Any other failure rethrows.
  public async signIn(): Promise<string | null> {
    try {
      await GoogleSignin.hasPlayServices();
      const response = await GoogleSignin.signIn();

      if (!isSuccessResponse(response)) {
        return null;
      }

      return response.data.idToken;
    } catch (error) {
      if (isErrorWithCode(error) && error.code === statusCodes.SIGN_IN_CANCELLED) {
        return null;
      }

      throw error;
    }
  }
}
