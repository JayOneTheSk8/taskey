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

    field(
      :logout,
      ID,
      null: false,
      description: "Logs the user out by resetting their session token"
    )
    def logout
      verify_authentication!
      reset_session!
      current_user.reset_session_token!
      current_user.id
    end

    field(
      :update_username,
      Types::UserType,
      null: false,
      description: "Updates a user's username"
    ) do
      argument :username, String, required: true
    end
    def update_username(username:)
      verify_authentication!
      raise GraphQL::ExecutionError, current_user.errors.full_messages.join(", ") unless current_user.update(username:)

      current_user
    end

    field(
      :delete_user,
      ID,
      null: false,
      description: "Deletes the logged in user and logs them out"
    )
    def delete_user
      verify_authentication!
      raise GraphQL::ExecutionError, current_user.errors.full_messages.join(", ") unless current_user.destroy

      reset_session!
      current_user.id
    end
  end
end
