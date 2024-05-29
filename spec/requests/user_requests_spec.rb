require "rails_helper"

RSpec.describe "User Requests" do
  let(:login_mutation) do
    <<~GRAPHQL
      mutation Login($username: String!, $password: String!) {
        login(username: $username, password: $password) {
          id
          username
          token
        }
      }
    GRAPHQL
  end

  describe "Update Username" do
    let!(:user) { create(:user) }
    let(:og_username) { user.username }
    let(:updated_username) { "NewUsername" }

    let(:update_username_mutation) do
      <<~GRAPHQL
        mutation UpdateUsername($username: String!) {
          updateUsername(username: $username) {
            id
            username
            token
          }
        }
      GRAPHQL
    end

    context "when user is logged in" do
      before do
        post(
          "/graphql",
          params: {
            query: login_mutation,
            variables: {username: user.username, password: user.password}
          }
        )
        user.reload
      end

      it "updates the logged in user's username" do
        expect do
          post(
            "/graphql",
            params: {query: update_username_mutation, variables: {username: updated_username}},
            headers: {"Authorization" => user.session_token}
          )
        end
          .to change { user.reload.username }.from(og_username).to(updated_username)

        expect(response.parsed_body["errors"]).to be_nil
        expect(response.parsed_body["data"].deep_symbolize_keys).to eq(
          {
            updateUsername: {
              id: user.id.to_s,
              username: updated_username,
              token: nil
            }
          }
        )
      end

      context "when username is invalid" do
        it "returns an error" do
          post(
            "/graphql",
            params: {query: update_username_mutation, variables: {username: "Coo"}},
            headers: {"Authorization" => user.session_token}
          )

          expect(response.parsed_body["data"]).to be_nil
          expect(response.parsed_body.dig("errors", 0, "message"))
            .to eq("Username is too short (minimum is 4 characters)")
        end
      end
    end

    context "when user is not logged in" do
      it "returns an error" do
        expect do
          post(
            "/graphql",
            params: {query: update_username_mutation, variables: {username: updated_username}},
            headers: {"Authorization" => user.session_token}
          )
        end
          .not_to change { user.reload.username }

        expect(response.parsed_body["data"]).to be_nil
        expect(response.parsed_body.dig("errors", 0, "message"))
          .to eq("Must be signed in!")
      end
    end
  end

  describe "Delete User" do
    let!(:user) { create(:user) }
    let(:delete_user_mutation) do
      <<~GRAPHQL
        mutation DeleteUser {
          deleteUser
        }
      GRAPHQL
    end

    context "when user is logged in" do
      before do
        post(
          "/graphql",
          params: {
            query: login_mutation,
            variables: {username: user.username, password: user.password}
          }
        )
        user.reload
      end

      it "deletes the logged in user from the database" do
        expect do
          post(
            "/graphql",
            params: {query: delete_user_mutation},
            headers: {"Authorization" => user.session_token}
          )
        end
          .to change { User.find_by(id: user.id).present? }.from(true).to(false)

        expect(response.parsed_body.dig("data", "deleteUser")).to eq(user.id.to_s)
        expect(response.parsed_body["errors"]).to be_nil
      end

      it "resets the session" do
        post(
          "/graphql",
          params: {query: delete_user_mutation},
          headers: {"Authorization" => user.session_token}
        )
        expect(session[:session_token]).to be_nil
      end

      context "when there is an issue deleting the user" do
        before do
          allow_any_instance_of(User).to receive(:destroy).and_return(false)
          allow_any_instance_of(User)
            .to receive(:errors)
            .and_return(
              double(:error_messages, full_messages: ["Something bad happened"])
            )
        end

        it "returns an error" do
          expect do
            post(
              "/graphql",
              params: {query: delete_user_mutation},
              headers: {"Authorization" => user.session_token}
            )
          end
            .not_to change { User.find_by(id: user.id).present? }

          expect(response.parsed_body["data"]).to be_nil
          expect(response.parsed_body.dig("errors", 0, "message")).to eq("Something bad happened")
        end
      end
    end

    context "when user is not logged in" do
      it "returns an error" do
        post(
          "/graphql",
          params: {query: delete_user_mutation},
          headers: {"Authorization" => user.session_token}
        )

        expect(response.parsed_body["data"]).to be_nil
        expect(response.parsed_body.dig("errors", 0, "message")).to eq("Must be signed in!")
      end
    end
  end
end
