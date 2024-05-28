class User < ApplicationRecord
  # Use password digest
  has_secure_password

  validates :password, length: { minimum: 6 }, if: :password_digest_changed?

  validates(
    :username,
    format: {with: /\A[\w\-\.]+\z/}, # can only include letters and "-" or "."
    presence: true,
    uniqueness: true,
    length: {minimum: 4, maximum: 50}
  )
end
