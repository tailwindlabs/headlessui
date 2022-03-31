import { defineComponent, nextTick, ref, watch, reactive, ComponentOptionsWithoutProps } from 'vue'
import { render } from '../../test-utils/vue-testing-library'

import { RadioGroup, RadioGroupOption, RadioGroupLabel, RadioGroupDescription } from './radio-group'

import { suppressConsoleLogs } from '../../test-utils/suppress-console-logs'
import { press, Keys, shift, click } from '../../test-utils/interactions'
import {
  getByText,
  assertRadioGroupLabel,
  getRadioGroupOptions,
  assertFocusable,
  assertNotFocusable,
  assertActiveElement,
} from '../../test-utils/accessibility-assertions'
import { html } from '../../test-utils/html'

jest.mock('../../hooks/use-id')

beforeAll(() => {
  jest.spyOn(window, 'requestAnimationFrame').mockImplementation(setImmediate as any)
  jest.spyOn(window, 'cancelAnimationFrame').mockImplementation(clearImmediate as any)
})

afterAll(() => jest.restoreAllMocks())

function nextFrame() {
  return new Promise<void>((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        resolve()
      })
    })
  })
}

function renderTemplate(input: string | ComponentOptionsWithoutProps) {
  let defaultComponents = { RadioGroup, RadioGroupOption, RadioGroupLabel, RadioGroupDescription }

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
  it.each([['RadioGroupOption', RadioGroupOption]])(
    'should error when we are using a <%s /> without a parent <RadioGroup />',
    suppressConsoleLogs((name, Component) => {
      expect(() => render(Component)).toThrowError(
        `<${name} /> is missing a parent <RadioGroup /> component.`
      )
    })
  )

  it(
    'should be possible to render a RadioGroup without crashing',
    suppressConsoleLogs(async () => {
      renderTemplate({
        template: html`
          <RadioGroup v-model="deliveryMethod">
            <RadioGroupLabel>Pizza Delivery</RadioGroupLabel>
            <RadioGroupOption value="pickup">Pickup</RadioGroupOption>
            <RadioGroupOption value="home-delivery">Home delivery</RadioGroupOption>
            <RadioGroupOption value="dine-in">Dine in</RadioGroupOption>
          </RadioGroup>
        `,
        setup() {
          let deliveryMethod = ref(undefined)
          return { deliveryMethod }
        },
      })

      await new Promise<void>(nextTick)

      assertRadioGroupLabel({ textContent: 'Pizza Delivery' })
    })
  )

  it('should be possible to render a RadioGroup without options and without crashing', () => {
    renderTemplate({
      template: html` <RadioGroup v-model="deliveryMethod" /> `,
      setup() {
        let deliveryMethod = ref(undefined)
        return { deliveryMethod }
      },
    })
  })
})

describe('Rendering', () => {
  it('should be possible to render a RadioGroup, where the first element is tabbable (value is undefined)', async () => {
    renderTemplate({
      template: html`
        <RadioGroup v-model="deliveryMethod">
          <RadioGroupLabel>Pizza Delivery</RadioGroupLabel>
          <RadioGroupOption value="pickup">Pickup</RadioGroupOption>
          <RadioGroupOption value="home-delivery">Home delivery</RadioGroupOption>
          <RadioGroupOption value="dine-in">Dine in</RadioGroupOption>
        </RadioGroup>
      `,
      setup() {
        let deliveryMethod = ref(undefined)
        return { deliveryMethod }
      },
    })

    await new Promise<void>(nextTick)

    expect(getRadioGroupOptions()).toHaveLength(3)

    assertFocusable(getByText('Pickup'))
    assertNotFocusable(getByText('Home delivery'))
    assertNotFocusable(getByText('Dine in'))
  })

  it('should be possible to render a RadioGroup, where the first element is tabbable (value is null)', async () => {
    renderTemplate({
      template: html`
        <RadioGroup v-model="deliveryMethod">
          <RadioGroupLabel>Pizza Delivery</RadioGroupLabel>
          <RadioGroupOption value="pickup">Pickup</RadioGroupOption>
          <RadioGroupOption value="home-delivery">Home delivery</RadioGroupOption>
          <RadioGroupOption value="dine-in">Dine in</RadioGroupOption>
        </RadioGroup>
      `,
      setup() {
        let deliveryMethod = ref(null)
        return { deliveryMethod }
      },
    })

    await new Promise<void>(nextTick)

    expect(getRadioGroupOptions()).toHaveLength(3)

    assertFocusable(getByText('Pickup'))
    assertNotFocusable(getByText('Home delivery'))
    assertNotFocusable(getByText('Dine in'))
  })

  it('should be possible to render a RadioGroup with an active value', async () => {
    renderTemplate({
      template: html`
        <RadioGroup v-model="deliveryMethod">
          <RadioGroupLabel>Pizza Delivery</RadioGroupLabel>
          <RadioGroupOption value="pickup">Pickup</RadioGroupOption>
          <RadioGroupOption value="home-delivery">Home delivery</RadioGroupOption>
          <RadioGroupOption value="dine-in">Dine in</RadioGroupOption>
        </RadioGroup>
      `,
      setup() {
        let deliveryMethod = ref('home-delivery')
        return { deliveryMethod }
      },
    })

    expect(getRadioGroupOptions()).toHaveLength(3)

    assertNotFocusable(getByText('Pickup'))
    assertFocusable(getByText('Home delivery'))
    assertNotFocusable(getByText('Dine in'))
  })

  it('should guarantee the radio option order after a few unmounts', async () => {
    renderTemplate({
      template: html`
        <button @click="showFirst = !showFirst">Toggle</button>
        <RadioGroup v-model="deliveryMethod">
          <RadioGroupLabel>Pizza Delivery</RadioGroupLabel>
          <RadioGroupOption v-if="showFirst" value="pickup">Pickup</RadioGroupOption>
          <RadioGroupOption value="home-delivery">Home delivery</RadioGroupOption>
          <RadioGroupOption value="dine-in">Dine in</RadioGroupOption>
        </RadioGroup>
      `,
      setup() {
        let showFirst = ref(false)
        let deliveryMethod = ref(undefined)
        return { showFirst, deliveryMethod }
      },
    })

    await new Promise<void>(nextTick)

    await click(getByText('Toggle')) // Render the pickup again

    await press(Keys.Tab) // Focus first element
    assertActiveElement(getByText('Pickup'))

    await press(Keys.ArrowUp) // Loop around
    assertActiveElement(getByText('Dine in'))

    await press(Keys.ArrowUp) // Up again
    assertActiveElement(getByText('Home delivery'))
  })

  it('should be possible to render a RadioGroupOption with a render prop', async () => {
    renderTemplate({
      template: html`
        <RadioGroup v-model="deliveryMethod">
          <RadioGroupLabel>Pizza Delivery</RadioGroupLabel>
          <RadioGroupOption value="pickup" v-slot="data"
            >Pickup - {{JSON.stringify(data)}}</RadioGroupOption
          >
          <RadioGroupOption value="home-delivery">Home delivery</RadioGroupOption>
          <RadioGroupOption value="dine-in">Dine in</RadioGroupOption>
        </RadioGroup>
      `,
      setup() {
        let deliveryMethod = ref(undefined)
        return { deliveryMethod }
      },
    })

    await new Promise<void>(nextTick)

    expect(document.querySelector('[id^="headlessui-radiogroup-option-"]')).toHaveTextContent(
      `Pickup - ${JSON.stringify({ checked: false, disabled: false, active: false })}`
    )
  })

  it('should set the checked v-slot info to true for the selected item (testing with objects, because Vue proxies)', async () => {
    renderTemplate({
      template: html`
        <RadioGroup v-model="deliveryMethod">
          <RadioGroupLabel>Pizza Delivery</RadioGroupLabel>
          <RadioGroupOption v-for="option in options" key="option.id" :value="option" v-slot="data"
            >{{option.label}} - {{JSON.stringify(data)}}</RadioGroupOption
          >
        </RadioGroup>
      `,
      setup() {
        let deliveryMethod = ref(undefined)
        let options = ref([
          { id: 1, label: 'Pickup' },
          { id: 2, label: 'Home delivery' },
          { id: 3, label: 'Dine in' },
        ])
        return { deliveryMethod, options }
      },
    })

    await new Promise<void>(nextTick)

    let [pickup, homeDelivery, dineIn] = Array.from(
      document.querySelectorAll('[id^="headlessui-radiogroup-option-"]')
    )
    expect(pickup).toHaveTextContent(
      `Pickup - ${JSON.stringify({ checked: false, disabled: false, active: false })}`
    )
    expect(homeDelivery).toHaveTextContent(
      `Home delivery - ${JSON.stringify({ checked: false, disabled: false, active: false })}`
    )
    expect(dineIn).toHaveTextContent(
      `Dine in - ${JSON.stringify({ checked: false, disabled: false, active: false })}`
    )

    await click(homeDelivery)
    ;[pickup, homeDelivery, dineIn] = Array.from(
      document.querySelectorAll('[id^="headlessui-radiogroup-option-"]')
    )

    expect(pickup).toHaveTextContent(
      `Pickup - ${JSON.stringify({ checked: false, disabled: false, active: false })}`
    )
    expect(homeDelivery).toHaveTextContent(
      `Home delivery - ${JSON.stringify({ checked: true, disabled: false, active: true })}`
    )
    expect(dineIn).toHaveTextContent(
      `Dine in - ${JSON.stringify({ checked: false, disabled: false, active: false })}`
    )
  })

  it('should be possible to put classes on a RadioGroup', async () => {
    renderTemplate({
      template: html`
        <RadioGroup v-model="deliveryMethod" as="div" class="abc">
          <RadioGroupLabel>Pizza Delivery</RadioGroupLabel>
          <RadioGroupOption v-for="option in options" key="option.id" :value="option" v-slot="data"
            >{{option.label}}</RadioGroupOption
          >
        </RadioGroup>
      `,
      setup() {
        let deliveryMethod = ref(undefined)
        let options = ref([{ id: 1, label: 'Pickup' }])
        return { deliveryMethod, options }
      },
    })

    await new Promise<void>(nextTick)

    expect(document.querySelector('[id^="headlessui-radiogroup-"]')).toHaveClass('abc')
  })

  it('should be possible to put classes on a RadioGroupOption', async () => {
    renderTemplate({
      template: html`
        <RadioGroup v-model="deliveryMethod">
          <RadioGroupLabel>Pizza Delivery</RadioGroupLabel>
          <RadioGroupOption
            v-for="option in options"
            key="option.id"
            :value="option"
            v-slot="data"
            class="abc"
            >{{option.label}}</RadioGroupOption
          >
        </RadioGroup>
      `,
      setup() {
        let deliveryMethod = ref(undefined)
        let options = ref([{ id: 1, label: 'Pickup' }])
        return { deliveryMethod, options }
      },
    })

    await new Promise<void>(nextTick)

    expect(getByText('Pickup')).toHaveClass('abc')
  })

  it('should be possible to disable a RadioGroup', async () => {
    let changeFn = jest.fn()
    renderTemplate({
      template: html`
        <button @click="disabled = !disabled">Toggle</button>
        <RadioGroup v-model="deliveryMethod" :disabled="disabled">
          <RadioGroupLabel>Pizza Delivery</RadioGroupLabel>
          <RadioGroupOption value="pickup">Pickup</RadioGroupOption>
          <RadioGroupOption value="home-delivery">Home delivery</RadioGroupOption>
          <RadioGroupOption value="dine-in">Dine in</RadioGroupOption>
          <RadioGroupOption value="render-prop" data-value="render-prop" v-slot="data">
            {{JSON.stringify(data)}}
          </RadioGroupOption>
        </RadioGroup>
      `,
      setup() {
        let deliveryMethod = ref(undefined)
        let disabled = ref(true)
        watch([deliveryMethod], () => changeFn(deliveryMethod.value))
        return { deliveryMethod, disabled }
      },
    })

    // Try to click one a few options
    await click(getByText('Pickup'))
    await click(getByText('Dine in'))

    // Verify that the RadioGroup.Option gets the disabled state
    expect(document.querySelector('[data-value="render-prop"]')).toHaveTextContent(
      JSON.stringify({
        checked: false,
        disabled: true,
        active: false,
      })
    )

    // Make sure that the onChange handler never got called
    expect(changeFn).toHaveBeenCalledTimes(0)

    // Make sure that all the options get an `aria-disabled`
    let options = getRadioGroupOptions()
    expect(options).toHaveLength(4)
    for (let option of options) expect(option).toHaveAttribute('aria-disabled', 'true')

    // Toggle the disabled state
    await click(getByText('Toggle'))

    // Verify that the RadioGroup.Option gets the disabled state
    expect(document.querySelector('[data-value="render-prop"]')).toHaveTextContent(
      JSON.stringify({
        checked: false,
        disabled: false,
        active: false,
      })
    )

    // Try to click one a few options
    await click(getByText('Pickup'))

    // Make sure that the onChange handler got called
    expect(changeFn).toHaveBeenCalledTimes(1)
  })

  it('should be possible to disable a RadioGroup.Option', async () => {
    let changeFn = jest.fn()
    renderTemplate({
      template: html`
        <button @click="disabled = !disabled">Toggle</button>
        <RadioGroup v-model="deliveryMethod">
          <RadioGroupLabel>Pizza Delivery</RadioGroupLabel>
          <RadioGroupOption value="pickup">Pickup</RadioGroupOption>
          <RadioGroupOption value="home-delivery">Home delivery</RadioGroupOption>
          <RadioGroupOption value="dine-in">Dine in</RadioGroupOption>
          <RadioGroupOption
            value="render-prop"
            :disabled="disabled"
            data-value="render-prop"
            v-slot="data"
          >
            {{JSON.stringify(data)}}
          </RadioGroupOption>
        </RadioGroup>
      `,
      setup() {
        let deliveryMethod = ref(undefined)
        let disabled = ref(true)
        watch([deliveryMethod], () => changeFn(deliveryMethod.value))
        return { deliveryMethod, disabled }
      },
    })

    // Try to click the disabled option
    await click(document.querySelector('[data-value="render-prop"]'))

    // Verify that the RadioGroup.Option gets the disabled state
    expect(document.querySelector('[data-value="render-prop"]')).toHaveTextContent(
      JSON.stringify({
        checked: false,
        disabled: true,
        active: false,
      })
    )

    // Make sure that the onChange handler never got called
    expect(changeFn).toHaveBeenCalledTimes(0)

    // Make sure that the option with value "render-prop" gets an `aria-disabled`
    let options = getRadioGroupOptions()
    expect(options).toHaveLength(4)
    for (let option of options) {
      if (option.dataset.value) {
        expect(option).toHaveAttribute('aria-disabled', 'true')
      } else {
        expect(option).not.toHaveAttribute('aria-disabled')
      }
    }

    // Toggle the disabled state
    await click(getByText('Toggle'))

    // Verify that the RadioGroup.Option gets the disabled state
    expect(document.querySelector('[data-value="render-prop"]')).toHaveTextContent(
      JSON.stringify({
        checked: false,
        disabled: false,
        active: false,
      })
    )

    // Try to click one a few options
    await click(document.querySelector('[data-value="render-prop"]'))

    // Make sure that the onChange handler got called
    expect(changeFn).toHaveBeenCalledTimes(1)
  })

  it('should guarantee the order of DOM nodes when performing actions', async () => {
    let props = reactive({ hide: false })

    renderTemplate({
      template: html`
        <RadioGroup v-model="value">
          <RadioGroupOption value="a">Option 1</RadioGroupOption>
          <RadioGroupOption v-if="!hide" value="b">Option 2</RadioGroupOption>
          <RadioGroupOption value="c">Option 3</RadioGroupOption>
        </RadioGroup>
      `,
      setup() {
        return {
          value: ref('a'),
          get hide() {
            return props.hide
          },
        }
      },
    })

    // Focus the RadioGroup
    await press(Keys.Tab)

    props.hide = true
    await nextFrame()

    props.hide = false
    await nextFrame()

    // Verify that the first radio group option is active
    assertActiveElement(getByText('Option 1'))

    await press(Keys.ArrowDown)
    // Verify that the second radio group option is active
    assertActiveElement(getByText('Option 2'))

    await press(Keys.ArrowDown)
    // Verify that the third radio group option is active
    assertActiveElement(getByText('Option 3'))
  })
})

describe('Keyboard interactions', () => {
  describe('`Tab` key', () => {
    it('should be possible to tab to the first item', async () => {
      renderTemplate({
        template: html`
          <RadioGroup v-model="deliveryMethod">
            <RadioGroupLabel>Pizza Delivery</RadioGroupLabel>
            <RadioGroupOption value="pickup">Pickup</RadioGroupOption>
            <RadioGroupOption value="home-delivery">Home delivery</RadioGroupOption>
            <RadioGroupOption value="dine-in">Dine in</RadioGroupOption>
          </RadioGroup>
        `,
        setup() {
          let deliveryMethod = ref()
          return { deliveryMethod }
        },
      })

      await new Promise<void>(nextTick)

      await press(Keys.Tab)

      assertActiveElement(getByText('Pickup'))
    })

    it('should not change the selected element on focus', async () => {
      let changeFn = jest.fn()
      renderTemplate({
        template: html`
          <RadioGroup v-model="deliveryMethod">
            <RadioGroupLabel>Pizza Delivery</RadioGroupLabel>
            <RadioGroupOption value="pickup">Pickup</RadioGroupOption>
            <RadioGroupOption value="home-delivery">Home delivery</RadioGroupOption>
            <RadioGroupOption value="dine-in">Dine in</RadioGroupOption>
          </RadioGroup>
        `,
        setup() {
          let deliveryMethod = ref()
          watch([deliveryMethod], () => changeFn(deliveryMethod.value))
          return { deliveryMethod }
        },
      })

      await new Promise<void>(nextTick)

      await press(Keys.Tab)

      assertActiveElement(getByText('Pickup'))

      expect(changeFn).toHaveBeenCalledTimes(0)
    })

    it('should be possible to tab to the active item', async () => {
      renderTemplate({
        template: html`
          <RadioGroup v-model="deliveryMethod">
            <RadioGroupLabel>Pizza Delivery</RadioGroupLabel>
            <RadioGroupOption value="pickup">Pickup</RadioGroupOption>
            <RadioGroupOption value="home-delivery">Home delivery</RadioGroupOption>
            <RadioGroupOption value="dine-in">Dine in</RadioGroupOption>
          </RadioGroup>
        `,
        setup() {
          let deliveryMethod = ref('home-delivery')
          return { deliveryMethod }
        },
      })

      await press(Keys.Tab)

      assertActiveElement(getByText('Home delivery'))
    })

    it('should not change the selected element on focus (when selecting the active item)', async () => {
      let changeFn = jest.fn()
      renderTemplate({
        template: html`
          <RadioGroup v-model="deliveryMethod">
            <RadioGroupLabel>Pizza Delivery</RadioGroupLabel>
            <RadioGroupOption value="pickup">Pickup</RadioGroupOption>
            <RadioGroupOption value="home-delivery">Home delivery</RadioGroupOption>
            <RadioGroupOption value="dine-in">Dine in</RadioGroupOption>
          </RadioGroup>
        `,
        setup() {
          let deliveryMethod = ref('home-delivery')
          watch([deliveryMethod], () => changeFn(deliveryMethod.value))
          return { deliveryMethod }
        },
      })

      await press(Keys.Tab)

      assertActiveElement(getByText('Home delivery'))

      expect(changeFn).toHaveBeenCalledTimes(0)
    })

    it('should be possible to tab out of the radio group (no selected value)', async () => {
      renderTemplate({
        template: html`
          <button>Before</button>
          <RadioGroup v-model="deliveryMethod">
            <RadioGroupLabel>Pizza Delivery</RadioGroupLabel>
            <RadioGroupOption value="pickup">Pickup</RadioGroupOption>
            <RadioGroupOption value="home-delivery">Home delivery</RadioGroupOption>
            <RadioGroupOption value="dine-in">Dine in</RadioGroupOption>
          </RadioGroup>
          <button>After</button>
        `,
        setup() {
          let deliveryMethod = ref()
          return { deliveryMethod }
        },
      })

      await press(Keys.Tab)
      assertActiveElement(getByText('Before'))

      await press(Keys.Tab)
      assertActiveElement(getByText('Pickup'))

      await press(Keys.Tab)
      assertActiveElement(getByText('After'))
    })

    it('should be possible to tab out of the radio group (selected value)', async () => {
      renderTemplate({
        template: html`
          <button>Before</button>
          <RadioGroup v-model="deliveryMethod">
            <RadioGroupLabel>Pizza Delivery</RadioGroupLabel>
            <RadioGroupOption value="pickup">Pickup</RadioGroupOption>
            <RadioGroupOption value="home-delivery">Home delivery</RadioGroupOption>
            <RadioGroupOption value="dine-in">Dine in</RadioGroupOption>
          </RadioGroup>
          <button>After</button>
        `,
        setup() {
          let deliveryMethod = ref('home-delivery')
          return { deliveryMethod }
        },
      })

      await press(Keys.Tab)
      assertActiveElement(getByText('Before'))

      await press(Keys.Tab)
      assertActiveElement(getByText('Home delivery'))

      await press(Keys.Tab)
      assertActiveElement(getByText('After'))
    })
  })

  describe('`Shift+Tab` key', () => {
    it('should be possible to tab to the first item', async () => {
      renderTemplate({
        template: html`
          <RadioGroup v-model="deliveryMethod">
            <RadioGroupLabel>Pizza Delivery</RadioGroupLabel>
            <RadioGroupOption value="pickup">Pickup</RadioGroupOption>
            <RadioGroupOption value="home-delivery">Home delivery</RadioGroupOption>
            <RadioGroupOption value="dine-in">Dine in</RadioGroupOption>
          </RadioGroup>
          <button>After</button>
        `,
        setup() {
          let deliveryMethod = ref()
          return { deliveryMethod }
        },
      })

      await new Promise<void>(nextTick)

      getByText('After')?.focus()

      await press(shift(Keys.Tab))

      assertActiveElement(getByText('Pickup'))
    })

    it('should not change the selected element on focus', async () => {
      let changeFn = jest.fn()
      renderTemplate({
        template: html`
          <RadioGroup v-model="deliveryMethod">
            <RadioGroupLabel>Pizza Delivery</RadioGroupLabel>
            <RadioGroupOption value="pickup">Pickup</RadioGroupOption>
            <RadioGroupOption value="home-delivery">Home delivery</RadioGroupOption>
            <RadioGroupOption value="dine-in">Dine in</RadioGroupOption>
          </RadioGroup>
          <button>After</button>
        `,
        setup() {
          let deliveryMethod = ref()
          return { deliveryMethod }
        },
      })

      await new Promise<void>(nextTick)

      getByText('After')?.focus()

      await press(shift(Keys.Tab))

      assertActiveElement(getByText('Pickup'))

      expect(changeFn).toHaveBeenCalledTimes(0)
    })

    it('should be possible to tab to the active item', async () => {
      renderTemplate({
        template: html`
          <RadioGroup v-model="deliveryMethod">
            <RadioGroupLabel>Pizza Delivery</RadioGroupLabel>
            <RadioGroupOption value="pickup">Pickup</RadioGroupOption>
            <RadioGroupOption value="home-delivery">Home delivery</RadioGroupOption>
            <RadioGroupOption value="dine-in">Dine in</RadioGroupOption>
          </RadioGroup>
          <button>After</button>
        `,
        setup() {
          let deliveryMethod = ref('home-delivery')
          return { deliveryMethod }
        },
      })

      getByText('After')?.focus()

      await press(shift(Keys.Tab))

      assertActiveElement(getByText('Home delivery'))
    })

    it('should not change the selected element on focus (when selecting the active item)', async () => {
      let changeFn = jest.fn()
      renderTemplate({
        template: html`
          <RadioGroup v-model="deliveryMethod">
            <RadioGroupLabel>Pizza Delivery</RadioGroupLabel>
            <RadioGroupOption value="pickup">Pickup</RadioGroupOption>
            <RadioGroupOption value="home-delivery">Home delivery</RadioGroupOption>
            <RadioGroupOption value="dine-in">Dine in</RadioGroupOption>
          </RadioGroup>
          <button>After</button>
        `,
        setup() {
          let deliveryMethod = ref('home-delivery')
          watch([deliveryMethod], () => changeFn(deliveryMethod.value))
          return { deliveryMethod }
        },
      })

      getByText('After')?.focus()

      await press(shift(Keys.Tab))

      assertActiveElement(getByText('Home delivery'))

      expect(changeFn).toHaveBeenCalledTimes(0)
    })

    it('should be possible to tab out of the radio group (no selected value)', async () => {
      renderTemplate({
        template: html`
          <button>Before</button>
          <RadioGroup v-model="deliveryMethod">
            <RadioGroupLabel>Pizza Delivery</RadioGroupLabel>
            <RadioGroupOption value="pickup">Pickup</RadioGroupOption>
            <RadioGroupOption value="home-delivery">Home delivery</RadioGroupOption>
            <RadioGroupOption value="dine-in">Dine in</RadioGroupOption>
          </RadioGroup>
          <button>After</button>
        `,
        setup() {
          let deliveryMethod = ref()
          return { deliveryMethod }
        },
      })

      await new Promise<void>(nextTick)

      getByText('After')?.focus()

      await press(shift(Keys.Tab))
      assertActiveElement(getByText('Pickup'))

      await press(shift(Keys.Tab))
      assertActiveElement(getByText('Before'))
    })

    it('should be possible to tab out of the radio group (selected value)', async () => {
      renderTemplate({
        template: html`
          <button>Before</button>
          <RadioGroup v-model="deliveryMethod">
            <RadioGroupLabel>Pizza Delivery</RadioGroupLabel>
            <RadioGroupOption value="pickup">Pickup</RadioGroupOption>
            <RadioGroupOption value="home-delivery">Home delivery</RadioGroupOption>
            <RadioGroupOption value="dine-in">Dine in</RadioGroupOption>
          </RadioGroup>
          <button>After</button>
        `,
        setup() {
          let deliveryMethod = ref('home-delivery')
          return { deliveryMethod }
        },
      })

      getByText('After')?.focus()

      await press(shift(Keys.Tab))
      assertActiveElement(getByText('Home delivery'))

      await press(shift(Keys.Tab))
      assertActiveElement(getByText('Before'))
    })
  })

  describe('`ArrowLeft` key', () => {
    it('should go to the previous item when pressing the ArrowLeft key', async () => {
      let changeFn = jest.fn()
      renderTemplate({
        template: html`
          <button>Before</button>
          <RadioGroup v-model="deliveryMethod">
            <RadioGroupLabel>Pizza Delivery</RadioGroupLabel>
            <RadioGroupOption value="pickup">Pickup</RadioGroupOption>
            <RadioGroupOption value="home-delivery">Home delivery</RadioGroupOption>
            <RadioGroupOption value="dine-in">Dine in</RadioGroupOption>
          </RadioGroup>
          <button>After</button>
        `,
        setup() {
          let deliveryMethod = ref()
          watch([deliveryMethod], () => changeFn(deliveryMethod.value))
          return { deliveryMethod }
        },
      })

      await new Promise<void>(nextTick)

      // Focus the "Before" button
      await press(Keys.Tab)

      // Focus the RadioGroup
      await press(Keys.Tab)

      assertActiveElement(getByText('Pickup'))

      await press(Keys.ArrowLeft) // Loop around
      assertActiveElement(getByText('Dine in'))

      await press(Keys.ArrowLeft)
      assertActiveElement(getByText('Home delivery'))

      expect(changeFn).toHaveBeenCalledTimes(2)
      expect(changeFn).toHaveBeenNthCalledWith(1, 'dine-in')
      expect(changeFn).toHaveBeenNthCalledWith(2, 'home-delivery')
    })
  })

  describe('`ArrowUp` key', () => {
    it('should go to the previous item when pressing the ArrowUp key', async () => {
      let changeFn = jest.fn()
      renderTemplate({
        template: html`
          <button>Before</button>
          <RadioGroup v-model="deliveryMethod">
            <RadioGroupLabel>Pizza Delivery</RadioGroupLabel>
            <RadioGroupOption value="pickup">Pickup</RadioGroupOption>
            <RadioGroupOption value="home-delivery">Home delivery</RadioGroupOption>
            <RadioGroupOption value="dine-in">Dine in</RadioGroupOption>
          </RadioGroup>
          <button>After</button>
        `,
        setup() {
          let deliveryMethod = ref()
          watch([deliveryMethod], () => changeFn(deliveryMethod.value))
          return { deliveryMethod }
        },
      })

      // Focus the "Before" button
      await press(Keys.Tab)

      // Focus the RadioGroup
      await press(Keys.Tab)

      assertActiveElement(getByText('Pickup'))

      await press(Keys.ArrowUp) // Loop around
      assertActiveElement(getByText('Dine in'))

      await press(Keys.ArrowUp)
      assertActiveElement(getByText('Home delivery'))

      expect(changeFn).toHaveBeenCalledTimes(2)
      expect(changeFn).toHaveBeenNthCalledWith(1, 'dine-in')
      expect(changeFn).toHaveBeenNthCalledWith(2, 'home-delivery')
    })
  })

  describe('`ArrowRight` key', () => {
    it('should go to the next item when pressing the ArrowRight key', async () => {
      let changeFn = jest.fn()
      renderTemplate({
        template: html`
          <button>Before</button>
          <RadioGroup v-model="deliveryMethod">
            <RadioGroupLabel>Pizza Delivery</RadioGroupLabel>
            <RadioGroupOption value="pickup">Pickup</RadioGroupOption>
            <RadioGroupOption value="home-delivery">Home delivery</RadioGroupOption>
            <RadioGroupOption value="dine-in">Dine in</RadioGroupOption>
          </RadioGroup>
          <button>After</button>
        `,
        setup() {
          let deliveryMethod = ref()
          watch([deliveryMethod], () => changeFn(deliveryMethod.value))
          return { deliveryMethod }
        },
      })

      // Focus the "Before" button
      await press(Keys.Tab)

      // Focus the RadioGroup
      await press(Keys.Tab)

      assertActiveElement(getByText('Pickup'))

      await press(Keys.ArrowRight)
      assertActiveElement(getByText('Home delivery'))

      await press(Keys.ArrowRight)
      assertActiveElement(getByText('Dine in'))

      await press(Keys.ArrowRight) // Loop around
      assertActiveElement(getByText('Pickup'))

      expect(changeFn).toHaveBeenCalledTimes(3)
      expect(changeFn).toHaveBeenNthCalledWith(1, 'home-delivery')
      expect(changeFn).toHaveBeenNthCalledWith(2, 'dine-in')
      expect(changeFn).toHaveBeenNthCalledWith(3, 'pickup')
    })
  })

  describe('`ArrowDown` key', () => {
    it('should go to the next item when pressing the ArrowDown key', async () => {
      let changeFn = jest.fn()
      renderTemplate({
        template: html`
          <button>Before</button>
          <RadioGroup v-model="deliveryMethod">
            <RadioGroupLabel>Pizza Delivery</RadioGroupLabel>
            <RadioGroupOption value="pickup">Pickup</RadioGroupOption>
            <RadioGroupOption value="home-delivery">Home delivery</RadioGroupOption>
            <RadioGroupOption value="dine-in">Dine in</RadioGroupOption>
          </RadioGroup>
          <button>After</button>
        `,
        setup() {
          let deliveryMethod = ref()
          watch([deliveryMethod], () => changeFn(deliveryMethod.value))
          return { deliveryMethod }
        },
      })

      // Focus the "Before" button
      await press(Keys.Tab)

      // Focus the RadioGroup
      await press(Keys.Tab)

      assertActiveElement(getByText('Pickup'))

      await press(Keys.ArrowDown)
      assertActiveElement(getByText('Home delivery'))

      await press(Keys.ArrowDown)
      assertActiveElement(getByText('Dine in'))

      await press(Keys.ArrowDown) // Loop around
      assertActiveElement(getByText('Pickup'))

      expect(changeFn).toHaveBeenCalledTimes(3)
      expect(changeFn).toHaveBeenNthCalledWith(1, 'home-delivery')
      expect(changeFn).toHaveBeenNthCalledWith(2, 'dine-in')
      expect(changeFn).toHaveBeenNthCalledWith(3, 'pickup')
    })
  })

  describe('`Space` key', () => {
    it('should select the current option when pressing space', async () => {
      let changeFn = jest.fn()
      renderTemplate({
        template: html`
          <button>Before</button>
          <RadioGroup v-model="deliveryMethod">
            <RadioGroupLabel>Pizza Delivery</RadioGroupLabel>
            <RadioGroupOption value="pickup">Pickup</RadioGroupOption>
            <RadioGroupOption value="home-delivery">Home delivery</RadioGroupOption>
            <RadioGroupOption value="dine-in">Dine in</RadioGroupOption>
          </RadioGroup>
          <button>After</button>
        `,
        setup() {
          let deliveryMethod = ref()
          watch([deliveryMethod], () => changeFn(deliveryMethod.value))
          return { deliveryMethod }
        },
      })

      // Focus the "Before" button
      await press(Keys.Tab)

      // Focus the RadioGroup
      await press(Keys.Tab)

      assertActiveElement(getByText('Pickup'))

      await press(Keys.Space)
      assertActiveElement(getByText('Pickup'))

      expect(changeFn).toHaveBeenCalledTimes(1)
      expect(changeFn).toHaveBeenNthCalledWith(1, 'pickup')
    })

    it('should select the current option only once when pressing space', async () => {
      let changeFn = jest.fn()
      renderTemplate({
        template: html`
          <button>Before</button>
          <RadioGroup v-model="deliveryMethod">
            <RadioGroupLabel>Pizza Delivery</RadioGroupLabel>
            <RadioGroupOption value="pickup">Pickup</RadioGroupOption>
            <RadioGroupOption value="home-delivery">Home delivery</RadioGroupOption>
            <RadioGroupOption value="dine-in">Dine in</RadioGroupOption>
          </RadioGroup>
          <button>After</button>
        `,
        setup() {
          let deliveryMethod = ref()
          watch([deliveryMethod], () => changeFn(deliveryMethod.value))
          return { deliveryMethod }
        },
      })

      // Focus the "Before" button
      await press(Keys.Tab)

      // Focus the RadioGroup
      await press(Keys.Tab)

      assertActiveElement(getByText('Pickup'))

      await press(Keys.Space)
      await press(Keys.Space)
      await press(Keys.Space)
      await press(Keys.Space)
      await press(Keys.Space)
      assertActiveElement(getByText('Pickup'))

      expect(changeFn).toHaveBeenCalledTimes(1)
      expect(changeFn).toHaveBeenNthCalledWith(1, 'pickup')
    })
  })

  describe('`Enter`', () => {
    it('should submit the form on `Enter`', async () => {
      let submits = jest.fn()

      renderTemplate({
        template: html`
          <form @submit="handleSubmit">
            <RadioGroup v-model="value" name="option">
              <RadioGroupOption value="alice">Alice</RadioGroupOption>
              <RadioGroupOption value="bob">Bob</RadioGroupOption>
              <RadioGroupOption value="charlie">Charlie</RadioGroupOption>
            </RadioGroup>
            <button>Submit</button>
          </form>
        `,
        setup() {
          let value = ref('bob')
          return {
            value,
            handleSubmit(event: KeyboardEvent) {
              event.preventDefault()
              submits([...new FormData(event.currentTarget as HTMLFormElement).entries()])
            },
          }
        },
      })

      // Focus the RadioGroup
      await press(Keys.Tab)

      // Press enter (which should submit the form)
      await press(Keys.Enter)

      // Verify the form was submitted
      expect(submits).toHaveBeenCalledTimes(1)
      expect(submits).toHaveBeenCalledWith([['option', 'bob']])
    })
  })
})

describe('Mouse interactions', () => {
  it('should be possible to change the current radio group value when clicking on a radio option', async () => {
    let changeFn = jest.fn()
    renderTemplate({
      template: html`
        <button>Before</button>
        <RadioGroup v-model="deliveryMethod">
          <RadioGroupLabel>Pizza Delivery</RadioGroupLabel>
          <RadioGroupOption value="pickup">Pickup</RadioGroupOption>
          <RadioGroupOption value="home-delivery">Home delivery</RadioGroupOption>
          <RadioGroupOption value="dine-in">Dine in</RadioGroupOption>
        </RadioGroup>
        <button>After</button>
      `,
      setup() {
        let deliveryMethod = ref()
        watch([deliveryMethod], () => changeFn(deliveryMethod.value))
        return { deliveryMethod }
      },
    })

    await click(getByText('Home delivery'))

    assertActiveElement(getByText('Home delivery'))

    expect(changeFn).toHaveBeenNthCalledWith(1, 'home-delivery')
  })

  it('should be a no-op when clicking on the same item', async () => {
    let changeFn = jest.fn()
    renderTemplate({
      template: html`
        <button>Before</button>
        <RadioGroup v-model="deliveryMethod">
          <RadioGroupLabel>Pizza Delivery</RadioGroupLabel>
          <RadioGroupOption value="pickup">Pickup</RadioGroupOption>
          <RadioGroupOption value="home-delivery">Home delivery</RadioGroupOption>
          <RadioGroupOption value="dine-in">Dine in</RadioGroupOption>
        </RadioGroup>
        <button>After</button>
      `,
      setup() {
        let deliveryMethod = ref()
        watch([deliveryMethod], () => changeFn(deliveryMethod.value))
        return { deliveryMethod }
      },
    })

    await click(getByText('Home delivery'))
    await click(getByText('Home delivery'))
    await click(getByText('Home delivery'))
    await click(getByText('Home delivery'))

    assertActiveElement(getByText('Home delivery'))

    expect(changeFn).toHaveBeenCalledTimes(1)
  })
})

describe('Form compatibility', () => {
  it('should be possible to submit a form with a value', async () => {
    let submits = jest.fn()

    renderTemplate({
      template: html`
        <form @submit="handleSubmit">
          <RadioGroup v-model="deliveryMethod" name="delivery">
            <RadioGroupLabel>Pizza Delivery</RadioGroupLabel>
            <RadioGroupOption value="pickup">Pickup</RadioGroupOption>
            <RadioGroupOption value="home-delivery">Home delivery</RadioGroupOption>
            <RadioGroupOption value="dine-in">Dine in</RadioGroupOption>
          </RadioGroup>
          <button>Submit</button>
        </form>
      `,
      setup() {
        let deliveryMethod = ref(null)
        return {
          deliveryMethod,
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

    // Choose home delivery
    await click(getByText('Home delivery'))

    // Submit the form again
    await click(getByText('Submit'))

    // Verify that the form has been submitted
    expect(submits).lastCalledWith([['delivery', 'home-delivery']])

    // Choose pickup
    await click(getByText('Pickup'))

    // Submit the form again
    await click(getByText('Submit'))

    // Verify that the form has been submitted
    expect(submits).lastCalledWith([['delivery', 'pickup']])
  })

  it('should be possible to submit a form with a complex value object', async () => {
    let submits = jest.fn()

    renderTemplate({
      template: html`
        <form @submit="handleSubmit">
          <RadioGroup v-model="deliveryMethod" name="delivery">
            <RadioGroupLabel>Pizza Delivery</RadioGroupLabel>
            <RadioGroupOption v-for="option in options" :key="option.id" :value="option"
              >{{ option.label }}</RadioGroupOption
            >
          </RadioGroup>
          <button>Submit</button>
        </form>
      `,
      setup() {
        let options = ref([
          {
            id: 1,
            value: 'pickup',
            label: 'Pickup',
            extra: { info: 'Some extra info' },
          },
          {
            id: 2,
            value: 'home-delivery',
            label: 'Home delivery',
            extra: { info: 'Some extra info' },
          },
          {
            id: 3,
            value: 'dine-in',
            label: 'Dine in',
            extra: { info: 'Some extra info' },
          },
        ])
        let deliveryMethod = ref(options.value[0])

        return {
          deliveryMethod,
          options,
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
    expect(submits).lastCalledWith([
      ['delivery[id]', '1'],
      ['delivery[value]', 'pickup'],
      ['delivery[label]', 'Pickup'],
      ['delivery[extra][info]', 'Some extra info'],
    ])

    // Choose home delivery
    await click(getByText('Home delivery'))

    // Submit the form again
    await click(getByText('Submit'))

    // Verify that the form has been submitted
    expect(submits).lastCalledWith([
      ['delivery[id]', '2'],
      ['delivery[value]', 'home-delivery'],
      ['delivery[label]', 'Home delivery'],
      ['delivery[extra][info]', 'Some extra info'],
    ])

    // Choose pickup
    await click(getByText('Pickup'))

    // Submit the form again
    await click(getByText('Submit'))

    // Verify that the form has been submitted
    expect(submits).lastCalledWith([
      ['delivery[id]', '1'],
      ['delivery[value]', 'pickup'],
      ['delivery[label]', 'Pickup'],
      ['delivery[extra][info]', 'Some extra info'],
    ])
  })
})
