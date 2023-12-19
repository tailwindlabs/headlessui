import { defineComponent, h, ref, watch } from 'vue'
import {
  SwitchState,
  assertActiveElement,
  assertSwitch,
  getByText,
  getSwitch,
  getSwitchLabel,
} from '../../test-utils/accessibility-assertions'
import { html } from '../../test-utils/html'
import { Keys, click, mouseEnter, press } from '../../test-utils/interactions'
import { suppressConsoleLogs } from '../../test-utils/suppress-console-logs'
import { createRenderTemplate } from '../../test-utils/vue-testing-library'
import { Switch, SwitchDescription, SwitchGroup, SwitchLabel } from './switch'

jest.mock('../../hooks/use-id')

const renderTemplate = createRenderTemplate({ Switch, SwitchLabel, SwitchDescription, SwitchGroup })

describe('Safe guards', () => {
  it('should be possible to render a Switch without crashing', () => {
    renderTemplate({
      template: html` <Switch v-model="checked" /> `,
      setup: () => ({ checked: ref(false) }),
    })
  })
})

describe('Rendering', () => {
  it('should be possible to render an (on) Switch using a render prop', () => {
    renderTemplate({
      template: html`
        <Switch v-model="checked">
          {({ checked }) => <span>{checked ? 'On' : 'Off'}</span>}
        </Switch>
      `,
      setup: () => ({ checked: ref(true) }),
    })

    assertSwitch({ state: SwitchState.On, textContent: 'On' })
  })

  it('should be possible to render an (off) Switch using a render prop', () => {
    renderTemplate({
      template: html`
        <Switch v-model="checked">
          {({ checked }) => <span>{checked ? 'On' : 'Off'}</span>}
        </Switch>
      `,
      setup: () => ({ checked: ref(false) }),
    })

    assertSwitch({ state: SwitchState.Off, textContent: 'Off' })
  })

  it('should be possible to render an (on) Switch using an `as` prop', () => {
    renderTemplate({
      template: html` <Switch as="span" v-model="checked" /> `,
      setup: () => ({ checked: ref(true) }),
    })
    assertSwitch({ state: SwitchState.On, tag: 'span' })
  })

  it('should be possible to render an (off) Switch using an `as` prop', () => {
    renderTemplate({
      template: html` <Switch as="span" v-model="checked" /> `,
      setup: () => ({ checked: ref(false) }),
    })
    assertSwitch({ state: SwitchState.Off, tag: 'span' })
  })

  it('should be possible to use the switch contents as the label', () => {
    renderTemplate({
      template: html`
        <Switch v-model="checked">
          <span>Enable notifications</span>
        </Switch>
      `,
      setup: () => ({ checked: ref(false) }),
    })

    assertSwitch({ state: SwitchState.Off, label: 'Enable notifications' })
  })

  describe('`type` attribute', () => {
    it('should set the `type` to "button" by default', async () => {
      renderTemplate({
        template: html` <Switch v-model="checked"> Trigger </Switch> `,
        setup: () => ({ checked: ref(false) }),
      })

      expect(getSwitch()).toHaveAttribute('type', 'button')
    })

    it('should not set the `type` to "button" if it already contains a `type`', async () => {
      renderTemplate({
        template: html` <Switch v-model="checked" type="submit"> Trigger </Switch> `,
        setup: () => ({ checked: ref(false) }),
      })

      expect(getSwitch()).toHaveAttribute('type', 'submit')
    })

    it(
      'should set the `type` to "button" when using the `as` prop which resolves to a "button"',
      suppressConsoleLogs(async () => {
        renderTemplate({
          template: html` <Switch v-model="checked" :as="CustomButton"> Trigger </Switch> `,
          setup: () => ({
            checked: ref(false),
            CustomButton: defineComponent({
              setup: (props) => () => h('button', { ...props }),
            }),
          }),
        })

        await new Promise(requestAnimationFrame)

        expect(getSwitch()).toHaveAttribute('type', 'button')
      })
    )

    it('should not set the type if the "as" prop is not a "button"', async () => {
      renderTemplate({
        template: html` <Switch v-model="checked" as="div"> Trigger </Switch> `,
        setup: () => ({ checked: ref(false) }),
      })

      expect(getSwitch()).not.toHaveAttribute('type')
    })

    it(
      'should not set the `type` to "button" when using the `as` prop which resolves to a "div"',
      suppressConsoleLogs(async () => {
        renderTemplate({
          template: html` <Switch v-model="checked" :as="CustomButton"> Trigger </Switch> `,
          setup: () => ({
            checked: ref(false),
            CustomButton: defineComponent({
              setup: (props) => () => h('div', props),
            }),
          }),
        })

        await new Promise(requestAnimationFrame)

        expect(getSwitch()).not.toHaveAttribute('type')
      })
    )
  })

  describe('Uncontrolled', () => {
    it('should be possible to use in an uncontrolled way', async () => {
      let handleSubmission = jest.fn()

      renderTemplate({
        template: html`
          <form @submit="handleSubmit">
            <Switch name="notifications" />
            <button id="submit">submit</button>
          </form>
        `,
        setup: () => ({
          handleSubmit(e: SubmitEvent) {
            e.preventDefault()
            handleSubmission(Object.fromEntries(new FormData(e.target as HTMLFormElement)))
          },
        }),
      })

      await click(document.getElementById('submit'))

      // No values
      expect(handleSubmission).toHaveBeenLastCalledWith({})

      // Toggle
      await click(getSwitch())

      // Submit
      await click(document.getElementById('submit'))

      // Notifications should be on
      expect(handleSubmission).toHaveBeenLastCalledWith({ notifications: 'on' })

      // Toggle
      await click(getSwitch())

      // Submit
      await click(document.getElementById('submit'))

      // Notifications should be off (or in this case, non-existant)
      expect(handleSubmission).toHaveBeenLastCalledWith({})
    })

    it('should be possible to use in an uncontrolled way with a value', async () => {
      let handleSubmission = jest.fn()

      renderTemplate({
        template: html`
          <form @submit="handleSubmit">
            <Switch name="notifications" value="enabled" />
            <button id="submit">submit</button>
          </form>
        `,
        setup: () => ({
          handleSubmit(e: SubmitEvent) {
            e.preventDefault()
            handleSubmission(Object.fromEntries(new FormData(e.target as HTMLFormElement)))
          },
        }),
      })

      await click(document.getElementById('submit'))

      // No values
      expect(handleSubmission).toHaveBeenLastCalledWith({})

      // Toggle
      await click(getSwitch())

      // Submit
      await click(document.getElementById('submit'))

      // Notifications should be on
      expect(handleSubmission).toHaveBeenLastCalledWith({ notifications: 'enabled' })

      // Toggle
      await click(getSwitch())

      // Submit
      await click(document.getElementById('submit'))

      // Notifications should be off (or in this case, non-existant)
      expect(handleSubmission).toHaveBeenLastCalledWith({})
    })

    it('should be possible to provide a default value', async () => {
      let handleSubmission = jest.fn()

      renderTemplate({
        template: html`
          <form @submit="handleSubmit">
            <Switch name="notifications" defaultChecked />
            <button id="submit">submit</button>
          </form>
        `,
        setup: () => ({
          handleSubmit(e: SubmitEvent) {
            e.preventDefault()
            handleSubmission(Object.fromEntries(new FormData(e.target as HTMLFormElement)))
          },
        }),
      })

      await click(document.getElementById('submit'))

      // Notifications should be on by default
      expect(handleSubmission).toHaveBeenLastCalledWith({ notifications: 'on' })

      // Toggle
      await click(getSwitch())

      // Submit
      await click(document.getElementById('submit'))

      // Notifications should be off (or in this case non-existant)
      expect(handleSubmission).toHaveBeenLastCalledWith({})
    })

    it('should be possible to reset to the default value if the form is reset', async () => {
      let handleSubmission = jest.fn()

      renderTemplate({
        template: html`
          <form @submit.prevent="handleSubmission">
            <Switch name="assignee" value="bob" defaultChecked />
            <button id="submit">submit</button>
            <button type="reset" id="reset">reset</button>
          </form>
        `,
        setup: () => ({
          handleSubmission(e: SubmitEvent) {
            handleSubmission(Object.fromEntries(new FormData(e.target as HTMLFormElement)))
          },
        }),
      })

      // Bob is the defaultValue
      await click(document.getElementById('submit'))
      expect(handleSubmission).toHaveBeenLastCalledWith({ assignee: 'bob' })

      // Toggle the switch
      await click(getSwitch())

      // Bob should not be active anymore
      await click(document.getElementById('submit'))
      expect(handleSubmission).toHaveBeenLastCalledWith({})

      // Reset
      await click(document.getElementById('reset'))

      // Bob should be submitted again
      await click(document.getElementById('submit'))
      expect(handleSubmission).toHaveBeenLastCalledWith({ assignee: 'bob' })
    })

    it('should still call the onChange listeners when choosing new values', async () => {
      let handleChange = jest.fn()

      renderTemplate({
        template: html`<Switch name="notifications" @update:modelValue="handleChange" />`,
        setup: () => ({ handleChange }),
      })

      // Toggle
      await click(getSwitch())

      // Toggle
      await click(getSwitch())

      // Toggle
      await click(getSwitch())

      // Change handler should have been called 3 times
      expect(handleChange).toHaveBeenNthCalledWith(1, true)
      expect(handleChange).toHaveBeenNthCalledWith(2, false)
      expect(handleChange).toHaveBeenNthCalledWith(3, true)
    })
  })
})

describe('Render composition', () => {
  it('should be possible to render a SwitchGroup, Switch and SwitchLabel', async () => {
    renderTemplate({
      template: html`
        <SwitchGroup>
          <Switch v-model="checked" />
          <SwitchLabel>Enable notifications</SwitchLabel>
        </SwitchGroup>
      `,
      setup: () => ({ checked: ref(false) }),
    })

    await new Promise(requestAnimationFrame)

    assertSwitch({ state: SwitchState.Off, label: 'Enable notifications' })
  })

  it('should be possible to render a SwitchGroup, Switch and SwitchLabel (before the Switch)', async () => {
    renderTemplate({
      template: html`
        <SwitchGroup>
          <SwitchLabel>Label B</SwitchLabel>
          <Switch v-model="checked"> Label A </Switch>
        </SwitchGroup>
      `,
      setup: () => ({ checked: ref(false) }),
    })

    await new Promise(requestAnimationFrame)

    // Warning! Using aria-label or aria-labelledby will hide any descendant content from assistive
    // technologies.
    //
    // Thus: Label A should not be part of the "label" in this case
    assertSwitch({ state: SwitchState.Off, label: 'Label B' })
  })

  it('should be possible to render a SwitchGroup, Switch and SwitchLabel (after the Switch)', async () => {
    renderTemplate({
      template: html`
        <SwitchGroup>
          <Switch v-model="checked"> Label A </Switch>
          <SwitchLabel>Label B</SwitchLabel>
        </SwitchGroup>
      `,
      setup: () => ({ checked: ref(false) }),
    })

    await new Promise(requestAnimationFrame)

    // Warning! Using aria-label or aria-labelledby will hide any descendant content from assistive
    // technologies.
    //
    // Thus: Label A should not be part of the "label" in this case
    assertSwitch({ state: SwitchState.Off, label: 'Label B' })
  })

  it('should be possible to render a Switch.Group, Switch and Switch.Description (before the Switch)', async () => {
    renderTemplate({
      template: html`
        <SwitchGroup>
          <SwitchDescription>This is an important feature</SwitchDescription>
          <Switch v-model="checked" />
        </SwitchGroup>
      `,
      setup: () => ({ checked: ref(false) }),
    })

    await new Promise(requestAnimationFrame)

    assertSwitch({ state: SwitchState.Off, description: 'This is an important feature' })
  })

  it('should be possible to render a Switch.Group, Switch and Switch.Description (after the Switch)', async () => {
    renderTemplate({
      template: html`
        <SwitchGroup>
          <Switch v-model="checked" />
          <SwitchDescription>This is an important feature</SwitchDescription>
        </SwitchGroup>
      `,
      setup: () => ({ checked: ref(false) }),
    })

    await new Promise(requestAnimationFrame)

    assertSwitch({ state: SwitchState.Off, description: 'This is an important feature' })
  })

  it('should be possible to render a Switch.Group, Switch, Switch.Label and Switch.Description', async () => {
    renderTemplate({
      template: html`
        <SwitchGroup>
          <SwitchLabel>Label A</SwitchLabel>
          <Switch v-model="checked" />
          <SwitchDescription>This is an important feature</SwitchDescription>
        </SwitchGroup>
      `,
      setup: () => ({ checked: ref(false) }),
    })

    await new Promise(requestAnimationFrame)

    assertSwitch({
      state: SwitchState.Off,
      label: 'Label A',
      description: 'This is an important feature',
    })
  })

  it('should be possible to put classes on a SwitchLabel', async () => {
    renderTemplate({
      template: html`
        <SwitchGroup>
          <SwitchLabel class="abc">Label A</SwitchLabel>
          <Switch v-model="checked" />
        </SwitchGroup>
      `,
      setup: () => ({ checked: ref(false) }),
    })

    await new Promise(requestAnimationFrame)

    assertSwitch({
      state: SwitchState.Off,
      label: 'Label A',
    })

    expect(getByText('Label A')).toHaveClass('abc')
  })

  it('should be possible to put classes on a SwitchDescription', async () => {
    renderTemplate({
      template: html`
        <SwitchGroup>
          <SwitchDescription class="abc">Description A</SwitchDescription>
          <Switch v-model="checked" />
        </SwitchGroup>
      `,
      setup: () => ({ checked: ref(false) }),
    })

    await new Promise(requestAnimationFrame)

    assertSwitch({
      state: SwitchState.Off,
      description: 'Description A',
    })

    expect(getByText('Description A')).toHaveClass('abc')
  })

  it('should be possible to put classes on a SwitchGroup', async () => {
    renderTemplate({
      template: html`
        <SwitchGroup as="div" class="abc" id="group">
          <Switch v-model="checked" />
        </SwitchGroup>
      `,
      setup: () => ({ checked: ref(false) }),
    })

    await new Promise(requestAnimationFrame)

    assertSwitch({ state: SwitchState.Off })

    expect(document.getElementById('group')).toHaveClass('abc')
  })
})

describe('Keyboard interactions', () => {
  describe('`Space` key', () => {
    it('should be possible to toggle the Switch with Space', async () => {
      let handleChange = jest.fn()
      renderTemplate({
        template: html` <Switch v-model="checked" /> `,
        setup() {
          let checked = ref(false)
          watch([checked], () => handleChange(checked.value))
          return { checked }
        },
      })

      // Ensure checkbox is off
      assertSwitch({ state: SwitchState.Off })

      // Focus the switch
      getSwitch()?.focus()

      // Toggle
      await press(Keys.Space)

      // Ensure state is on
      assertSwitch({ state: SwitchState.On })

      // Toggle
      await press(Keys.Space)

      // Ensure state is off
      assertSwitch({ state: SwitchState.Off })
    })
  })

  describe('`Enter` key', () => {
    it('should not be possible to use Enter to toggle the Switch', async () => {
      let handleChange = jest.fn()
      renderTemplate({
        template: html` <Switch v-model="checked" /> `,
        setup() {
          let checked = ref(false)
          watch([checked], () => handleChange(checked.value))
          return { checked }
        },
      })

      // Ensure checkbox is off
      assertSwitch({ state: SwitchState.Off })

      // Focus the switch
      getSwitch()?.focus()

      // Try to toggle
      await press(Keys.Enter)

      expect(handleChange).not.toHaveBeenCalled()
    })

    it('should submit the form on `Enter`', async () => {
      let submits = jest.fn()
      renderTemplate({
        template: html`
          <form @submit="handleSubmit">
            <Switch v-model="checked" name="option" />
            <button>Submit</button>
          </form>
        `,
        setup() {
          let checked = ref(true)
          return {
            checked,
            handleSubmit(event: KeyboardEvent) {
              event.preventDefault()
              submits([...new FormData(event.currentTarget as HTMLFormElement).entries()])
            },
          }
        },
      })

      // Focus the input field
      getSwitch()?.focus()
      assertActiveElement(getSwitch())

      // Press enter (which should submit the form)
      await press(Keys.Enter)

      // Verify the form was submitted
      expect(submits).toHaveBeenCalledTimes(1)
      expect(submits).toHaveBeenCalledWith([['option', 'on']])
    })

    it('should submit the form on `Enter` (when no submit button was found)', async () => {
      let submits = jest.fn()
      renderTemplate({
        template: html`
          <form @submit="handleSubmit">
            <Switch v-model="checked" name="option" />
          </form>
        `,
        setup() {
          let checked = ref(true)
          return {
            checked,
            handleSubmit(event: KeyboardEvent) {
              event.preventDefault()
              submits([...new FormData(event.currentTarget as HTMLFormElement).entries()])
            },
          }
        },
      })

      // Focus the input field
      getSwitch()?.focus()
      assertActiveElement(getSwitch())

      // Press enter (which should submit the form)
      await press(Keys.Enter)

      // Verify the form was submitted
      expect(submits).toHaveBeenCalledTimes(1)
      expect(submits).toHaveBeenCalledWith([['option', 'on']])
    })
  })

  describe('`Tab` key', () => {
    it('should be possible to tab away from the Switch', async () => {
      renderTemplate({
        template: html`
          <div>
            <Switch v-model="checked" />
            <button id="btn">Other element</button>
          </div>
        `,
        setup: () => ({ checked: ref(false) }),
      })

      // Ensure checkbox is off
      assertSwitch({ state: SwitchState.Off })

      // Focus the switch
      getSwitch()?.focus()

      // Expect the switch to be active
      assertActiveElement(getSwitch())

      // Toggle
      await press(Keys.Tab)

      // Expect the button to be active
      assertActiveElement(document.getElementById('btn'))
    })
  })
})

describe('Mouse interactions', () => {
  it('should be possible to toggle the Switch with a click', async () => {
    let handleChange = jest.fn()
    renderTemplate({
      template: html` <Switch v-model="checked" /> `,
      setup() {
        let checked = ref(false)
        watch([checked], () => handleChange(checked.value))
        return { checked }
      },
    })

    // Ensure checkbox is off
    assertSwitch({ state: SwitchState.Off })

    // Toggle
    await click(getSwitch())

    // Ensure state is on
    assertSwitch({ state: SwitchState.On })

    // Toggle
    await click(getSwitch())

    // Ensure state is off
    assertSwitch({ state: SwitchState.Off })
  })

  it('should be possible to toggle the Switch with a click on the Label', async () => {
    let handleChange = jest.fn()
    renderTemplate({
      template: html`
        <SwitchGroup>
          <Switch v-model="checked" />
          <SwitchLabel>The label</SwitchLabel>
        </SwitchGroup>
      `,
      setup() {
        let checked = ref(false)
        watch([checked], () => handleChange(checked.value))
        return { checked }
      },
    })

    // Ensure checkbox is off
    assertSwitch({ state: SwitchState.Off })

    // Toggle
    await click(getSwitchLabel())

    // Ensure the switch is focused
    assertActiveElement(getSwitch())

    // Ensure state is on
    assertSwitch({ state: SwitchState.On })

    // Toggle
    await click(getSwitchLabel())

    // Ensure the switch is focused
    assertActiveElement(getSwitch())

    // Ensure state is off
    assertSwitch({ state: SwitchState.Off })
  })

  it('should not be possible to toggle the Switch with a click on the Label (passive)', async () => {
    let handleChange = jest.fn()
    renderTemplate({
      template: html`
        <SwitchGroup>
          <Switch v-model="checked" />
          <SwitchLabel passive>The label</SwitchLabel>
        </SwitchGroup>
      `,
      setup() {
        let checked = ref(false)
        watch([checked], () => handleChange(checked.value))
        return { checked }
      },
    })

    // Ensure checkbox is off
    assertSwitch({ state: SwitchState.Off })

    // Toggle
    await click(getSwitchLabel())

    // Ensure state is still Off
    assertSwitch({ state: SwitchState.Off })
  })

  xit('should be possible to hover the label and trigger a hover on the switch', async () => {
    // This test doen't work in JSDOM :(
    // Keeping it here for reference when we can test this in a real browser
    renderTemplate({
      template: html`
        <SwitchGroup>
          <style>
            .bg {
              background-color: rgba(0, 255, 0);
            }
            .bg-on-hover:hover {
              background-color: rgba(255, 0, 0);
            }
          </style>
          <Switch v-model="checked" className="bg bg-on-hover" />
          <SwitchLabel>The label</SwitchLabel>
        </SwitchGroup>
      `,
      setup() {
        return { checked: ref(false) }
      },
    })

    // Verify the switch is not hovered
    expect(window.getComputedStyle(getSwitch()!).backgroundColor).toBe('rgb(0, 255, 0)')

    // Hover over the *label*
    await mouseEnter(getSwitchLabel())

    // Make sure the switch gets hover styles
    expect(window.getComputedStyle(getSwitch()!).backgroundColor).toBe('rgb(255, 0, 0)')
  })
})

describe('Form compatibility', () => {
  it('should be possible to set the `form`, which is forwarded to the hidden inputs', async () => {
    let submits = jest.fn()

    renderTemplate({
      template: html`
        <div>
          <SwitchGroup>
            <Switch form="my-form" v-model="checked" name="notifications" />
            <SwitchLabel>Enable notifications</SwitchLabel>
          </SwitchGroup>
          <form id="my-form" @submit="handleSubmit">
            <button>Submit</button>
          </form>
        </div>
      `,
      setup() {
        let checked = ref(false)
        return {
          checked,
          handleSubmit(event: SubmitEvent) {
            event.preventDefault()
            submits([...new FormData(event.currentTarget as HTMLFormElement).entries()])
          },
        }
      },
    })

    // Toggle
    await click(getSwitchLabel())

    // Submit the form again
    await click(getByText('Submit'))

    // Verify that the form has been submitted
    expect(submits).lastCalledWith([['notifications', 'on']])
  })

  it('should be possible to submit a form with an boolean value', async () => {
    let submits = jest.fn()

    renderTemplate({
      template: html`
        <form @submit="handleSubmit">
          <SwitchGroup>
            <Switch v-model="checked" name="notifications" />
            <SwitchLabel>Enable notifications</SwitchLabel>
          </SwitchGroup>
          <button>Submit</button>
        </form>
      `,
      setup() {
        let checked = ref(false)
        return {
          checked,
          handleSubmit(event: SubmitEvent) {
            event.preventDefault()
            submits([...new FormData(event.currentTarget as HTMLFormElement).entries()])
          },
        }
      },
    })

    // Submit the form
    await click(getByText('Submit'))

    // Verify that the form has been submitted
    expect(submits).lastCalledWith([]) // no data

    // Toggle
    await click(getSwitchLabel())

    // Submit the form again
    await click(getByText('Submit'))

    // Verify that the form has been submitted
    expect(submits).lastCalledWith([['notifications', 'on']])
  })

  it('should be possible to submit a form with a provided string value', async () => {
    let submits = jest.fn()

    renderTemplate({
      template: html`
        <form @submit="handleSubmit">
          <SwitchGroup>
            <Switch v-model="checked" name="fruit" value="apple" />
            <SwitchLabel>Apple</SwitchLabel>
          </SwitchGroup>
          <button>Submit</button>
        </form>
      `,
      setup() {
        let checked = ref(false)
        return {
          checked,
          handleSubmit(event: SubmitEvent) {
            event.preventDefault()
            submits([...new FormData(event.currentTarget as HTMLFormElement).entries()])
          },
        }
      },
    })

    // Submit the form
    await click(getByText('Submit'))

    // Verify that the form has been submitted
    expect(submits).lastCalledWith([]) // no data

    // Toggle
    await click(getSwitchLabel())

    // Submit the form again
    await click(getByText('Submit'))

    // Verify that the form has been submitted
    expect(submits).lastCalledWith([['fruit', 'apple']])
  })
})
