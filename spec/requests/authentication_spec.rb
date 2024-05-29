require "rails_helper"

RSpec.describe "Authentication" do
  let(:token) { "123" }

  before do
    allow_any_instance_of(User).to receive(:to_sgid).and_return(token)
  end

  describe "Login" do
    let!(:user) { create(:user) }
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
    let(:params) do
      {
        query: login_mutation,
        variables: {
          username: user.username,
          password: user.password
        }
      }
    end

    it "returns the user data with their signed Global ID as a token" do
      post("/graphql", params:)

      expect(response.parsed_body["errors"]).to be_nil
      expect(response.parsed_body["data"].deep_symbolize_keys).to eq(
        {
          login: {
            id: user.id.to_s,
            username: user.username,
            token:
          }
        }
      )
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
    let(:params) do
      {
        query: register_mutation,
        variables: {
          username:,
          password:
        }
      }
    end

    it "returns the user with their signed Global ID as a token" do
      post("/graphql", params:)

      expect(response.parsed_body["errors"]).to be_nil
      expect(response.parsed_body["data"].deep_symbolize_keys).to eq(
        {
          register: {
            username:,
            token:
          }
        }
      )
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
end
