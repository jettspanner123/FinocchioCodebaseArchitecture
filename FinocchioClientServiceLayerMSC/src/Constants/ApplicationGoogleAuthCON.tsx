// Not secrets -- OAuth Client IDs ship inside the app config/binary regardless,
// matching the same constants committed on the backend
// (Features::Authentication::Constants::AuthenticationConstant).
export default class ApplicationGoogleAuthCON {
  public static readonly IOS_CLIENT_ID: string =
    "243259728467-0spvqedumppc0ga6mr6q6ravbsupl9a8.apps.googleusercontent.com";
  public static readonly WEB_CLIENT_ID: string =
    "243259728467-mjpnnjq42lbdqrq9io9totge9mg68ktf.apps.googleusercontent.com";
}
