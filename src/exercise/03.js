// Flexible Compound Components
// http://localhost:3000/isolated/exercise/03.js

import * as React from 'react'
import {Switch} from '../switch'

const ToggleContext = React.createContext();
ToggleContext.displayName = 'ToggleContext';
// 📜 https://reactjs.org/docs/context.html#reactcreatecontext

function Toggle(props) {
  const [on, setOn] = React.useState(false)
  const toggle = () => setOn(!on)

  return <ToggleContext.Provider value={{on, toggle}} {...props}/>;
}

const useContext = () => {
    const context = React.useContext(ToggleContext);
    if (!context) {
        throw new Error('ToggleButton must be a child of Toggle');
    }
    return context;
}

function ToggleOn({children}) {
  const { on } = useContext();
  return on ? children : null
}

function ToggleOff({children}) {
  const { on } = useContext();
  return on ? null : children
}

function ToggleButton(props) {
  const { on, toggle } = useContext();
  return <Switch on={on} onClick={toggle} {...props} />
}

function App() {
  return (
      <ToggleButton />
  )
}

export default App

/*
eslint
  no-unused-vars: "off",
*/
