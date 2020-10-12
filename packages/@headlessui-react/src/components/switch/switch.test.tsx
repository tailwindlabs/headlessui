import React from 'react'
import { render } from '@testing-library/react'
import { switchComponent } from '@headlessui/tests/suits'
import { suppressConsoleLogs } from '@headlessui/tests/utils'
import { SwitchState, assertSwitch } from '@headlessui/tests/accessibility-assertions'

import { Switch } from './switch'

jest.mock('../../hooks/use-id')

describe('Safe guards', () => {
  it.each([['Switch.Label', Switch.Label]])(
    'should error when we are using a <%s /> without a parent <Switch.Group />',
    suppressConsoleLogs((name, Component) => {
      expect(() => render(React.createElement(Component))).toThrowError(
        `<${name} /> is missing a parent <Switch.Group /> component.`
      )
    })
  )

  it('should be possible to render a Switch without crashing', () => {
    render(<Switch checked={false} onChange={console.log} />)
  })
})

describe('Rendering', () => {
  it('should be possible to render an (on) Switch using a render prop', () => {
    render(
      <Switch checked={true} onChange={console.log}>
        {({ checked }) => <span>{checked ? 'On' : 'Off'}</span>}
      </Switch>
    )

    assertSwitch({ state: SwitchState.On, textContent: 'On' })
  })

  it('should be possible to render an (off) Switch using a render prop', () => {
    render(
      <Switch checked={false} onChange={console.log}>
        {({ checked }) => <span>{checked ? 'On' : 'Off'}</span>}
      </Switch>
    )

    assertSwitch({ state: SwitchState.Off, textContent: 'Off' })
  })

  it('should be possible to render an (on) Switch using an `as` prop', () => {
    render(<Switch as="span" checked={true} onChange={console.log} />)
    assertSwitch({ state: SwitchState.On, tag: 'span' })
  })

  it('should be possible to render an (off) Switch using an `as` prop', () => {
    render(<Switch as="span" checked={false} onChange={console.log} />)
    assertSwitch({ state: SwitchState.Off, tag: 'span' })
  })

  it('should be possible to use the switch contents as the label', () => {
    render(
      <Switch checked={false} onChange={console.log}>
        <span>Enable notifications</span>
      </Switch>
    )
    assertSwitch({ state: SwitchState.Off, label: 'Enable notifications' })
  })
})

describe('Render composition', () => {
  it('should be possible to render a Switch.Group, Switch and Switch.Label', () => {
    render(
      <Switch.Group>
        <Switch checked={false} onChange={console.log} />
        <Switch.Label>Enable notifications</Switch.Label>
      </Switch.Group>
    )

    assertSwitch({ state: SwitchState.Off, label: 'Enable notifications' })
  })

  it('should be possible to render a Switch.Group, Switch and Switch.Label (before the Switch)', () => {
    render(
      <Switch.Group>
        <Switch.Label>Label B</Switch.Label>
        <Switch checked={false} onChange={console.log}>
          Label A
        </Switch>
      </Switch.Group>
    )

    // Warning! Using aria-label or aria-labelledby will hide any descendant content from assistive
    // technologies.
    //
    // Thus: Label A should not be part of the "label" in this case
    assertSwitch({ state: SwitchState.Off, label: 'Label B' })
  })

  it('should be possible to render a Switch.Group, Switch and Switch.Label (after the Switch)', () => {
    render(
      <Switch.Group>
        <Switch checked={false} onChange={console.log}>
          Label A
        </Switch>
        <Switch.Label>Label B</Switch.Label>
      </Switch.Group>
    )

    // Warning! Using aria-label or aria-labelledby will hide any descendant content from assistive
    // technologies.
    //
    // Thus: Label A should not be part of the "label" in this case
    assertSwitch({ state: SwitchState.Off, label: 'Label B' })
  })
})

switchComponent.run({
  [switchComponent.scenarios.Default]({ handleChange }) {
    function Example() {
      const [state, setState] = React.useState(false)
      return (
        <Switch
          checked={state}
          onChange={value => {
            setState(value)
            handleChange(value)
          }}
        />
      )
    }

    return render(<Example />)
  },
  [switchComponent.scenarios.WithOtherElement]() {
    return render(
      <div>
        <Switch checked={false} onChange={console.log} />
        <button id="btn">Other element</button>
      </div>
    )
  },
  [switchComponent.scenarios.WithGroup]({ handleChange }) {
    function Example() {
      const [state, setState] = React.useState(false)
      return (
        <Switch.Group>
          <Switch
            checked={state}
            onChange={value => {
              setState(value)
              handleChange(value)
            }}
          />
          <Switch.Label>The label</Switch.Label>
        </Switch.Group>
      )
    }

    return render(<Example />)
  },
})
