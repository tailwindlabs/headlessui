import { defineComponent, ComponentOptionsWithoutProps } from 'vue'
import { render as testRender } from '../test-utils/vue-testing-library'

import { render } from './render'
import { html } from '../test-utils/html'

let Dummy = defineComponent({
  props: {
    as: { type: [Object, String], default: 'div' },
  },
  setup(props, { attrs, slots }) {
    return () => render({ props, slots, attrs, slot: {}, name: 'Dummy' })
  },
})

function renderTemplate(input: string | ComponentOptionsWithoutProps) {
  let defaultComponents = { Dummy }

  if (typeof input === 'string') {
    return testRender(defineComponent({ template: input, components: defaultComponents }))
  }

  return testRender(
    defineComponent(
      Object.assign({}, input, {
        components: { ...defaultComponents, ...input.components },
      }) as Parameters<typeof defineComponent>[0]
    )
  )
}

describe('Validation', () => {
  it('should error when using an as="template" with additional props', () => {
    expect.hasAssertions()

    renderTemplate({
      template: html` <Dummy as="template" class="abc">Contents</Dummy> `,
      errorCaptured(err) {
        expect(err as Error).toEqual(
          new Error(
            [
              'Passing props on "template"!',
              '',
              'The current component <Dummy /> is rendering a "template".',
              'However we need to passthrough the following props:',
              '  - class',
              '',
              'You can apply a few solutions:',
              '  - Add an `as="..."` prop, to ensure that we render an actual element instead of a "template".',
              '  - Render a single element as the child so that we can forward the props onto that element.',
            ].join('\n')
          )
        )
        return false
      },
    })
  })

  it('should forward the props to the first child', () => {
    renderTemplate({
      template: html`
        <Dummy as="template" class="abc">
          <div id="result">Contents</div>
        </Dummy>
      `,
    })

    expect(document.getElementById('result')).toHaveClass('abc')
  })

  it('should forward the props via Functional Components', () => {
    renderTemplate({
      components: {
        PassThrough(props, context) {
          props.as = props.as ?? 'template'
          return render({
            props,
            attrs: context.attrs,
            slots: context.slots,
            slot: {},
            name: 'PassThrough',
          })
        },
      },
      template: html`
        <Dummy as="template" class="abc" data-test="123">
          <PassThrough>
            <div id="result">Contents</div>
          </PassThrough>
        </Dummy>
      `,
    })

    expect(document.getElementById('result')).toHaveClass('abc')
  })
})
