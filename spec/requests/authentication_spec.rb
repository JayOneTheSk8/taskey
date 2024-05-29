require "rails_helper"

RSpec.describe "Authentication" do
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
  let(:register_mutation) do
    <<~GRAPHQL
      mutation Register($username: String!, $password: String!) {
        register(username: $username, password: $password) {
          username
          token
        }
      }
    GRAPHQL
  end
  let(:logout_mutation) do
    <<~GRAPHQL
      mutation Logout {
        logout
      }
    GRAPHQL
  end

  describe "Login" do
    let!(:user) { create(:user) }
    let(:params) do
      {
        query: login_mutation,
        variables: {
          username: user.username,
          password: user.password
        }
      }
    end

    it "returns the user data with their session_token as a token" do
      post("/graphql", params:)
      user.reload

      expect(response.parsed_body["errors"]).to be_nil
      expect(response.parsed_body["data"].deep_symbolize_keys).to eq(
        {
          login: {
            id: user.id.to_s,
            username: user.username,
            token: user.session_token
          }
        }
      )
    end

    it "logs the user in" do
      post("/graphql", params:)
      user.reload

      expect(session[:session_token]).to eq(user.session_token)
    end

    context "when password is incorrect" do
      it "returns an error" do
        post("/graphql", params: params.deep_merge(variables: {password: "wrong"}))

        expect(response.parsed_body["data"]).to be_nil
        expect(response.parsed_body.dig("errors", 0, "message"))
          .to eq("Invalid username or password")
      end
    end

    context "when user does not exist" do
      it "returns an error" do
        post("/graphql", params: params.deep_merge(variables: {username: "someonenothere"}))

        expect(response.parsed_body["data"]).to be_nil
        expect(response.parsed_body.dig("errors", 0, "message"))
          .to eq("Invalid username or password")
      end
    end
  end

  describe "Register" do
    let(:username) { "HowardPerson" }
    let(:password) { "h0w@rdP3r$0n" }

    let(:params) do
      {
        query: register_mutation,
        variables: {
          username:,
          password:
        }
      }
    end

    it "returns the user with their session_token as a token" do
      post("/graphql", params:)
      user = User.last

      expect(response.parsed_body["errors"]).to be_nil
      expect(response.parsed_body["data"].deep_symbolize_keys).to eq(
        {
          register: {
            username:,
            token: user.session_token
          }
        }
      )
    end

    it "logs the user in" do
      post("/graphql", params:)
      user = User.last

      expect(session[:session_token]).to eq(user.session_token)
    end

    context "when the username is taken" do
      before { create(:user, username:, password:) }

      it "returns an error" do
        post("/graphql", params:)

        expect(response.parsed_body["data"]).to be_nil
        expect(response.parsed_body.dig("errors", 0, "message")).to eq("Username has already been taken")
      end
    end

    context "when the username is invalid" do
      it "returns an error" do
        post("/graphql", params: params.deep_merge(variables: {username: "some one"}))

        expect(response.parsed_body["data"]).to be_nil
        expect(response.parsed_body.dig("errors", 0, "message")).to eq("Username is invalid")
      end
    end

    context "when the password is too short" do
      it "returns an error" do
        post("/graphql", params: params.deep_merge(variables: {password: "some"}))

        expect(response.parsed_body["data"]).to be_nil
        expect(response.parsed_body.dig("errors", 0, "message"))
          .to eq("Password is too short (minimum is 6 characters)")
      end
    end
  end

  describe "Logout" do
    context "when user is logged in" do
      let!(:user) { create(:user) }

      before do
        post(
          "/graphql",
          params: {
            query: login_mutation,
            variables: {
              username: user.username,
              password: user.password
            }
          }
        )
        user.reload
      end

      it "returns the logged in user's id" do
        post("/graphql", params: {query: logout_mutation}, headers: {"Authorization" => user.session_token })
        expect(response.parsed_body["errors"]).to be_nil
        expect(response.parsed_body["data"]["logout"]).to eq(user.id.to_s)
      end

      it "resets the user's session token" do
        expect { post("/graphql", params: {query: logout_mutation}, headers: {"Authorization" => user.session_token }) }
          .to change { user.reload.session_token }
      end

      it "nullifies the session's token" do
        expect { post("/graphql", params: {query: logout_mutation}, headers: {"Authorization" => user.session_token }) }
          .to change { session[:session_token] }.to(nil)
      end
    end

    context "when no user is logged in" do
      it "returns an error" do
        post("/graphql", params: {query: logout_mutation})
        expect(response.parsed_body.dig("data", "logout")).to be_nil
        expect(response.parsed_body.dig("errors", 0, "message")).to eq("Must be signed in!")
      end
    end
  end
end
