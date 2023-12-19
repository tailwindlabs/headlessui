import { defineComponent, h, nextTick, ref } from 'vue'
import { getByText } from '../../test-utils/accessibility-assertions'
import { click } from '../../test-utils/interactions'
import { render } from '../../test-utils/vue-testing-library'
import { Label, useLabels } from './label'

function format(input: Element | null | string) {
  if (input === null) throw new Error('input is null')
  let contents = (typeof input === 'string' ? input : (input as HTMLElement).outerHTML).trim()
  return contents
}

jest.mock('../../hooks/use-id')

beforeAll(() => {
  jest.spyOn(window, 'requestAnimationFrame').mockImplementation(setImmediate as any)
  jest.spyOn(window, 'cancelAnimationFrame').mockImplementation(clearImmediate as any)
})

afterAll(() => jest.restoreAllMocks())

it('should be possible to use useLabels without using a Label', async () => {
  let { container } = render(
    defineComponent({
      components: { Label },
      setup() {
        let labelledby = useLabels()

        return () => h('div', [h('div', { 'aria-labelledby': labelledby.value }, ['No label'])])
      },
    })
  )

  expect(format(container.firstElementChild)).toMatchSnapshot()
})

it('should be possible to use useLabels and a single Label, and have them linked', async () => {
  let { container } = render(
    defineComponent({
      components: { Label },
      setup() {
        let labelledby = useLabels()

        return () =>
          h('div', [
            h('div', { 'aria-labelledby': labelledby.value }, [
              h(Label, () => 'I am a label'),
              h('span', 'Contents'),
            ]),
          ])
      },
    })
  )

  await new Promise<void>(nextTick)

  expect(format(container.firstElementChild)).toMatchSnapshot()
})

it('should be possible to use useLabels and multiple Label components, and have them linked', async () => {
  let { container } = render(
    defineComponent({
      components: { Label },
      setup() {
        let labelledby = useLabels()

        return () =>
          h('div', [
            h('div', { 'aria-labelledby': labelledby.value }, [
              h(Label, () => 'I am a label'),
              h('span', 'Contents'),
              h(Label, () => 'I am also a label'),
            ]),
          ])
      },
    })
  )

  await new Promise<void>(nextTick)

  expect(format(container.firstElementChild)).toMatchSnapshot()
})

it('should be possible to update a prop from the parent and it should reflect in the Label component', async () => {
  let { container } = render(
    defineComponent({
      components: { Label },
      setup() {
        let count = ref(0)
        let labelledby = useLabels({ props: { 'data-count': count } })

        return () =>
          h('div', [
            h('div', { 'aria-labelledby': labelledby.value }, [
              h(Label, () => 'I am a label'),
              h('button', { onClick: () => count.value++ }, '+1'),
            ]),
          ])
      },
    })
  )

  await new Promise<void>(nextTick)

  expect(format(container.firstElementChild)).toMatchSnapshot()

  await click(getByText('+1'))

  expect(format(container.firstElementChild)).toMatchSnapshot()
})
