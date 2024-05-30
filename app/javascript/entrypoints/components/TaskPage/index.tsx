import React from 'react'
import { withStyles } from '@material-ui/core'

const TaskPage = ({ classes }: {[key: string]: any}) => {
  return (
    <>
      <div>Tasks Here</div>
    </>
  )
}

const styles = () => ({
  taskPage: {

  }
})

export default withStyles(styles)(TaskPage)
