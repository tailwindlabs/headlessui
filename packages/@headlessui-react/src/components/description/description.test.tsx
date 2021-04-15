import { render } from '@testing-library/react'
import { Description, useDescriptions } from './description'
import React, { ReactNode } from 'react'

jest.mock('../../hooks/use-id')

it('should be possible to use a DescriptionProvider without using a Description', async () => {
  function Component(props: { children: ReactNode }) {
    let [describedby, DescriptionProvider] = useDescriptions()

    return (
      <DescriptionProvider>
        <div aria-describedby={describedby}>{props.children}</div>
      </DescriptionProvider>
    )
  }

  function Example() {
    return <Component>No description</Component>
  }

  let { container } = render(<Example />)
  expect(container.firstChild).toMatchInlineSnapshot(`
    <div>
      No description
    </div>
  `)
})

it('should be possible to use a DescriptionProvider and a single Description, and have them linked', async () => {
  function Component(props: { children: ReactNode }) {
    let [describedby, DescriptionProvider] = useDescriptions()

    return (
      <DescriptionProvider>
        <div aria-describedby={describedby}>{props.children}</div>
      </DescriptionProvider>
    )
  }

  function Example() {
    return (
      <Component>
        <Description>I am a description</Description>
        <span>Contents</span>
      </Component>
    )
  }

  let { container } = render(<Example />)
  expect(container.firstChild).toMatchInlineSnapshot(`
    <div
      aria-describedby="headlessui-description-1"
    >
      <p
        id="headlessui-description-1"
      >
        I am a description
      </p>
      <span>
        Contents
      </span>
    </div>
  `)
})

it('should be possible to use a DescriptionProvider and multiple Description components, and have them linked', async () => {
  function Component(props: { children: ReactNode }) {
    let [describedby, DescriptionProvider] = useDescriptions()

    return (
      <DescriptionProvider>
        <div aria-describedby={describedby}>{props.children}</div>
      </DescriptionProvider>
    )
  }

  function Example() {
    return (
      <Component>
        <Description>I am a description</Description>
        <span>Contents</span>
        <Description>I am also a description</Description>
      </Component>
    )
  }

  let { container } = render(<Example />)
  expect(container.firstChild).toMatchInlineSnapshot(`
    <div
      aria-describedby="headlessui-description-1 headlessui-description-2"
    >
      <p
        id="headlessui-description-1"
      >
        I am a description
      </p>
      <span>
        Contents
      </span>
      <p
        id="headlessui-description-2"
      >
        I am also a description
      </p>
    </div>
  `)
})
