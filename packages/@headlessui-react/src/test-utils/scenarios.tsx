import { render, screen } from '@testing-library/react'
import React from 'react'
import { Description, Field, Fieldset, Label } from '..'
import {
  assertActiveElement,
  assertDisabledish,
  assertLinkedWithDescription,
  assertLinkedWithLabel,
  getControl,
  getDescriptions,
  getLabel,
  getLabels,
} from './accessibility-assertions'
import { click } from './interactions'
import { suppressConsoleLogs } from './suppress-console-logs'

export function commonControlScenarios(Control: React.ComponentType<any>) {
  describe('Rendering composition', () => {
    describe('Inside `Field`', () => {
      it('should mark the control as disabled, if the `Field` is disabled', () => {
        render(
          <Field disabled>
            <Control />
          </Field>
        )

        assertDisabledish(getControl())
      })

      it('should link a control and a `Label` when inside a `Field`', () => {
        render(
          <Field>
            <Label>My Label</Label>
            <Control />
          </Field>
        )

        assertLinkedWithLabel(getControl(), getLabels())
      })

      it('should link a control and multiple `Label` components when inside a `Field`', () => {
        render(
          <Field>
            <Label>My Label #1</Label>
            <Label>My Label #2</Label>
            <Control />
          </Field>
        )

        assertLinkedWithLabel(getControl(), getLabels())
      })

      it('should link a control and a `Description` when inside a `Field`', () => {
        render(
          <Field>
            <Control />
            <Description>My Description</Description>
          </Field>
        )

        assertLinkedWithDescription(getControl(), getDescriptions())
      })

      it('should link a control and multiple `Description` components when inside a `Field`', () => {
        render(
          <Field>
            <Control />
            <Description>My Description #1</Description>
            <Description>My Description #2</Description>
            <Description>My Description #3</Description>
          </Field>
        )

        assertLinkedWithDescription(getControl(), getDescriptions())
      })

      it('should link a control with a `Label` and a `Description` when inside a `Field`', () => {
        render(
          <Field>
            <Label>My Label</Label>
            <Control />
            <Description>My Description</Description>
          </Field>
        )

        assertLinkedWithDescription(getControl(), getDescriptions())
        assertLinkedWithLabel(getControl(), getLabels())
      })
    })
  })

  describe('Mouse interactions', () => {
    describe('Inside `Field`', () => {
      it('should be possible to click a `Label`, and focus the control when in a `Field`', async () => {
        render(
          <Field>
            <Label>My Label</Label>
            <Control />
          </Field>
        )

        assertActiveElement(document.body)
        await click(getLabel())
        assertActiveElement(getControl())
      })

      it('should not be possible to click a `Label`, if the `Label` has the `passive` prop', async () => {
        render(
          <Field>
            <Label passive>My Label</Label>
            <Control />
          </Field>
        )

        assertActiveElement(document.body)
        await click(getLabel())
        assertActiveElement(document.body)
      })

      it('should not be possible to click a `Label` and focus the control, if the control is disabled', async () => {
        render(
          <Field>
            <Label>My Label</Label>
            <Control disabled />
          </Field>
        )

        assertActiveElement(document.body)
        await click(getLabel())
        assertActiveElement(document.body)
      })

      it('should not be possible to click a `Label` and focus the control, if the `Field` is disabled', async () => {
        render(
          <Field disabled>
            <Label>My Label</Label>
            <Control />
          </Field>
        )

        assertActiveElement(document.body)
        await click(getLabel())
        assertActiveElement(document.body)
      })
    })

    describe('Inside `Fieldset`', () => {
      it('should not be possible to click a `Label` and focus the control, if the `Fieldset` is disabled', async () => {
        render(
          <Fieldset disabled>
            <Field>
              <Label>My Label</Label>
              <Control />
            </Field>
          </Fieldset>
        )

        assertActiveElement(document.body)
        await click(getLabel())
        assertActiveElement(document.body)
      })
    })
  })
}

export function commonFormScenarios(
  Control: React.ComponentType<any>,
  {
    performUserInteraction,
  }: { performUserInteraction: (control: HTMLElement | null) => PromiseLike<void> }
) {
  describe('Form compatibility', () => {
    it('should render native (hidden) form elements for the control', () => {
      render(
        <form>
          <Control name="foo" />
        </form>
      )

      expect(document.querySelector('[name=foo]')).toBeInTheDocument()
    })

    it('should submit the form with all the data', async () => {
      let formDataMock = jest.fn()

      render(
        <form
          onSubmit={(e) => {
            e.preventDefault()
            formDataMock(new FormData(e.target as HTMLFormElement))
          }}
        >
          <Control name="foo" />
          <button>Submit</button>
        </form>
      )

      // Submit form
      await click(screen.getByText('Submit'))

      // Ensure the form was submitted with the `foo` input present
      expect(formDataMock.mock.calls[0][0].has('foo')).toBe(true)
    })

    it(
      'should reset the control when the form is reset',
      suppressConsoleLogs(async () => {
        let formDataMock = jest.fn()

        render(
          <form
            onSubmit={(e) => {
              e.preventDefault()
              formDataMock(new FormData(e.target as HTMLFormElement))
            }}
          >
            <Field>
              <Label>The Label</Label>
              <Control name="foo" />
            </Field>

            <button>Submit</button>
            <button type="reset">Reset</button>
          </form>
        )

        // Submit the form to get the intial state of the form
        await click(screen.getByText('Submit'))
        let formState = Object.fromEntries(formDataMock.mock.calls[0][0])

        // Make changes to the control
        await performUserInteraction(getControl())

        // Submit form
        await click(screen.getByText('Submit'))

        // Ensure the form was, and the values are different
        let newFormState = Object.fromEntries(formDataMock.mock.calls[1][0])
        expect(newFormState).not.toEqual(formState)

        // Reset the form
        await click(screen.getByText('Reset'))

        // Ensure the form was reset
        await click(screen.getByText('Submit'))

        // Ensure the form state looks like the initial state
        let resetFormState = Object.fromEntries(formDataMock.mock.calls[2][0])
        expect(resetFormState).toEqual(formState)
      })
    )
  })
}

export function commonRenderingScenarios(
  Control: React.ComponentType<any>,
  { getElement }: { getElement: () => HTMLElement | null }
) {
  describe('Rendering', () => {
    it('should render a control', async () => {
      render(<Control />)

      expect(getElement()).toBeInTheDocument()
    })

    it('should have an `id` attached', () => {
      render(<Control />)

      expect(getElement()).toHaveAttribute('id')
    })

    it('should be possible to override the `id`', () => {
      render(<Control id="foo" />)

      expect(getElement()).toHaveAttribute('id', 'foo')
    })
  })
}
