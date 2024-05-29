# This file should ensure the existence of records required to run the application in every environment (production,
# development, test). The code here should be idempotent so that it can be executed at any point in every environment.
# The data can then be loaded with the bin/rails db:seed command (or created alongside the database with db:setup).
#
# Example:
#
#   ["Action", "Comedy", "Drama", "Horror"].each do |genre_name|
#     MovieGenre.find_or_create_by!(name: genre_name)
#   end

ApplicationRecord.transaction do
  bernie = User.create!(username: "bernieHall", password: "Password.1")

  FactoryBot.create(:task, author: bernie)
  FactoryBot.create(:task, author: bernie)
  FactoryBot.create(:task, :timed, author: bernie)
  FactoryBot.create(:task, :past_due, author: bernie)
  FactoryBot.create(:task, :past_due, author: bernie)
  FactoryBot.create(:task, :completed, author: bernie)

  serena = User.create!(username: "serenaRodgers", password: "Password.2")

  FactoryBot.create(:task, :timed, author: serena)
  FactoryBot.create(:task, :past_due, author: serena)
  FactoryBot.create(:task, :completed, author: serena)
end
