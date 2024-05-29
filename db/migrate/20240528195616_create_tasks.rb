class CreateTasks < ActiveRecord::Migration[7.1]
  def change
    create_table :tasks do |t|
      t.string :title, null: false
      t.text :description, null: false
      t.boolean :completed, null: false, default: false
      t.date :due_date

      t.references :author, foreign_key: {to_table: :users}, null: false

      t.timestamps
    end
  end
end
