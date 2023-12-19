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
