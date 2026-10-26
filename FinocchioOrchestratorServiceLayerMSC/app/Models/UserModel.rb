class UserModel < ApplicationRecord
  self.table_name = "FN_UserTBL"

  # validations: false because a Google sign-up never sets a password -- the
  # default presence validation has_secure_password adds would reject it.
  # password_required_unless_google_sign_up below replaces that validation,
  # scoped to accounts that aren't Google-linked.
  has_secure_password validations: false

  has_many :refresh_tokens,
           class_name: "Features::Authentication::Models::RefreshTokenModel",
           foreign_key: :user_id,
           dependent: :destroy

  before_validation { self.email = email.to_s.downcase.strip }

  validates :email, presence: true,
                     uniqueness: { case_sensitive: false },
                     format: { with: URI::MailTo::EMAIL_REGEXP }
  validates :google_uid, uniqueness: true, allow_nil: true
  validates :password, presence: true, on: :create, if: -> { google_uid.blank? }
  validate :password_meets_policy, if: -> { password.present? }

  def google_linked?
    google_uid.present?
  end

  private

  def password_meets_policy
    return if Features::Authentication::Services::PasswordPolicyService.current.valid?(password)

    errors.add(:password, Features::Authentication::Constants::AuthenticationConstant::PASSWORD_POLICY_DESCRIPTION)
  end
end
