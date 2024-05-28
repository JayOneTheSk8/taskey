FactoryBot.define do
  factory :user do
    sequence(:username) { |n| "user#{n}" }
    password { "Something123!" }
  end
end
