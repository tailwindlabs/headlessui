import { defineComponent, ref, watch } from 'vue'
import { render } from '../../test-utils/vue-testing-library'

import { Switch, SwitchLabel, SwitchDescription, SwitchGroup } from './switch'
import {
  SwitchState,
  assertSwitch,
  getSwitch,
  assertActiveElement,
  getSwitchLabel,
} from '../../test-utils/accessibility-assertions'
import { press, click, Keys } from '../../test-utils/interactions'
import { suppressConsoleLogs } from '../../test-utils/suppress-console-logs'

jest.mock('../../hooks/use-id')

function renderTemplate(input: string | Partial<Parameters<typeof defineComponent>[0]>) {
  let defaultComponents = { Switch, SwitchLabel, SwitchDescription, SwitchGroup }

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

describe('Safe guards', () => {
  it.each([
    ['SwitchLabel', SwitchLabel],
    ['SwitchDescription', SwitchDescription],
  ])(
    'should error when we are using a <%s /> without a parent <SwitchGroup />',
    suppressConsoleLogs((name, Component) => {
      expect(() => render(Component)).toThrowError(
        `<${name} /> is missing a parent <SwitchGroup /> component.`
      )
    })
  )

  it('should be possible to render a Switch without crashing', () => {
    renderTemplate({
      template: `<Switch v-model="checked"  />`,
      setup: () => ({ checked: ref(false) }),
    })
  })
})

describe('Rendering', () => {
  it('should be possible to render an (on) Switch using a render prop', () => {
    renderTemplate({
      template: `
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
      template: `
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
      template: `<Switch as="span" v-model="checked" />`,
      setup: () => ({ checked: ref(true) }),
    })
    assertSwitch({ state: SwitchState.On, tag: 'span' })
  })

  it('should be possible to render an (off) Switch using an `as` prop', () => {
    renderTemplate({
      template: `<Switch as="span" v-model="checked" />`,
      setup: () => ({ checked: ref(false) }),
    })
    assertSwitch({ state: SwitchState.Off, tag: 'span' })
  })

  it('should be possible to use the switch contents as the label', () => {
    renderTemplate({
      template: `
        <Switch v-model="checked">
          <span>Enable notifications</span>
        </Switch>
      `,
      setup: () => ({ checked: ref(false) }),
    })

    assertSwitch({ state: SwitchState.Off, label: 'Enable notifications' })
  })
})

describe('Render composition', () => {
  it('should be possible to render a SwitchGroup, Switch and SwitchLabel', async () => {
    renderTemplate({
      template: `
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
      template: `
        <SwitchGroup>
          <SwitchLabel>Label B</SwitchLabel>
          <Switch v-model="checked">
            Label A
          </Switch>
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
      template: `
        <SwitchGroup>
          <Switch v-model="checked">
            Label A
          </Switch>
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
      template: `
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
      template: `
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
      template: `
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
})

describe('Keyboard interactions', () => {
  describe('`Space` key', () => {
    it('should be possible to toggle the Switch with Space', async () => {
      let handleChange = jest.fn()
      renderTemplate({
        template: `<Switch v-model="checked" />`,
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
        template: `<Switch v-model="checked" />`,
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
  })

  describe('`Tab` key', () => {
    it('should be possible to tab away from the Switch', async () => {
      renderTemplate({
        template: `
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
      template: `<Switch v-model="checked" />`,
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
      template: `
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
})
