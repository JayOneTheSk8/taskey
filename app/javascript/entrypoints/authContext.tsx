import React, { createContext, useReducer } from 'react'
import { HashRouterProps } from 'react-router-dom'
import { useApolloClient } from '@apollo/client'

import constants from './constants'

interface AuthState {
  id: string | undefined
  username: string | undefined
}

interface AuthContextType {
  id: string | undefined
  username: string | undefined
  login: (userData: UserData) => void
  logout: () => void
}

interface ReducerAction {
  type: string
  payload?: UserData
}

export interface UserData {
  id: string
  username: string
  token?: string
}

// These are only used here so we won't put them in the constants
const LOGIN = 'LOGIN'
const LOGOUT = 'LOGOUT'

const {
  util: {
    tokens: {
      SESSION_TOKEN,
    },
  },
} = constants

const initialState: AuthState = {
  id: undefined,
  username: undefined,
}

const authReducer = (state: AuthState, action: ReducerAction): AuthState => {
  switch (action.type) {
    case LOGIN:
      return {
        ...state,
        id: action.payload?.id,
        username: action.payload?.username,
      }
    case LOGOUT:
      return {
        ...state,
        ...initialState,
      }
    default:
      return state
  }
}

const AuthContext = createContext({} as AuthContextType)

// HashRouter is child of AuthProvider so the props are HashRouterProps
const AuthProvider = (props: HashRouterProps) => {
  const [state, dispatch] = useReducer(authReducer, initialState)
  const apolloClient = useApolloClient()

  const login = (userData: UserData) => {
    if (userData.token) {
      localStorage.setItem(SESSION_TOKEN, userData.token)
    }

    dispatch({ type: LOGIN, payload: { ...userData } })
  }

  const logout = () => {
    localStorage.removeItem(SESSION_TOKEN)
    apolloClient.resetStore()
    dispatch({ type: LOGOUT })
  }

  return (
    <AuthContext.Provider
      value={{
        id: state.id,
        username: state.username,
        login,
        logout,
      }}
      {...props}
    />
  )
}

export { AuthContext, AuthProvider }
