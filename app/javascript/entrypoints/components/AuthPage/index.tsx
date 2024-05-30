import React from 'react'
import { withStyles } from '@material-ui/core'

const AuthPage = ({ classes }: { [key: string]: any }) => {
  return (
    <>
      <div>Login Page Here</div>
    </>
  )
}

const styles = () => ({
  authPage: {

  }
})

export default withStyles(styles)(AuthPage)
