class Task < ApplicationRecord
  belongs_to :author, class_name: :User

  validates :title, :description, presence: true
  validates :completed, inclusion: {in: [true, false], message: "must be true or false"}

  def complete!
    update!(completed: true) if incomplete?
  end

  def mark_incomplete!
    update!(completed: false) unless incomplete?
  end

  def incomplete?
    !completed?
  end
end
