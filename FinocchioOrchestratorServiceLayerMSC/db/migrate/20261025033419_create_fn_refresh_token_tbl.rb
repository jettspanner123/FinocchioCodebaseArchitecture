class CreateFnRefreshTokenTbl < ActiveRecord::Migration[8.1]
  def change
    create_table :FN_RefreshTokenTBL do |t|
      t.bigint :user_id, null: false
      t.string :token_digest, null: false
      t.datetime :expires_at, null: false
      t.datetime :revoked_at

      t.timestamps
    end

    add_index :FN_RefreshTokenTBL, :token_digest, unique: true
    add_index :FN_RefreshTokenTBL, :user_id
    add_foreign_key :FN_RefreshTokenTBL, :FN_UserTBL, column: :user_id
  end
end
