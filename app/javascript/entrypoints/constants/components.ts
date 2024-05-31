import util from "./util"

const {
  limits: {
    USERNAME_MIN_LIMIT,
    PASSWORD_MIN_LIMIT,
  }
} = util

const navbar = {
  LOGOUT: 'Logout',
  SETTINGS: 'Settings',
  TASKEY: 'Taskey',
}

const authPage = {
  ALREADY_HAVE_ACCOUNT: 'Already have an account?',
  DONT_HAVE_ACCOUNT: "Don't have an account?",
  REGISTER: 'Register',
  SIGN_IN: 'Sign In',
  SIGN_UP_HEADER: 'Sign Up for Taskey',
  SIGN_IN_HEADER: 'Sign In to Taskey',
  usernameLabel: (signUpForm: boolean) => `Username${signUpForm ? ` (must be at least ${USERNAME_MIN_LIMIT} characters)` : ''}`,
  passwordLabel: (signUpForm: boolean) => `Password${signUpForm ? ` (must be at least ${PASSWORD_MIN_LIMIT} characters)` : ''}`,
}

const taskPage = {
  userTasksHeader: (username: string) => `${username}'s Tasks`,
  PENDING_TASKS: 'Pending Tasks',
  COMPLETED_TASKS: 'Completed Tasks',
}

export default {
  authPage,
  navbar,
  taskPage,
}