import React from 'react'
import ReactDOM from 'react-dom/client'
import { HashRouter } from 'react-router-dom'

import Root from './Root'

import { AuthProvider } from './authContext';

const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement)

root.render(
  <React.StrictMode>
    <AuthProvider>
      <HashRouter>
        <Root />
      </HashRouter>
    </AuthProvider>
  </React.StrictMode>
)