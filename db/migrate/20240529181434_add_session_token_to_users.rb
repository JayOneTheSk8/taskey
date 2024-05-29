class AddSessionTokenToUsers < ActiveRecord::Migration[7.1]
  def change
    add_column :users, :session_token, :string, null: false, default: -> { "md5((random())::text)" }
    add_index :users, :session_token, unique: true
  end
end
