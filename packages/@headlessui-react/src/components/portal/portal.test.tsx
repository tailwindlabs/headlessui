import React, { useState } from 'react'
import { render } from '@testing-library/react'

import { Portal } from './portal'

import { click } from '../../test-utils/interactions'

function getPortalRoot() {
  return document.getElementById('headlessui-portal-root')
}

beforeEach(() => {
  document.body.innerHTML = ''
})

it('should be possible to use a Portal', () => {
  expect(getPortalRoot()).toBe(null)

  render(
    <main id="parent">
      <Portal>
        <p id="content">Contents...</p>
      </Portal>
    </main>
  )

  let parent = document.getElementById('parent')
  let content = document.getElementById('content')

  expect(getPortalRoot()).not.toBe(null)

  // Ensure the content is not part of the parent
  expect(parent).not.toContain(content)

  // Ensure the content does exist
  expect(content).not.toBe(null)
  expect(content).toHaveTextContent('Contents...')
})

it('should be possible to use multiple Portal elements', () => {
  expect(getPortalRoot()).toBe(null)

  render(
    <main id="parent">
      <Portal>
        <p id="content1">Contents 1 ...</p>
      </Portal>
      <hr />
      <Portal>
        <p id="content2">Contents 2 ...</p>
      </Portal>
    </main>
  )

  let parent = document.getElementById('parent')
  let content1 = document.getElementById('content1')
  let content2 = document.getElementById('content2')

  expect(getPortalRoot()).not.toBe(null)

  // Ensure the content1 is not part of the parent
  expect(parent).not.toContain(content1)

  // Ensure the content2 is not part of the parent
  expect(parent).not.toContain(content2)

  // Ensure the content does exist
  expect(content1).not.toBe(null)
  expect(content1).toHaveTextContent('Contents 1 ...')

  // Ensure the content does exist
  expect(content2).not.toBe(null)
  expect(content2).toHaveTextContent('Contents 2 ...')
})

it('should cleanup the Portal root when the last Portal is unmounted', async () => {
  expect(getPortalRoot()).toBe(null)

  function Example() {
    let [renderA, setRenderA] = useState(false)
    let [renderB, setRenderB] = useState(false)

    return (
      <main id="parent">
        <button id="a" onClick={() => setRenderA(v => !v)}>
          Toggle A
        </button>
        <button id="b" onClick={() => setRenderB(v => !v)}>
          Toggle B
        </button>

        {renderA && (
          <Portal>
            <p id="content1">Contents 1 ...</p>
          </Portal>
        )}

        {renderB && (
          <Portal>
            <p id="content2">Contents 2 ...</p>
          </Portal>
        )}
      </main>
    )
  }

  render(<Example />)

  let a = document.getElementById('a')
  let b = document.getElementById('b')

  expect(getPortalRoot()).toBe(null)

  // Let's render the first Portal
  await click(a)

  expect(getPortalRoot()).not.toBe(null)
  expect(getPortalRoot().childNodes).toHaveLength(1)

  // Let's render the second Portal
  await click(b)

  expect(getPortalRoot()).not.toBe(null)
  expect(getPortalRoot().childNodes).toHaveLength(2)

  // Let's remove the first portal
  await click(a)

  expect(getPortalRoot()).not.toBe(null)
  expect(getPortalRoot().childNodes).toHaveLength(1)

  // Let's remove the second Portal
  await click(b)

  expect(getPortalRoot()).toBe(null)

  // Let's render the first Portal again
  await click(a)

  expect(getPortalRoot()).not.toBe(null)
  expect(getPortalRoot().childNodes).toHaveLength(1)
})
