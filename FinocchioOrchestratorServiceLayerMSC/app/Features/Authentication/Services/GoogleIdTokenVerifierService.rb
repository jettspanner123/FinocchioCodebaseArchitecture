require "net/http"
require "json"

module Features
  module Authentication
    module Services
      # Verifies a Google-issued ID token server-side via Google's published
      # JWKS, with no dedicated Google gem -- the `jwt` gem already supports
      # JWKS-based verification directly (confirmed against the installed
      # jwt 3.3.0's lib/jwt/decode.rb before building this).
      class GoogleIdTokenVerifierService
        def self.current
          @current ||= new
        end

        # Returns the decoded payload hash (includes "email", "sub", etc.) if
        # the token is genuinely Google-issued, intended for this app, and not
        # expired -- or nil for any failure. Callers don't need to distinguish
        # why verification failed, only that it did.
        def verify(id_token)
          return nil if id_token.blank?

          constant = Features::Authentication::Constants::AuthenticationConstant

          decoded, = JWT.decode(id_token, nil, true, algorithms: ["RS256"], jwks: jwks_loader)

          return nil unless constant::GOOGLE_ACCEPTABLE_ISSUERS.include?(decoded["iss"])
          return nil unless constant::GOOGLE_ACCEPTABLE_AUDIENCES.include?(decoded["aud"])
          return nil if decoded["email_verified"] == false

          decoded
        rescue JWT::DecodeError, JWT::VerificationError => e
          Rails.logger.warn("[GoogleIdTokenVerifierService#verify] #{e.class}: #{e.message}")
          nil
        end

        private

        def jwks_loader
          lambda do |options|
            @cached_keys = nil if options[:invalidate]
            @cached_keys ||= fetch_jwks
          end
        end

        def fetch_jwks
          constant = Features::Authentication::Constants::AuthenticationConstant
          response = Net::HTTP.get(URI(constant::GOOGLE_JWKS_URI))
          JSON.parse(response)
        end
      end
    end
  end
end
