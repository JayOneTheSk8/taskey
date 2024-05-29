# frozen_string_literal: true

module Types
  class MutationType < Types::BaseObject
    field(
      :login,
      Types::UserType,
      null: false,
      description: "Logs a User in via session token."
    ) do
      argument :username, String, required: true
      argument :password, String, required: true
    end
    def login(username:, password:)
      user = User.find_by_credentials(username, password)
      raise GraphQL::ExecutionError, "Invalid username or password" unless user

      login!(user)
    end

    field(
      :register,
      Types::UserType,
      null: false,
      description: "Creates a User then logs them in via session token"
    ) do
      argument :username, String, required: true
      argument :password, String, required: true
    end
    def register(username:, password:)
      user = User.new(username:, password:)
      raise GraphQL::ExecutionError, user.errors.full_messages.join(", ") unless user.save

      login!(user)
    end
  end
end
