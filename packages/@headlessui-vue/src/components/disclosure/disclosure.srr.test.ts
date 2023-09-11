import { defineComponent } from 'vue'
import { html } from '../../test-utils/html'
import { renderHydrate, renderSSR } from '../../test-utils/ssr'
import { Disclosure, DisclosureButton, DisclosurePanel } from './disclosure'

jest.mock('../../hooks/use-id')

beforeAll(() => {
  jest.spyOn(window, 'requestAnimationFrame').mockImplementation(setImmediate as any)
  jest.spyOn(window, 'cancelAnimationFrame').mockImplementation(clearImmediate as any)
})

afterAll(() => jest.restoreAllMocks())

let Example = defineComponent({
  components: { Disclosure, DisclosureButton, DisclosurePanel },
  template: html`
    <Disclosure>
      <DisclosureButton>Toggle</DisclosureButton>
      <DisclosurePanel>Contents</DisclosurePanel>
    </Disclosure>
  `,
})

describe('Rendering', () => {
  describe('SSR', () => {
    it('should be possible to server side render the Disclosure in a closed state', async () => {
      let { contents } = await renderSSR(Example)

      expect(contents).toContain(`Toggle`)
      expect(contents).not.toContain('aria-controls')
      expect(contents).not.toContain(`aria-expanded="true"`)
      expect(contents).not.toContain(`Contents`)
    })

    it('should be possible to server side render the Disclosure in an open state', async () => {
      let { contents } = await renderSSR(Example, { defaultOpen: true })

      let ariaControlsId = contents.match(
        /aria-controls="(headlessui-disclosure-panel-[^"]+)"/
      )?.[1]
      let id = contents.match(/id="(headlessui-disclosure-panel-[^"]+)"/)?.[1]

      expect(id).toEqual(ariaControlsId)

      expect(contents).toContain(`Toggle`)
      expect(contents).toContain('aria-controls')
      expect(contents).toContain(`aria-expanded="true"`)
      expect(contents).toContain(`Contents`)
    })
  })

  describe('Hydration', () => {
    it('should be possible to server side render the Disclosure in a closed state', async () => {
      let { contents } = await renderHydrate(Example)

      expect(contents).toContain(`Toggle`)
      expect(contents).not.toContain('aria-controls')
      expect(contents).not.toContain(`aria-expanded="true"`)
      expect(contents).not.toContain(`Contents`)
    })

    it('should be possible to server side render the Disclosure in an open state', async () => {
      let { contents } = await renderHydrate(Example, { defaultOpen: true })

      let ariaControlsId = contents.match(
        /aria-controls="(headlessui-disclosure-panel-[^"]+)"/
      )?.[1]
      let id = contents.match(/id="(headlessui-disclosure-panel-[^"]+)"/)?.[1]

      expect(id).toEqual(ariaControlsId)

      expect(contents).toContain(`Toggle`)
      expect(contents).toContain('aria-controls')
      expect(contents).toContain(`aria-expanded="true"`)
      expect(contents).toContain(`Contents`)
    })
  })
})
