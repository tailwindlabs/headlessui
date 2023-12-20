import { render, screen } from '@testing-library/react'
import React from 'react'
import {
  assertLinkedWithLabel,
  assertNotLinkedWithLabel,
  getControl,
  getLabels,
} from '../../test-utils/accessibility-assertions'
import { Field } from '../field/field'
import { Input } from '../input/input'
import { Label } from '../label/label'
import { Legend } from '../legend/legend'
import { Fieldset } from './fieldset'

describe('Rendering', () => {
  it('should render a `Fieldset` component', async () => {
    let { container } = render(
      <Fieldset>
        <input />
      </Fieldset>
    )

    let fieldset = container.firstChild

    expect(fieldset).toHaveAttribute('role', 'group')
  })

  it('should add an `aria-disabled` attribute when disabling the `Fieldset`', async () => {
    let { container } = render(
      <Fieldset disabled>
        <input />
      </Fieldset>
    )

    let fieldset = container.firstChild

    expect(fieldset).toHaveAttribute('role', 'group')
    expect(fieldset).toHaveAttribute('aria-disabled', 'true')
  })

  it('should link a `Fieldset` to a nested `Legend`', async () => {
    let { container } = render(
      <Fieldset>
        <Legend>My Legend</Legend>
        <input />
      </Fieldset>
    )

    let fieldset = container.firstChild as HTMLElement

    assertLinkedWithLabel(fieldset, getLabels())
  })

  it('should not link a `Label` inside a `Field` to the `Fieldset`', async () => {
    render(
      <Fieldset>
        <Legend>My Legend</Legend>

        <Field>
          <Label>My Label</Label>
          <Input />
        </Field>
      </Fieldset>
    )

    let legend = screen.getByText('My Legend')
    let label = screen.getByText('My Label')

    let fieldset = legend.parentElement
    let field = label.parentElement

    let input = getControl()

    // The fieldset should be linked with the legend
    assertLinkedWithLabel(fieldset, legend)

    // The input/control should be linked with the label
    assertLinkedWithLabel(input, label)

    // The fieldset should not be linked with the label
    assertNotLinkedWithLabel(fieldset, label)

    // The input/control should not be linked with the legend
    assertNotLinkedWithLabel(input, legend)

    // The field should not be linked with anything
    assertNotLinkedWithLabel(field, legend)
    assertNotLinkedWithLabel(field, label)
  })
})
