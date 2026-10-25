module Features
  module Authentication
    module Models
      class RefreshTokenModel < ApplicationRecord
        self.table_name = "FN_RefreshTokenTBL"

        belongs_to :user, class_name: "UserModel", foreign_key: :user_id

        validates :token_digest, presence: true, uniqueness: true

        def self.issue_for(user)
          raw_token = SecureRandom.hex(32)

          record = create!(
            user_id: user.id,
            token_digest: digest(raw_token),
            expires_at: Features::Authentication::Constants::AuthenticationConstant::REFRESH_TOKEN_EXPIRY.from_now
          )

          [raw_token, record]
        end

        def self.find_active_by_raw_token(raw_token)
          return nil if raw_token.blank?

          record = find_by(token_digest: digest(raw_token))
          record&.active? ? record : nil
        end

        def self.digest(raw_token)
          Digest::SHA256.hexdigest(raw_token)
        end

        def active?
          revoked_at.nil? && expires_at.future?
        end

        def revoke!
          update!(revoked_at: Time.current)
        end
      end
    end
  end
end
