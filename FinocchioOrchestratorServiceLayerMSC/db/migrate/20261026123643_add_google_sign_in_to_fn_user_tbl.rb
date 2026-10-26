class AddGoogleSignInToFnUserTbl < ActiveRecord::Migration[8.1]
  def change
    add_column :FN_UserTBL, :google_uid, :string
    add_index :FN_UserTBL, :google_uid, unique: true

    # A Google-only sign-up never sets a password.
    change_column_null :FN_UserTBL, :password_digest, true
  end
end
