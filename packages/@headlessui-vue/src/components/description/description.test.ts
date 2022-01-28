import { defineComponent, h, nextTick, ref } from 'vue'
import prettier from 'prettier'

import { render } from '../../test-utils/vue-testing-library'
import { Description, useDescriptions } from './description'

import { html } from '../../test-utils/html'
import { click } from '../../test-utils/interactions'
import { getByText } from '../../test-utils/accessibility-assertions'

function format(input: Element | null | string) {
  if (input === null) throw new Error('input is null')
  let contents = (typeof input === 'string' ? input : (input as HTMLElement).outerHTML).trim()
  return prettier.format(contents, { parser: 'babel' })
}

jest.mock('../../hooks/use-id')

beforeAll(() => {
  jest.spyOn(window, 'requestAnimationFrame').mockImplementation(setImmediate as any)
  jest.spyOn(window, 'cancelAnimationFrame').mockImplementation(clearImmediate as any)
})

afterAll(() => jest.restoreAllMocks())

it('should be possible to use useDescriptions without using a Description', async () => {
  let { container } = render(
    defineComponent({
      components: { Description },
      setup() {
        let describedby = useDescriptions()

        return () =>
          h('div', [h('div', { 'aria-describedby': describedby.value }, ['No description'])])
      },
    })
  )

  expect(format(container.firstElementChild)).toEqual(
    format(html`
      <div>
        <div>No description</div>
      </div>
    `)
  )
})

it('should be possible to use useDescriptions and a single Description, and have them linked', async () => {
  let { container } = render(
    defineComponent({
      components: { Description },
      setup() {
        let describedby = useDescriptions()

        return () =>
          h('div', [
            h('div', { 'aria-describedby': describedby.value }, [
              h(Description, () => 'I am a description'),
              h('span', 'Contents'),
            ]),
          ])
      },
    })
  )

  await new Promise<void>(nextTick)

  expect(format(container.firstElementChild)).toEqual(
    format(html`
      <div>
        <div aria-describedby="headlessui-description-1">
          <p id="headlessui-description-1">I am a description</p>
          <span>Contents</span>
        </div>
      </div>
    `)
  )
})

it('should be possible to use useDescriptions and multiple Description components, and have them linked', async () => {
  let { container } = render(
    defineComponent({
      components: { Description },
      setup() {
        let describedby = useDescriptions()

        return () =>
          h('div', [
            h('div', { 'aria-describedby': describedby.value }, [
              h(Description, () => 'I am a description'),
              h('span', 'Contents'),
              h(Description, () => 'I am also a description'),
            ]),
          ])
      },
    })
  )

  await new Promise<void>(nextTick)

  expect(format(container.firstElementChild)).toEqual(
    format(html`
      <div>
        <div aria-describedby="headlessui-description-1 headlessui-description-2">
          <p id="headlessui-description-1">I am a description</p>
          <span>Contents</span>
          <p id="headlessui-description-2">I am also a description</p>
        </div>
      </div>
    `)
  )
})

it('should be possible to update a prop from the parent and it should reflect in the Description component', async () => {
  let { container } = render(
    defineComponent({
      components: { Description },
      setup() {
        let count = ref(0)
        let describedby = useDescriptions({ props: { 'data-count': count } })

        return () => {
          return h('div', [
            h('div', { 'aria-describedby': describedby.value }, [
              h(Description, () => 'I am a description'),
              h('button', { onClick: () => count.value++ }, '+1'),
            ]),
          ])
        }
      },
    })
  )

  await new Promise<void>(nextTick)

  expect(format(container.firstElementChild)).toEqual(
    format(html`
      <div>
        <div aria-describedby="headlessui-description-1">
          <p data-count="0" id="headlessui-description-1">I am a description</p>
          <button>+1</button>
        </div>
      </div>
    `)
  )

  await click(getByText('+1'))

  expect(format(container.firstElementChild)).toEqual(
    format(html`
      <div>
        <div aria-describedby="headlessui-description-1">
          <p data-count="1" id="headlessui-description-1">I am a description</p>
          <button>+1</button>
        </div>
      </div>
    `)
  )
})
