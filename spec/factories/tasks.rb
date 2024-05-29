FactoryBot.define do
  factory :task do
    sequence(:title) { |n| "Task ##{n}" }

    description { Faker::Quote.yoda }
    completed { false }
    author { create(:user) }

    trait :timed do
      due_date { Date.current + 1.day }
    end

    trait :past_due do
      due_date { Date.current - 1.day }
    end

    trait :completed do
      completed { true }
    end
  end
end
