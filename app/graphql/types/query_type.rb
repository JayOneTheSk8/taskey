# frozen_string_literal: true

module Types
  class QueryType < Types::BaseObject
    field :me, Types::UserType, null: false, description: "Data on the current logged in user"
    def me
      verify_authentication!
      current_user
    end
  end
end
