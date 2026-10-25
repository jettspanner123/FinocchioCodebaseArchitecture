module Features
  module Authentication
    module Services
      class PasswordPolicyService
        def self.current
          @current ||= new
        end

        def valid?(password)
          return false if password.blank?

          constant = Features::Authentication::Constants::AuthenticationConstant
          password.length >= constant::PASSWORD_MIN_LENGTH &&
            password.match?(constant::PASSWORD_SPECIAL_CHARACTER_REGEX)
        end
      end
    end
  end
end
