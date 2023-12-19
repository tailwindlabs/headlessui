import {
  createSSRApp,
  defineComponent,
  h,
  nextTick,
  ref,
  type ComponentOptionsWithoutProps,
} from 'vue'
import { renderToString } from 'vue/server-renderer'
import { html } from '../../test-utils/html'
import { click } from '../../test-utils/interactions'
import { createRenderTemplate } from '../../test-utils/vue-testing-library'
import { Portal, PortalGroup } from './portal'

function getPortalRoot() {
  return document.getElementById('headlessui-portal-root')!
}

beforeEach(() => {
  document.body.innerHTML = ''
})

jest.mock('../../hooks/use-id')

beforeAll(() => {
  jest.spyOn(window, 'requestAnimationFrame').mockImplementation(setImmediate as any)
  jest.spyOn(window, 'cancelAnimationFrame').mockImplementation(clearImmediate as any)
})

afterAll(() => jest.restoreAllMocks())

const renderTemplate = createRenderTemplate({ Portal, PortalGroup })

async function ssrRenderTemplate(input: string | ComponentOptionsWithoutProps) {
  let defaultComponents = { Portal, PortalGroup }

  if (typeof input === 'string') {
    let app = createSSRApp({
      render: () => h(defineComponent({ template: input, components: defaultComponents })),
    })

    return await renderToString(app)
  }

  let app = createSSRApp({
    render: () =>
      h(
        defineComponent(
          Object.assign({}, input, {
            components: { ...defaultComponents, ...input.components },
          }) as Parameters<typeof defineComponent>[0]
        )
      ),
  })

  return await renderToString(app)
}

async function withoutBrowserGlobals<T>(fn: () => Promise<T>) {
  let oldWindow = globalThis.window
  let oldDocument = globalThis.document

  Object.defineProperty(globalThis, '_document', {
    value: undefined,
    configurable: true,
  })

  Object.defineProperty(globalThis, '_globalProxy', {
    value: undefined,
    configurable: true,
  })

  try {
    return await fn()
  } finally {
    Object.defineProperty(globalThis, '_globalProxy', {
      value: oldWindow,
      configurable: true,
    })

    Object.defineProperty(globalThis, '_document', {
      value: oldDocument,
      configurable: true,
    })
  }
}

it('SSR-rendering a Portal should not error', async () => {
  expect(getPortalRoot()).toBe(null)

  let result = await withoutBrowserGlobals(() =>
    ssrRenderTemplate(html`
      <main id="parent">
        <Portal>
          <p id="content">Contents...</p>
        </Portal>
      </main>
    `)
  )

  expect(getPortalRoot()).toBe(null)

  expect(result).toBe(html`<main id="parent"><!----></main>`)
})

it('should be possible to use a Portal', async () => {
  expect(getPortalRoot()).toBe(null)

  renderTemplate(html`
    <main id="parent">
      <Portal>
        <p id="content">Contents...</p>
      </Portal>
    </main>
  `)

  await nextTick()

  let parent = document.getElementById('parent')
  let content = document.getElementById('content')

  expect(getPortalRoot()).not.toBe(null)

  // Ensure the content is not part of the parent
  expect(parent).not.toContainElement(content)

  // Ensure the content does exist
  expect(content).not.toBe(null)
  expect(content).toHaveTextContent('Contents...')
})

it('should be possible to use multiple Portal elements', async () => {
  expect(getPortalRoot()).toBe(null)

  renderTemplate(html`
    <main id="parent">
      <Portal>
        <p id="content1">Contents 1 ...</p>
      </Portal>
      <hr />
      <Portal>
        <p id="content2">Contents 2 ...</p>
      </Portal>
    </main>
  `)

  await nextTick()

  let parent = document.getElementById('parent')
  let content1 = document.getElementById('content1')
  let content2 = document.getElementById('content2')

  expect(getPortalRoot()).not.toBe(null)

  // Ensure the content1 is not part of the parent
  expect(parent).not.toContainElement(content1)

  // Ensure the content2 is not part of the parent
  expect(parent).not.toContainElement(content2)

  // Ensure the content does exist
  expect(content1).not.toBe(null)
  expect(content1).toHaveTextContent('Contents 1 ...')

  // Ensure the content does exist
  expect(content2).not.toBe(null)
  expect(content2).toHaveTextContent('Contents 2 ...')
})

it('should cleanup the Portal root when the last Portal is unmounted', async () => {
  expect(getPortalRoot()).toBe(null)

  renderTemplate({
    template: html`
      <main id="parent">
        <button id="a" @click="toggleA">Toggle A</button>
        <button id="b" @click="toggleB">Toggle B</button>

        <Portal v-if="renderA">
          <p id="content1">Contents 1 ...</p>
        </Portal>

        <Portal v-if="renderB">
          <p id="content2">Contents 2 ...</p>
        </Portal>
      </main>
    `,
    setup() {
      let renderA = ref(false)
      let renderB = ref(false)

      return {
        renderA,
        renderB,
        toggleA() {
          renderA.value = !renderA.value
        },
        toggleB() {
          renderB.value = !renderB.value
        },
      }
    },
  })

  let a = document.getElementById('a')
  let b = document.getElementById('b')

  expect(getPortalRoot()).toBe(null)

  // Let's render the first Portal
  await click(a)

  expect(getPortalRoot()).not.toBe(null)
  expect(getPortalRoot().children).toHaveLength(1)

  // Let's render the second Portal
  await click(b)

  expect(getPortalRoot()).not.toBe(null)
  expect(getPortalRoot().children).toHaveLength(2)

  // Let's remove the first portal
  await click(a)

  expect(getPortalRoot()).not.toBe(null)
  expect(getPortalRoot().children).toHaveLength(1)

  // Let's remove the second Portal
  await click(b)

  expect(getPortalRoot()).toBe(null)

  // Let's render the first Portal again
  await click(a)

  expect(getPortalRoot()).not.toBe(null)
  expect(getPortalRoot().children).toHaveLength(1)
})

it('should be possible to render multiple portals at the same time', async () => {
  expect(getPortalRoot()).toBe(null)

  renderTemplate({
    template: html`
      <main id="parent">
        <button id="a" @click="toggleA">Toggle A</button>
        <button id="b" @click="toggleB">Toggle B</button>
        <button id="c" @click="toggleC">Toggle C</button>

        <button id="double" @click="toggleAB">Toggle A & B</button>

        <Portal v-if="renderA">
          <p id="content1">Contents 1 ...</p>
        </Portal>

        <Portal v-if="renderB">
          <p id="content2">Contents 2 ...</p>
        </Portal>

        <Portal v-if="renderC">
          <p id="content3">Contents 3 ...</p>
        </Portal>
      </main>
    `,
    setup() {
      let renderA = ref(true)
      let renderB = ref(true)
      let renderC = ref(true)

      return {
        renderA,
        renderB,
        renderC,
        toggleA() {
          renderA.value = !renderA.value
        },
        toggleB() {
          renderB.value = !renderB.value
        },
        toggleC() {
          renderC.value = !renderC.value
        },
        toggleAB() {
          renderA.value = !renderA.value
          renderB.value = !renderB.value
        },
      }
    },
  })

  await nextTick()

  expect(getPortalRoot()).not.toBe(null)
  expect(getPortalRoot().children).toHaveLength(3)

  // Remove Portal 1
  await click(document.getElementById('a'))
  expect(getPortalRoot().children).toHaveLength(2)

  // Remove Portal 2
  await click(document.getElementById('b'))
  expect(getPortalRoot().children).toHaveLength(1)

  // Re-add Portal 1
  await click(document.getElementById('a'))
  expect(getPortalRoot().children).toHaveLength(2)

  // Remove Portal 3
  await click(document.getElementById('c'))
  expect(getPortalRoot().children).toHaveLength(1)

  // Remove Portal 1
  await click(document.getElementById('a'))
  expect(getPortalRoot()).toBe(null)

  // Render A and B at the same time!
  await click(document.getElementById('double'))
  expect(getPortalRoot().children).toHaveLength(2)
})

it('should be possible to tamper with the modal root and restore correctly', async () => {
  expect(getPortalRoot()).toBe(null)

  renderTemplate({
    template: html`
      <main id="parent">
        <button id="a" @click="toggleA">Toggle A</button>
        <button id="b" @click="toggleB">Toggle B</button>

        <Portal v-if="renderA">
          <p id="content1">Contents 1 ...</p>
        </Portal>

        <Portal v-if="renderB">
          <p id="content2">Contents 2 ...</p>
        </Portal>
      </main>
    `,
    setup() {
      let renderA = ref(true)
      let renderB = ref(true)

      return {
        renderA,
        renderB,
        toggleA() {
          renderA.value = !renderA.value
        },
        toggleB() {
          renderB.value = !renderB.value
        },
      }
    },
  })

  expect(getPortalRoot()).not.toBe(null)

  // Tamper tamper
  document.body.removeChild(document.getElementById('headlessui-portal-root')!)

  // Hide Portal 1 and 2
  await click(document.getElementById('a'))
  await click(document.getElementById('b'))

  expect(getPortalRoot()).toBe(null)

  // Re-show Portal 1 and 2
  await click(document.getElementById('a'))
  await click(document.getElementById('b'))

  expect(getPortalRoot()).not.toBe(null)
  expect(getPortalRoot().children).toHaveLength(2)
})

it('should be possible to force the Portal into a specific element using PortalGroup', async () => {
  renderTemplate({
    template: html`
      <main>
        <aside ref="container" id="group-1">A</aside>

        <PortalGroup :target="container">
          <section id="group-2">
            <span>B</span>
          </section>
          <Portal>Next to A</Portal>
        </PortalGroup>
      </main>
    `,
    setup() {
      let container = ref(null)
      return { container }
    },
  })

  await new Promise<void>(nextTick)

  expect(document.body.innerHTML).toMatchSnapshot()
})
