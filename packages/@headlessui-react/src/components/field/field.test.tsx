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

  it('should render a `Field` component with a render prop', async () => {
    let { container } = render(
      <Field>
        {(slot) => {
          return (
            <div data-slot={JSON.stringify(slot)}>
              <input />
            </div>
          )
        }}
      </Field>
    )

    expect(container.querySelector('[data-slot]')?.getAttribute('data-slot')).toEqual(
      JSON.stringify({ disabled: false })
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

    expect(fieldset).toHaveAttribute('disabled')
    expect(field).toHaveAttribute('aria-disabled', 'true')
  })
})
