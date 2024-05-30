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
  components: {
    navbar: {
      SETTINGS,
      TASKEY,
    },
  },
} = constants

const Root = ({ classes }: { [key: string]: any }) => {
  // TODO: This is for testing; to remove
  const isLoggedIn = true

  return (
    <div className={classes.root}>
      {
        isLoggedIn &&
          <div className={classes.navbar}>
            <div></div>
            <div className={classes.taskeyIcon}>{TASKEY}</div>
            <div className={classes.settings}>{SETTINGS}</div>
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
  navbar: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '1em',
    alignItems: 'center',
    borderBottom: '1px solid black',
    boxShadow: '0px 1px 7px 2px',
  },
  taskeyIcon: {
    padding: '1em',
    border: '2px solid black',
    height: '5em',
    width: '5em',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    cursor: 'pointer',
    fontSize: '20px',
    fontWeight: 600,
    textDecoration: 'underline',
  },
  settings: {
    cursor: 'pointer',
    fontSize: '20px',
    fontWeight: 600,
  },
  root: {

  }
})

export default withStyles(styles)(withMuiTheme(Root))
