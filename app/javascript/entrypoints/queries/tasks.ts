import { gql } from '@apollo/client'

export const COMPLETE_TASK = gql`
  mutation CompleteTask($id: ID!) {
    completeTask(id: $id) {
      id
      completed
    }
  }
`

export const MARK_TASK_INCOMPLETE = gql`
  mutation MarkTaskIncomplete($id: ID!) {
    markTaskIncomplete(id: $id) {
      id
      completed
    }
  }
`

export const CREATE_TASK = gql`
  mutation CreateTask($title: String!, $description: String!, $dueDate: ISO8601Date) {
    createTask(title: $title, description: $description, dueDate: $dueDate) {
      id
      title
      description
      dueDate
      completed
    }
  }
`
