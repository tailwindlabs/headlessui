import React, { Fragment } from 'react'
import { Transition } from './transition'
import { renderSSR } from '../../test-utils/ssr'

beforeAll(() => {
  jest.spyOn(window, 'requestAnimationFrame').mockImplementation(setImmediate as any)
  jest.spyOn(window, 'cancelAnimationFrame').mockImplementation(clearImmediate as any)
})

describe('Rendering', () => {
  describe('SSR', () => {
    it('should not overwrite className of children when as=Fragment', async () => {
      await renderSSR(
        <Transition
          as={Fragment}
          show={true}
          appear={true}
          enter="enter"
          enterFrom="enter-from"
          enterTo="enter-to"
        >
          <div className="inner"></div>
        </Transition>
      )

      let div = document.querySelector('.inner')

      expect(div).not.toBeNull()
      expect(div?.className).toBe('inner enter enter-from')
    })
  })
})
