class UserModel < ApplicationRecord
  self.table_name = "FN_UserTBL"

  has_secure_password

  has_many :refresh_tokens,
           class_name: "Features::Authentication::Models::RefreshTokenModel",
           foreign_key: :user_id,
           dependent: :destroy

  before_validation { self.email = email.to_s.downcase.strip }

  validates :email, presence: true,
                     uniqueness: { case_sensitive: false },
                     format: { with: URI::MailTo::EMAIL_REGEXP }
  validate :password_meets_policy, if: -> { password.present? }

  private

  def password_meets_policy
    return if Features::Authentication::Services::PasswordPolicyService.current.valid?(password)

    errors.add(:password, Features::Authentication::Constants::AuthenticationConstant::PASSWORD_POLICY_DESCRIPTION)
  end
end
