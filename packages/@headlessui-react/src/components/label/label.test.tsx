import { render } from '@testing-library/react'
import React, { type ReactNode } from 'react'
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
