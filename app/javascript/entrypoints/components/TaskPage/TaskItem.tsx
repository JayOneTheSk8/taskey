import React from 'react'
import { withStyles } from '@material-ui/core'

import constants from '../../constants'

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
  general: {
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

  // Color due date red and notate if past due
  const pastDue = (dueDate: string): boolean => {
    if (completed) return false
    return new Date(dueDate) < new Date()
  }

  return (
    <div className={classes.taskItem}>
      <div className={classes.taskManageArea}>
        <input type="checkbox" defaultChecked={completed} className={classes.completed} />
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
})

export default withStyles(styles)(TaskItem)
