import { defineComponent, h, nextTick } from 'vue'
import prettier from 'prettier'

import { render } from '../../test-utils/vue-testing-library'
import { Description, useDescriptions } from './description'

import { html } from '../../test-utils/html'

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
  let defaultComponents = { Description }

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

it('should be possible to use a DescriptionProvider without using a Description', async () => {
  let { container } = renderTemplate({
    render() {
      return h('div', [
        h(this.DescriptionProvider, () => [
          h('div', { 'aria-describedby': this.describedby }, ['No description']),
        ]),
      ])
    },
    setup() {
      let [describedby, DescriptionProvider] = useDescriptions()
      return { describedby, DescriptionProvider }
    },
  })

  expect(format(container.firstElementChild)).toEqual(
    format(html`
      <div>
        No description
      </div>
    `)
  )
})

it('should be possible to use a DescriptionProvider and a single Description, and have them linked', async () => {
  let { container } = renderTemplate({
    render() {
      return h('div', [
        h(this.DescriptionProvider, () => [
          h('div', { 'aria-describedby': this.describedby }, [
            h(Description, () => 'I am a description'),
            h('span', 'Contents'),
          ]),
        ]),
      ])
    },
    setup() {
      let [describedby, DescriptionProvider] = useDescriptions()
      return { describedby, DescriptionProvider }
    },
  })

  await new Promise<void>(nextTick)

  expect(format(container.firstElementChild)).toEqual(
    format(html`
      <div aria-describedby="headlessui-description-1">
        <p id="headlessui-description-1">
          I am a description
        </p>
        <span>
          Contents
        </span>
      </div>
    `)
  )
})

it('should be possible to use a DescriptionProvider and multiple Description components, and have them linked', async () => {
  let { container } = renderTemplate({
    render() {
      return h('div', [
        h(this.DescriptionProvider, () => [
          h('div', { 'aria-describedby': this.describedby }, [
            h(Description, () => 'I am a description'),
            h('span', 'Contents'),
            h(Description, () => 'I am also a description'),
          ]),
        ]),
      ])
    },
    setup() {
      let [describedby, DescriptionProvider] = useDescriptions()
      return { describedby, DescriptionProvider }
    },
  })

  await new Promise<void>(nextTick)

  expect(format(container.firstElementChild)).toEqual(
    format(html`
      <div aria-describedby="headlessui-description-1 headlessui-description-2">
        <p id="headlessui-description-1">
          I am a description
        </p>
        <span>
          Contents
        </span>
        <p id="headlessui-description-2">
          I am also a description
        </p>
      </div>
    `)
  )
})
