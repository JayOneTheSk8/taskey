require "rails_helper"

RSpec.describe Task do
  let(:task) { build(:task) }

  describe "#valid?" do
    %w[
      title
      description
    ].each do |attr|
      it "is invalid with a nil #{attr}" do
        task.assign_attributes(attr => nil)
        expect(task).not_to be_valid
        expect(
          task.errors.full_messages.map(&:downcase)
        ).to include "#{attr.gsub('_', ' ')} can't be blank"
      end
    end

    it "must have an author" do
      task.author_id = nil
      expect(task).not_to be_valid
      expect(
        task.errors.full_messages
      ).to include "Author must exist"
    end

    it "must have a boolean completed" do
      task.completed = nil
      expect(task).not_to be_valid
      expect(
        task.errors.full_messages
      ).to include "Completed must be true or false"
    end
  end

  describe "#complete!" do
    context "when task is already completed" do
      let!(:t) { create(:task, :completed) }

      it "does nothing" do
        expect(t).not_to receive(:save!)
        expect { t.complete! }.not_to change { t.completed? }
      end
    end

    context "when task is incomplete" do
      let!(:t) { create(:task) }

      it "sets the task's completed to true" do
        expect(t).to receive(:save!)
        expect { t.complete! }.to change { t.completed? }.from(false).to(true)
      end
    end
  end

  describe "#completed?" do
    context "when task is completed" do
      let!(:t) { create(:task, :completed) }

      it "returns true" do
        expect(t.completed?).to be true
      end
    end

    context "when task is incomplete" do
      let!(:t) { create(:task) }

      it "returns false" do
        expect(t.completed?).to be false
      end
    end
  end

  describe "#mark_incomplete!" do
    context "when task is incomplete" do
      let!(:t) { create(:task) }

      it "does nothing" do
        expect(t).not_to receive(:save!)
        expect { t.mark_incomplete! }.not_to change { t.completed? }
      end
    end

    context "when task is completed" do
      let!(:t) { create(:task, :completed) }

      it "sets the task's completed to false" do
        expect(t).to receive(:save!)
        expect { t.mark_incomplete! }.to change { t.completed? }.from(true).to(false)
      end
    end
  end

  describe "#incomplete?" do
    context "when task is completed" do
      let!(:t) { create(:task, :completed) }

      it "returns false" do
        expect(t.incomplete?).to be false
      end
    end

    context "when task is incomplete" do
      let!(:t) { create(:task) }

      it "returns true" do
        expect(t.incomplete?).to be true
      end
    end
  end
end
