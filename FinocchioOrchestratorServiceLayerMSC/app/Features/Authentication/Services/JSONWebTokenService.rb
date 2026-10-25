module Features
  module Authentication
    module Services
      class JSONWebTokenService
        def self.current
          @current ||= new
        end

        def encode(user_id)
          constant = Features::Authentication::Constants::AuthenticationConstant
          payload = {
            sub: user_id,
            exp: (Time.current + constant::ACCESS_TOKEN_EXPIRY).to_i,
            iat: Time.current.to_i
          }

          JWT.encode(payload, secret, constant::JWT_ALGORITHM)
        end

        # Returns the decoded payload hash, or nil for any expired/invalid/malformed token --
        # callers treat nil as "not authenticated", they don't need to distinguish why.
        def decode(token)
          constant = Features::Authentication::Constants::AuthenticationConstant
          decoded, = JWT.decode(token, secret, true, algorithm: constant::JWT_ALGORITHM)
          decoded
        rescue JWT::ExpiredSignature, JWT::DecodeError, JWT::VerificationError
          nil
        end

        private

        def secret
          Rails.application.credentials.jwt_secret
        end
      end
    end
  end
end
