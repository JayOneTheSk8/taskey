import React, { useEffect, useState } from 'react'
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
  general: {
    eventTypes: {
      LOGINUSER,
    },
  },
  util: {
    tokens: {
      SESSION_TOKEN,
    },
  },
} = constants

const Root = ({ classes }: { [key: string]: any }) => {
  // User is logged in if there is a session token in local storage
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem(SESSION_TOKEN))

  // This allows us to update this state from child components
  useEffect(() => {
    const handler = (event: any) => {
      setIsLoggedIn(event.detail.loggedIn)
    }

    window.addEventListener(LOGINUSER, handler)

    return () => window.removeEventListener(LOGINUSER, handler)
  }, [])

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
