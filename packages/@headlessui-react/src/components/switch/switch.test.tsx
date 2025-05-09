import { render } from '@testing-library/react'
import React, { useState } from 'react'
import {
  assertActiveElement,
  assertSwitch,
  getByText,
  getSwitch,
  getSwitchLabel,
  SwitchState,
} from '../../test-utils/accessibility-assertions'
import { click, focus, Keys, mouseEnter, press } from '../../test-utils/interactions'
import { Switch } from './switch'

describe('Safe guards', () => {
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

  describe('`tabIndex` attribute', () => {
    it('should have a default tabIndex of `0`', () => {
      render(
        <Switch checked={false} onChange={console.log}>
          <span>Enable notifications</span>
        </Switch>
      )
      assertSwitch({
        state: SwitchState.Off,
        label: 'Enable notifications',
        attributes: { tabindex: '0' },
      })
    })

    it('should be possible to override the `tabIndex`', () => {
      render(
        <Switch checked={false} onChange={console.log} tabIndex={3}>
          <span>Enable notifications</span>
        </Switch>
      )
      assertSwitch({
        state: SwitchState.Off,
        label: 'Enable notifications',
        attributes: { tabindex: '3' },
      })
    })

    it('should not be possible to override the `tabIndex` to `-1`', () => {
      render(
        <Switch checked={false} onChange={console.log} tabIndex={-1}>
          <span>Enable notifications</span>
        </Switch>
      )
      assertSwitch({
        state: SwitchState.Off,
        label: 'Enable notifications',
        attributes: { tabindex: '0' },
      })
    })
  })

  describe('`type` attribute', () => {
    it('should set the `type` to "button" by default', async () => {
      render(
        <Switch checked={false} onChange={console.log}>
          Trigger
        </Switch>
      )

      expect(getSwitch()).toHaveAttribute('type', 'button')
    })

    it('should not set the `type` to "button" if it already contains a `type`', async () => {
      render(
        <Switch checked={false} onChange={console.log} type="submit">
          Trigger
        </Switch>
      )

      expect(getSwitch()).toHaveAttribute('type', 'submit')
    })

    it('should set the `type` to "button" when using the `as` prop which resolves to a "button"', async () => {
      let CustomButton = React.forwardRef<HTMLButtonElement>((props, ref) => (
        <button ref={ref} {...props} />
      ))

      render(
        <Switch checked={false} onChange={console.log} as={CustomButton}>
          Trigger
        </Switch>
      )

      expect(getSwitch()).toHaveAttribute('type', 'button')
    })

    it('should not set the type if the "as" prop is not a "button"', async () => {
      render(
        <Switch checked={false} onChange={console.log} as="div">
          Trigger
        </Switch>
      )

      expect(getSwitch()).not.toHaveAttribute('type')
    })

    it('should not set the `type` to "button" when using the `as` prop which resolves to a "div"', async () => {
      let CustomButton = React.forwardRef<HTMLDivElement>((props, ref) => (
        <div ref={ref} {...props} />
      ))

      render(
        <Switch checked={false} onChange={console.log} as={CustomButton}>
          Trigger
        </Switch>
      )

      expect(getSwitch()).not.toHaveAttribute('type')
    })
  })

  describe('Uncontrolled', () => {
    it('should be possible to use in an uncontrolled way', async () => {
      let handleSubmission = jest.fn()

      render(
        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleSubmission(Object.fromEntries(new FormData(e.target as HTMLFormElement)))
          }}
        >
          <Switch name="notifications" />
          <button id="submit">submit</button>
        </form>
      )

      await click(document.getElementById('submit'))

      // No values
      expect(handleSubmission).toHaveBeenLastCalledWith({})

      // Toggle
      await click(getSwitch())

      // Submit
      await click(document.getElementById('submit'))

      // Notifications should be on
      expect(handleSubmission).toHaveBeenLastCalledWith({ notifications: 'on' })

      // Toggle
      await click(getSwitch())

      // Submit
      await click(document.getElementById('submit'))

      // Notifications should be off (or in this case, non-existent)
      expect(handleSubmission).toHaveBeenLastCalledWith({})
    })

    it('should be possible to use in an uncontrolled way with a value', async () => {
      let handleSubmission = jest.fn()

      render(
        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleSubmission(Object.fromEntries(new FormData(e.target as HTMLFormElement)))
          }}
        >
          <Switch name="notifications" value="enabled" />
          <button id="submit">submit</button>
        </form>
      )

      await click(document.getElementById('submit'))

      // No values
      expect(handleSubmission).toHaveBeenLastCalledWith({})

      // Toggle
      await click(getSwitch())

      // Submit
      await click(document.getElementById('submit'))

      // Notifications should be on
      expect(handleSubmission).toHaveBeenLastCalledWith({ notifications: 'enabled' })

      // Toggle
      await click(getSwitch())

      // Submit
      await click(document.getElementById('submit'))

      // Notifications should be off (or in this case, non-existent)
      expect(handleSubmission).toHaveBeenLastCalledWith({})
    })

    it('should be possible to provide a default value', async () => {
      let handleSubmission = jest.fn()

      render(
        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleSubmission(Object.fromEntries(new FormData(e.target as HTMLFormElement)))
          }}
        >
          <Switch name="notifications" defaultChecked />
          <button id="submit">submit</button>
        </form>
      )

      await click(document.getElementById('submit'))

      // Notifications should be on by default
      expect(handleSubmission).toHaveBeenLastCalledWith({ notifications: 'on' })

      // Toggle
      await click(getSwitch())

      // Submit
      await click(document.getElementById('submit'))

      // Notifications should be off (or in this case non-existent)
      expect(handleSubmission).toHaveBeenLastCalledWith({})
    })

    it('should be possible to reset to the default value if the form is reset', async () => {
      let handleSubmission = jest.fn()

      render(
        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleSubmission(Object.fromEntries(new FormData(e.target as HTMLFormElement)))
          }}
        >
          <Switch name="assignee" value="bob" defaultChecked />
          <button id="submit">submit</button>
          <button type="reset" id="reset">
            reset
          </button>
        </form>
      )

      // Bob is the defaultValue
      await click(document.getElementById('submit'))
      expect(handleSubmission).toHaveBeenLastCalledWith({ assignee: 'bob' })

      // Toggle the switch
      await click(getSwitch())

      // Bob should not be active anymore
      await click(document.getElementById('submit'))
      expect(handleSubmission).toHaveBeenLastCalledWith({})

      // Reset
      await click(document.getElementById('reset'))

      // Bob should be submitted again
      await click(document.getElementById('submit'))
      expect(handleSubmission).toHaveBeenLastCalledWith({ assignee: 'bob' })
    })

    it('should still call the onChange listeners when choosing new values', async () => {
      let handleChange = jest.fn()

      render(<Switch name="notifications" onChange={handleChange} />)

      // Toggle
      await click(getSwitch())

      // Toggle
      await click(getSwitch())

      // Toggle
      await click(getSwitch())

      // Change handler should have been called 3 times
      expect(handleChange).toHaveBeenNthCalledWith(1, true)
      expect(handleChange).toHaveBeenNthCalledWith(2, false)
      expect(handleChange).toHaveBeenNthCalledWith(3, true)
    })
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

  it('should be possible to render a Switch.Group, Switch and Switch.Description (before the Switch)', async () => {
    render(
      <Switch.Group>
        <Switch.Description>This is an important feature</Switch.Description>
        <Switch checked={false} onChange={console.log} />
      </Switch.Group>
    )

    assertSwitch({ state: SwitchState.Off, description: 'This is an important feature' })
  })

  it('should be possible to render a Switch.Group, Switch and Switch.Description (after the Switch)', () => {
    render(
      <Switch.Group>
        <Switch checked={false} onChange={console.log} />
        <Switch.Description>This is an important feature</Switch.Description>
      </Switch.Group>
    )

    assertSwitch({ state: SwitchState.Off, description: 'This is an important feature' })
  })

  it('should be possible to render a Switch.Group, Switch, Switch.Label and Switch.Description', () => {
    render(
      <Switch.Group>
        <Switch.Label>Label A</Switch.Label>
        <Switch checked={false} onChange={console.log} />
        <Switch.Description>This is an important feature</Switch.Description>
      </Switch.Group>
    )

    assertSwitch({
      state: SwitchState.Off,
      label: 'Label A',
      description: 'This is an important feature',
    })
  })
})

describe('Keyboard interactions', () => {
  describe('`Space` key', () => {
    it('should be possible to toggle the Switch with Space', async () => {
      let handleChange = jest.fn()
      function Example() {
        let [state, setState] = useState(false)
        return (
          <Switch
            checked={state}
            onChange={(value) => {
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
      await focus(getSwitch())

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
      let handleChange = jest.fn()
      render(<Switch checked={false} onChange={handleChange} />)

      // Ensure checkbox is off
      assertSwitch({ state: SwitchState.Off })

      // Focus the switch
      await focus(getSwitch())

      // Try to toggle
      await press(Keys.Enter)

      expect(handleChange).not.toHaveBeenCalled()
    })

    it('should submit the form on `Enter`', async () => {
      let submits = jest.fn()

      function Example() {
        let [value, setValue] = useState(true)

        return (
          <form
            onSubmit={(event) => {
              event.preventDefault()
              submits([...new FormData(event.currentTarget).entries()])
            }}
          >
            <Switch checked={value} onChange={setValue} name="option" />
            <button>Submit</button>
          </form>
        )
      }

      render(<Example />)

      // Focus the input field
      await focus(getSwitch())
      assertActiveElement(getSwitch())

      // Press enter (which should submit the form)
      await press(Keys.Enter)

      // Verify the form was submitted
      expect(submits).toHaveBeenCalledTimes(1)
      expect(submits).toHaveBeenCalledWith([['option', 'on']])
    })

    it('should submit the form on `Enter` (when no submit button was found)', async () => {
      let submits = jest.fn()

      function Example() {
        let [value, setValue] = useState(true)

        return (
          <form
            onSubmit={(event) => {
              event.preventDefault()
              submits([...new FormData(event.currentTarget).entries()])
            }}
          >
            <Switch checked={value} onChange={setValue} name="option" />
          </form>
        )
      }

      render(<Example />)

      // Focus the input field
      await focus(getSwitch())
      assertActiveElement(getSwitch())

      // Press enter (which should submit the form)
      await press(Keys.Enter)

      // Verify the form was submitted
      expect(submits).toHaveBeenCalledTimes(1)
      expect(submits).toHaveBeenCalledWith([['option', 'on']])
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
      await focus(getSwitch())

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
    let handleChange = jest.fn()
    function Example() {
      let [state, setState] = useState(false)
      return (
        <Switch
          checked={state}
          onChange={(value) => {
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
    let handleChange = jest.fn()
    function Example() {
      let [state, setState] = useState(false)
      return (
        <Switch.Group>
          <Switch
            checked={state}
            onChange={(value) => {
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

  it('should not be possible to toggle the Switch with a click on the Label (passive)', async () => {
    let handleChange = jest.fn()
    function Example() {
      let [state, setState] = useState(false)
      return (
        <Switch.Group>
          <Switch
            checked={state}
            onChange={(value) => {
              setState(value)
              handleChange(value)
            }}
          />
          <Switch.Label passive>The label</Switch.Label>
        </Switch.Group>
      )
    }

    render(<Example />)

    // Ensure checkbox is off
    assertSwitch({ state: SwitchState.Off })

    // Toggle
    await click(getSwitchLabel())

    // Ensure state is still off
    assertSwitch({ state: SwitchState.Off })
  })

  xit('should be possible to hover the label and trigger a hover on the switch', async () => {
    // This test doesn't work in JSDOM :(
    // Keeping it here for reference when we can test this in a real browser
    function Example() {
      let [state] = useState(false)
      return (
        <Switch.Group>
          <style>{`.bg{background-color:rgba(0,255,0)}.bg-on-hover:hover{background-color:rgba(255,0,0)}`}</style>
          <Switch checked={state} className="bg bg-on-hover" />
          <Switch.Label>The label</Switch.Label>
        </Switch.Group>
      )
    }

    render(<Example />)

    // Verify the switch is not hovered
    expect(window.getComputedStyle(getSwitch()!).backgroundColor).toBe('rgb(0, 255, 0)')

    // Hover over the *label*
    await mouseEnter(getSwitchLabel())

    // Make sure the switch gets hover styles
    expect(window.getComputedStyle(getSwitch()!).backgroundColor).toBe('rgb(255, 0, 0)')
  })
})

describe('Form compatibility', () => {
  it('should be possible to set the `form`, which is forwarded to the hidden inputs', async () => {
    let submits = jest.fn()

    function Example() {
      let [state, setState] = useState(false)
      return (
        <div>
          <Switch.Group>
            <Switch form="my-form" checked={state} onChange={setState} name="notifications" />
            <Switch.Label>Enable notifications</Switch.Label>
          </Switch.Group>

          <form
            id="my-form"
            onSubmit={(event) => {
              event.preventDefault()
              submits([...new FormData(event.currentTarget).entries()])
            }}
          >
            <button>Submit</button>
          </form>
        </div>
      )
    }

    render(<Example />)

    // Toggle
    await click(getSwitchLabel())

    // Submit the form again
    await click(getByText('Submit'))

    // Verify that the form has been submitted
    expect(submits).toHaveBeenLastCalledWith([['notifications', 'on']])
  })

  it('should be possible to submit a form with an boolean value', async () => {
    let submits = jest.fn()

    function Example() {
      let [state, setState] = useState(false)
      return (
        <form
          onSubmit={(event) => {
            event.preventDefault()
            submits([...new FormData(event.currentTarget).entries()])
          }}
        >
          <Switch.Group>
            <Switch checked={state} onChange={setState} name="notifications" />
            <Switch.Label>Enable notifications</Switch.Label>
          </Switch.Group>
          <button>Submit</button>
        </form>
      )
    }

    render(<Example />)

    // Submit the form
    await click(getByText('Submit'))

    // Verify that the form has been submitted
    expect(submits).toHaveBeenLastCalledWith([]) // no data

    // Toggle
    await click(getSwitchLabel())

    // Submit the form again
    await click(getByText('Submit'))

    // Verify that the form has been submitted
    expect(submits).toHaveBeenLastCalledWith([['notifications', 'on']])
  })

  it('should be possible to submit a form with a provided string value', async () => {
    let submits = jest.fn()

    function Example() {
      let [state, setState] = useState(false)
      return (
        <form
          onSubmit={(event) => {
            event.preventDefault()
            submits([...new FormData(event.currentTarget).entries()])
          }}
        >
          <Switch.Group>
            <Switch checked={state} onChange={setState} name="fruit" value="apple" />
            <Switch.Label>Apple</Switch.Label>
          </Switch.Group>
          <button>Submit</button>
        </form>
      )
    }

    render(<Example />)

    // Submit the form
    await click(getByText('Submit'))

    // Verify that the form has been submitted
    expect(submits).toHaveBeenLastCalledWith([]) // no data

    // Toggle
    await click(getSwitchLabel())

    // Submit the form again
    await click(getByText('Submit'))

    // Verify that the form has been submitted
    expect(submits).toHaveBeenLastCalledWith([['fruit', 'apple']])
  })

  it('should not submit the data if the Switch is disabled', async () => {
    let submits = jest.fn()

    function Example() {
      let [state, setState] = useState(true)
      return (
        <form
          onSubmit={(event) => {
            event.preventDefault()
            submits([...new FormData(event.currentTarget).entries()])
          }}
        >
          <input type="hidden" name="foo" value="bar" />
          <Switch.Group>
            <Switch checked={state} onChange={setState} name="fruit" value="apple" disabled />
            <Switch.Label>Apple</Switch.Label>
          </Switch.Group>
          <button>Submit</button>
        </form>
      )
    }

    render(<Example />)

    // Submit the form
    await click(getByText('Submit'))

    // Verify that the form has been submitted
    expect(submits).toHaveBeenLastCalledWith([
      ['foo', 'bar'], // The only available field
    ])
  })
})
