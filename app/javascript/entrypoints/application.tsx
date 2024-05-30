import React from 'react'
import ReactDOM from 'react-dom/client'
import { HashRouter } from 'react-router-dom'

import Root from './Root'

const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement)

root.render(
  <HashRouter>
    <Root />
  </HashRouter>
)