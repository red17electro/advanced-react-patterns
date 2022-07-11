// Context Module Functions
// http://localhost:3000/isolated/exercise/01.js

import * as React from 'react'
import {dequal} from 'dequal'

// ./context/user-context.js

import * as userClient from '../user-client'
import {useAuth} from '../auth-context'

const UserContext = React.createContext() // creating the context object
UserContext.displayName = 'UserContext' // for debugging

function userReducer(state, action) { // reducer function for the user state
  switch (action.type) { // switch on the action type
    case 'start update': { // start update action
      return { // return the new state
        ...state, // keep the old state
        user: {...state.user, ...action.updates}, // update the user
        status: 'pending', // set the status to pending
        storedUser: state.user, // store the old user
      }
    }
    case 'finish update': { // finish update action
      return { // return the new state
        ...state, // keep the old state
        user: action.updatedUser, // update the user
        status: 'resolved', // set the status to resolved
        storedUser: null, // clear the stored user
        error: null, // clear the error
      }
    }
    case 'fail update': { // fail update action
      return { // return the new state
        ...state, // keep the old state
        status: 'rejected', // set the status to rejected
        error: action.error, // set the error
        user: state.storedUser, // restore the old user
        storedUser: null, // clear the stored user
      }
    }
    case 'reset': { // reset action
      return { // return the new state
        ...state, // keep the old state
        status: null, // clear the status
        error: null, // clear the error
      }
    }
    default: {
      throw new Error(`Unhandled action type: ${action.type}`) // throw an error if the action type is not handled
    }
  }
}

function UserProvider({children}) { // provider component
  const {user} = useAuth() // get the user from the auth context
  const [state, dispatch] = React.useReducer(userReducer, { // create the state and dispatch functions
    status: null, // set the status to null
    error: null, // set the error to null
    storedUser: user, // set the stored user to the user from the auth context
    user, // set the user to the user from the auth context
  })
  const value = [state, dispatch] // create the value object
  return <UserContext.Provider value={value}>{children}</UserContext.Provider> // return the provider component
}

function useUser() { // hook for the user context
  const context = React.useContext(UserContext) // get the context object
  if (context === undefined) { // if the context object is undefined
    throw new Error(`useUser must be used within a UserProvider`) // throw an error
  }
  return context
}

const updateUser = (dispatch, user, updates) => { // update user function
  dispatch({type: 'start update', updates: updates}) // start update action
  userClient.updateUser(user, updates).then( // update the user
      updatedUser => dispatch({type: 'finish update', updatedUser}),
      error => dispatch({type: 'fail update', error}),
  )
};

// export {UserProvider, useUser}

// src/screens/user-profile.js
// import {UserProvider, useUser} from './context/user-context'
function UserSettings() {
  const [{user, status, error}, userDispatch] = useUser() // get the user and user dispatch functions

  const isPending = status === 'pending' // check if the status is pending
  const isRejected = status === 'rejected' // check if the status is rejected

  const [formState, setFormState] = React.useState(user) // create the form state and set function

  const isChanged = !dequal(user, formState) // check if the user is changed

  function handleChange(e) {
    setFormState({...formState, [e.target.name]: e.target.value})
  } // handle change function

  function handleSubmit(event) {
    event.preventDefault(); // prevent the default submit behavior
    updateUser(userDispatch, user, formState); // update the user
  }

  return (
    <form onSubmit={handleSubmit}>
      <div style={{marginBottom: 12}}>
        <label style={{display: 'block'}} htmlFor="username">
          Username
        </label>
        <input
          id="username"
          name="username"
          disabled
          readOnly
          value={formState.username}
          style={{width: '100%'}}
        />
      </div>
      <div style={{marginBottom: 12}}>
        <label style={{display: 'block'}} htmlFor="tagline">
          Tagline
        </label>
        <input
          id="tagline"
          name="tagline"
          value={formState.tagline}
          onChange={handleChange}
          style={{width: '100%'}}
        />
      </div>
      <div style={{marginBottom: 12}}>
        <label style={{display: 'block'}} htmlFor="bio">
          Biography
        </label>
        <textarea
          id="bio"
          name="bio"
          value={formState.bio}
          onChange={handleChange}
          style={{width: '100%'}}
        />
      </div>
      <div>
        <button
          type="button"
          onClick={() => {
            setFormState(user)
            userDispatch({type: 'reset'})
          }}
          disabled={!isChanged || isPending}
        >
          Reset
        </button>
        <button
          type="submit"
          disabled={(!isChanged && !isRejected) || isPending}
        >
          {isPending
            ? '...'
            : isRejected
            ? '✖ Try again'
            : isChanged
            ? 'Submit'
            : '✔'}
        </button>
        {isRejected ? <pre style={{color: 'red'}}>{error.message}</pre> : null}
      </div>
    </form>
  )
}

function UserDataDisplay() {
  const [{user}] = useUser()
  return <pre>{JSON.stringify(user, null, 2)}</pre>
}

function App() {
  return (
    <div
      style={{
        minHeight: 350,
        width: 300,
        backgroundColor: '#ddd',
        borderRadius: 4,
        padding: 10,
      }}
    >
      <UserProvider>
        <UserSettings />
        <UserDataDisplay />
      </UserProvider>
    </div>
  )
}

export default App
