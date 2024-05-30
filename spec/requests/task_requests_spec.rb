require "rails_helper"

RSpec.describe "Task Requests" do
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

  describe "Create Task" do
    let!(:user) { create(:user) }
    let(:title) { Faker::Lorem.sentence }
    let(:description) { Faker::Quote.yoda }
    let(:due_date) { (Date.current + 1.day).strftime("%Y-%m-%d") }

    let(:create_task_mutation) do
      <<~GRAPHQL
        mutation CreateTask($title: String!, $description: String!, $dueDate: ISO8601Date) {
          createTask(title: $title, description: $description, dueDate: $dueDate) {
            id
            title
            description
            dueDate
            completed
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

      it "creates a new task based on the passed arguments" do
        expect do
          post(
            "/graphql",
            params: {
              query: create_task_mutation,
              variables: {
                title:,
                description:,
                dueDate: due_date
              }
            },
            headers: {"Authorization" => user.session_token}
          )
        end
          .to change { Task.count }.by(1)

        task = Task.last
        expect(response.parsed_body["errors"]).to be_nil
        expect(response.parsed_body["data"].deep_symbolize_keys).to eq(
          {
            createTask: {
              id: task.id.to_s,
              title: task.title,
              description: task.description,
              dueDate: task.due_date.strftime("%Y-%m-%d"),
              completed: false
            }
          }
        )
      end

      it "does not require a passed due_date" do
        expect do
          post(
            "/graphql",
            params: {
              query: create_task_mutation,
              variables: {
                title:,
                description:
              }
            },
            headers: {"Authorization" => user.session_token}
          )
        end
          .to change { Task.count }.by(1)

        task = Task.last
        expect(response.parsed_body["errors"]).to be_nil
        expect(response.parsed_body["data"].deep_symbolize_keys).to eq(
          {
            createTask: {
              id: task.id.to_s,
              title: task.title,
              description: task.description,
              dueDate: nil,
              completed: false
            }
          }
        )
      end

      context "when the task could not be saved" do
        it "returns an error" do
          expect do
            post(
              "/graphql",
              params: {
                query: create_task_mutation,
                variables: {
                  title: "",
                  description:
                }
              },
              headers: {"Authorization" => user.session_token}
            )
          end
            .not_to change { Task.count }

          expect(response.parsed_body["data"]).to be_nil
          expect(response.parsed_body.dig("errors", 0, "message")).to eq("Title can't be blank")
        end
      end
    end

    context "when user is not logged in" do
      it "returns an error" do
        expect do
          post(
            "/graphql",
            params: {
              query: create_task_mutation,
              variables: {
                title:,
                description:
              }
            },
            headers: {"Authorization" => user.session_token}
          )
        end
          .not_to change { Task.count }

        expect(response.parsed_body["data"]).to be_nil
        expect(response.parsed_body.dig("errors", 0, "message")).to eq("Must be signed in!")
      end
    end
  end

  describe "Update Task" do
    let!(:user) { create(:user) }
    let!(:task) { create(:task, author: user) }

    let(:title) { Faker::Lorem.sentence }
    let(:description) { Faker::Quote.yoda }
    let(:due_date) { (Date.current + 1.day).strftime("%Y-%m-%d") }

    let(:update_task_mutation) do
      <<~GRAPHQL
        mutation UpdateTask($id: ID!, $title: String!, $description: String!, $dueDate: ISO8601Date) {
          updateTask(id: $id, title: $title, description: $description, dueDate: $dueDate) {
            id
            title
            description
            dueDate
            completed
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

      it "updates the task based on the passed arguments" do
        expect do
          post(
            "/graphql",
            params: {
              query: update_task_mutation,
              variables: {
                id: task.id,
                title:,
                description:,
                dueDate: due_date
              }
            },
            headers: {"Authorization" => user.session_token}
          )
        end
          .not_to change { Task.count }

        task.reload
        expect(response.parsed_body["errors"]).to be_nil
        expect(response.parsed_body["data"].deep_symbolize_keys).to eq(
          {
            updateTask: {
              id: task.id.to_s,
              title:,
              description:,
              dueDate: due_date,
              completed: false
            }
          }
        )
      end

      context "when task does not exist at the given ID" do
        it "returns an error" do
          post(
            "/graphql",
            params: {
              query: update_task_mutation,
              variables: {
                id: 0,
                title:,
                description:,
                dueDate: due_date
              }
            },
            headers: {"Authorization" => user.session_token}
          )

          expect(response.parsed_body["data"]).to be_nil
          expect(response.parsed_body.dig("errors", 0, "message")).to eq("Could not find Task")
        end
      end

      context "when the task does not belong to the logged in user" do
        let!(:task2) { create(:task) }

        it "returns an error" do
          post(
            "/graphql",
            params: {
              query: update_task_mutation,
              variables: {
                id: task2.id,
                title:,
                description:,
                dueDate: due_date
              }
            },
            headers: {"Authorization" => user.session_token}
          )

          expect(response.parsed_body["data"]).to be_nil
          expect(response.parsed_body.dig("errors", 0, "message")).to eq("Cannot update others' Tasks")
        end
      end

      context "when task could not be saved" do
        before do
          allow_any_instance_of(Task).to receive(:update).and_return(false)
          allow_any_instance_of(Task)
            .to receive(:errors)
            .and_return(
              double(:error_messages, full_messages: ["Something bad happened"])
            )
        end

        it "returns an error" do
          post(
            "/graphql",
            params: {
              query: update_task_mutation,
              variables: {
                id: task.id,
                title:,
                description:,
                dueDate: due_date
              }
            },
            headers: {"Authorization" => user.session_token}
          )

          expect(response.parsed_body["data"]).to be_nil
          expect(response.parsed_body.dig("errors", 0, "message")).to eq("Something bad happened")
        end
      end
    end

    context "when user is not logged in" do
      it "returns an error" do
        post(
          "/graphql",
          params: {
            query: update_task_mutation,
            variables: {
              id: task.id,
              title:,
              description:,
              dueDate: due_date
            }
          },
          headers: {"Authorization" => user.session_token}
        )

        expect(response.parsed_body["data"]).to be_nil
        expect(response.parsed_body.dig("errors", 0, "message")).to eq("Must be signed in!")
      end
    end
  end

  describe "Delete Task" do
    let!(:user) { create(:user) }
    let!(:task) { create(:task, author: user) }

    let(:delete_task_mutation) do
      <<~GRAPHQL
        mutation DeleteTask($id: ID!) {
          deleteTask(id: $id)
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

      it "deletes the task at the given ID" do
        expect do
          post(
            "/graphql",
            params: {
              query: delete_task_mutation,
              variables: {
                id: task.id
              }
            },
            headers: {"Authorization" => user.session_token}
          )
        end
          .to change { Task.count }.by(-1)
          .and change { Task.find_by(id: task.id).present? }.from(true).to(false)

        expect(response.parsed_body["errors"]).to be_nil
        expect(response.parsed_body.dig("data", "deleteTask")).to eq(task.id.to_s)
      end

      context "when task does not exist at the given ID" do
        it "returns an error" do
          expect do
            post(
              "/graphql",
              params: {
                query: delete_task_mutation,
                variables: {
                  id: 0
                }
              },
              headers: {"Authorization" => user.session_token}
            )
          end
            .not_to change { Task.count }

          expect(response.parsed_body["data"]).to be_nil
          expect(response.parsed_body.dig("errors", 0, "message")).to eq("Could not find Task")
        end
      end

      context "when the task does not belong to the logged in user" do
        let!(:task2) { create(:task) }

        it "returns an error" do
          expect do
            post(
              "/graphql",
              params: {
                query: delete_task_mutation,
                variables: {
                  id: task2.id
                }
              },
              headers: {"Authorization" => user.session_token}
            )
          end
            .not_to change { Task.count }

          expect(response.parsed_body["data"]).to be_nil
          expect(response.parsed_body.dig("errors", 0, "message")).to eq("Cannot delete others' Tasks")
        end
      end

      context "when task could not be deleted" do
        before do
          allow_any_instance_of(Task).to receive(:destroy).and_return(false)
          allow_any_instance_of(Task)
            .to receive(:errors)
            .and_return(
              double(:error_messages, full_messages: ["Something bad happened"])
            )
        end

        it "returns an error" do
          expect do
            post(
              "/graphql",
              params: {
                query: delete_task_mutation,
                variables: {
                  id: task.id
                }
              },
              headers: {"Authorization" => user.session_token}
            )
          end
            .not_to change { Task.count }

          expect(response.parsed_body["data"]).to be_nil
          expect(response.parsed_body.dig("errors", 0, "message")).to eq("Something bad happened")
        end
      end
    end

    context "when user is not logged in" do
      it "returns an error" do
        expect do
          post(
            "/graphql",
            params: {
              query: delete_task_mutation,
              variables: {
                id: task.id
              }
            },
            headers: {"Authorization" => user.session_token}
          )
        end
          .not_to change { Task.count }

        expect(response.parsed_body["data"]).to be_nil
        expect(response.parsed_body.dig("errors", 0, "message")).to eq("Must be signed in!")
      end
    end
  end

  describe "Complete Task" do
    let!(:user) { create(:user) }
    let!(:task) { create(:task, author: user) }

    let(:complete_task_mutation) do
      <<~GRAPHQL
        mutation CompleteTask($id: ID!) {
          completeTask(id: $id) {
            id
            completed
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

      it "completes the task at the given ID" do
        expect do
          post(
            "/graphql",
            params: {
              query: complete_task_mutation,
              variables: {
                id: task.id
              }
            },
            headers: {"Authorization" => user.session_token}
          )
        end
          .to change { task.reload.completed? }.from(false).to(true)

        expect(response.parsed_body["errors"]).to be_nil
        expect(response.parsed_body["data"].deep_symbolize_keys).to eq(
          {
            completeTask: {
              id: task.id.to_s,
              completed: true
            }
          }
        )
      end

      context "when task does not exist at the given ID" do
        it "returns an error" do
          post(
            "/graphql",
            params: {
              query: complete_task_mutation,
              variables: {
                id: 0
              }
            },
            headers: {"Authorization" => user.session_token}
          )

          expect(response.parsed_body["data"]).to be_nil
          expect(response.parsed_body.dig("errors", 0, "message")).to eq("Could not find Task")
        end
      end

      context "when the task does not belong to the logged in user" do
        let!(:task2) { create(:task) }

        it "returns an error" do
          post(
            "/graphql",
            params: {
              query: complete_task_mutation,
              variables: {
                id: task2.id
              }
            },
            headers: {"Authorization" => user.session_token}
          )

          expect(response.parsed_body["data"]).to be_nil
          expect(response.parsed_body.dig("errors", 0, "message")).to eq("Cannot manage others' Tasks")
        end
      end

      context "when the task cannot be completed" do
        before do
          allow_any_instance_of(Task).to receive(:update!).and_raise("Something bad happened")
        end

        it "returns an error" do
          expect do
            post(
              "/graphql",
              params: {
                query: complete_task_mutation,
                variables: {
                  id: task.id
                }
              },
              headers: {"Authorization" => user.session_token}
            )
          end
            .not_to change { task.reload.completed? }

          expect(response.parsed_body["data"]).to be_nil
          expect(response.parsed_body.dig("errors", 0, "message")).to eq("Something bad happened")
        end
      end
    end

    context "when user is not logged in" do
      it "returns an error" do
        expect do
          post(
            "/graphql",
            params: {
              query: complete_task_mutation,
              variables: {
                id: task.id
              }
            },
            headers: {"Authorization" => user.session_token}
          )
        end
          .not_to change { task.reload.completed? }

        expect(response.parsed_body["data"]).to be_nil
        expect(response.parsed_body.dig("errors", 0, "message")).to eq("Must be signed in!")
      end
    end
  end

  describe "Mark Task Incomplete" do
    let!(:user) { create(:user) }
    let!(:task) { create(:task, :completed, author: user) }

    let(:mark_task_incomplete_mutation) do
      <<~GRAPHQL
        mutation MarkTaskIncomplete($id: ID!) {
          markTaskIncomplete(id: $id) {
            id
            completed
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

      it "marks the task at the given ID as incomplete" do
        expect do
          post(
            "/graphql",
            params: {
              query: mark_task_incomplete_mutation,
              variables: {
                id: task.id
              }
            },
            headers: {"Authorization" => user.session_token}
          )
        end
          .to change { task.reload.completed? }.from(true).to(false)

        expect(response.parsed_body["errors"]).to be_nil
        expect(response.parsed_body["data"].deep_symbolize_keys).to eq(
          {
            markTaskIncomplete: {
              id: task.id.to_s,
              completed: false
            }
          }
        )
      end

      context "when task does not exist at the given ID" do
        it "returns an error" do
          expect do
            post(
              "/graphql",
              params: {
                query: mark_task_incomplete_mutation,
                variables: {
                  id: 0
                }
              },
              headers: {"Authorization" => user.session_token}
            )
          end
            .not_to change { task.reload.completed? }

          expect(response.parsed_body["data"]).to be_nil
          expect(response.parsed_body.dig("errors", 0, "message")).to eq("Could not find Task")
        end
      end

      context "when the task does not belong to the logged in user" do
        let!(:task2) { create(:task) }

        it "returns an error" do
          post(
            "/graphql",
            params: {
              query: mark_task_incomplete_mutation,
              variables: {
                id: task2.id
              }
            },
            headers: {"Authorization" => user.session_token}
          )

          expect(response.parsed_body["data"]).to be_nil
          expect(response.parsed_body.dig("errors", 0, "message")).to eq("Cannot manage others' Tasks")
        end
      end

      context "when the task cannot be marked incomplete" do
        before do
          allow_any_instance_of(Task).to receive(:update!).and_raise("Something bad happened")
        end

        it "returns an error" do
          expect do
            post(
              "/graphql",
              params: {
                query: mark_task_incomplete_mutation,
                variables: {
                  id: task.id
                }
              },
              headers: {"Authorization" => user.session_token}
            )
          end
            .not_to change { task.reload.completed? }

          expect(response.parsed_body["data"]).to be_nil
          expect(response.parsed_body.dig("errors", 0, "message")).to eq("Something bad happened")
        end
      end
    end

    context "when user is not logged in" do
      it "returns an error" do
        expect do
          post(
            "/graphql",
            params: {
              query: mark_task_incomplete_mutation,
              variables: {
                id: task.id
              }
            },
            headers: {"Authorization" => user.session_token}
          )
        end
          .not_to change { task.reload.completed? }

        expect(response.parsed_body["data"]).to be_nil
        expect(response.parsed_body.dig("errors", 0, "message")).to eq("Must be signed in!")
      end
    end
  end
end
