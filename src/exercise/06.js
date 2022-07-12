// Control Props
// http://localhost:3000/isolated/exercise/06.js

import * as React from 'react'
import {Switch} from '../switch'
import warning from "warning";

const callAll = (...fns) => (...args) => fns.forEach(fn => fn?.(...args))

const actionTypes = {
  toggle: 'toggle',
  reset: 'reset',
}

function toggleReducer(state, {type, initialState}) {
  switch (type) {
    case actionTypes.toggle: {
      return {on: !state.on}
    }
    case actionTypes.reset: {
      return initialState
    }
    default: {
      throw new Error(`Unsupported type: ${type}`)
    }
  }
}

function useControlledSwitchWarning(controlPropValue, controlPropName, componentName) {
  const isControlled = controlPropValue !== null;
  const {current: wasControlled} = React.useRef(isControlled)
  React.useEffect(() => {
    warning(
        !(isControlled && !wasControlled),
        `\`${componentName}\` is changing from uncontrolled to be controlled. Components should not switch from uncontrolled to controlled (or vice versa). Decide between using a controlled or uncontrolled \`${componentName}\` for the lifetime of the component. Check the \`${controlPropName}\` prop.`,
    )
    warning(
        !(!isControlled && wasControlled),
        `\`${componentName}\` is changing from controlled to be uncontrolled. Components should not switch from controlled to uncontrolled (or vice versa). Decide between using a controlled or uncontrolled \`${componentName}\` for the lifetime of the component. Check the \`${controlPropName}\` prop.`,
    )
  }, [isControlled, wasControlled, componentName, controlPropName])
}

function useOnChangeReadOnlyWarning(controlPropValue, controlPropName, componentName, hasOnChange, readOnlyValue, readOnlyProp, initialValueProp, onChangeProp) {
  const isControlled = controlPropValue !== null;
  React.useEffect(() => {
    warning(
        !(!hasOnChange && isControlled && !readOnlyValue),
        `An \`on\` prop was provided to useToggle without an \`onChange\` handler. This will render a read-only toggle. If you want it to be mutable, use \`initialOn\`. Otherwise, set either \`onChange\` or \`readOnly\`.`,
    )
  }, [hasOnChange, isControlled, readOnlyValue, componentName, controlPropName, initialValueProp, onChangeProp, readOnlyProp])
}

function useToggle({
  initialOn = false,
  reducer = toggleReducer,
  onChange,
  on: controlledOn,
   readOnly = false
} = {}) {
  const {current: initialState} = React.useRef({on: initialOn})
  const [state, dispatch] = React.useReducer(reducer, initialState)
  const onIsControlled = controlledOn !== null;
  const on = onIsControlled ? controlledOn : state.on;

  if (process.env.NODE_ENV !== 'production') {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useControlledSwitchWarning(controlledOn, 'on', 'useToggle');
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useOnChangeReadOnlyWarning(controlledOn, 'on', 'useToggle', Boolean(onChange), readOnly, 'readOnly', 'initialOn', 'onChange');
  }

  const dispatchWithOnChange = (action) => {
    if (!onIsControlled) {
      dispatch(action)
    }

    onChange?.(reducer({...state, on}, action), action);
  };

  const toggle = () => dispatchWithOnChange({type: actionTypes.toggle})
  const reset = () => dispatchWithOnChange({type: actionTypes.reset, initialState})

  function getTogglerProps({onClick, ...props} = {}) {
    return {
      'aria-pressed': on,
      onClick: callAll(onClick, toggle),
      ...props,
    }
  }

  function getResetterProps({onClick, ...props} = {}) {
    return {
      onClick: callAll(onClick, reset),
      ...props,
    }
  }

  return {
    on,
    reset,
    toggle,
    getTogglerProps,
    getResetterProps,
  }
}

function Toggle({on: controlledOn, onChange}) {
  const {on, getTogglerProps} = useToggle({on: controlledOn, onChange})
  const props = getTogglerProps({on})
  return <Switch {...props} />
}

function App() {
  const [bothOn, setBothOn] = React.useState(false)
  const [timesClicked, setTimesClicked] = React.useState(0)

  function handleToggleChange(state, action) {
    if (action.type === actionTypes.toggle && timesClicked > 4) {
      return
    }
    setBothOn()
    setTimesClicked(c => c + 1)
  }

  function handleResetClick() {
    setBothOn(false)
    setTimesClicked(0)
  }

  return (
      <div>
        <div>
          <Toggle on={bothOn} onChange={handleToggleChange}/>
          <Toggle on={bothOn} onChange={handleToggleChange} />
        </div>
        {timesClicked > 4 ? (
            <div data-testid="notice">
              Whoa, you clicked too much!
              <br />
            </div>
        ) : (
            <div data-testid="click-count">Click count: {timesClicked}</div>
        )}
        <button onClick={handleResetClick}>Reset</button>
        <hr />
        <div>
          <div>Uncontrolled Toggle:</div>
          <Toggle
              onChange={(...args) =>
                  console.info('Uncontrolled Toggle onChange', ...args)
              }
          />
        </div>
      </div>
  )
}

export default App
// we're adding the Toggle export for tests
export {Toggle}

/*
eslint
  no-unused-vars: "off",
*/
