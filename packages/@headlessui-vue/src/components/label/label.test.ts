import { defineComponent, h, nextTick, ref } from 'vue'
import prettier from 'prettier'

import { render } from '../../test-utils/vue-testing-library'
import { Label, useLabels } from './label'

import { html } from '../../test-utils/html'
import { click } from '../../test-utils/interactions'
import { getByText } from '../../test-utils/accessibility-assertions'

function format(input: Element | string) {
  let contents = (typeof input === 'string' ? input : (input as HTMLElement).outerHTML).trim()
  return prettier.format(contents, { parser: 'babel' })
}

jest.mock('../../hooks/use-id')

beforeAll(() => {
  jest.spyOn(window, 'requestAnimationFrame').mockImplementation(setImmediate as any)
  jest.spyOn(window, 'cancelAnimationFrame').mockImplementation(clearImmediate as any)
})

afterAll(() => jest.restoreAllMocks())

function renderTemplate(input: string | Partial<Parameters<typeof defineComponent>[0]>) {
  let defaultComponents = { Label }

  if (typeof input === 'string') {
    return render(defineComponent({ template: input, components: defaultComponents }))
  }

  return render(
    defineComponent(
      Object.assign({}, input, {
        components: { ...defaultComponents, ...input.components },
      }) as Parameters<typeof defineComponent>[0]
    )
  )
}

it('should be possible to use useLabels without using a Label', async () => {
  let { container } = renderTemplate({
    render() {
      return h('div', [h('div', { 'aria-labelledby': this.labelledby }, ['No label'])])
    },
    setup() {
      let labelledby = useLabels()
      return { labelledby }
    },
  })

  expect(format(container.firstElementChild)).toEqual(
    format(html`
      <div>
        <div>
          No label
        </div>
      </div>
    `)
  )
})

it('should be possible to use useLabels and a single Label, and have them linked', async () => {
  let { container } = renderTemplate({
    render() {
      return h('div', [
        h('div', { 'aria-labelledby': this.labelledby }, [
          h(Label, () => 'I am a label'),
          h('span', 'Contents'),
        ]),
      ])
    },
    setup() {
      let labelledby = useLabels()
      return { labelledby }
    },
  })

  await new Promise<void>(nextTick)

  expect(format(container.firstElementChild)).toEqual(
    format(html`
      <div>
        <div aria-labelledby="headlessui-label-1">
          <label id="headlessui-label-1">
            I am a label
          </label>
          <span>
            Contents
          </span>
        </div>
      </div>
    `)
  )
})

it('should be possible to use useLabels and multiple Label components, and have them linked', async () => {
  let { container } = renderTemplate({
    render() {
      return h('div', [
        h('div', { 'aria-labelledby': this.labelledby }, [
          h(Label, () => 'I am a label'),
          h('span', 'Contents'),
          h(Label, () => 'I am also a label'),
        ]),
      ])
    },
    setup() {
      let labelledby = useLabels()
      return { labelledby }
    },
  })

  await new Promise<void>(nextTick)

  expect(format(container.firstElementChild)).toEqual(
    format(html`
      <div>
        <div aria-labelledby="headlessui-label-1 headlessui-label-2">
          <label id="headlessui-label-1">
            I am a label
          </label>
          <span>
            Contents
          </span>
          <label id="headlessui-label-2">
            I am also a label
          </label>
        </div>
      </div>
    `)
  )
})

it('should be possible to update a prop from the parent and it should reflect in the Label component', async () => {
  let { container } = renderTemplate({
    render() {
      return h('div', [
        h('div', { 'aria-labelledby': this.labelledby }, [
          h(Label, () => 'I am a label'),
          h('button', { onClick: () => this.count++ }, '+1'),
        ]),
      ])
    },
    setup() {
      let count = ref(0)
      let labelledby = useLabels({ props: { 'data-count': count } })
      return { count, labelledby }
    },
  })

  await new Promise<void>(nextTick)

  expect(format(container.firstElementChild)).toEqual(
    format(html`
      <div>
        <div aria-labelledby="headlessui-label-1">
          <label data-count="0" id="headlessui-label-1">
            I am a label
          </label>
          <button>+1</button>
        </div>
      </div>
    `)
  )

  await click(getByText('+1'))

  expect(format(container.firstElementChild)).toEqual(
    format(html`
      <div>
        <div aria-labelledby="headlessui-label-1">
          <label data-count="1" id="headlessui-label-1">
            I am a label
          </label>
          <button>+1</button>
        </div>
      </div>
    `)
  )
})
