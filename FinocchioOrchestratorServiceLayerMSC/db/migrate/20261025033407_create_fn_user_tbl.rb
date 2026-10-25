class CreateFnUserTbl < ActiveRecord::Migration[8.1]
  def change
    create_table :FN_UserTBL do |t|
      t.string :email, null: false
      t.string :password_digest, null: false

      t.timestamps
    end

    add_index :FN_UserTBL, :email, unique: true
  end
end
