import React from 'react'
import { Route, Routes } from 'react-router-dom'
import { withStyles } from '@material-ui/core'

import constants from './constants'
import withMuiTheme from './withMuiTheme'
import { AuthRoutes, ProtectedRoutes } from './routes'

import AuthPage from './components/AuthPage'
import TaskPage from './components/TaskPage'

const {
  endpoints,
} = constants

const Root = (props: any) => {
  const { classes } = props

  // TODO: This is for testing; to remove
  const isLoggedIn = true

  return (
    <div className={classes.root}>
      {
        isLoggedIn &&
          <div>
            <div>Settings</div>
          </div>
      }

      <Routes>
        {/* Protected Routes */}
        <Route element={ProtectedRoutes(isLoggedIn)}>
          <Route path={endpoints.root} Component={TaskPage} />
        </Route>

        {/* Auth Routes */}
        <Route element={AuthRoutes(isLoggedIn)}>
          <Route path={endpoints.auth} Component={AuthPage} />
        </Route>
      </Routes>
    </div>
  )
}

const styles = () => ({
  root: {

  }
})

export default withStyles(styles)(withMuiTheme(Root))
