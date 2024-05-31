# frozen_string_literal: true

module Types
  class UserType < Types::BaseObject
    field :id, ID, null: false
    field :username, String, null: false
    field :created_at, GraphQL::Types::ISO8601DateTime, null: false
    field :updated_at, GraphQL::Types::ISO8601DateTime, null: false

    field :token, String, description: "The session_token for the user; only present on login."
    field(
      :pending_tasks,
      [TaskType],
      null: false,
      description: "List of pending tasks sorted by ascending due date"
    )
    field(
      :completed_tasks,
      [TaskType],
      null: false,
      description: "List of completed tasks sorted by ID (and by proxy creation date)"
    )
  end
end
