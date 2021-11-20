import { render } from '@testing-library/react'
import { Label, useLabels } from './label'
import React, { ReactNode } from 'react'

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
  expect(container.firstChild).toMatchInlineSnapshot(`
    <div>
      No label
    </div>
  `)
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
  expect(container.firstChild).toMatchInlineSnapshot(`
    <div
      aria-labelledby="headlessui-label-1"
    >
      <label
        id="headlessui-label-1"
      >
        I am a label
      </label>
      <span>
        Contents
      </span>
    </div>
  `)
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
  expect(container.firstChild).toMatchInlineSnapshot(`
    <div
      aria-labelledby="headlessui-label-1 headlessui-label-2"
    >
      <label
        id="headlessui-label-1"
      >
        I am a label
      </label>
      <span>
        Contents
      </span>
      <label
        id="headlessui-label-2"
      >
        I am also a label
      </label>
    </div>
  `)
})
