# frozen_string_literal: true

module Types
  class BaseObject < GraphQL::Schema::Object
    edge_type_class(Types::BaseEdge)
    connection_type_class(Types::BaseConnection)
    field_class Types::BaseField

    private

    def current_user
      context[:current_user]
    end

    def verify_authentication!
      raise GraphQL::ExecutionError, "Must be signed in!" if current_user.blank?
    end
  end
end
