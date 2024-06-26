import React, { useContext, useEffect, useState } from 'react'
import { withStyles } from '@material-ui/core'
import { useMutation, useQuery } from '@apollo/client'

import constants from '../../constants'
import { AuthContext } from '../../authContext'
import { ME_QUERY } from '../../queries/auth'
import { CREATE_TASK } from '../../queries/tasks'

import TaskItem, { TaskItemType } from './TaskItem'

export interface QuickChangeTaskDetail {
  index: number
  completed: boolean
}

export interface UpdateTaskDetail extends QuickChangeTaskDetail {
  title: string
  description: string
  dueDate: string
}

const {
  components: {
    taskPage: {
      taskFormSwitch,
      userTasksHeader,
      CREATE_TASK_SUBMIT,
      PENDING_TASKS,
      COMPLETED_TASKS,
    }
  },
  errors: {
    errorTypes: {
      CREATE_TASK_ERROR,
    },
  },
  general: {
    eventTypes: {
      COMPLETETASK,
      UPDATETASK,
      DELETETASK,
    },
    fields: {
      TITLE,
      DESCRIPTION,
      DUE_DATE
    },
    fieldTexts: {
      TITLE_TITLE,
      DESCRIPTION_TITLE,
      DUE_DATE_TITLE,
    }
  },
} = constants

const TaskPage = ({ classes }: {[key: string]: any}) => {
  const context = useContext(AuthContext)

  const [errors, setErrors] = useState({} as { [key: string]: string })

  // Keep tasks in state to allow list rerendering on change
  const [pendingTasks, setPendingTasks] = useState([] as TaskItemType[])
  const [completedTasks, setCompletedTasks] = useState([] as TaskItemType[])

  // New Task State
  const [taskForm, setTaskForm] = useState(false)
  const [taskTitle, setTaskTitle] = useState('')
  const [taskDescription, setTaskDescription] = useState('')
  const [taskDueDate, setTaskDueDate] = useState('')

  const { data, loading, error: meQueryError } = useQuery(ME_QUERY, {
    onCompleted(data) {
      const { id, username } = data.me
      context.login({ id, username })
    }
  })

  const [createTask, { loading: creatingTask }] = useMutation(CREATE_TASK, {
    onError(err) {
      setErrors({
        ...errors,
        [CREATE_TASK_ERROR]: err.graphQLErrors.map((e) => e.message).join(', ')
      })
    }
  })

  // When data is loaded, populate state
  useEffect(() => {
    if (data) {
      setPendingTasks(data.me.pendingTasks)
      setCompletedTasks(data.me.completedTasks)
    }
  }, [data])


  // Event listener for when task is marked complete or incomplete
  useEffect(() => {
    const handler = (event: any) => {
      const { completed, index } = event.detail as QuickChangeTaskDetail

      if (completed) {
        // If task is completed, we want to move it from pending to complete
        
        // Copy pending tasks to avoid change before state change
        const tempPending = [...pendingTasks]
        // Remove relevant task
        const selectedTask = tempPending.splice(index, 1)[0]

        // Selected Task is read only so we'll create a new one
        const task: TaskItemType = {
          id: selectedTask.id,
          title: selectedTask.title,
          description: selectedTask.description,
          completed: true,
          dueDate: selectedTask.dueDate,
        }

        // Update pending and add task to the top of completed
        setPendingTasks(tempPending)
        setCompletedTasks([task, ...completedTasks])
      } else {
        // If task is marked incomplete, we want to move it from complete to pending
        const tempCompleted = [...completedTasks]
        const selectedTask = tempCompleted.splice(index, 1)[0]

        // Create new task
        const task: TaskItemType = {
          id: selectedTask.id,
          title: selectedTask.title,
          description: selectedTask.description,
          completed: false,
          dueDate: selectedTask.dueDate,
        }

        // Update state
        setCompletedTasks(tempCompleted)
        setPendingTasks([task, ...pendingTasks])
      }
    }

    window.addEventListener(COMPLETETASK, handler)

    return () => window.removeEventListener(COMPLETETASK, handler)
  }, [pendingTasks, completedTasks])

  // Event listener for update event
  useEffect(() => {
    const handler = (event: any) => {
      const {
        index,
        completed,
        title,
        description,
        dueDate,
      } = event.detail as UpdateTaskDetail

      if (completed) {
        // Copy task details
        const task = { ...completedTasks[index] }

        // Update Task
        task.title = title
        task.description = description
        task.dueDate = dueDate

        // Update Completed Task
        setCompletedTasks([
          ...completedTasks.slice(0, index),
          task,
          ...completedTasks.slice(index + 1)
        ])
      } else {
        const task = { ...pendingTasks[index] }

        task.title = title
        task.description = description
        task.dueDate = dueDate

        // Update Pending Task
        setPendingTasks([
          ...pendingTasks.slice(0, index),
          task,
          ...pendingTasks.slice(index + 1)
        ])
      }
    }

    window.addEventListener(UPDATETASK, handler)

    return () => window.removeEventListener(UPDATETASK, handler)
  }, [pendingTasks, completedTasks])

  // Event listener for delete event
  useEffect(() => {
    const handler = (event: any) => {
      const { index, completed } = event.detail as QuickChangeTaskDetail

      if (completed) {
        // Delete from completed state
        const tempCompleted = [...completedTasks]
        tempCompleted.splice(index, 1)
        setCompletedTasks(tempCompleted)
      } else {
        // Delete from pending state
        const tempPending = [...pendingTasks]
        tempPending.splice(index, 1)
        setPendingTasks(tempPending)
      }
    }

    window.addEventListener(DELETETASK, handler)

    return () => window.removeEventListener(DELETETASK, handler)
  }, [pendingTasks, completedTasks])

  const handleNewTask = (e: React.FormEvent) => {
    e.preventDefault()
    if (creatingTask) return

    createTask({
      variables: {
        title: taskTitle,
        description: taskDescription,
        dueDate: taskDueDate || null,
      }
    })
      .then(({ data }) => {
        if (data) {
          const taskData: TaskItemType = data.createTask
          setPendingTasks([taskData, ...pendingTasks])
          setTaskForm(false)
        }
      })
  }

  const taskList = (tasks: TaskItemType[]) => {
    return tasks.map((task, idx) => {
      return (
        <TaskItem
          key={task.id}
          index={idx}
          id={task.id}
          title={task.title}
          description={task.description}
          dueDate={task.dueDate}
          completed={task.completed}
        />
      )
    })
  }

  if (meQueryError) return <div>{meQueryError.message}</div>
  if (loading) return <div>LOADING...</div>

  return (
    <div className={classes.taskPage}>
      <div className={classes.header}>{userTasksHeader(data.me.username)}</div>

      <div className={classes.taskLists}>
        <div className={classes.taskListContainer}>
          <div className={classes.taskListHeader}>{PENDING_TASKS}</div>

          <div
            className={classes.taskFormSwitch}
            onClick={() => {
              // Clear errors when closing
              if (taskForm) {
                delete errors[CREATE_TASK_ERROR]
              }

              setTaskForm(!taskForm)
            }}
          >
            {taskFormSwitch(taskForm)}
          </div>

          {
            taskForm &&
              <form className={classes.newTaskForm} onSubmit={handleNewTask}>
                {
                  errors[CREATE_TASK_ERROR] &&
                    <div className={classes.errorMessage}>{errors[CREATE_TASK_ERROR]}</div>
                }

                <label className={classes.inputLabel} htmlFor={TITLE}>{TITLE_TITLE}</label>
                <input className={classes.titleInput} id={TITLE} type="text" onChange={(e) => setTaskTitle(e.target.value)} />

                <label className={classes.inputLabel} htmlFor={DESCRIPTION}>{DESCRIPTION_TITLE}</label>
                <textarea className={classes.descriptionInput} id={DESCRIPTION} onChange={(e) => setTaskDescription(e.target.value)} />

                <label className={classes.inputLabel} htmlFor={DUE_DATE}>{DUE_DATE_TITLE}</label>
                <input className={classes.dueDateInput} id={DUE_DATE} type="date" onChange={(e) => setTaskDueDate(e.target.value)} />

                <button
                  className={classes.newTaskSubmit}
                  type="submit"
                  disabled={
                    !taskTitle.trim()
                      || !taskDescription.trim()
                  }
                >
                  {CREATE_TASK_SUBMIT}
                </button>
              </form>
          }
          <div className={classes.taskList}>{taskList(pendingTasks)}</div>
        </div>

        <div className={classes.taskListContainer}>
          <div className={classes.taskListHeader}>{COMPLETED_TASKS}</div>
          <div className={classes.taskList}>{taskList(completedTasks)}</div>
        </div>
      </div>
    </div>
  )
}

const styles = () => ({
  taskPage: {
    display: 'flex',
    'flex-direction': 'column',
    alignItems: 'center',
  },
  header: {
    margin: '1em 0',
    fontSize: '22px',
    fontWeight: 600,
  },
  taskLists: {
    display: 'flex',
    justifyContent: 'space-around',
  },
  taskListContainer: {
    width: '30%',
  },
  taskListHeader: {
    fontSize: '18px',
    fontWeight: 600,
    textDecoration: 'underline',
  },
  taskList: {
    height: '55vh',
    'overflow-y': 'auto',
  },
  taskFormSwitch: {
    fontSize: '24px',
    fontWeight: 600,
    width: 'max-content',
    cursor: 'pointer',
  },
  newTaskForm: {
    display: 'flex',
    'flex-direction': 'column'
  },
  inputLabel: {
    fontSize: '16px',
    fontWeight: 600,
  },
  titleInput: {
    fontSize: '16px',
  },
  descriptionInput: {
    fontSize: '16px',
  },
  dueDateInput: {
    fontSize: '16px',
  },
  newTaskSubmit: {
    fontSize: '16px',
    fontWeight: 600,
    margin: '1em 0',
    cursor: 'pointer',
    width: 'max-content',
    '&:disabled': {
      cursor: 'not-allowed',
    }
  },
  errorMessage: {
    color: '#cf0404',
  },
})

export default withStyles(styles)(TaskPage)
