import React from 'react'
import { createTheme, ThemeProvider, CssBaseline } from '@material-ui/core'

const theme = createTheme({
  typography: {
    fontFamily: 'Verdana',
  }
})

const withMuiTheme = (Component: React.FunctionComponent) => {
  const withRoot = (props: any) => {
    return (
      <ThemeProvider theme={{ ...theme }}>
        <CssBaseline />
        <Component {...props} />
      </ThemeProvider>
    )
  }

  return withRoot
}

export default withMuiTheme