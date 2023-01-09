import * as Transition from './transition'
import { renderSSR } from '../../test-utils/ssr'
import { defineComponent } from 'vue'
import { html } from '../../test-utils/html'

beforeAll(() => {
  jest.spyOn(window, 'requestAnimationFrame').mockImplementation(setImmediate as any)
  jest.spyOn(window, 'cancelAnimationFrame').mockImplementation(clearImmediate as any)
})

describe('Rendering', () => {
  describe('SSR', () => {
    it('should not overwrite className of children when as=Fragment', async () => {
      await renderSSR(
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
    })
  })
})
