import { render } from '@testing-library/react'
import React from 'react'
import { Fieldset } from '../fieldset/fieldset'
import { Field } from './field'

describe('Rendering', () => {
  it('should render a `Field` component', async () => {
    let { container } = render(
      <Field>
        <input />
      </Field>
    )

    expect(container.firstChild).not.toHaveAttribute('aria-disabled', 'true')
  })

  it('should add `aria-disabled` when a `Field` is disabled', async () => {
    let { container } = render(
      <Field disabled>
        <input />
      </Field>
    )

    expect(container.firstChild).toHaveAttribute('aria-disabled', 'true')
  })

  it('should inherit the `disabled` state from a parent `Fieldset`', async () => {
    let { container } = render(
      <Fieldset disabled>
        <Field>
          <input />
        </Field>
      </Fieldset>
    )

    let fieldset = container.firstChild
    let field = fieldset?.firstChild

    expect(fieldset).toHaveAttribute('aria-disabled', 'true')
    expect(field).toHaveAttribute('aria-disabled', 'true')
  })
})
