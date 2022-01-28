import { defineComponent, ref, nextTick, ComponentOptionsWithoutProps } from 'vue'

import { render } from '../test-utils/vue-testing-library'
import { useInertOthers } from './use-inert-others'
import { getByText } from '../test-utils/accessibility-assertions'
import { click } from '../test-utils/interactions'
import { html } from '../test-utils/html'

beforeAll(() => {
  jest.spyOn(window, 'requestAnimationFrame').mockImplementation(setImmediate as any)
  jest.spyOn(window, 'cancelAnimationFrame').mockImplementation(clearImmediate as any)
  jest.spyOn(global.console, 'error').mockImplementation(jest.fn())
})

afterAll(() => jest.restoreAllMocks())

function renderTemplate(input: string | ComponentOptionsWithoutProps) {
  let defaultComponents = {}

  if (typeof input === 'string') {
    return render(defineComponent({ template: input, components: defaultComponents }), {
      attachTo: document.body,
    })
  }

  return render(
    defineComponent(
      Object.assign({}, input, {
        components: { ...defaultComponents, ...input.components },
      }) as Parameters<typeof defineComponent>[0]
    ),
    { attachTo: document.body }
  )
}

let Before = defineComponent({
  name: 'Before',
  template: html` <div>before</div> `,
})

let After = defineComponent({
  name: 'After',
  template: html` <div>after</div> `,
})

it('should be possible to inert other elements', async () => {
  renderTemplate({
    template: html`
      <Before />
      <Example />
      <After />
    `,
    components: {
      Before,
      After,
      Example: defineComponent({
        name: 'Example',
        template: html`
          <div ref="container" id="main">
            <button @click="enabled = !enabled">toggle</button>
          </div>
        `,
        setup() {
          let container = ref(null)
          let enabled = ref(true)

          useInertOthers(container, enabled)

          return { container, enabled }
        },
      }),
    },
  })

  await new Promise<void>(nextTick)

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
  renderTemplate({
    template: html`
      <Before />
      <Example id="main1" toggle="toggle 1" />
      <Example id="main2" toggle="toggle 2" />
      <After />
    `,

    components: {
      Before,
      After,
      Example: defineComponent({
        name: 'Example',
        props: {
          toggle: { type: String },
          id: { type: String },
        },
        template: html`
          <div ref="container" :id="id">
            <button @click="enabled = !enabled">{{toggle}}</button>
          </div>
        `,
        setup() {
          let container = ref(null)
          let enabled = ref(false)

          useInertOthers(container, enabled)

          return { container, enabled }
        },
      }),
    },
  })

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
  renderTemplate({
    template: html`
      <Before />
      <Example id="main1" toggle="toggle 1" />
      <Example id="main2" toggle="toggle 2" />
      <After />
    `,
    components: {
      Before,
      After,
      Example: defineComponent({
        name: 'Example',
        props: {
          toggle: { type: String },
          id: { type: String },
        },
        template: html`
          <div :id="'parent-' + id">
            <div ref="container" :id="id">
              <button @click="enabled = !enabled">{{toggle}}</button>
            </div>
          </div>
        `,
        setup() {
          let container = ref(null)
          let enabled = ref(false)

          useInertOthers(container, enabled)

          return { container, enabled }
        },
      }),
    },
  })

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
  renderTemplate({
    template: html`
      <Before />
      <div id="parent">
        <Example id="main1" toggle="toggle 1" />
        <Example id="main2" toggle="toggle 2" />
      </div>
      <After />
    `,
    components: {
      Before,
      After,
      Example: defineComponent({
        name: 'Example',
        props: {
          toggle: { type: String },
          id: { type: String },
        },
        template: html`
          <div :id="'parent-' + id">
            <div ref="container" :id="id">
              <button @click="enabled = !enabled">{{toggle}}</button>
            </div>
          </div>
        `,
        setup() {
          let container = ref(null)
          let enabled = ref(false)

          useInertOthers(container, enabled)

          return { container, enabled }
        },
      }),
    },
  })

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
