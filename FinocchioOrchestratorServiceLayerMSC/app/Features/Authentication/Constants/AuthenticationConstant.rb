module Features
  module Authentication
    module Constants
      class AuthenticationConstant
        PASSWORD_MIN_LENGTH = 8
        PASSWORD_SPECIAL_CHARACTER_REGEX = /[^a-zA-Z0-9]/
        PASSWORD_POLICY_DESCRIPTION = "must be at least 8 characters long and contain at least 1 special character"

        ACCESS_TOKEN_EXPIRY = 15.minutes
        REFRESH_TOKEN_EXPIRY = 30.days

        JWT_ALGORITHM = "HS256"

        # Not secrets -- OAuth Client IDs ship inside the app binary/config
        # regardless, so there's no harm committing them as plain constants.
        GOOGLE_IOS_CLIENT_ID = "243259728467-0spvqedumppc0ga6mr6q6ravbsupl9a8.apps.googleusercontent.com"
        GOOGLE_WEB_CLIENT_ID = "243259728467-mjpnnjq42lbdqrq9io9totge9mg68ktf.apps.googleusercontent.com"
        GOOGLE_ACCEPTABLE_AUDIENCES = [GOOGLE_IOS_CLIENT_ID, GOOGLE_WEB_CLIENT_ID].freeze
        GOOGLE_ACCEPTABLE_ISSUERS = ["accounts.google.com", "https://accounts.google.com"].freeze
        GOOGLE_JWKS_URI = "https://www.googleapis.com/oauth2/v3/certs"
      end
    end
  end
end
