import React from 'react'
import ReactDOM from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import {
  ApolloClient,
  ApolloProvider,
  createHttpLink,
  InMemoryCache,
  from,
} from '@apollo/client'
import { setContext } from '@apollo/client/link/context'
import { onError } from '@apollo/client/link/error'

import constants from './constants'

import Root from './Root'

import { AuthProvider } from './authContext'

const {
  util: {
    tokens: {
      SESSION_TOKEN,
    },
  },
} = constants

const httpLink = createHttpLink({
  uri: '/graphql',
  credentials: 'same-origin',
})

const errorLink = onError(({ graphQLErrors, networkError }) => {
    if (graphQLErrors) {
        graphQLErrors.forEach(({ message }) => {
            console.log(message)
        })
    }
    if (networkError) {
        console.log(networkError.message)
    }
})

const authLink = setContext((_, { headers }) => {
  // get the session token from local storage if it exists
  const token = localStorage.getItem(SESSION_TOKEN)
  // return the headers to the context so httpLink can read them
  return {
    headers: {
      ...headers,
      authorization: token ? `Token ${token}` : "",
    }
  }
})

const client = new ApolloClient({
  link: from([errorLink, authLink, httpLink]),
  cache: new InMemoryCache(),
})

const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement)

root.render(
  <React.StrictMode>
    <ApolloProvider client={client}>
      <AuthProvider>
        <HashRouter>
          <Root />
        </HashRouter>
      </AuthProvider>
    </ApolloProvider>
  </React.StrictMode>
)