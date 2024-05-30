import React from 'react'
import { Navigate, Outlet } from 'react-router-dom'

import endpoints from './constants/endpoints'

// Redirects to root from auth page
export const AuthRoutes = (isLoggedIn: boolean) => {
  return isLoggedIn ? <Navigate to={endpoints.root} />  : <Outlet />
}

// Redirects to auth page from any route that requires login
export const ProtectedRoutes = (isLoggedIn: boolean) => {
  return isLoggedIn ? <Outlet /> : <Navigate to={endpoints.auth} />
};
