require "rails_helper"

RSpec.describe User do
  let(:user) { build(:user) }

  describe "#valid?" do
    %w[
      username
      password
    ].each do |attr|
      it "is invalid with a nil #{attr}" do
        user.assign_attributes(attr => nil)
        expect(user).not_to be_valid
        expect(
          user.errors.full_messages.map(&:downcase)
        ).to include "#{attr.gsub('_', ' ')} can't be blank"
      end
    end

    describe "username attribute" do
      it "does not allow username longer than 50 characters" do
        user.assign_attributes(username: "x" * 51)
        expect(user).not_to be_valid
        expect(
          user.errors.full_messages
        ).to include "Username is too long (maximum is 50 characters)"
      end

      it "does not allow username shorter than 4 characters" do
        user.assign_attributes(username: "ooo")
        expect(user).not_to be_valid
        expect(
          user.errors.full_messages
        ).to include "Username is too short (minimum is 4 characters)"
      end

      it "allows usernames with periods, hyphens, and underscores" do
        user.assign_attributes(username: "-s0me_0ne.")
        expect(user).to be_valid
      end

      it "does not allow usernames with spaces" do
        user.assign_attributes(username: "-s0me 0ne.")
        expect(user).not_to be_valid
      end

      it "does not allow usernames with other characters" do
        %w[? ! @ # $ % ^ & * ( ) + ~ / \\ ].each do |chr|
          user.assign_attributes(username: "-s0me_0ne.#{chr}")
          expect(user).not_to be_valid
        end
      end
    end

    describe "password attribute" do
      it "does not allow password shorter than 6 characters" do
        user.assign_attributes(password: "xoxox")
        expect(user).not_to be_valid
        expect(
          user.errors.full_messages
        ).to include "Password is too short (minimum is 6 characters)"
      end

      context "when password is updated" do
        before { user.save! }

        it "does not allow password shorter than 6 characters" do
          reloaded_user = described_class.find(user.id)
          reloaded_user.password = "newun"

          expect(reloaded_user).not_to be_valid
          expect(
            reloaded_user.errors.full_messages
          ).to include "Password is too short (minimum is 6 characters)"
        end
      end
    end
  end

  describe "after_initialize" do
    it "gives the user a session_token" do
      u = described_class.new
      expect(u.session_token).to be_present
    end
  end

  describe ".find_by_credentials" do
    let(:password) { "G00d+im3s" }
    let!(:u) { create(:user, password:) }

    it "finds the user by username" do
      expect(described_class.find_by_credentials(u.username, password)).to eq u
    end

    it "is case-insensitive" do
      expect(described_class.find_by_credentials(u.username.upcase, password)).to eq u
    end

    context "when the credentials are incorrect" do
      it "returns nil" do
        expect(described_class.find_by_credentials(u.username, "password")).to be_nil
      end
    end

    context "when username does not exist" do
      it "returns nil" do
        expect(described_class.find_by_credentials("some-one", "password")).to be_nil
      end
    end
  end

  describe "#reset_session_token!" do
    let!(:u) { create(:user) }

    it "changes the user's session token" do
      expect { u.reset_session_token! }
        .to change { u.reload.session_token }
        .and change { u.reload.updated_at }
    end

    it "returns the new session_token" do
      old_session_token = u.session_token
      expect(u.reset_session_token!).not_to eq(old_session_token)
    end
  end
end
