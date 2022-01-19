import React, { useRef, useState } from 'react'
import { render } from '@testing-library/react'
import { useInertOthers } from './use-inert-others'
import { getByText } from '../test-utils/accessibility-assertions'
import { click } from '../test-utils/interactions'

beforeEach(() => {
  jest.restoreAllMocks()
  jest.spyOn(global.console, 'error').mockImplementation(jest.fn())
})

it('should be possible to inert other elements', async () => {
  function Example() {
    let ref = useRef(null)
    let [enabled, setEnabled] = useState(true)
    useInertOthers(ref, enabled)

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

  // Verify the others are hidden
  expect(document.getElementById('main')).not.toHaveAttribute('aria-hidden')
  expect(getByText('before')).toHaveAttribute('aria-hidden', 'true')
  expect(getByText('after')).toHaveAttribute('aria-hidden', 'true')

  // Restore
  await click(getByText('toggle'))

  // Verify we are un-hidden
  expect(document.getElementById('main')).not.toHaveAttribute('aria-hidden')
  expect(getByText('before')).not.toHaveAttribute('aria-hidden')
  expect(getByText('after')).not.toHaveAttribute('aria-hidden')
})

it('should restore inert elements, when all useInertOthers calls are disabled', async () => {
  function Example({ toggle, id }: { toggle: string; id: string }) {
    let ref = useRef(null)
    let [enabled, setEnabled] = useState(false)
    useInertOthers(ref, enabled)

    return (
      <div ref={ref} id={id}>
        <button onClick={() => setEnabled((v) => !v)}>{toggle}</button>
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
      <Example id="main1" toggle="toggle 1" />
      <Example id="main2" toggle="toggle 2" />
      <After />
    </>,
    { container: document.body }
  )

  // Verify nothing is hidden
  expect(document.getElementById('main1')).not.toHaveAttribute('aria-hidden')
  expect(document.getElementById('main2')).not.toHaveAttribute('aria-hidden')
  expect(getByText('before')).not.toHaveAttribute('aria-hidden')
  expect(getByText('after')).not.toHaveAttribute('aria-hidden')

  // Enable inert on others (via toggle 1)
  await click(getByText('toggle 1'))

  // Verify the others are hidden
  expect(document.getElementById('main1')).not.toHaveAttribute('aria-hidden')
  expect(document.getElementById('main2')).toHaveAttribute('aria-hidden', 'true')
  expect(getByText('before')).toHaveAttribute('aria-hidden', 'true')
  expect(getByText('after')).toHaveAttribute('aria-hidden', 'true')

  // Enable inert on others (via toggle 2)
  await click(getByText('toggle 2'))

  // Verify the others are hidden
  expect(document.getElementById('main1')).not.toHaveAttribute('aria-hidden')
  expect(document.getElementById('main2')).not.toHaveAttribute('aria-hidden')
  expect(getByText('before')).toHaveAttribute('aria-hidden', 'true')
  expect(getByText('after')).toHaveAttribute('aria-hidden', 'true')

  // Remove first level of inert (via toggle 1)
  await click(getByText('toggle 1'))

  // Verify the others are hidden
  expect(document.getElementById('main1')).toHaveAttribute('aria-hidden')
  expect(document.getElementById('main2')).not.toHaveAttribute('aria-hidden')
  expect(getByText('before')).toHaveAttribute('aria-hidden', 'true')
  expect(getByText('after')).toHaveAttribute('aria-hidden', 'true')

  // Remove second level of inert (via toggle 2)
  await click(getByText('toggle 2'))

  // Verify the others are not hidden
  expect(document.getElementById('main1')).not.toHaveAttribute('aria-hidden')
  expect(document.getElementById('main2')).not.toHaveAttribute('aria-hidden')
  expect(getByText('before')).not.toHaveAttribute('aria-hidden')
  expect(getByText('after')).not.toHaveAttribute('aria-hidden')
})

it('should restore inert elements, when all useInertOthers calls are disabled (including parents)', async () => {
  function Example({ toggle, id }: { toggle: string; id: string }) {
    let ref = useRef(null)
    let [enabled, setEnabled] = useState(false)
    useInertOthers(ref, enabled)

    return (
      <div id={`parent-${id}`}>
        <div ref={ref} id={id}>
          <button onClick={() => setEnabled((v) => !v)}>{toggle}</button>
        </div>
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
      <Example id="main1" toggle="toggle 1" />
      <Example id="main2" toggle="toggle 2" />
      <After />
    </>,
    { container: document.body }
  )

  // Verify nothing is hidden
  expect(document.getElementById('main1')).not.toHaveAttribute('aria-hidden')
  expect(document.getElementById('parent-main1')).not.toHaveAttribute('aria-hidden')
  expect(document.getElementById('main2')).not.toHaveAttribute('aria-hidden')
  expect(document.getElementById('parent-main2')).not.toHaveAttribute('aria-hidden')
  expect(getByText('before')).not.toHaveAttribute('aria-hidden')
  expect(getByText('after')).not.toHaveAttribute('aria-hidden')

  // Enable inert on others (via toggle 1)
  await click(getByText('toggle 1'))

  // Verify the others are hidden
  expect(document.getElementById('main1')).not.toHaveAttribute('aria-hidden')
  expect(document.getElementById('parent-main1')).not.toHaveAttribute('aria-hidden')
  expect(document.getElementById('main2')).not.toHaveAttribute('aria-hidden', 'true')
  expect(document.getElementById('parent-main2')).toHaveAttribute('aria-hidden', 'true')
  expect(getByText('before')).toHaveAttribute('aria-hidden', 'true')
  expect(getByText('after')).toHaveAttribute('aria-hidden', 'true')

  // Enable inert on others (via toggle 2)
  await click(getByText('toggle 2'))

  // Verify the others are hidden
  expect(document.getElementById('main1')).not.toHaveAttribute('aria-hidden')
  expect(document.getElementById('parent-main1')).not.toHaveAttribute('aria-hidden')
  expect(document.getElementById('main2')).not.toHaveAttribute('aria-hidden')
  expect(document.getElementById('parent-main2')).not.toHaveAttribute('aria-hidden')
  expect(getByText('before')).toHaveAttribute('aria-hidden', 'true')
  expect(getByText('after')).toHaveAttribute('aria-hidden', 'true')

  // Remove first level of inert (via toggle 1)
  await click(getByText('toggle 1'))

  // Verify the others are hidden
  expect(document.getElementById('main1')).not.toHaveAttribute('aria-hidden')
  expect(document.getElementById('parent-main1')).toHaveAttribute('aria-hidden')
  expect(document.getElementById('main2')).not.toHaveAttribute('aria-hidden')
  expect(document.getElementById('parent-main2')).not.toHaveAttribute('aria-hidden')
  expect(getByText('before')).toHaveAttribute('aria-hidden', 'true')
  expect(getByText('after')).toHaveAttribute('aria-hidden', 'true')

  // Remove second level of inert (via toggle 2)
  await click(getByText('toggle 2'))

  // Verify the others are not hidden
  expect(document.getElementById('main1')).not.toHaveAttribute('aria-hidden')
  expect(document.getElementById('parent-main1')).not.toHaveAttribute('aria-hidden')
  expect(document.getElementById('main2')).not.toHaveAttribute('aria-hidden')
  expect(document.getElementById('parent-main2')).not.toHaveAttribute('aria-hidden')
  expect(getByText('before')).not.toHaveAttribute('aria-hidden')
  expect(getByText('after')).not.toHaveAttribute('aria-hidden')
})

it('should handle inert others correctly when 2 useInertOthers are used in a shared parent', async () => {
  function Example({ toggle, id }: { toggle: string; id: string }) {
    let ref = useRef(null)
    let [enabled, setEnabled] = useState(false)
    useInertOthers(ref, enabled)

    return (
      <div ref={ref} id={id}>
        <button onClick={() => setEnabled((v) => !v)}>{toggle}</button>
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
      <div id="parent">
        <Example id="main1" toggle="toggle 1" />
        <Example id="main2" toggle="toggle 2" />
      </div>
      <After />
    </>,
    { container: document.body }
  )

  // Verify nothing is hidden
  expect(document.getElementById('main1')).not.toHaveAttribute('aria-hidden')
  expect(document.getElementById('main2')).not.toHaveAttribute('aria-hidden')
  expect(document.getElementById('parent')).not.toHaveAttribute('aria-hidden')
  expect(getByText('before')).not.toHaveAttribute('aria-hidden')
  expect(getByText('after')).not.toHaveAttribute('aria-hidden')

  // Enable inert on others (via toggle 1)
  await click(getByText('toggle 1'))

  // Verify the others are hidden
  expect(document.getElementById('main1')).not.toHaveAttribute('aria-hidden')
  expect(document.getElementById('main2')).not.toHaveAttribute('aria-hidden', 'true')
  expect(document.getElementById('parent')).not.toHaveAttribute('aria-hidden')
  expect(getByText('before')).toHaveAttribute('aria-hidden', 'true')
  expect(getByText('after')).toHaveAttribute('aria-hidden', 'true')

  // Enable inert on others (via toggle 2)
  await click(getByText('toggle 2'))

  // Verify the others are hidden
  expect(document.getElementById('main1')).not.toHaveAttribute('aria-hidden')
  expect(document.getElementById('main2')).not.toHaveAttribute('aria-hidden')
  expect(document.getElementById('parent')).not.toHaveAttribute('aria-hidden')
  expect(getByText('before')).toHaveAttribute('aria-hidden', 'true')
  expect(getByText('after')).toHaveAttribute('aria-hidden', 'true')

  // Remove first level of inert (via toggle 1)
  await click(getByText('toggle 1'))

  // Verify the others are hidden
  expect(document.getElementById('main1')).not.toHaveAttribute('aria-hidden')
  expect(document.getElementById('main2')).not.toHaveAttribute('aria-hidden')
  expect(document.getElementById('parent')).not.toHaveAttribute('aria-hidden')
  expect(getByText('before')).toHaveAttribute('aria-hidden', 'true')
  expect(getByText('after')).toHaveAttribute('aria-hidden', 'true')

  // Remove second level of inert (via toggle 2)
  await click(getByText('toggle 2'))

  // Verify the others are not hidden
  expect(document.getElementById('main1')).not.toHaveAttribute('aria-hidden')
  expect(document.getElementById('main2')).not.toHaveAttribute('aria-hidden')
  expect(document.getElementById('parent')).not.toHaveAttribute('aria-hidden')
  expect(getByText('before')).not.toHaveAttribute('aria-hidden')
  expect(getByText('after')).not.toHaveAttribute('aria-hidden')
})
