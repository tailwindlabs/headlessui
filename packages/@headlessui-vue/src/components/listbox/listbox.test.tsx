import { defineComponent, ref, watch } from 'vue'
import { render } from '../../test-utils/vue-testing-library'
import { listbox } from '@headlessui/tests/suits'
import { suppressConsoleLogs } from '@headlessui/tests/utils'
import {
  assertActiveElement,
  assertActiveListboxOption,
  assertListbox,
  assertListboxButton,
  assertListboxButtonLinkedWithListboxLabel,
  assertListboxOption,
  assertListboxLabel,
  assertListboxLabelLinkedWithListbox,
  assertNoActiveListboxOption,
  getListbox,
  getListboxButton,
  getListboxOptions,
  ListboxState,
} from '@headlessui/tests/accessibility-assertions'
import { click, press, Keys } from '@headlessui/tests/interactions'

import { Listbox, ListboxLabel, ListboxButton, ListboxOptions, ListboxOption } from './listbox'

jest.mock('../../hooks/use-id')

beforeAll(() => {
  jest.spyOn(window, 'requestAnimationFrame').mockImplementation(setImmediate as any)
  jest.spyOn(window, 'cancelAnimationFrame').mockImplementation(clearImmediate as any)
})

afterAll(() => jest.restoreAllMocks())

function renderTemplate(input: string | Partial<Parameters<typeof defineComponent>[0]>) {
  const defaultComponents = { Listbox, ListboxLabel, ListboxButton, ListboxOptions, ListboxOption }

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

describe('safeguards', () => {
  it.each([
    ['ListboxButton', ListboxButton],
    ['ListboxLabel', ListboxLabel],
    ['ListboxOptions', ListboxOptions],
    ['ListboxOption', ListboxOption],
  ])(
    'should error when we are using a <%s /> without a parent <Listbox />',
    suppressConsoleLogs((name, Component) => {
      expect(() => render(Component)).toThrowError(
        `<${name} /> is missing a parent <Listbox /> component.`
      )
    })
  )

  it(
    'should be possible to render a Listbox without crashing',
    suppressConsoleLogs(async () => {
      renderTemplate({
        template: `
          <Listbox v-model="value">
            <ListboxButton>Trigger</ListboxButton>
            <ListboxOptions>
              <ListboxOption value="a">Option A</ListboxOption>
              <ListboxOption value="b">Option B</ListboxOption>
              <ListboxOption value="c">Option C</ListboxOption>
            </ListboxOptions>
          </Listbox>
        `,
        setup: () => ({ value: ref(null) }),
      })

      assertListboxButton({
        state: ListboxState.Closed,
        attributes: { id: 'headlessui-listbox-button-1' },
      })
      assertListbox({ state: ListboxState.Closed })
    })
  )
})

describe('Rendering', () => {
  describe('Listbox', () => {
    it('should be possible to render a Listbox using a render prop', async () => {
      renderTemplate({
        template: `
          <Listbox v-model="value" v-slot="{ open }">
            <ListboxButton>Trigger</ListboxButton>
            <ListboxOptions v-show="open">
              <ListboxOption value="a">Option A</ListboxOption>
              <ListboxOption value="b">Option B</ListboxOption>
              <ListboxOption value="c">Option C</ListboxOption>
            </ListboxOptions>
          </Listbox>
        `,
        setup: () => ({ value: ref(null) }),
      })

      assertListboxButton({
        state: ListboxState.Closed,
        attributes: { id: 'headlessui-listbox-button-1' },
      })
      assertListbox({ state: ListboxState.Closed })

      await click(getListboxButton())

      assertListboxButton({
        state: ListboxState.Open,
        attributes: { id: 'headlessui-listbox-button-1' },
      })
      assertListbox({ state: ListboxState.Open })
    })
  })

  describe('ListboxLabel', () => {
    it(
      'should be possible to render a ListboxLabel using a render prop',
      suppressConsoleLogs(async () => {
        renderTemplate({
          template: `
            <Listbox v-model="value">
              <ListboxLabel v-slot="data">{{JSON.stringify(data)}}</ListboxLabel>
              <ListboxButton>Trigger</ListboxButton>
              <ListboxOptions>
                <ListboxOption value="a">Option A</ListboxOption>
                <ListboxOption value="b">Option B</ListboxOption>
                <ListboxOption value="c">Option C</ListboxOption>
              </ListboxOptions>
            </Listbox>
          `,
          setup: () => ({ value: ref(null) }),
        })

        assertListboxButton({
          state: ListboxState.Closed,
          attributes: { id: 'headlessui-listbox-button-2' },
        })
        assertListboxLabel({
          attributes: { id: 'headlessui-listbox-label-1' },
          textContent: JSON.stringify({ open: false }),
        })
        assertListbox({ state: ListboxState.Closed })

        await click(getListboxButton())

        assertListboxLabel({
          attributes: { id: 'headlessui-listbox-label-1' },
          textContent: JSON.stringify({ open: true }),
        })
        assertListbox({ state: ListboxState.Open })
        assertListboxLabelLinkedWithListbox()
        assertListboxButtonLinkedWithListboxLabel()
      })
    )

    it(
      'should be possible to render a ListboxLabel using a render prop and an `as` prop',
      suppressConsoleLogs(async () => {
        renderTemplate({
          template: `
            <Listbox v-model="value">
              <ListboxLabel as="p" v-slot="data">{{JSON.stringify(data)}}</ListboxLabel>
              <ListboxButton>Trigger</ListboxButton>
              <ListboxOptions>
                <ListboxOption value="a">Option A</ListboxOption>
                <ListboxOption value="b">Option B</ListboxOption>
                <ListboxOption value="c">Option C</ListboxOption>
              </ListboxOptions>
            </Listbox>
          `,
          setup: () => ({ value: ref(null) }),
        })

        assertListboxLabel({
          attributes: { id: 'headlessui-listbox-label-1' },
          textContent: JSON.stringify({ open: false }),
          tag: 'p',
        })
        assertListbox({ state: ListboxState.Closed })

        await click(getListboxButton())
        assertListboxLabel({
          attributes: { id: 'headlessui-listbox-label-1' },
          textContent: JSON.stringify({ open: true }),
          tag: 'p',
        })
        assertListbox({ state: ListboxState.Open })
      })
    )
  })

  describe('ListboxButton', () => {
    it(
      'should be possible to render a ListboxButton using a render prop',
      suppressConsoleLogs(async () => {
        renderTemplate({
          template: `
            <Listbox v-model="value">
              <ListboxButton v-slot="data">{{JSON.stringify(data)}}</ListboxButton>
              <ListboxOptions>
                <ListboxOption value="a">Option A</ListboxOption>
                <ListboxOption value="b">Option B</ListboxOption>
                <ListboxOption value="c">Option C</ListboxOption>
              </ListboxOptions>
            </Listbox>
          `,
          setup: () => ({ value: ref(null) }),
        })

        assertListboxButton({
          state: ListboxState.Closed,
          attributes: { id: 'headlessui-listbox-button-1' },
          textContent: JSON.stringify({ open: false, focused: false }),
        })
        assertListbox({ state: ListboxState.Closed })

        await click(getListboxButton())

        assertListboxButton({
          state: ListboxState.Open,
          attributes: { id: 'headlessui-listbox-button-1' },
          textContent: JSON.stringify({ open: true, focused: false }),
        })
        assertListbox({ state: ListboxState.Open })
      })
    )

    it(
      'should be possible to render a ListboxButton using a render prop and an `as` prop',
      suppressConsoleLogs(async () => {
        renderTemplate({
          template: `
            <Listbox v-model="value">
              <ListboxButton as="div" role="button" v-slot="data">{{JSON.stringify(data)}}</ListboxButton>
              <ListboxOptions>
                <ListboxOption value="a">Option A</ListboxOption>
                <ListboxOption value="b">Option B</ListboxOption>
                <ListboxOption value="c">Option C</ListboxOption>
              </ListboxOptions>
            </Listbox>
          `,
          setup: () => ({ value: ref(null) }),
        })

        assertListboxButton({
          state: ListboxState.Closed,
          attributes: { id: 'headlessui-listbox-button-1' },
          textContent: JSON.stringify({ open: false, focused: false }),
        })
        assertListbox({ state: ListboxState.Closed })

        await click(getListboxButton())

        assertListboxButton({
          state: ListboxState.Open,
          attributes: { id: 'headlessui-listbox-button-1' },
          textContent: JSON.stringify({ open: true, focused: false }),
        })
        assertListbox({ state: ListboxState.Open })
      })
    )

    it(
      'should be possible to render a ListboxButton and a ListboxLabel and see them linked together',
      suppressConsoleLogs(async () => {
        renderTemplate({
          template: `
            <Listbox v-model="value">
              <ListboxLabel>Label</ListboxLabel>
              <ListboxButton>Trigger</ListboxButton>
              <ListboxOptions>
                <ListboxOption value="a">Option A</ListboxOption>
                <ListboxOption value="b">Option B</ListboxOption>
                <ListboxOption value="c">Option C</ListboxOption>
              </ListboxOptions>
            </Listbox>
          `,
          setup: () => ({ value: ref(null) }),
        })

        await new Promise(requestAnimationFrame)

        assertListboxButton({
          state: ListboxState.Closed,
          attributes: { id: 'headlessui-listbox-button-2' },
        })
        assertListbox({ state: ListboxState.Closed })
        assertListboxButtonLinkedWithListboxLabel()
      })
    )
  })

  describe('ListboxOptions', () => {
    it(
      'should be possible to render ListboxOptions using a render prop',
      suppressConsoleLogs(async () => {
        renderTemplate({
          template: `
            <Listbox v-model="value">
              <ListboxButton>Trigger</ListboxButton>
              <ListboxOptions v-slot="data">
                <ListboxOption value="a">{{JSON.stringify(data)}}</ListboxOption>
              </ListboxOptions>
            </Listbox>
          `,
          setup: () => ({ value: ref(null) }),
        })

        assertListboxButton({
          state: ListboxState.Closed,
          attributes: { id: 'headlessui-listbox-button-1' },
        })
        assertListbox({ state: ListboxState.Closed })

        await click(getListboxButton())

        assertListboxButton({
          state: ListboxState.Open,
          attributes: { id: 'headlessui-listbox-button-1' },
        })
        assertListbox({
          state: ListboxState.Open,
          textContent: JSON.stringify({ open: true }),
        })
        assertActiveElement(getListbox())
      })
    )

    it('should be possible to always render the ListboxOptions if we provide it a `static` prop', () => {
      renderTemplate({
        template: `
          <Listbox v-model="value">
            <ListboxButton>Trigger</ListboxButton>
            <ListboxOptions static>
              <ListboxOption value="a">Option A</ListboxOption>
              <ListboxOption value="b">Option B</ListboxOption>
              <ListboxOption value="c">Option C</ListboxOption>
            </ListboxOptions>
          </Listbox>
        `,
        setup: () => ({ value: ref(null) }),
      })

      // Let's verify that the Listbox is already there
      expect(getListbox()).not.toBe(null)
    })
  })

  describe('ListboxOption', () => {
    it(
      'should be possible to render a ListboxOption using a render prop',
      suppressConsoleLogs(async () => {
        renderTemplate({
          template: `
            <Listbox v-model="value">
              <ListboxButton>Trigger</ListboxButton>
              <ListboxOptions>
                <ListboxOption value="a" v-slot="data">{{JSON.stringify(data)}}</ListboxOption>
              </ListboxOptions>
            </Listbox>
          `,
          setup: () => ({ value: ref(null) }),
        })

        assertListboxButton({
          state: ListboxState.Closed,
          attributes: { id: 'headlessui-listbox-button-1' },
        })
        assertListbox({ state: ListboxState.Closed })

        await click(getListboxButton())

        assertListboxButton({
          state: ListboxState.Open,
          attributes: { id: 'headlessui-listbox-button-1' },
        })
        assertListbox({
          state: ListboxState.Open,
          textContent: JSON.stringify({ active: false, selected: false, disabled: false }),
        })
      })
    )
  })
})

describe('Rendering composition', () => {
  it(
    'should be possible to conditionally render classNames (aka className can be a function?!)',
    suppressConsoleLogs(async () => {
      renderTemplate({
        template: `
          <Listbox v-model="value">
            <ListboxButton>Trigger</ListboxButton>
            <ListboxOptions>
              <ListboxOption value="a" :className="JSON.stringify">
                Option A
              </ListboxOption>
              <ListboxOption value="b" disabled :className="JSON.stringify">
                Option B
              </ListboxOption>
              <ListboxOption value="c" className="no-special-treatment">
                Option C
              </ListboxOption>
            </ListboxOptions>
          </Listbox>
        `,
        setup: () => ({ value: ref(null) }),
      })

      assertListboxButton({
        state: ListboxState.Closed,
        attributes: { id: 'headlessui-listbox-button-1' },
      })
      assertListbox({ state: ListboxState.Closed })

      // Open Listbox
      await click(getListboxButton())

      const options = getListboxOptions()

      // Verify correct classNames
      expect('' + options[0].classList).toEqual(
        JSON.stringify({ active: false, selected: false, disabled: false })
      )
      expect('' + options[1].classList).toEqual(
        JSON.stringify({ active: false, selected: false, disabled: true })
      )
      expect('' + options[2].classList).toEqual('no-special-treatment')

      // Double check that nothing is active
      assertNoActiveListboxOption(getListbox())

      // Make the first option active
      await press(Keys.ArrowDown)

      // Verify the classNames
      expect('' + options[0].classList).toEqual(
        JSON.stringify({ active: true, selected: false, disabled: false })
      )
      expect('' + options[1].classList).toEqual(
        JSON.stringify({ active: false, selected: false, disabled: true })
      )
      expect('' + options[2].classList).toEqual('no-special-treatment')

      // Double check that the first option is the active one
      assertActiveListboxOption(options[0])

      // Let's go down, this should go to the third option since the second option is disabled!
      await press(Keys.ArrowDown)

      // Verify the classNames
      expect('' + options[0].classList).toEqual(
        JSON.stringify({ active: false, selected: false, disabled: false })
      )
      expect('' + options[1].classList).toEqual(
        JSON.stringify({ active: false, selected: false, disabled: true })
      )
      expect('' + options[2].classList).toEqual('no-special-treatment')

      // Double check that the last option is the active one
      assertActiveListboxOption(options[2])
    })
  )

  it(
    'should be possible to swap the Listbox option with a button for example',
    suppressConsoleLogs(async () => {
      renderTemplate({
        template: `
          <Listbox v-model="value">
            <ListboxButton>Trigger</ListboxButton>
            <ListboxOptions>
              <ListboxOption as="button" value="a">
                Option A
              </ListboxOption>
              <ListboxOption as="button" value="b">
                Option B
              </ListboxOption>
              <ListboxOption as="button" value="c">
                Option C
              </ListboxOption>
            </ListboxOptions>
          </Listbox>
        `,
        setup: () => ({ value: ref(null) }),
      })

      assertListboxButton({
        state: ListboxState.Closed,
        attributes: { id: 'headlessui-listbox-button-1' },
      })
      assertListbox({ state: ListboxState.Closed })

      // Open Listbox
      await click(getListboxButton())

      // Verify options are buttons now
      getListboxOptions().forEach(option => assertListboxOption(option, { tag: 'button' }))
    })
  )
})

listbox.run({
  [listbox.scenarios.Default]({ listbox, label, button, options }) {
    return renderTemplate({
      template: `
        <Listbox v-model="value">
          <ListboxButton :disabled="button.disabled">{{button.children}}</ListboxButton>
          <ListboxLabel v-if="label != null">{{label.children}}</ListboxLabel>
          <ListboxOptions>
            <ListboxOption
              v-for="option in options"
              :as="option.as"
              :disabled="option.disabled"
              :value="option.value"
            >{{option.children}}</ListboxOption>
          </ListboxOptions>
        </Listbox>
      `,
      setup: () => {
        const value = ref(listbox.value)
        watch([value], () => listbox.onChange(value.value))
        return { options, button, label, value }
      },
    })
  },
  [listbox.scenarios.MultipleListboxes](listboxes: any[]) {
    return renderTemplate({
      template: `
        <Listbox v-for="listbox in listboxes" v-model="value">
          <ListboxButton :disabled="listbox.button.disabled">{{listbox.button.children}}</ListboxButton>
          <ListboxLabel v-if="label != null">{{listbox.label.children}}</ListboxLabel>
          <ListboxOptions>
            <ListboxOption
              v-for="option in listbox.options"
              :as="option.as"
              :disabled="option.disabled"
              :value="option.value"
            >{{option.children}}</ListboxOption>
          </ListboxOptions>
        </Listbox>
      `,
      setup: () => {
        return {
          listboxes: listboxes.map(listbox => {
            const value = ref(listbox.value)
            watch([value], () => listbox.onChange(value.value))
            return { ...listbox, value }
          }),
        }
      },
    })
  },
  [listbox.scenarios.WithState]({ handleChange, label, button, options }) {
    return renderTemplate({
      template: `
        <Listbox v-model="value">
          <ListboxButton :disabled="button.disabled">{{button.children}}</ListboxButton>
          <ListboxLabel v-if="label != null">{{label.children}}</ListboxLabel>
          <ListboxOptions>
            <ListboxOption
              v-for="option in options"
              :as="option.as"
              :disabled="option.disabled"
              :value="option.value"
            >{{option.children}}</ListboxOption>
          </ListboxOptions>
        </Listbox>
      `,
      setup: () => {
        const value = ref(null)
        watch([value], () => handleChange(value.value))
        return { options, button, label, value }
      },
    })
  },
})
