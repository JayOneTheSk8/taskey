class Task < ApplicationRecord
  belongs_to :author, class_name: :User

  validates :title, :description, presence: true
  validates :completed, inclusion: {in: [true, false], message: "must be true or false"}
end
