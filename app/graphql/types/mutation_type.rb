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

    field(
      :create_task,
      Types::TaskType,
      null: false,
      description: "Creates a task for the current user"
    ) do
      argument :title, String, required: true
      argument :description, String, required: true
      argument :due_date, GraphQL::Types::ISO8601Date, required: false
    end
    def create_task(title:, description:, due_date: nil)
      verify_authentication!
      task = Task.new(title:, description:, due_date:, author: current_user)
      raise GraphQL::ExecutionError, task.errors.full_messages.join(", ") unless task.save

      task
    end

    field(
      :update_task,
      Types::TaskType,
      null: false,
      description: "Updates a task if it belongs to the current user"
    ) do
      argument :id, ID, required: true
      argument :title, String, required: true
      argument :description, String, required: true
      argument :due_date, GraphQL::Types::ISO8601Date, required: false
    end
    def update_task(id:, title:, description:, due_date: nil)
      verify_authentication!
      task = Task.find_by(id:)

      validate_task!(task, "update")

      # Update task
      unless task.update(title:, description:, due_date:)
        raise GraphQL::ExecutionError, task.errors.full_messages.join(", ")
      end

      task
    end

    field(
      :delete_task,
      ID,
      null: false,
      description: "Deletes a task if it belongs to the current user"
    ) do
      argument :id, ID, required: true
    end
    def delete_task(id:)
      verify_authentication!
      task = Task.find_by(id:)

      validate_task!(task, "delete")

      # Delete task
      raise GraphQL::ExecutionError, task.errors.full_messages.join(", ") unless task.destroy

      task.id
    end

    field(
      :complete_task,
      Types::TaskType,
      null: false,
      description: "Completes a task if it belongs to the current user"
    ) do
      argument :id, ID, required: true
    end
    def complete_task(id:)
      verify_authentication!
      task = Task.find_by(id:)

      validate_task!(task, "manage")
      task.complete!
      task
    rescue StandardError => e
      raise GraphQL::ExecutionError, e.message
    end

    field(
      :mark_task_incomplete,
      Types::TaskType,
      null: false,
      description: "Marks a task incomplete if it belongs to the current user"
    ) do
      argument :id, ID, required: true
    end
    def mark_task_incomplete(id:)
      verify_authentication!
      task = Task.find_by(id:)

      validate_task!(task, "manage")
      task.mark_incomplete!
      task
    rescue StandardError => e
      raise GraphQL::ExecutionError, e.message
    end

    private

    def validate_task!(task, operation)
      # Validate task exists
      raise GraphQL::ExecutionError, "Could not find Task" if task.blank?
      # Validate task belongs to user
      raise GraphQL::ExecutionError, "Cannot #{operation} others' Tasks" unless task.author_id == current_user.id
    end
  end
end
