import { render } from '@testing-library/react'
import React, { useState, type ReactNode } from 'react'
import { assertActiveElement } from '../../test-utils/accessibility-assertions'
import { click } from '../../test-utils/interactions'
import { Field } from '../field/field'
import { Input } from '../input/input'
import { Radio, RadioGroup } from '../radio-group/radio-group'
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

it('should render a `for` attribute on the `Label` when it is linked to a labelable element', async () => {
  let { container } = render(
    <Field>
      <Label>Name</Label>
      <Input />
    </Field>
  )

  let label = container.querySelector('label')
  let input = container.querySelector('input')

  expect(label).toHaveAttribute('for', input?.id)
})

it('should not render a `for` attribute on the `Label` when it is linked to a non-labelable element (e.g.: a `Radio`)', async () => {
  let { container } = render(
    <RadioGroup value="a" onChange={() => {}}>
      <Field>
        <Radio value="a" />
        <Label>A</Label>
      </Field>
    </RadioGroup>
  )

  let label = container.querySelector('label')
  let radio = container.querySelector('[role="radio"]')

  expect(label).not.toHaveAttribute('for')

  // The `Label` should still be linked to the `Radio` via `aria-labelledby`
  expect(radio).toHaveAttribute('aria-labelledby', label?.id)
})

it('should still proxy clicks on the `Label` to the linked `Radio` without a `for` attribute', async () => {
  function Example() {
    let [value, setValue] = useState<string | null>(null)

    return (
      <RadioGroup value={value} onChange={setValue}>
        <Field>
          <Radio value="a" />
          <Label>A</Label>
        </Field>
      </RadioGroup>
    )
  }

  let { container } = render(<Example />)

  let label = container.querySelector('label')!
  let radio = container.querySelector('[role="radio"]') as HTMLElement

  expect(label).not.toHaveAttribute('for')

  await click(label)

  // The `Radio` received focus, which means the `Label` was still able to
  // resolve the linked control even without a rendered `for` attribute.
  assertActiveElement(radio)
})
