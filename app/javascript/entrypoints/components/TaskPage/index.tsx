import React from 'react'
import { withStyles } from '@material-ui/core'
import { Link } from 'react-router-dom'

import constants from '../../constants'

const {
  endpoints,
} = constants

const TaskPage = (props: any) => {
  return (
    <>
      <div>Tasks Here</div>
      <Link to={endpoints.auth}>To Login</Link>
    </>
  )
}

const styles = () => ({
  taskPage: {

  }
})

export default withStyles(styles)(TaskPage)