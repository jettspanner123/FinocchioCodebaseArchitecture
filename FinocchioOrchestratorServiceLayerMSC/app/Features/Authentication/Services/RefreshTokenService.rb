module Features
  module Authentication
    module Services
      class RefreshTokenService
        def self.current
          @current ||= new
        end

        def issue(user)
          Features::Authentication::Models::RefreshTokenModel.issue_for(user)
        end

        # Rotation: the presented token is revoked and a brand-new one issued in
        # its place, every time. If a stolen refresh token is ever used by an
        # attacker and later by the real user (or vice versa), one of them gets
        # a surprise logout instead of the compromise staying silent for the
        # token's full 30-day life.
        def rotate(raw_token)
          existing = Features::Authentication::Models::RefreshTokenModel.find_active_by_raw_token(raw_token)
          return nil unless existing

          user = existing.user
          existing.revoke!

          issue(user)
        end

        # Revokes only the one token presented -- logs out this device only,
        # consistent with this project's multi-device-sessions decision.
        def revoke(raw_token)
          existing = Features::Authentication::Models::RefreshTokenModel.find_active_by_raw_token(raw_token)
          existing&.revoke!
        end
      end
    end
  end
end
