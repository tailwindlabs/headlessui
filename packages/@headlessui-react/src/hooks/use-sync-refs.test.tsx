import { render } from '@testing-library/react'
import React, { Fragment, createRef } from 'react'
import { Combobox } from '../components/combobox/combobox'
import { optionalRef, useSyncRefs } from './use-sync-refs'

it('should clean up callback refs alongside object and legacy callback refs', () => {
  let objectRef = createRef<HTMLButtonElement>()
  let legacyRef = jest.fn()
  let cleanup = jest.fn()
  let callbackRef = jest.fn(() => cleanup)

  function Example() {
    return <button ref={useSyncRefs(objectRef, legacyRef, callbackRef, null)}>Example</button>
  }

  let { getByRole, unmount } = render(<Example />)
  let button = getByRole('button')
  expect(objectRef.current).toBe(button)
  expect(legacyRef).toHaveBeenCalledWith(button)
  expect(callbackRef).toHaveBeenCalledWith(button)
  expect(cleanup).not.toHaveBeenCalled()

  unmount()

  expect(objectRef.current).toBe(null)
  expect(legacyRef).toHaveBeenCalledTimes(2)
  expect(legacyRef).toHaveBeenLastCalledWith(null)
  expect(callbackRef).toHaveBeenCalledTimes(1)
  expect(cleanup).toHaveBeenCalledTimes(1)
  expect(cleanup).toHaveBeenCalledWith()
})

it('should keep refs attached when rerendering the same element', () => {
  let cleanup = jest.fn()
  let callbackRef = jest.fn(() => cleanup)

  function Example({ label }: { label: string }) {
    return <button ref={useSyncRefs(callbackRef)}>{label}</button>
  }

  let { rerender, unmount } = render(<Example label="Before" />)
  rerender(<Example label="After" />)

  expect(callbackRef).toHaveBeenCalledTimes(1)
  expect(cleanup).not.toHaveBeenCalled()

  unmount()
  expect(cleanup).toHaveBeenCalledTimes(1)
})

it('should clean up the refs attached to the element after the refs change', () => {
  let firstCleanup = jest.fn()
  let firstRef = jest.fn(() => firstCleanup)
  let secondRef = jest.fn()
  let firstObjectRef = createRef<HTMLButtonElement>()
  let secondObjectRef = createRef<HTMLButtonElement>()

  function Example({ changed = false }) {
    let ref = useSyncRefs(
      changed ? secondRef : firstRef,
      changed ? secondObjectRef : firstObjectRef
    )
    return <button ref={ref}>Example</button>
  }

  let { rerender, unmount } = render(<Example />)
  rerender(<Example changed />)
  unmount()

  expect(firstCleanup).toHaveBeenCalledTimes(1)
  expect(firstRef).toHaveBeenCalledTimes(1)
  expect(firstObjectRef.current).toBe(null)
  expect(secondRef).not.toHaveBeenCalled()
  expect(secondObjectRef.current).toBe(null)
})

it('should clean up each attachment when replacing the element', () => {
  let cleanups: jest.Mock[] = []
  let callbackRef = jest.fn(() => {
    let cleanup = jest.fn()
    cleanups.push(cleanup)
    return cleanup
  })

  function Example({ id }: { id: string }) {
    return (
      <button key={id} ref={useSyncRefs(callbackRef)}>
        Example
      </button>
    )
  }

  let { rerender, unmount } = render(<Example id="before" />)
  rerender(<Example id="after" />)

  expect(callbackRef).toHaveBeenCalledTimes(2)
  expect(cleanups[0]).toHaveBeenCalledTimes(1)
  expect(cleanups[1]).not.toHaveBeenCalled()

  unmount()

  expect(cleanups[0]).toHaveBeenCalledTimes(1)
  expect(cleanups[1]).toHaveBeenCalledTimes(1)
})

it('should not attach refs when all refs are optional', () => {
  let callbackRef = jest.fn()

  function Example() {
    return <button ref={useSyncRefs(optionalRef(callbackRef), null)}>Example</button>
  }

  let { unmount } = render(<Example />)
  unmount()
  expect(callbackRef).not.toHaveBeenCalled()
})

it('should clean up optional refs when a required ref is present', () => {
  let cleanup = jest.fn()
  let callbackRef = jest.fn(() => cleanup)
  let objectRef = createRef<HTMLButtonElement>()

  function Example() {
    return <button ref={useSyncRefs(optionalRef(callbackRef), objectRef)}>Example</button>
  }

  let { unmount } = render(<Example />)
  unmount()
  expect(callbackRef).toHaveBeenCalledTimes(1)
  expect(cleanup).toHaveBeenCalledTimes(1)
  expect(objectRef.current).toBe(null)
})

it.each(['button', Fragment] as const)('should clean up a Combobox.Button ref with as=%s', (as) => {
  let cleanup = jest.fn()
  let callbackRef = jest.fn(() => cleanup)

  let { getByRole, unmount } = render(
    <Combobox>
      <Combobox.Button as={as} ref={callbackRef}>
        {as === Fragment ? <button>Choose</button> : 'Choose'}
      </Combobox.Button>
    </Combobox>
  )

  expect(callbackRef).toHaveBeenCalledWith(getByRole('button'))
  unmount()
  expect(callbackRef).toHaveBeenCalledTimes(1)
  expect(cleanup).toHaveBeenCalledTimes(1)
})
