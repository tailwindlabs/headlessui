import { defineComponent } from 'vue'
import { html } from '../../test-utils/html'
import { renderSSR } from '../../test-utils/ssr'
import * as Transition from './transition'

beforeAll(() => {
  jest.spyOn(window, 'requestAnimationFrame').mockImplementation(setImmediate as any)
  jest.spyOn(window, 'cancelAnimationFrame').mockImplementation(clearImmediate as any)
})

describe('Rendering', () => {
  describe('SSR', () => {
    it('A transition without appear=true does not insert classes during SSR', async () => {
      let result = await renderSSR(
        defineComponent({
          components: Transition,
          template: html`
            <TransitionRoot
              as="template"
              :show="true"
              enter="enter"
              enterFrom="enter-from"
              enterTo="enter-to"
            >
              <div class="inner"></div>
            </TransitionRoot>
          `,
        })
      )

      let div = document.querySelector('.inner')

      expect(div).not.toBeNull()
      expect(div?.className).toBe('inner')

      // If we don't await then we get the same for SSR and hydration
      // but we want to investigate what effects this has on our other transition tests too
      await result.hydrate()

      div = document.querySelector('.inner')

      expect(div).not.toBeNull()
      expect(div?.className).toBe('inner enter enter-from')
    })

    it('should not overwrite className of children when as=Fragment', async () => {
      let result = await renderSSR(
        defineComponent({
          components: Transition,
          template: html`
            <TransitionRoot
              as="template"
              :show="true"
              :appear="true"
              enter="enter"
              enterFrom="enter-from"
              enterTo="enter-to"
            >
              <div class="inner"></div>
            </TransitionRoot>
          `,
        })
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
