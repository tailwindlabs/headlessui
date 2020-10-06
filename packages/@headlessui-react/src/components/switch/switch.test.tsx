import React from 'react'
import { render } from '@testing-library/react'

import { Switch } from './switch'
import {
  SwitchState,
  assertSwitch,
  getSwitch,
  assertActiveElement,
  getSwitchLabel,
} from '../../test-utils/accessibility-assertions'
import { press, click, Keys } from '../../test-utils/interactions'
import { suppressConsoleLogs } from '../../test-utils/suppress-console-logs'

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

describe('Keyboard interactions', () => {
  describe('`Space` key', () => {
    it('should be possible to toggle the Switch with Space', async () => {
      const handleChange = jest.fn()
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

      render(<Example />)

      // Ensure checkbox is off
      assertSwitch({ state: SwitchState.Off })

      // Focus the switch
      getSwitch()?.focus()

      // Toggle
      await press(Keys.Space)

      // Ensure state is on
      assertSwitch({ state: SwitchState.On })

      // Toggle
      await press(Keys.Space)

      // Ensure state is off
      assertSwitch({ state: SwitchState.Off })
    })
  })

  describe('`Enter` key', () => {
    it('should not be possible to use Enter to toggle the Switch', async () => {
      const handleChange = jest.fn()
      render(<Switch checked={false} onChange={handleChange} />)

      // Ensure checkbox is off
      assertSwitch({ state: SwitchState.Off })

      // Focus the switch
      getSwitch()?.focus()

      // Try to toggle
      await press(Keys.Enter)

      expect(handleChange).not.toHaveBeenCalled()
    })
  })

  describe('`Tab` key', () => {
    it('should be possible to tab away from the Switch', async () => {
      render(
        <div>
          <Switch checked={false} onChange={console.log} />
          <button id="btn">Other element</button>
        </div>
      )

      // Ensure checkbox is off
      assertSwitch({ state: SwitchState.Off })

      // Focus the switch
      getSwitch()?.focus()

      // Expect the switch to be active
      assertActiveElement(getSwitch())

      // Toggle
      await press(Keys.Tab)

      // Expect the button to be active
      assertActiveElement(document.getElementById('btn'))
    })
  })
})

describe('Mouse interactions', () => {
  it('should be possible to toggle the Switch with a click', async () => {
    const handleChange = jest.fn()
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

    render(<Example />)

    // Ensure checkbox is off
    assertSwitch({ state: SwitchState.Off })

    // Toggle
    await click(getSwitch())

    // Ensure state is on
    assertSwitch({ state: SwitchState.On })

    // Toggle
    await click(getSwitch())

    // Ensure state is off
    assertSwitch({ state: SwitchState.Off })
  })

  it('should be possible to toggle the Switch with a click on the Label', async () => {
    const handleChange = jest.fn()
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

    render(<Example />)

    // Ensure checkbox is off
    assertSwitch({ state: SwitchState.Off })

    // Toggle
    await click(getSwitchLabel())

    // Ensure the switch is focused
    assertActiveElement(getSwitch())

    // Ensure state is on
    assertSwitch({ state: SwitchState.On })

    // Toggle
    await click(getSwitchLabel())

    // Ensure the switch is focused
    assertActiveElement(getSwitch())

    // Ensure state is off
    assertSwitch({ state: SwitchState.Off })
  })
})
