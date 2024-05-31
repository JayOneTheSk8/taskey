import React, { useContext, useEffect, useState } from 'react'
import { withStyles } from '@material-ui/core'
import { useQuery } from '@apollo/client'

import constants from '../../constants'
import { AuthContext } from '../../authContext'
import { ME_QUERY } from '../../queries/auth'

import TaskItem, { TaskItemType } from './TaskItem'

const {
  components: {
    taskPage: {
      userTasksHeader,
      PENDING_TASKS,
      COMPLETED_TASKS,
    }
  },
  general: {
    eventTypes: {
      COMPLETETASK,
    },
  },
} = constants

const TaskPage = ({ classes }: {[key: string]: any}) => {
  const context = useContext(AuthContext)

  // Keep tasks in state to allow list rerendering on change
  const [pendingTasks, setPendingTasks] = useState([] as TaskItemType[])
  const [completedTasks, setCompletedTasks] = useState([] as TaskItemType[])

  const { data, loading, error } = useQuery(ME_QUERY, {
    onCompleted(data) {
      const { id, username } = data.me
      context.login({ id, username })
    }
  })

  // When data is loaded, populate state
  useEffect(() => {
    if (data) {
      setPendingTasks(data.me.pendingTasks)
      setCompletedTasks(data.me.completedTasks)
    }
  }, [data])


  // Add event listener for when task is marked complete or incomplete
  useEffect(() => {
    const handler = (event: any) => {
      const {
        detail: {
          completed,
          taskIdx,
        }
      } = event

      if (completed) {
        // If task is completed, we want to move it from pending to complete
        
        // Copy pending tasks to avoid change before state change
        const tempPending = [...pendingTasks]
        // Remove relevant task
        const selectedTask = tempPending.splice(taskIdx, 1)[0]

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
        const selectedTask = tempCompleted.splice(taskIdx, 1)[0]

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

  if (error) return <div>ERROR</div>
  if (loading) return <div>LOADING...</div>

  return (
    <div className={classes.taskPage}>
      <div className={classes.header}>{userTasksHeader(data.me.username)}</div>

      <div className={classes.taskLists}>
        <div className={classes.taskListContainer}>
          <div className={classes.taskListHeader}>{PENDING_TASKS}</div>
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
})

export default withStyles(styles)(TaskPage)
