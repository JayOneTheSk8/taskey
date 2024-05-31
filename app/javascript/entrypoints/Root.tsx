import React, { useContext, useEffect, useState } from 'react'
import { Route, Routes } from 'react-router-dom'
import { withStyles } from '@material-ui/core'
import { useMutation } from '@apollo/client'

import constants from './constants'
import withMuiTheme from './withMuiTheme'
import { AuthRoutes, ProtectedRoutes } from './routes'
import { AuthContext } from './authContext'
import { dispatchEvent } from './util'
import { LOGOUT_USER } from './queries/auth'

import AuthPage from './components/AuthPage'
import TaskPage from './components/TaskPage'

const {
  endpoints,
  components: {
    navbar: {
      LOGOUT,
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
  const context = useContext(AuthContext)

  // User is logged in if there is a session token in local storage
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem(SESSION_TOKEN))

  const [logoutUser, { loading: loggingOut }] = useMutation(LOGOUT_USER, {
    onError(err) {
      // Regardless, if this mutation returns with or without error
      // We should log out the frontend
      context.logout()
      dispatchEvent(LOGINUSER, { loggedIn: false })

      err.graphQLErrors.forEach((e) => {
        console.log(e);
      });
    }
  })

  // This allows us to update this state from child components
  useEffect(() => {
    const handler = (event: any) => {
      setIsLoggedIn(event.detail.loggedIn)
    }

    window.addEventListener(LOGINUSER, handler)

    return () => window.removeEventListener(LOGINUSER, handler)
  }, [])

  if (loggingOut) return <div>Loading...</div>

  return (
    <div className={classes.root}>
      {
        isLoggedIn &&
          <div className={classes.navbar}>
            <div></div>

            <div className={classes.taskeyIcon}>{TASKEY}</div>

            <div
              className={classes.settings}
              onClick={() => {
                logoutUser().then(() => {
                  context.logout()
                  dispatchEvent(LOGINUSER, { loggedIn: false })
                })
              }}
            >
              {LOGOUT}
            </div>
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
