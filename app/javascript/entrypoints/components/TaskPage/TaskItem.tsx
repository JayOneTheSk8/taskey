import React, { useState } from 'react'
import { withStyles } from '@material-ui/core'
import { useMutation } from '@apollo/client'

import constants from '../../constants'
import { COMPLETE_TASK, MARK_TASK_INCOMPLETE } from '../../queries/tasks'
import { dispatchEvent } from '../../util'

export interface TaskItemType {
  id: string
  title: string
  description: string
  completed: boolean
  dueDate?: string
}

interface TaskItemProps extends TaskItemType {
  index: number
  classes: { [key: string]: any }
}

const {
  errors: {
    errorTypes: {
      GENERAL_ERROR,
    },
  },
  general: {
    eventTypes: {
      COMPLETETASK,
    },
    fieldTexts: {
      EDIT,
    },
  },
} = constants

const TaskItem = ({
  classes,
  index,
  id,
  title,
  description,
  dueDate,
  completed
}: TaskItemProps) => {
  // TODO: Add edit capabilities

  const [errors, setErrors] = useState({} as { [key: string]: string })

  const [completeTask, { loading: completingTask }] = useMutation(COMPLETE_TASK, {
    onError(err) {
      setErrors({
        ...errors,
        [GENERAL_ERROR]: err.graphQLErrors.map((e) => e.message).join(', ')
      })
    }
  })

  const [markTaskIncomplete, { loading: markingTaskIncomplete }] = useMutation(MARK_TASK_INCOMPLETE, {
    onError(err) {
      setErrors({
        ...errors,
        [GENERAL_ERROR]: err.graphQLErrors.map((e) => e.message).join(', ')
      })
    }
  })

  const handleTask = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (completingTask || markingTaskIncomplete) return

    if (completed) {
      markTaskIncomplete({ variables: { id }})
        .then(({ data }) => {
          if (data) {
            dispatchEvent(COMPLETETASK, { completed: false, taskIdx: index })
          }
        })
    } else {
      completeTask({ variables: { id } })
        .then(({ data }) => {
          if (data) {
            dispatchEvent(COMPLETETASK, { completed: true, taskIdx: index })
          }
        })
    }
  }

  // Color due date red and notate if past due
  const pastDue = (dueDate: string): boolean => {
    if (completed) return false
    return new Date(dueDate) < new Date()
  }

  return (
    <div className={classes.taskItem}>
      {
        errors[GENERAL_ERROR] &&
          <div className={classes.errorMessage}>{errors[GENERAL_ERROR]}</div>
      }

      <div className={classes.taskManageArea}>
        <input type="checkbox" checked={completed} className={classes.completed} onChange={handleTask} />
        <div className={classes.edit}>{EDIT}</div>
      </div>

      <div className={classes.title}>{title}</div>

      {
        dueDate &&
          <div
            className={`${classes.dueDate}
            ${pastDue(dueDate) ? classes.pastDue : ''}`}
          >
            {`${pastDue(dueDate) ? 'Past ' : ''}Due: ${dueDate}`}
          </div>
      }

      <div className={classes.description}>{description}</div>
    </div>
  )
}

const styles = () => ({
  taskItem: {
    border: '2px solid black',
    margin: '1em 0',
    padding: '1em',
  },
  taskManageArea: {
    display: 'flex',
    justifyContent: 'space-between',
  },
  completed: {
    
  },
  edit: {
    fontWeight: 600,
    cursor: 'pointer',
    margin: '5px',
  },
  title: {
    fontWeight: 600,
  },
  dueDate: {

  },
  pastDue: {
    color: '#cf0404',
  },
  description: {
    margin: '5px 0',
  },
  errorMessage: {
    color: '#cf0404',
  },
})

export default withStyles(styles)(TaskItem)
