import { gql } from '@apollo/client';

export const LOGOUT_USER = gql`
  mutation Logout {
    logout
  }
`
