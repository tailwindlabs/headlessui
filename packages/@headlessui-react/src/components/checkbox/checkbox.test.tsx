import { render } from '@testing-library/react'
import React, { useState } from 'react'
import {
  CheckboxState,
  assertCheckbox,
  getCheckbox,
} from '../../test-utils/accessibility-assertions'
import { Keys, click, focus, press } from '../../test-utils/interactions'
import {
  commonControlScenarios,
  commonFormScenarios,
  commonRenderingScenarios,
} from '../../test-utils/scenarios'
import { suppressConsoleLogs } from '../../test-utils/suppress-console-logs'
import { Field } from '../field/field'
import { Label } from '../label/label'
import { Checkbox, type CheckboxProps } from './checkbox'

commonRenderingScenarios(Checkbox, { getElement: getCheckbox })
commonControlScenarios(Checkbox)
commonFormScenarios((props) => <Checkbox defaultChecked {...props} />, {
  async performUserInteraction(control) {
    await click(control)
  },
})

describe('Rendering', () => {
  it(
    'should be possible to put the checkbox in an indeterminate state',
    suppressConsoleLogs(async () => {
      render(<Checkbox indeterminate />)

      assertCheckbox({ state: CheckboxState.Indeterminate })
    })
  )

  it(
    'should be possible to put the checkbox in an default checked state',
    suppressConsoleLogs(async () => {
      render(<Checkbox defaultChecked />)

      assertCheckbox({ state: CheckboxState.Checked })
    })
  )

  it(
    'should render a checkbox in an unchecked state',
    suppressConsoleLogs(async () => {
      render(<Checkbox />)

      assertCheckbox({ state: CheckboxState.Unchecked })
    })
  )
})

describe.each([
  [
    'Uncontrolled',
    function Example(props: CheckboxProps) {
      return <Checkbox {...props} />
    },
  ],
  [
    'Controlled',
    function Example(props: CheckboxProps) {
      let [checked, setChecked] = useState(false)
      return <Checkbox checked={checked} onChange={setChecked} {...props} />
    },
  ],
])('Keyboard interactions (%s)', (_, Example) => {
  describe('`Space` key', () => {
    it(
      'should be possible to toggle a checkbox',
      suppressConsoleLogs(async () => {
        render(<Example />)

        assertCheckbox({ state: CheckboxState.Unchecked })

        await focus(getCheckbox())
        await press(Keys.Space)

        assertCheckbox({ state: CheckboxState.Checked })

        await press(Keys.Space)

        assertCheckbox({ state: CheckboxState.Unchecked })
      })
    )
  })
})

describe.each([
  [
    'Uncontrolled',
    function Example(props: CheckboxProps) {
      return <Checkbox {...props} />
    },
  ],
  [
    'Controlled',
    function Example(props: CheckboxProps) {
      let [checked, setChecked] = useState(false)
      return <Checkbox checked={checked} onChange={setChecked} {...props} />
    },
  ],
])('Mouse interactions (%s)', (_, Example) => {
  it(
    'should be possible to toggle a checkbox by clicking it',
    suppressConsoleLogs(async () => {
      render(<Example />)

      assertCheckbox({ state: CheckboxState.Unchecked })

      await click(getCheckbox())

      assertCheckbox({ state: CheckboxState.Checked })

      await click(getCheckbox())

      assertCheckbox({ state: CheckboxState.Unchecked })
    })
  )
})

describe('Form submissions', () => {
  it('should omit invalid label `for` attributes in a Field while preserving label interaction', async () => {
    let { container, getByText } = render(
      <form>
        <Field>
          <Label>Accept terms</Label>
          <Checkbox name="terms" />
        </Field>
      </form>
    )

    let label = getByText('Accept terms')
    let checkbox = getCheckbox()

    expect(label).not.toHaveAttribute('for')
    expect(checkbox).toHaveAttribute('aria-labelledby', label.id)

    await click(label)

    assertCheckbox({ state: CheckboxState.Checked })
    expect(document.activeElement).toBe(checkbox)
    expect(Object.fromEntries(new FormData(container.querySelector('form')!))).toEqual({
      terms: 'on',
    })
  })

  it('should be possible to use in an uncontrolled way', async () => {
    let handleSubmission = jest.fn()

    render(
      <form
        onSubmit={(e) => {
          e.preventDefault()
          handleSubmission(Object.fromEntries(new FormData(e.target as HTMLFormElement)))
        }}
      >
        <Checkbox name="notifications" />
      </form>
    )

    let checkbox = document.querySelector('[id^="headlessui-checkbox-"]') as HTMLInputElement

    // Focus the checkbox
    await focus(checkbox)

    // Submit
    await press(Keys.Enter)

    // No values
    expect(handleSubmission).toHaveBeenLastCalledWith({})

    // Toggle
    await click(checkbox)

    // Submit
    await press(Keys.Enter)

    // Notifications should be on
    expect(handleSubmission).toHaveBeenLastCalledWith({ notifications: 'on' })

    // Toggle
    await click(checkbox)

    // Submit
    await press(Keys.Enter)

    // Notifications should be off (or in this case, non-existent)
    expect(handleSubmission).toHaveBeenLastCalledWith({})
  })
})
