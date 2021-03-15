import { defineComponent } from 'vue'
import { render } from '../../test-utils/vue-testing-library'
import { getByText } from '../../test-utils/accessibility-assertions'

import { Alert } from './alert'
import { html } from '../../test-utils/html'

beforeAll(() => {
  jest.spyOn(window, 'requestAnimationFrame').mockImplementation(setImmediate as any)
  jest.spyOn(window, 'cancelAnimationFrame').mockImplementation(clearImmediate as any)
})

function renderTemplate(input: string | Partial<Parameters<typeof defineComponent>[0]>) {
  let defaultComponents = { Alert }

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

describe('Rendering', () => {
  it('should be possible to render an Alert', () => {
    renderTemplate(
      html`
        <Alert>This is an alert</Alert>
      `
    )

    expect(getByText('This is an alert')).toHaveAttribute('role', 'status')
  })

  it('should be possible to render an Alert with an explicit level of importance (polite)', () => {
    renderTemplate(
      html`
        <Alert importance="polite">This is a polite message</Alert>
      `
    )

    expect(getByText('This is a polite message')).toHaveAttribute('role', 'status')
  })

  it('should be possible to render an Alert with an explicit level of importance (assertive)', () => {
    renderTemplate(
      html`
        <Alert importance="assertive">This is a assertive message</Alert>
      `
    )

    expect(getByText('This is a assertive message')).toHaveAttribute('role', 'alert')
  })
})
