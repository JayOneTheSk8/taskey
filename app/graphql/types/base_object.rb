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

    def session
      context[:session]
    end

    def logged_in?
      !!current_user
    end

    def verify_authentication!
      raise GraphQL::ExecutionError, "Must be signed in!" if current_user.blank?
    end

    def login!(user)
      session[:session_token] = user.reset_session_token!
      user.token = session[:session_token]
      user
    end

    def reset_session!
      session[:session_token] = nil
    end
  end
end
