import { render } from '@testing-library/react'
import React, { useRef, useState, type ReactNode } from 'react'
import { assertInert, assertNotInert, getByText } from '../test-utils/accessibility-assertions'
import { click } from '../test-utils/interactions'
import { useInertOthers } from './use-inert-others'

beforeEach(() => {
  jest.restoreAllMocks()
  jest.spyOn(global.console, 'error').mockImplementation(jest.fn())
})

it('should be possible to inert an element', async () => {
  function Example() {
    let ref = useRef(null)
    let [enabled, setEnabled] = useState(true)
    useInertOthers(enabled, { disallowed: () => [ref.current] })

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
    useInertOthers(enabled, { disallowed: () => [ref.current] })

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
    useInertOthers(enabled, { disallowed: () => [ref.current?.parentElement ?? null] })

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

it('should be possible to mark everything but allowed containers as inert', async () => {
  function Example({ children }: { children: ReactNode }) {
    let [enabled, setEnabled] = useState(false)
    useInertOthers(enabled, {
      allowed: () => [document.getElementById('a-a-b')!, document.getElementById('a-a-c')!],
    })

    return (
      <div>
        {children}
        <button onClick={() => setEnabled((v) => !v)}>toggle</button>
      </div>
    )
  }

  render(
    <Example>
      <div id="a">
        <div id="a-a">
          <div id="a-a-a"></div>
          <div id="a-a-b"></div>
          <div id="a-a-c"></div>
        </div>
        <div id="a-b"></div>
        <div id="a-c"></div>
      </div>
    </Example>,
    { container: document.body }
  )

  let a = document.getElementById('a')!
  let aa = document.getElementById('a-a')!
  let aaa = document.getElementById('a-a-a')!
  let aab = document.getElementById('a-a-b')!
  let aac = document.getElementById('a-a-c')!
  let ab = document.getElementById('a-b')!
  let ac = document.getElementById('a-c')!

  // Nothing should be inert
  for (let el of [a, aa, aaa, aab, aac, ab, ac]) assertNotInert(el)

  // Toggle inert state
  await click(getByText('toggle'))

  // Every sibling of `a-a-b` and `a-a-c` should be inert, and all the
  // siblings of the parents of `a-a-b` and `a-a-c` should be inert as well.
  // The path to the body should not be marked as inert.
  for (let el of [a, aa, aab, aac]) assertNotInert(el)
  for (let el of [aaa, ab, ac]) assertInert(el)
})
