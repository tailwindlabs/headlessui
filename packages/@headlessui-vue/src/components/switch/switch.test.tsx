import { defineComponent, ref, watch } from 'vue'
import { render } from '../../test-utils/vue-testing-library'
import { switchComponent } from '@headlessui/tests/suits'
import { suppressConsoleLogs } from '@headlessui/tests/utils'
import { SwitchState, assertSwitch } from '@headlessui/tests/accessibility-assertions'

import { Switch, SwitchLabel, SwitchGroup } from './switch'

jest.mock('../../hooks/use-id')

beforeAll(() => {
  jest.spyOn(window, 'requestAnimationFrame').mockImplementation(setImmediate as any)
  jest.spyOn(window, 'cancelAnimationFrame').mockImplementation(clearImmediate as any)
})

afterAll(() => jest.restoreAllMocks())

function renderTemplate(input: string | Partial<Parameters<typeof defineComponent>[0]>) {
  const defaultComponents = { Switch, SwitchLabel, SwitchGroup }

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
  it.each([['SwitchLabel', SwitchLabel]])(
    'should error when we are using a <%s /> without a parent <SwitchGroup />',
    suppressConsoleLogs((name, Component) => {
      expect(() => render(Component)).toThrowError(
        `<${name} /> is missing a parent <SwitchGroup /> component.`
      )
    }, 'warn')
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
})

switchComponent.run({
  [switchComponent.scenarios.Default]({ handleChange }) {
    return renderTemplate({
      template: `<Switch v-model="checked" />`,
      setup() {
        const checked = ref(false)
        watch([checked], () => handleChange(checked.value))
        return { checked }
      },
    })
  },
  [switchComponent.scenarios.WithOtherElement]() {
    return renderTemplate({
      template: `
        <div>
          <Switch v-model="checked" />
          <button id="btn">Other element</button>
        </div>
      `,
      setup: () => ({ checked: ref(false) }),
    })
  },
  [switchComponent.scenarios.WithGroup]({ handleChange }) {
    return renderTemplate({
      template: `
        <SwitchGroup>
          <Switch v-model="checked" />
          <SwitchLabel>The label</SwitchLabel>
        </SwitchGroup>
      `,
      setup() {
        const checked = ref(false)
        watch([checked], () => handleChange(checked.value))
        return { checked }
      },
    })
  },
})
