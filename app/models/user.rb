class User < ApplicationRecord
  # For use with login and register mutations
  attr_accessor :token

  # Use password digest
  has_secure_password

  # Pending tasks should be ordered by due date to prioritise past due tasks
  has_many(
    :pending_tasks,
    -> { where(completed: false).order(due_date: :asc, id: :desc) },
    class_name: :Task,
    foreign_key: :author_id,
    dependent: :destroy
  )
  # Completed tasks should be ordered by id as due date isn't priority
  has_many(
    :completed_tasks,
    -> { where(completed: true).order(id: :desc) },
    class_name: :Task,
    foreign_key: :author_id,
    dependent: :destroy
  )

  after_initialize :ensure_session_token!

  validates :session_token, presence: true, uniqueness: true
  validates :password, length: { minimum: 6 }, if: :password_digest_changed?
  validates(
    :username,
    format: {with: /\A[\w\-\.]+\z/}, # can only include letters and "-" or "."
    presence: true,
    uniqueness: true,
    length: {minimum: 4, maximum: 50}
  )

  def self.find_by_credentials(username, password)
    User.where(username:).first&.authenticate(password).presence
  end

  def reset_session_token!
    self.session_token = SecureRandom.urlsafe_base64(32)
    save!
    session_token
  end

  private

  def ensure_session_token!
    self.session_token ||= SecureRandom.urlsafe_base64(32)
  end
end
