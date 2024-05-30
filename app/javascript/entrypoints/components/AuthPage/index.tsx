import React from 'react'
import { withStyles } from '@material-ui/core'
import { Link } from 'react-router-dom'

import constants from '../../constants'

const {
  endpoints,
} = constants

const AuthPage = (props: any) => {
  return (
    <>
      <div>Login Page Here</div>
      <Link to={endpoints.root}>To Tasks</Link>
    </>
  )
}

const styles = () => ({
  authPage: {

  }
})

export default withStyles(styles)(AuthPage)