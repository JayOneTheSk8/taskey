import React, { useState } from 'react'
import { withStyles } from '@material-ui/core'
import { ApolloError, OperationVariables, useMutation } from '@apollo/client'

import constants from '../../constants'
import { COMPLETE_TASK, DELETE_TASK, MARK_TASK_INCOMPLETE, UPDATE_TASK } from '../../queries/tasks'
import { dispatchEvent } from '../../util'

import { QuickChangeTaskDetail, UpdateTaskDetail } from '.'

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
      UPDATETASK,
      DELETETASK,
    },
    fieldTexts: {
      EDIT,
      UPDATE,
      DELETE,
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
  const [errors, setErrors] = useState({} as { [key: string]: string })

  // Editing Mode State
  const [editMode, setEditMode] = useState(false)
  const [taskTitle, setTaskTitle] = useState(title)
  const [taskDescription, setTaskDescription] = useState(description)
  const [taskDueDate, setTaskDueDate] = useState(dueDate)

  const errorOptions: OperationVariables = {
    onError(err: ApolloError) {
      setErrors({
        ...errors,
        [GENERAL_ERROR]: err.graphQLErrors.map((e) => e.message).join(', ')
      })
    }
  }

  // Complete Task Mutation
  const [
    completeTask,
    { loading: completingTask }
  ] = useMutation(COMPLETE_TASK, errorOptions)

  // Mark Task Incomplete Mutation
  const [
    markTaskIncomplete,
    { loading: markingTaskIncomplete }
  ] = useMutation(MARK_TASK_INCOMPLETE, errorOptions)

  // Delete Task Mutation
  const [
    deleteTask,
    { loading: deletingTask }
  ] = useMutation(DELETE_TASK, errorOptions)
  
  // Update Task Mutation
  const [
    updateTask,
    { loading: updatingTask }
  ] = useMutation(UPDATE_TASK, errorOptions)

  const handleCompleteTask = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()

    if (completingTask || markingTaskIncomplete || deletingTask || updatingTask) return

    if (completed) {
      markTaskIncomplete({ variables: { id }})
        .then(({ data }) => {
          if (data) {
            dispatchEvent(COMPLETETASK, { completed: false, index } as QuickChangeTaskDetail)
          }
        })
    } else {
      completeTask({ variables: { id } })
        .then(({ data }) => {
          if (data) {
            dispatchEvent(COMPLETETASK, { completed: true, index } as QuickChangeTaskDetail)
          }
        })
    }
  }

  const handleDeleteTask = (e: React.MouseEvent) => {
    e.preventDefault()

    if (completingTask || markingTaskIncomplete || deletingTask || updatingTask) return

    deleteTask({
      variables: {
        id,
      }
    })
      .then(({ data }) => {
        if (data) {
          dispatchEvent(DELETETASK, { index, completed } as QuickChangeTaskDetail)
        }
      })
  }

  const handleUpdateTask = (e: React.FormEvent) => {
    e.preventDefault()

    if (completingTask || markingTaskIncomplete || deletingTask || updatingTask) return

    updateTask({
      variables: {
        id,
        title: taskTitle,
        description: taskDescription,
        dueDate: taskDueDate || null,
      }
    })
      .then(({ data }) => {
        if (data) {
          const {
            updateTask: {
              title: updatedTitle,
              description: updatedDescription,
              dueDate: updatedDueDate,
            }
          } = data

          dispatchEvent(
            UPDATETASK,
            {
              index,
              title: updatedTitle,
              description: updatedDescription,
              dueDate: updatedDueDate,
              completed,
            } as UpdateTaskDetail
          )

          setEditMode(false)
        }
      })
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
        {/* Completed Checkbox / Delete Button */}
        {
          editMode
            ? <div className={classes.deleteButton} onClick={handleDeleteTask}>{DELETE}</div>
            : <input type="checkbox" checked={completed} className={classes.completed} onChange={handleCompleteTask} />
        }

        {/* Edit Button / X */}
        <div
          className={classes.edit}
          onClick={() => {
            // If we're not in edit mode, clear its variables by replacing them with the original
            // This element is deleted when changed so no need to change the current html
            if (!editMode) {
              setTaskTitle(title)
              setTaskDescription(description)
              setTaskDueDate(dueDate)
            }

            setEditMode(!editMode)
          }}
        >
          {editMode ? 'X' : EDIT}
        </div>
      </div>

      {/* Title */}
      {
        editMode
          ? <input
            type="text"
            className={classes.taskTitleInput}
            defaultValue={title}
            onChange={(e) => setTaskTitle(e.target.value)}
          />
          : <div className={classes.title}>{title}</div>
      }

      {/* Due Date */}
      {
        editMode
          ? <input
            type="date"
            className={classes.taskDateInput}
            defaultValue={dueDate}
            onChange={(e) => setTaskDueDate(e.target.value)}
          />
          : dueDate &&
              <div
                className={`${classes.dueDate}
                ${pastDue(dueDate) ? classes.pastDue : ''}`}
              >
                {`${pastDue(dueDate) ? 'Past ' : ''}Due: ${dueDate}`}
              </div>
      }

      {/* Description */}
      {
        editMode
          ? <textarea
            className={classes.taskDescriptionInput}
            defaultValue={description}
            onChange={(e) => setTaskDescription(e.target.value)}
          />
          : <div className={classes.description}>{description}</div>
      }

      {/* Update Task */}
      {
        editMode &&
          <form onSubmit={handleUpdateTask}>
            <button
              type="submit"
              className={classes.editTaskSubmit}
              disabled={
                !taskTitle.trim()
                  || !taskDescription.trim()
                  || completingTask
                  || markingTaskIncomplete
                  || deletingTask
                  || updatingTask
              }
            >
              {UPDATE}
            </button>
          </form>
      }
    </div>
  )
}

const styles = () => ({
  taskItem: {
    border: '2px solid black',
    margin: '1em 0',
    padding: '1em',
    display: 'flex',
    'flex-direction': 'column',
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
  deleteButton: {
    cursor: 'pointer',
    color: '#cf0404',
  },
  taskTitleInput: {
    fontSize: '16px',
    marginBottom: '0.5em',
  },
  taskDateInput: {
    fontSize: '16px',
    marginBottom: '0.5em',
  },
  taskDescriptionInput: {
    fontSize: '16px',
    marginBottom: '0.5em',
    height: '10em',
  },
  editTaskSubmit: {
    fontSize: '16px',
    fontWeight: 600,
    margin: '1em 0',
    cursor: 'pointer',
    width: 'max-content',
    '&:disabled': {
      cursor: 'not-allowed',
    }
  },
})

export default withStyles(styles)(TaskItem)
