import { render } from '@testing-library/react'
import React, { type ReactNode } from 'react'
import {
  CheckboxState,
  assertActiveElement,
  assertCheckbox,
  assertLinkedWithLabel,
  getCheckbox,
  getLabel,
} from '../../test-utils/accessibility-assertions'
import { click } from '../../test-utils/interactions'
import { Checkbox } from '../checkbox/checkbox'
import { Field } from '../field/field'
import { Label, useLabels } from './label'

jest.mock('../../hooks/use-id')

it('should be possible to use a LabelProvider without using a Label', async () => {
  function Component(props: { children: ReactNode }) {
    let [labelledby, LabelProvider] = useLabels()

    return (
      <LabelProvider>
        <div aria-labelledby={labelledby}>{props.children}</div>
      </LabelProvider>
    )
  }

  function Example() {
    return <Component>No label</Component>
  }

  let { container } = render(<Example />)
  expect(container.firstChild).toMatchSnapshot()
})

it('should be possible to use a LabelProvider and a single Label, and have them linked', async () => {
  function Component(props: { children: ReactNode }) {
    let [labelledby, LabelProvider] = useLabels()

    return (
      <LabelProvider>
        <div aria-labelledby={labelledby}>{props.children}</div>
      </LabelProvider>
    )
  }

  function Example() {
    return (
      <Component>
        <Label>I am a label</Label>
        <span>Contents</span>
      </Component>
    )
  }

  let { container } = render(<Example />)
  expect(container.firstChild).toMatchSnapshot()
})

it('should be possible to use a LabelProvider and multiple Label components, and have them linked', async () => {
  function Component(props: { children: ReactNode }) {
    let [labelledby, LabelProvider] = useLabels()

    return (
      <LabelProvider>
        <div aria-labelledby={labelledby}>{props.children}</div>
      </LabelProvider>
    )
  }

  function Example() {
    return (
      <Component>
        <Label>I am a label</Label>
        <span>Contents</span>
        <Label>I am also a label</Label>
      </Component>
    )
  }

  let { container } = render(<Example />)
  expect(container.firstChild).toMatchSnapshot()
})

it('should be possible to use a Label with a non labelablea element', async () => {
  function Example() {
    return (
      <Field>
        <Label>Accept terms and conditions</Label>
        <Checkbox />
      </Field>
    )
  }

  render(<Example />)

  // Ensure the label is linked to the checkbox
  assertLinkedWithLabel(getCheckbox(), getLabel()!)

  // Ensure the checkbox is not checked
  assertCheckbox({ state: CheckboxState.Unchecked })

  // Ensure we can click on the label
  await click(getLabel())

  // Ensure the checkbox was toggled
  assertCheckbox({ state: CheckboxState.Checked })

  // Ensure focus is moved to the checkbox
  assertActiveElement(getCheckbox())
})
