import React, { useContext, useState } from 'react'
import { withStyles } from '@material-ui/core'
import { useMutation } from '@apollo/client'

import constants from '../../constants'
import { UserData, AuthContext } from '../../authContext'
import { REGISTER_USER, LOGIN_USER } from '../../queries/auth'
import { dispatchEvent } from '../../util'


const {
  components: {
    authPage: {
      ALREADY_HAVE_ACCOUNT,
      DONT_HAVE_ACCOUNT,
      REGISTER,
      SIGN_IN,
      SIGN_UP_HEADER,
      SIGN_IN_HEADER,
      usernameLabel,
      passwordLabel,
    },
  },
  errors: {
    errorTypes: {
      GENERAL_ERROR,
    },
  },
  general: {
    eventTypes: {
      LOGINUSER,
    },
    fields: {
      USERNAME,
      PASSWORD,
    },
  },
  util: {
    limits: {
      USERNAME_MIN_LIMIT,
      USERNAME_MAX_LIMIT,
      PASSWORD_MIN_LIMIT,
    },
  },
} = constants

const AuthPage = ({ classes }: { [key: string]: any }) => {
  const context = useContext(AuthContext)

  // Whether or not we are signing up a user or logging them in
  const [signUpForm, setSignUpForm] = useState(false)

  // Form data
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  // Errors
  const [errors, setErrors] = useState({} as { [key: string]: string })

  const [loginUser, { loading: loggingInUser }] = useMutation(LOGIN_USER, {
    onError(err) {
      setErrors({
        ...errors,
        [GENERAL_ERROR]: err.graphQLErrors.map((e) => e.message).join(', ')
      })
    }
  })

  const [registerUser, { loading: registeringUser }] = useMutation(REGISTER_USER, {
    onError(err) {
      setErrors({
        ...errors,
        [GENERAL_ERROR]: err.graphQLErrors.map((e) => e.message).join(', ')
      })
    }
  })

  const handleUser = (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})

    if (signUpForm) {
      registerUser({
        variables: {
          username,
          password,
        }
      }).then(({ data }) => {
        if (data) {
          const userData: UserData = data.register
          context.login(userData)
          dispatchEvent(LOGINUSER, { loggedIn: true })
        }
      })
    } else {
      loginUser({
        variables: {
          username,
          password,
        }
      }).then(({ data }) => {
        if (data) {
          const userData: UserData = data.login
          context.login(userData)
          dispatchEvent(LOGINUSER, { loggedIn: true })
        }
      })
    }
  }

  return (
    <div className={classes.authPage}>
      <div className={classes.authFormContainer}>
        <div className={classes.authHeader}>{signUpForm ? SIGN_UP_HEADER : SIGN_IN_HEADER}</div>

        {
          errors[GENERAL_ERROR] &&
            <div className={classes.errorMessage}>{errors[GENERAL_ERROR]}</div>
        }

        <form onSubmit={handleUser} className={classes.authForm}>
          {/* Username Label */}
          <label
            htmlFor={USERNAME}
            className={classes.formLabel}
          >
            {usernameLabel(signUpForm)}
          </label>
          <input
            id={USERNAME}
            type="text"
            className={classes.formInput}
            spellCheck={false}
            maxLength={USERNAME_MAX_LIMIT}
            onChange={e => setUsername(e.target.value)}
          />

          {/* Password Label */}
          <label
            htmlFor={PASSWORD}
            className={classes.formLabel}  
          >
            {passwordLabel(signUpForm)}
          </label>
          <input
            id={PASSWORD}
            type="password"
            className={classes.formInput}
            onChange={e => setPassword(e.target.value)}
          />

          {/* Submit Button */}
          <button
            type="submit"
            className={classes.submit}
            disabled={
              !username.trim()
                || !password.trim()
                || username.trim().length < USERNAME_MIN_LIMIT
                || password.trim().length < PASSWORD_MIN_LIMIT
                || loggingInUser
                || registeringUser
            }
          >
            {signUpForm ? REGISTER : SIGN_IN}
          </button>

          {/* Switch to Login/Register */}
          <div className={classes.switchAuth}>
            {signUpForm ? ALREADY_HAVE_ACCOUNT : DONT_HAVE_ACCOUNT}

            <div
              className={classes.switchAuthButton}
              onClick={() => {
                setErrors({})
                setSignUpForm(!signUpForm)
              }}
            >
              {signUpForm ? SIGN_IN : REGISTER}
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

const styles = () => ({
  authPage: {
    display: 'flex',
    justifyContent: 'center',
  },
  authFormContainer: {
    marginTop: '3em',
    padding: '1em',
    border: '1px solid black',
    borderRadius: '9px',
  },
  authHeader: {
    fontSize: '22px',
    fontWeight: 600,
    marginBottom: '1em',
  },
  errorMessage: {
    color: '#cf0404',
  },
  authForm: {
    display: 'flex',
    'flex-direction': 'column',
  },
  formLabel: {

  },
  formInput: {
    marginBottom: '1em',
    fontSize: '22px',
  },
  submit: {
    marginBottom: '1em',
    fontSize: '20px',
    fontWeight: 600,
    cursor: 'pointer',
    '&:disabled': {
      cursor: 'not-allowed'
    }
  },
  switchAuth: {
    display: 'flex',
    'flex-direction': 'column',
    alignItems: 'center',
  },
  switchAuthButton: {
    cursor: 'pointer',
    textDecoration: 'underline',
  },
})

export default withStyles(styles)(AuthPage)
