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
      end
    end
  end
end
