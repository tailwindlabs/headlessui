import { render } from '@testing-library/react'
import React, { useRef, useState, type ReactNode } from 'react'
import { assertInert, assertNotInert, getByText } from '../test-utils/accessibility-assertions'
import { click } from '../test-utils/interactions'
import { useInert } from './use-inert'

beforeEach(() => {
  jest.restoreAllMocks()
  jest.spyOn(global.console, 'error').mockImplementation(jest.fn())
})

it('should be possible to inert an element', async () => {
  function Example() {
    let ref = useRef(null)
    let [enabled, setEnabled] = useState(true)
    useInert(ref, enabled)

    return (
      <div ref={ref} id="main">
        <button onClick={() => setEnabled((v) => !v)}>toggle</button>
      </div>
    )
  }

  function Before() {
    return <div>before</div>
  }

  function After() {
    return <div>after</div>
  }

  render(
    <>
      <Before />
      <Example />
      <After />
    </>,
    { container: document.body }
  )

  // Verify that `main` is inert
  assertInert(document.getElementById('main'))

  // Verify that the others are not inert
  assertNotInert(getByText('before'))
  assertNotInert(getByText('after'))

  // Restore
  await click(getByText('toggle'))

  // Verify that nothing is inert
  assertNotInert(document.getElementById('main'))
  assertNotInert(getByText('before'))
  assertNotInert(getByText('after'))
})

it('should not mark an element as inert when the hook is disabled', async () => {
  function Example() {
    let ref = useRef(null)
    let [enabled, setEnabled] = useState(false)
    useInert(ref, enabled)

    return (
      <div ref={ref} id="main">
        <button onClick={() => setEnabled((v) => !v)}>toggle</button>
      </div>
    )
  }

  function Before() {
    return <div>before</div>
  }

  function After() {
    return <div>after</div>
  }

  render(
    <>
      <Before />
      <Example />
      <After />
    </>,
    { container: document.body }
  )

  assertNotInert(document.getElementById('main'))
  assertNotInert(getByText('before'))
  assertNotInert(getByText('after'))
})

it('should mark the element as not inert anymore, once all references are gone', async () => {
  function Example({ children }: { children: ReactNode }) {
    let ref = useRef<HTMLDivElement | null>(null)

    let [enabled, setEnabled] = useState(false)
    useInert(() => ref.current?.parentElement ?? null, enabled)

    return (
      <div ref={ref}>
        <button onClick={() => setEnabled((v) => !v)}>{children}</button>
      </div>
    )
  }

  render(
    <div id="parent">
      <Example>A</Example>
      <Example>B</Example>
    </div>,
    { container: document.body }
  )

  // Parent should not be inert yet
  assertNotInert(document.getElementById('parent'))

  // Toggle A
  await click(getByText('A'))

  // Parent should be inert
  assertInert(document.getElementById('parent'))

  // Toggle B
  await click(getByText('B'))

  // Parent should still be inert
  assertInert(document.getElementById('parent'))

  // Toggle A
  await click(getByText('A'))

  // Parent should still be inert (because B is still enabled)
  assertInert(document.getElementById('parent'))

  // Toggle B
  await click(getByText('B'))

  // Parent should not be inert because both A and B are disabled
  assertNotInert(document.getElementById('parent'))
})
