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
