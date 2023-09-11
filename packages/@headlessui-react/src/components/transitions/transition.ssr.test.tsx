import React, { Fragment } from 'react'
import { renderSSR } from '../../test-utils/ssr'
import { Transition } from './transition'

beforeAll(() => {
  jest.spyOn(window, 'requestAnimationFrame').mockImplementation(setImmediate as any)
  jest.spyOn(window, 'cancelAnimationFrame').mockImplementation(clearImmediate as any)
})

describe('Rendering', () => {
  describe('SSR', () => {
    it('A transition without appear=true does not insert classes during SSR', async () => {
      let result = await renderSSR(
        <Transition
          as={Fragment}
          show={true}
          enter="enter"
          enterFrom="enter-from"
          enterTo="enter-to"
        >
          <div className="inner"></div>
        </Transition>
      )

      let div = document.querySelector('.inner')

      expect(div).not.toBeNull()
      expect(div?.className).toBe('inner')

      await result.hydrate()

      div = document.querySelector('.inner')

      expect(div).not.toBeNull()
      expect(div?.className).toBe('inner')
    })

    it('should not overwrite className of children when as=Fragment', async () => {
      let result = await renderSSR(
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

      await result.hydrate()

      div = document.querySelector('.inner')

      expect(div).not.toBeNull()
      expect(div?.className).toBe('inner enter enter-from')
    })
  })
})
