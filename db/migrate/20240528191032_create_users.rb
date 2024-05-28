class CreateUsers < ActiveRecord::Migration[7.1]
  def change
    create_table :users do |t|
      t.citext :username, null: false
      t.string :password_digest, null: false

      t.index :username, unique: true

      t.timestamps
    end
  end
end
