import { computed, defineComponent, nextTick, ref, type ComponentOptionsWithoutProps } from 'vue'
import { assertInert, assertNotInert, getByText } from '../test-utils/accessibility-assertions'
import { html } from '../test-utils/html'
import { click } from '../test-utils/interactions'
import { render } from '../test-utils/vue-testing-library'
import { dom } from '../utils/dom'
import { useInert } from './use-inert'

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

it('should be possible to inert an element', async () => {
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

          useInert(container, enabled)

          return { container, enabled }
        },
      }),
    },
  })

  await new Promise<void>(nextTick)

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

it('should be possible to inert an element', async () => {
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
          let enabled = ref(false)

          useInert(container, enabled)

          return { container, enabled }
        },
      }),
    },
  })

  await new Promise<void>(nextTick)

  assertNotInert(document.getElementById('main'))
  assertNotInert(getByText('before'))
  assertNotInert(getByText('after'))
})

it('should mark the element as not inert anymore, once all references are gone', async () => {
  renderTemplate({
    template: html`
      <div id="parent">
        <Example>A</Example>
        <Example>B</Example>
      </div>
    `,
    components: {
      Example: defineComponent({
        name: 'Example',
        template: html`
          <div ref="container">
            <button @click="enabled = !enabled">
              <slot></slot>
            </button>
          </div>
        `,
        setup() {
          let container = ref<HTMLElement | null>(null)
          let enabled = ref(false)

          let resolveParentContainer = computed(() => dom(container)?.parentElement ?? null)
          useInert(resolveParentContainer, enabled)

          return { container, enabled }
        },
      }),
    },
  })

  await new Promise<void>(nextTick)

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
