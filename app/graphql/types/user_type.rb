# frozen_string_literal: true

module Types
  class UserType < Types::BaseObject
    field :id, ID, null: false
    field :username, String, null: false
    field :pending_tasks, [TaskType], null: false
    field :completed_tasks, [TaskType], null: false
    field :token, String, description: "The session_token for the user; only present on login."
    field :created_at, GraphQL::Types::ISO8601DateTime, null: false
    field :updated_at, GraphQL::Types::ISO8601DateTime, null: false
  end
end
