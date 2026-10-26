module Features
  module Authentication
    class AuthenticationController < ApplicationController
      before_action :authenticate_request!, only: [:logout]

      def sign_up
        begin
          user = UserModel.new(email: params[:email], password: params[:password])
          saved = user.save
        rescue StandardError => e
          Rails.logger.error("[AuthenticationController#sign_up] #{e.class}: #{e.message}")
          render(
            json: ApplicationApiResponseService.current.error_envelope(
              message: "An unexpected error occurred during sign up.",
              status_code: 500
            ),
            status: 500
          )
        else
          if saved
            render_authenticated_session(user, message: "Account created successfully.", status_code: 201)
          else
            render(
              json: ApplicationApiResponseService.current.error_envelope(
                message: "Validation failed.",
                errors: user.errors.to_hash,
                status_code: 422
              ),
              status: 422
            )
          end
        ensure
          # No cleanup required for this action.
        end
      end

      def login
        begin
          user = UserModel.find_by(email: params[:email].to_s.downcase.strip)
          authenticated = user&.authenticate(params[:password])
        rescue StandardError => e
          Rails.logger.error("[AuthenticationController#login] #{e.class}: #{e.message}")
          render(
            json: ApplicationApiResponseService.current.error_envelope(
              message: "An unexpected error occurred during login.",
              status_code: 500
            ),
            status: 500
          )
        else
          if authenticated
            render_authenticated_session(user, message: "Logged in successfully.", status_code: 200)
          else
            render(
              json: ApplicationApiResponseService.current.error_envelope(
                message: "Invalid email or password.",
                status_code: 401
              ),
              status: 401
            )
          end
        ensure
          # No cleanup required for this action.
        end
      end

      def refresh
        begin
          rotated = Features::Authentication::Services::RefreshTokenService.current.rotate(params[:refresh_token])
        rescue StandardError => e
          Rails.logger.error("[AuthenticationController#refresh] #{e.class}: #{e.message}")
          render(
            json: ApplicationApiResponseService.current.error_envelope(
              message: "An unexpected error occurred during token refresh.",
              status_code: 500
            ),
            status: 500
          )
        else
          if rotated
            raw_refresh_token, record = rotated
            access_token = Features::Authentication::Services::JSONWebTokenService.current.encode(record.user_id)

            render(
              json: ApplicationApiResponseService.current.success_envelope(
                data: { AccessToken: access_token, RefreshToken: raw_refresh_token },
                message: "Token refreshed successfully.",
                status_code: 200
              ),
              status: 200
            )
          else
            render(
              json: ApplicationApiResponseService.current.error_envelope(
                message: "Invalid or expired refresh token.",
                status_code: 401
              ),
              status: 401
            )
          end
        ensure
          # No cleanup required for this action.
        end
      end

      def google_sign_in
        begin
          payload = Features::Authentication::Services::GoogleIdTokenVerifierService.current.verify(params[:id_token])
        rescue StandardError => e
          Rails.logger.error("[AuthenticationController#google_sign_in] #{e.class}: #{e.message}")
          render(
            json: ApplicationApiResponseService.current.error_envelope(
              message: "An unexpected error occurred during Google sign-in.",
              status_code: 500
            ),
            status: 500
          )
        else
          if payload.nil?
            render(
              json: ApplicationApiResponseService.current.error_envelope(
                message: "Invalid Google sign-in token.",
                status_code: 401
              ),
              status: 401
            )
          else
            user = find_or_create_google_user(payload)

            if user.persisted? && user.errors.empty?
              render_authenticated_session(user, message: "Signed in with Google successfully.", status_code: 200)
            else
              render(
                json: ApplicationApiResponseService.current.error_envelope(
                  message: "Validation failed.",
                  errors: user.errors.to_hash,
                  status_code: 422
                ),
                status: 422
              )
            end
          end
        ensure
          # No cleanup required for this action.
        end
      end

      def logout
        begin
          Features::Authentication::Services::RefreshTokenService.current.revoke(params[:refresh_token])
        rescue StandardError => e
          Rails.logger.error("[AuthenticationController#logout] #{e.class}: #{e.message}")
          render(
            json: ApplicationApiResponseService.current.error_envelope(
              message: "An unexpected error occurred during logout.",
              status_code: 500
            ),
            status: 500
          )
        else
          render(
            json: ApplicationApiResponseService.current.success_envelope(
              message: "Logged out successfully.",
              status_code: 200
            ),
            status: 200
          )
        ensure
          # No cleanup required for this action.
        end
      end

      private

      # Account linking: a Google sign-in matching an existing google_uid
      # returns that user; otherwise it matches by email (Google has already
      # verified that email belongs to whoever is signing in) and links
      # google_uid onto that account; otherwise it creates a new account.
      def find_or_create_google_user(payload)
        email = payload["email"].to_s.downcase.strip
        google_uid = payload["sub"]

        existing_by_uid = UserModel.find_by(google_uid: google_uid)
        return existing_by_uid if existing_by_uid

        user = UserModel.find_by(email: email) || UserModel.new(email: email)
        user.google_uid = google_uid
        user.save
        user
      end

      def render_authenticated_session(user, message:, status_code:)
        raw_refresh_token, = Features::Authentication::Services::RefreshTokenService.current.issue(user)
        access_token = Features::Authentication::Services::JSONWebTokenService.current.encode(user.id)

        render(
          json: ApplicationApiResponseService.current.success_envelope(
            data: {
              User: { Id: user.id, Email: user.email },
              AccessToken: access_token,
              RefreshToken: raw_refresh_token
            },
            message: message,
            status_code: status_code
          ),
          status: status_code
        )
      end
    end
  end
end
