import { defineComponent, h, nextTick, reactive, ref, watch } from 'vue'
import { State, useOpenClosed, useOpenClosedProvider } from '../../internal/open-closed'
import {
  MenuState,
  assertActiveElement,
  assertMenu,
  assertMenuButton,
  assertMenuButtonLinkedWithMenu,
  assertMenuItem,
  assertMenuLinkedWithMenuItem,
  assertNoActiveMenuItem,
  getByText,
  getMenu,
  getMenuButton,
  getMenuButtons,
  getMenuItems,
  getMenus,
} from '../../test-utils/accessibility-assertions'
import { jsx } from '../../test-utils/html'
import {
  Keys,
  MouseButton,
  click,
  focus,
  mouseLeave,
  mouseMove,
  press,
  shift,
  type,
  word,
} from '../../test-utils/interactions'
import { suppressConsoleLogs } from '../../test-utils/suppress-console-logs'
import { createRenderTemplate, render } from '../../test-utils/vue-testing-library'
import { TransitionChild } from '../transitions/transition'
import { Menu, MenuButton, MenuItem, MenuItems } from './menu'

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

const renderTemplate = createRenderTemplate({ Menu, MenuButton, MenuItems, MenuItem })

describe('Safe guards', () => {
  it.each([
    ['MenuButton', MenuButton],
    ['MenuItems', MenuItems],
    ['MenuItem', MenuItem],
  ])(
    'should error when we are using a <%s /> without a parent <Menu />',
    suppressConsoleLogs((name, component) => {
      expect(() => render(component)).toThrowError(
        `<${name} /> is missing a parent <Menu /> component.`
      )
    })
  )

  it('should be possible to render a Menu without crashing', () => {
    renderTemplate(jsx`
      <Menu>
        <MenuButton>Trigger</MenuButton>
        <MenuItems>
          <MenuItem as="a">Item A</MenuItem>
          <MenuItem as="a">Item B</MenuItem>
          <MenuItem as="a">Item C</MenuItem>
        </MenuItems>
      </Menu>
    `)

    assertMenuButton({
      state: MenuState.InvisibleUnmounted,
      attributes: { id: 'headlessui-menu-button-1' },
    })
    assertMenu({ state: MenuState.InvisibleUnmounted })
  })
})

describe('Rendering', () => {
  describe('Menu', () => {
    it('should not crash when rendering no children at all', () => {
      renderTemplate(jsx`
        <Menu></Menu>
      `)
    })

    it('should be possible to render a Menu using a default render prop', async () => {
      renderTemplate(jsx`
        <Menu v-slot="{ open }">
          <MenuButton>Trigger {{ open ? "visible" : "hidden" }}</MenuButton>
          <MenuItems>
            <MenuItem as="a">Item A</MenuItem>
            <MenuItem as="a">Item B</MenuItem>
            <MenuItem as="a">Item C</MenuItem>
          </MenuItems>
        </Menu>
      `)

      assertMenuButton({
        state: MenuState.InvisibleUnmounted,
        attributes: { id: 'headlessui-menu-button-1' },
        textContent: 'Trigger hidden',
      })
      assertMenu({ state: MenuState.InvisibleUnmounted })

      await click(getMenuButton())

      assertMenuButton({
        state: MenuState.Visible,
        attributes: { id: 'headlessui-menu-button-1' },
        textContent: 'Trigger visible',
      })
      assertMenu({ state: MenuState.Visible })
    })

    it('should be possible to render a Menu using a template `as` prop', async () => {
      renderTemplate(jsx`
        <Menu as="template">
          <div>
            <MenuButton>Trigger</MenuButton>
            <MenuItems>
              <MenuItem as="a">Item A</MenuItem>
              <MenuItem as="a">Item B</MenuItem>
              <MenuItem as="a">Item C</MenuItem>
            </MenuItems>
          </div>
        </Menu>
      `)

      assertMenuButton({
        state: MenuState.InvisibleUnmounted,
        attributes: { id: 'headlessui-menu-button-1' },
      })
      assertMenu({ state: MenuState.InvisibleUnmounted })

      await click(getMenuButton())

      assertMenuButton({
        state: MenuState.Visible,
        attributes: { id: 'headlessui-menu-button-1' },
      })
      assertMenu({ state: MenuState.Visible })
    })

    it(
      'should yell when we render a Menu using a template `as` prop (default) that contains multiple children (if we passthrough props)',
      suppressConsoleLogs(() => {
        expect.hasAssertions()

        renderTemplate({
          template: jsx`
              <Menu class="relative">
                <MenuButton>Trigger</MenuButton>
                <MenuItems>
                  <MenuItem as="a">Item A</MenuItem>
                  <MenuItem as="a">Item B</MenuItem>
                  <MenuItem as="a">Item C</MenuItem>
                </MenuItems>
              </Menu>
            `,
          errorCaptured(err) {
            expect(err as Error).toEqual(
              new Error(
                [
                  'Passing props on "template"!',
                  '',
                  'The current component <Menu /> is rendering a "template".',
                  'However we need to passthrough the following props:',
                  '  - class',
                  '',
                  'You can apply a few solutions:',
                  '  - Add an `as="..."` prop, to ensure that we render an actual element instead of a "template".',
                  '  - Render a single element as the child so that we can forward the props onto that element.',
                ].join('\n')
              )
            )

            return false
          },
        })
      })
    )

    it('should be possible to manually close the Menu using the exposed close function', async () => {
      renderTemplate({
        template: jsx`
          <Menu v-slot="{ close }">
            <MenuButton>Trigger</MenuButton>
            <MenuItems>
              <MenuItem>
                <button @click.prevent="close">Close</button>
              </MenuItem>
            </MenuItems>
          </Menu>
        `,
      })

      assertMenu({ state: MenuState.InvisibleUnmounted })

      await click(getMenuButton())

      assertMenu({ state: MenuState.Visible })

      await click(getByText('Close'))

      assertMenu({ state: MenuState.InvisibleUnmounted })
    })
  })

  describe('MenuButton', () => {
    it('should be possible to render a MenuButton using a default render prop', async () => {
      renderTemplate(jsx`
        <Menu>
          <MenuButton v-slot="{ open }">
            Trigger {{ open ? "visible" : "hidden" }}
          </MenuButton>
          <MenuItems>
            <MenuItem as="a">Item A</MenuItem>
            <MenuItem as="a">Item B</MenuItem>
            <MenuItem as="a">Item C</MenuItem>
          </MenuItems>
        </Menu>
      `)

      assertMenuButton({
        state: MenuState.InvisibleUnmounted,
        attributes: { id: 'headlessui-menu-button-1' },
        textContent: 'Trigger hidden',
      })
      assertMenu({ state: MenuState.InvisibleUnmounted })

      await click(getMenuButton())

      assertMenuButton({
        state: MenuState.Visible,
        attributes: { id: 'headlessui-menu-button-1' },
        textContent: 'Trigger visible',
      })
      assertMenu({ state: MenuState.Visible })
    })

    it('should be possible to render a MenuButton using a template `as` prop', async () => {
      renderTemplate(jsx`
        <Menu>
          <MenuButton as="template" v-slot="{ open }">
            <button :data-open="open">Trigger</button>
          </MenuButton>
          <MenuItems>
            <MenuItem as="a">Item A</MenuItem>
            <MenuItem as="a">Item B</MenuItem>
            <MenuItem as="a">Item C</MenuItem>
          </MenuItems>
        </Menu>
      `)

      assertMenuButton({
        state: MenuState.InvisibleUnmounted,
        attributes: { id: 'headlessui-menu-button-1', 'data-open': 'false' },
      })
      assertMenu({ state: MenuState.InvisibleUnmounted })

      await click(getMenuButton())

      assertMenuButton({
        state: MenuState.Visible,
        attributes: { id: 'headlessui-menu-button-1', 'data-open': 'true' },
      })
      assertMenu({ state: MenuState.Visible })
    })

    it('should be possible to render a MenuButton using a template `as` prop and a custom element', async () => {
      renderTemplate({
        template: jsx`
          <Menu>
            <MenuButton as="template" v-slot="{ open }">
              <MyCustomButton :data-open="open">Options</MyCustomButton>
            </MenuButton>
            <MenuItems>
              <MenuItem as="a">Item A</MenuItem>
              <MenuItem as="a">Item B</MenuItem>
              <MenuItem as="a">Item C</MenuItem>
            </MenuItems>
          </Menu>
        `,
        components: {
          MyCustomButton: defineComponent({
            setup(_, { slots }) {
              return () => {
                return h('button', slots.default?.())
              }
            },
          }),
        },
      })

      assertMenuButton({
        state: MenuState.InvisibleUnmounted,
        attributes: { id: 'headlessui-menu-button-1', 'data-open': 'false' },
      })
      assertMenu({ state: MenuState.InvisibleUnmounted })

      await click(getMenuButton())

      assertMenuButton({
        state: MenuState.Visible,
        attributes: { id: 'headlessui-menu-button-1', 'data-open': 'true' },
      })
      assertMenu({ state: MenuState.Visible })
    })

    it(
      'should yell when we render a MenuButton using a template `as` prop that contains multiple children',
      suppressConsoleLogs(() => {
        expect.hasAssertions()

        renderTemplate({
          template: jsx`
            <Menu>
              <MenuButton as="template">
                <span>Trigger</span>
                <svg />
              </MenuButton>
              <MenuItems>
                <MenuItem as="a">Item A</MenuItem>
                <MenuItem as="a">Item B</MenuItem>
                <MenuItem as="a">Item C</MenuItem>
              </MenuItems>
            </Menu>
          `,
          errorCaptured(err) {
            expect(err as Error).toEqual(
              new Error(
                [
                  'Passing props on "template"!',
                  '',
                  'The current component <MenuButton /> is rendering a "template".',
                  'However we need to passthrough the following props:',
                  '  - aria-controls',
                  '  - aria-expanded',
                  '  - aria-haspopup',
                  '  - disabled',
                  '  - id',
                  '  - onClick',
                  '  - onKeydown',
                  '  - onKeyup',
                  '  - ref',
                  '  - type',
                  '',
                  'You can apply a few solutions:',
                  '  - Add an `as="..."` prop, to ensure that we render an actual element instead of a "template".',
                  '  - Render a single element as the child so that we can forward the props onto that element.',
                ].join('\n')
              )
            )

            return false
          },
        })
      })
    )

    describe('`type` attribute', () => {
      it('should set the `type` to "button" by default', async () => {
        renderTemplate(
          jsx`
            <Menu>
              <MenuButton>Trigger</MenuButton>
            </Menu>
          `
        )

        expect(getMenuButton()).toHaveAttribute('type', 'button')
      })

      it('should not set the `type` to "button" if it already contains a `type`', async () => {
        renderTemplate(
          jsx`
            <Menu>
              <MenuButton type="submit">
                Trigger
              </MenuButton>
            </Menu>
          `
        )

        expect(getMenuButton()).toHaveAttribute('type', 'submit')
      })

      it(
        'should set the `type` to "button" when using the `as` prop which resolves to a "button"',
        suppressConsoleLogs(async () => {
          renderTemplate({
            template: jsx`
              <Menu>
                <MenuButton :as="CustomButton">
                  Trigger
                </MenuButton>
              </Menu>
            `,
            setup: () => ({
              CustomButton: defineComponent({
                setup: (props) => () => h('button', { ...props }),
              }),
            }),
          })

          await new Promise(requestAnimationFrame)

          expect(getMenuButton()).toHaveAttribute('type', 'button')
        })
      )

      it('should not set the type if the "as" prop is not a "button"', async () => {
        renderTemplate(
          jsx`
            <Menu>
              <MenuButton as="div">
                Trigger
              </MenuButton>
            </Menu>
          `
        )

        expect(getMenuButton()).not.toHaveAttribute('type')
      })

      it(
        'should not set the `type` to "button" when using the `as` prop which resolves to a "div"',
        suppressConsoleLogs(async () => {
          renderTemplate({
            template: jsx`
              <Menu>
                <MenuButton :as="CustomButton">
                  Trigger
                </MenuButton>
              </Menu>
            `,
            setup: () => ({
              CustomButton: defineComponent({
                setup: (props) => () => h('div', props),
              }),
            }),
          })

          await new Promise(requestAnimationFrame)

          expect(getMenuButton()).not.toHaveAttribute('type')
        })
      )
    })
  })

  describe('MenuItems', () => {
    it('should be possible to render MenuItems using a default render prop', async () => {
      renderTemplate(jsx`
        <Menu>
          <MenuButton>Trigger</MenuButton>
          <MenuItems v-slot="{ open }">
            <span>{{ open ? "visible" : "hidden" }}</span>
            <MenuItem as="a">Item A</MenuItem>
            <MenuItem as="a">Item B</MenuItem>
            <MenuItem as="a">Item C</MenuItem>
          </MenuItems>
        </Menu>
      `)

      assertMenuButton({
        state: MenuState.InvisibleUnmounted,
        attributes: { id: 'headlessui-menu-button-1' },
      })
      assertMenu({ state: MenuState.InvisibleUnmounted })

      await click(getMenuButton())

      assertMenuButton({
        state: MenuState.Visible,
        attributes: { id: 'headlessui-menu-button-1' },
      })
      assertMenu({ state: MenuState.Visible })
      expect(getMenu()?.firstChild?.textContent).toBe('visible')
    })

    it('should be possible to render MenuItems using a template `as` prop', async () => {
      renderTemplate(jsx`
        <Menu>
          <MenuButton>Trigger</MenuButton>
          <MenuItems as="template" v-slot="{ open }">
            <div :data-open="open">
              <MenuItem as="a">Item A</MenuItem>
              <MenuItem as="a">Item B</MenuItem>
              <MenuItem as="a">Item C</MenuItem>
            </div>
          </MenuItems>
        </Menu>
      `)

      assertMenuButton({
        state: MenuState.InvisibleUnmounted,
        attributes: { id: 'headlessui-menu-button-1' },
      })
      assertMenu({ state: MenuState.InvisibleUnmounted })

      await click(getMenuButton())

      assertMenuButton({
        state: MenuState.Visible,
        attributes: { id: 'headlessui-menu-button-1' },
      })
      assertMenu({ state: MenuState.Visible, attributes: { 'data-open': 'true' } })
    })

    it('should yell when we render MenuItems using a template `as` prop that contains multiple children', async () => {
      expect.assertions(1)

      renderTemplate({
        template: jsx`
          <Menu>
            <MenuButton>Trigger</MenuButton>
            <MenuItems as="template">
              <MenuItem as="a">Item A</MenuItem>
              <MenuItem as="a">Item B</MenuItem>
              <MenuItem as="a">Item C</MenuItem>
            </MenuItems>
          </Menu>
        `,
        errorCaptured(err) {
          expect(err as Error).toEqual(
            new Error(
              [
                'Passing props on "template"!',
                '',
                'The current component <MenuItems /> is rendering a "template".',
                'However we need to passthrough the following props:',
                '  - aria-activedescendant',
                '  - aria-labelledby',
                '  - id',
                '  - onKeydown',
                '  - onKeyup',
                '  - ref',
                '  - role',
                '  - tabIndex',
                '',
                'You can apply a few solutions:',
                '  - Add an `as="..."` prop, to ensure that we render an actual element instead of a "template".',
                '  - Render a single element as the child so that we can forward the props onto that element.',
              ].join('\n')
            )
          )

          return false
        },
      })

      await click(getMenuButton())
    })

    it('should be possible to always render the MenuItems if we provide it a `static` prop', () => {
      renderTemplate(jsx`
        <Menu>
          <MenuButton>Trigger</MenuButton>
          <MenuItems static>
            <MenuItem as="a">Item A</MenuItem>
            <MenuItem as="a">Item B</MenuItem>
            <MenuItem as="a">Item C</MenuItem>
          </MenuItems>
        </Menu>
      `)

      // Let's verify that the Menu is already there
      expect(getMenu()).not.toBe(null)
    })

    it('should be possible to use a different render strategy for the MenuItems', async () => {
      renderTemplate(jsx`
        <Menu>
          <MenuButton>Trigger</MenuButton>
          <MenuItems :unmount="false">
            <MenuItem as="a">Item A</MenuItem>
            <MenuItem as="a">Item B</MenuItem>
            <MenuItem as="a">Item C</MenuItem>
          </MenuItems>
        </Menu>
      `)

      await new Promise<void>(nextTick)

      assertMenu({ state: MenuState.InvisibleHidden })

      // Let's open the Menu, to see if it is not hidden anymore
      await click(getMenuButton())

      assertMenu({ state: MenuState.Visible })
    })
  })

  describe('MenuItem', () => {
    it('should be possible to render MenuItem using a default render prop', async () => {
      renderTemplate(jsx`
        <Menu>
          <MenuButton>Trigger</MenuButton>
          <MenuItems>
            <MenuItem v-slot="{ active, disabled }">
              <span>Item A - {{ JSON.stringify({ active, disabled }) }}</span>
            </MenuItem>
            <MenuItem as="a">Item B</MenuItem>
            <MenuItem as="a">Item C</MenuItem>
          </MenuItems>
        </Menu>
      `)

      assertMenuButton({
        state: MenuState.InvisibleUnmounted,
        attributes: { id: 'headlessui-menu-button-1' },
      })
      assertMenu({ state: MenuState.InvisibleUnmounted })

      await click(getMenuButton())

      assertMenuButton({
        state: MenuState.Visible,
        attributes: { id: 'headlessui-menu-button-1' },
      })
      assertMenu({ state: MenuState.Visible })
      expect(getMenuItems()[0]?.textContent).toBe(
        `Item A - ${JSON.stringify({ active: false, disabled: false })}`
      )
    })

    it('should be possible to render a MenuItem using a template `as` prop', async () => {
      renderTemplate(jsx`
        <Menu>
          <MenuButton>Trigger</MenuButton>
          <MenuItems>
            <MenuItem as="template" v-slot="{ active, disabled }">
              <a :data-active="active" :data-disabled="disabled">Item A</a>
            </MenuItem>
            <MenuItem as="template" v-slot="{ active, disabled }">
              <a :data-active="active" :data-disabled="disabled">Item B</a>
            </MenuItem>
            <MenuItem disabled as="template" v-slot="{ active, disabled }">
              <a :data-active="active" :data-disabled="disabled">Item C</a>
            </MenuItem>
          </MenuItems>
        </Menu>
      `)

      assertMenuButton({
        state: MenuState.InvisibleUnmounted,
        attributes: { id: 'headlessui-menu-button-1' },
      })
      assertMenu({ state: MenuState.InvisibleUnmounted })

      getMenuButton()?.focus()

      await press(Keys.Enter)

      assertMenuButton({
        state: MenuState.Visible,
        attributes: { id: 'headlessui-menu-button-1' },
      })
      assertMenu({ state: MenuState.Visible })
      assertMenuItem(getMenuItems()[0], {
        tag: 'a',
        attributes: { 'data-active': 'true', 'data-disabled': 'false' },
      })
      assertMenuItem(getMenuItems()[1], {
        tag: 'a',
        attributes: { 'data-active': 'false', 'data-disabled': 'false' },
      })
      assertMenuItem(getMenuItems()[2], {
        tag: 'a',
        attributes: { 'data-active': 'false', 'data-disabled': 'true' },
      })
    })

    it('should yell when we render a MenuItem using a template `as` prop that contains multiple children', async () => {
      expect.hasAssertions()

      renderTemplate({
        template: jsx`
          <Menu>
            <MenuButton>Trigger</MenuButton>
            <MenuItems>
              <MenuItem as="template">
                <span>Item A</span>
                <svg />
              </MenuItem>
              <MenuItem as="a">Item B</MenuItem>
              <MenuItem as="a">Item C</MenuItem>
            </MenuItems>
          </Menu>
        `,
        errorCaptured(err) {
          expect(err as Error).toEqual(
            new Error(
              [
                'Passing props on "template"!',
                '',
                'The current component <MenuItem /> is rendering a "template".',
                'However we need to passthrough the following props:',
                '  - aria-disabled',
                '  - disabled',
                '  - id',
                '  - onClick',
                '  - onFocus',
                '  - onMouseenter',
                '  - onMouseleave',
                '  - onMousemove',
                '  - onPointerenter',
                '  - onPointerleave',
                '  - onPointermove',
                '  - ref',
                '  - role',
                '  - tabIndex',
                '',
                'You can apply a few solutions:',
                '  - Add an `as="..."` prop, to ensure that we render an actual element instead of a "template".',
                '  - Render a single element as the child so that we can forward the props onto that element.',
              ].join('\n')
            )
          )

          return false
        },
      })

      await click(getMenuButton())
    })

    it('should be possible to manually close the Menu using the exposed close function', async () => {
      renderTemplate({
        template: jsx`
          <Menu>
            <MenuButton>Trigger</MenuButton>
            <MenuItems>
              <MenuItem v-slot="{ close }">
                <button @click.prevent="close">Close</button>
              </MenuItem>
            </MenuItems>
          </Menu>
        `,
      })

      assertMenu({ state: MenuState.InvisibleUnmounted })

      await click(getMenuButton())

      assertMenu({ state: MenuState.Visible })

      await click(getByText('Close'))

      assertMenu({ state: MenuState.InvisibleUnmounted })
    })
  })

  it('should guarantee the order of DOM nodes when performing actions', async () => {
    let props = reactive({ hide: false })

    renderTemplate({
      template: jsx`
        <Menu>
          <MenuButton>Trigger</MenuButton>
          <MenuItems>
            <MenuItem as="button">Item 1</MenuItem>
            <MenuItem v-if="!hide" as="button">Item 2</MenuItem>
            <MenuItem as="button">Item 3</MenuItem>
          </MenuItems>
        </Menu>
      `,
      setup() {
        return {
          get hide() {
            return props.hide
          },
        }
      },
    })

    // Open the Menu
    await click(getByText('Trigger'))

    props.hide = true
    await nextFrame()

    props.hide = false
    await nextFrame()

    assertMenu({ state: MenuState.Visible })

    let items = getMenuItems()

    // Focus the first item
    await press(Keys.ArrowDown)

    // Verify that the first menu item is active
    assertMenuLinkedWithMenuItem(items[0])

    await press(Keys.ArrowDown)

    // Verify that the second menu item is active
    assertMenuLinkedWithMenuItem(items[1])

    await press(Keys.ArrowDown)

    // Verify that the third menu item is active
    assertMenuLinkedWithMenuItem(items[2])
  })

  it(
    'should be possible to use a custom component using the `as` prop without crashing',
    suppressConsoleLogs(async () => {
      let CustomComponent = defineComponent({
        template: `<button><slot /></button>`,
      })

      renderTemplate({
        template: `
          <Menu>
            <MenuButton />
            <MenuOptions>
              <MenuOption :as="CustomComponent">Alice</RadioGroupOption>
              <MenuOption :as="CustomComponent">Bob</RadioGroupOption>
              <MenuOption :as="CustomComponent">Charlie</RadioGroupOption>
            </MenuOptions>
          </Menu>
        `,
        setup: () => ({ CustomComponent }),
      })

      // Open menu
      await click(getMenuButton())
    })
  )
})

describe('Rendering composition', () => {
  it(
    'should be possible to swap the menu item with a button for example',
    suppressConsoleLogs(async () => {
      let MyButton = defineComponent({
        setup(props) {
          return () => h('button', { 'data-my-custom-button': true, ...props })
        },
      })

      renderTemplate({
        template: jsx`
          <Menu>
            <MenuButton>Trigger</MenuButton>
            <MenuItems>
              <MenuItem :as="MyButton">Item A</MenuItem>
              <MenuItem :as="MyButton">Item B</MenuItem>
              <MenuItem :as="MyButton">Item C</MenuItem>
            </MenuItems>
          </Menu>
        `,
        setup: () => ({ MyButton }),
      })

      assertMenuButton({
        state: MenuState.InvisibleUnmounted,
        attributes: { id: 'headlessui-menu-button-1' },
      })
      assertMenu({ state: MenuState.InvisibleUnmounted })

      // Open menu
      await click(getMenuButton())

      // Verify items are buttons now
      let items = getMenuItems()
      items.forEach((item) =>
        assertMenuItem(item, { tag: 'button', attributes: { 'data-my-custom-button': 'true' } })
      )
    })
  )

  it(
    'should mark all the elements between Menu.Items and Menu.Item with role none',
    suppressConsoleLogs(async () => {
      renderTemplate({
        template: jsx`
          <Menu>
            <MenuButton>Trigger</MenuButton>
            <div class="outer">
              <MenuItems>
                <div class="py-1 inner">
                  <MenuItem as="button">Item A</MenuItem>
                  <MenuItem as="button">Item B</MenuItem>
                </div>
                <div class="py-1 inner">
                  <MenuItem as="button">Item C</MenuItem>
                  <MenuItem>
                    <div>
                      <div class="outer">Item D</div>
                    </div>
                  </MenuItem>
                </div>
                <div class="py-1 inner">
                  <form class="inner">
                    <MenuItem as="button">Item E</MenuItem>
                  </form>
                </div>
              </MenuItems>
            </div>
          </Menu>
        `,
      })

      // Open menu
      await click(getMenuButton())

      expect.hasAssertions()

      document.querySelectorAll('.outer').forEach((element) => {
        expect(element).not.toHaveAttribute('role', 'none')
      })

      document.querySelectorAll('.inner').forEach((element) => {
        expect(element).toHaveAttribute('role', 'none')
      })
    })
  )
})

describe('Composition', () => {
  let OpenClosedWrite = defineComponent({
    props: { open: { type: Boolean } },
    setup(props, { slots }) {
      useOpenClosedProvider(ref(props.open ? State.Open : State.Closed))
      return () => slots.default?.()
    },
  })

  let OpenClosedRead = defineComponent({
    emits: ['read'],
    setup(_, { slots, emit }) {
      let state = useOpenClosed()
      watch([state], ([value]) => emit('read', value))
      return () => slots.default?.()
    },
  })

  it(
    'should always open the MenuItems because of a wrapping OpenClosed component',
    suppressConsoleLogs(async () => {
      renderTemplate({
        components: { OpenClosedWrite },
        template: jsx`
          <Menu>
            <MenuButton>Trigger</MenuButton>
            <OpenClosedWrite :open="true">
              <MenuItems v-slot="data">
                {{JSON.stringify(data)}}
              </MenuItems>
            </OpenClosedWrite>
          </Menu>
        `,
      })

      await new Promise<void>(nextTick)

      // Verify the Menu is visible
      assertMenu({ state: MenuState.Visible })

      // Let's try and open the Menu
      await click(getMenuButton())

      // Verify the Menu is still visible
      assertMenu({ state: MenuState.Visible })
    })
  )

  it(
    'should always close the MenuItems because of a wrapping OpenClosed component',
    suppressConsoleLogs(async () => {
      renderTemplate({
        components: { OpenClosedWrite },
        template: jsx`
          <Menu>
            <MenuButton>Trigger</MenuButton>
            <OpenClosedWrite :open="false">
              <MenuItems v-slot="data">
                {{JSON.stringify(data)}}
              </MenuItems>
            </OpenClosedWrite>
          </Menu>
        `,
      })

      await new Promise<void>(nextTick)

      // Verify the Menu is hidden
      assertMenu({ state: MenuState.InvisibleUnmounted })

      // Let's try and open the Menu
      await click(getMenuButton())

      // Verify the Menu is still hidden
      assertMenu({ state: MenuState.InvisibleUnmounted })
    })
  )

  it(
    'should be possible to read the OpenClosed state',
    suppressConsoleLogs(async () => {
      let readFn = jest.fn()
      renderTemplate({
        components: { OpenClosedRead },
        template: jsx`
          <Menu>
            <MenuButton>Trigger</MenuButton>
            <OpenClosedRead @read="readFn">
              <MenuItems></MenuItems>
            </OpenClosedRead>
          </Menu>
        `,
        setup() {
          return { readFn }
        },
      })

      await new Promise<void>(nextTick)

      // Verify the Menu is hidden
      assertMenu({ state: MenuState.InvisibleUnmounted })

      // Let's toggle the Menu 3 times
      await click(getMenuButton())
      await click(getMenuButton())
      await click(getMenuButton())

      // Verify the Menu is visible
      assertMenu({ state: MenuState.Visible })

      expect(readFn).toHaveBeenCalledTimes(3)
      expect(readFn).toHaveBeenNthCalledWith(1, State.Open)
      expect(readFn).toHaveBeenNthCalledWith(2, State.Closed)
      expect(readFn).toHaveBeenNthCalledWith(3, State.Open)
    })
  )

  it('should be possible to render a TransitionChild that inherits state from the Menu', async () => {
    let readFn = jest.fn()
    renderTemplate({
      components: { TransitionChild },
      template: jsx`
        <Menu>
          <MenuButton>Trigger</MenuButton>
          <TransitionChild
            as="template"
            @beforeEnter="readFn('enter')"
            @beforeLeave="readFn('leave')"
          >
            <MenuItems>
              <MenuItem as="button">I am a button</MenuItem>
            </MenuItems>
          </TransitionChild>
        </Menu>
      `,
      setup() {
        return { readFn }
      },
    })

    // Verify the Menu is hidden
    assertMenu({ state: MenuState.InvisibleUnmounted })

    // Let's toggle the Menu
    await click(getMenuButton())

    // Verify that our transition fired
    expect(readFn).toHaveBeenCalledTimes(1)
    expect(readFn).toHaveBeenNthCalledWith(1, 'enter')

    // Verify the Menu is visible
    assertMenu({ state: MenuState.Visible })

    // Let's toggle the Menu
    await click(getMenuButton())

    // Verify that our transition fired
    expect(readFn).toHaveBeenCalledTimes(2)
    expect(readFn).toHaveBeenNthCalledWith(2, 'leave')

    // Wait for the transitions to finish
    await nextFrame()

    // Verify the Menu is hidden
    assertMenu({ state: MenuState.InvisibleUnmounted })
  })
})

describe('Keyboard interactions', () => {
  describe('`Enter` key', () => {
    it('should be possible to open the menu with Enter', async () => {
      renderTemplate(jsx`
        <Menu>
          <MenuButton>Trigger</MenuButton>
          <MenuItems>
            <MenuItem as="a">Item A</MenuItem>
            <MenuItem as="a">Item B</MenuItem>
            <MenuItem as="a">Item C</MenuItem>
          </MenuItems>
        </Menu>
      `)

      assertMenuButton({
        state: MenuState.InvisibleUnmounted,
        attributes: { id: 'headlessui-menu-button-1' },
      })
      assertMenu({ state: MenuState.InvisibleUnmounted })

      // Focus the button
      getMenuButton()?.focus()

      // Open menu
      await press(Keys.Enter)

      // Verify it is open
      assertMenuButton({ state: MenuState.Visible })
      assertMenu({
        state: MenuState.Visible,
        attributes: { id: 'headlessui-menu-items-2' },
      })
      assertMenuButtonLinkedWithMenu()

      // Verify we have menu items
      let items = getMenuItems()
      expect(items).toHaveLength(3)
      items.forEach((item) => assertMenuItem(item))

      // Verify that the first menu item is active
      assertMenuLinkedWithMenuItem(items[0])
    })

    it('should not be possible to open the menu with Enter when the button is disabled', async () => {
      renderTemplate(jsx`
        <Menu>
          <MenuButton disabled>Trigger</MenuButton>
          <MenuItems>
            <MenuItem as="a">Item A</MenuItem>
            <MenuItem as="a">Item B</MenuItem>
            <MenuItem as="a">Item C</MenuItem>
          </MenuItems>
        </Menu>
      `)

      assertMenuButton({
        state: MenuState.InvisibleUnmounted,
        attributes: { id: 'headlessui-menu-button-1' },
      })
      assertMenu({ state: MenuState.InvisibleUnmounted })

      // Focus the button
      getMenuButton()?.focus()

      // Try to open the menu
      await press(Keys.Enter)

      // Verify it is still closed
      assertMenuButton({
        state: MenuState.InvisibleUnmounted,
        attributes: { id: 'headlessui-menu-button-1' },
      })
      assertMenu({ state: MenuState.InvisibleUnmounted })
    })

    it('should have no active menu item when there are no menu items at all', async () => {
      renderTemplate(jsx`
        <Menu>
          <MenuButton>Trigger</MenuButton>
          <MenuItems />
        </Menu>
      `)

      assertMenu({ state: MenuState.InvisibleUnmounted })

      // Focus the button
      getMenuButton()?.focus()

      // Open menu
      await press(Keys.Enter)
      assertMenu({ state: MenuState.Visible })

      assertNoActiveMenuItem()
    })

    it('should focus the first non disabled menu item when opening with Enter', async () => {
      renderTemplate(jsx`
        <Menu>
          <MenuButton>Trigger</MenuButton>
          <MenuItems>
            <MenuItem as="a" disabled>Item A</MenuItem>
            <MenuItem as="a">Item B</MenuItem>
            <MenuItem as="a">Item C</MenuItem>
          </MenuItems>
        </Menu>
      `)

      assertMenuButton({
        state: MenuState.InvisibleUnmounted,
        attributes: { id: 'headlessui-menu-button-1' },
      })
      assertMenu({ state: MenuState.InvisibleUnmounted })

      // Focus the button
      getMenuButton()?.focus()

      // Open menu
      await press(Keys.Enter)

      let items = getMenuItems()

      // Verify that the first non-disabled menu item is active
      assertMenuLinkedWithMenuItem(items[1])
    })

    it('should focus the first non disabled menu item when opening with Enter (jump over multiple disabled ones)', async () => {
      renderTemplate(jsx`
        <Menu>
          <MenuButton>Trigger</MenuButton>
          <MenuItems>
            <MenuItem as="a" disabled>Item A</MenuItem>
            <MenuItem as="a" disabled>Item B</MenuItem>
            <MenuItem as="a">Item C</MenuItem>
          </MenuItems>
        </Menu>
      `)

      assertMenuButton({
        state: MenuState.InvisibleUnmounted,
        attributes: { id: 'headlessui-menu-button-1' },
      })
      assertMenu({ state: MenuState.InvisibleUnmounted })

      // Focus the button
      getMenuButton()?.focus()

      // Open menu
      await press(Keys.Enter)

      let items = getMenuItems()

      // Verify that the first non-disabled menu item is active
      assertMenuLinkedWithMenuItem(items[2])
    })

    it('should have no active menu item upon Enter key press, when there are no non-disabled menu items', async () => {
      renderTemplate(jsx`
        <Menu>
          <MenuButton>Trigger</MenuButton>
          <MenuItems>
            <MenuItem as="a" disabled>Item A</MenuItem>
            <MenuItem as="a" disabled>Item B</MenuItem>
            <MenuItem as="a" disabled>Item C</MenuItem>
          </MenuItems>
        </Menu>
      `)

      assertMenuButton({
        state: MenuState.InvisibleUnmounted,
        attributes: { id: 'headlessui-menu-button-1' },
      })
      assertMenu({ state: MenuState.InvisibleUnmounted })

      // Focus the button
      getMenuButton()?.focus()

      // Open menu
      await press(Keys.Enter)

      assertNoActiveMenuItem()
    })

    it('should be possible to close the menu with Enter when there is no active menuitem', async () => {
      renderTemplate(jsx`
        <Menu>
          <MenuButton>Trigger</MenuButton>
          <MenuItems>
            <MenuItem as="a">Item A</MenuItem>
            <MenuItem as="a">Item B</MenuItem>
            <MenuItem as="a">Item C</MenuItem>
          </MenuItems>
        </Menu>
      `)

      assertMenuButton({
        state: MenuState.InvisibleUnmounted,
        attributes: { id: 'headlessui-menu-button-1' },
      })
      assertMenu({ state: MenuState.InvisibleUnmounted })

      // Open menu
      await click(getMenuButton())

      // Verify it is open
      assertMenuButton({ state: MenuState.Visible })

      // Close menu
      await press(Keys.Enter)

      // Verify it is closed
      assertMenuButton({ state: MenuState.InvisibleUnmounted })
      assertMenu({ state: MenuState.InvisibleUnmounted })

      // Verify the button is focused again
      assertActiveElement(getMenuButton())
    })

    it('should be possible to close the menu with Enter and invoke the active menu item', async () => {
      let clickHandler = jest.fn()
      renderTemplate({
        template: jsx`
          <Menu>
            <MenuButton>Trigger</MenuButton>
            <MenuItems>
              <MenuItem as="a" @click="clickHandler">Item A</MenuItem>
              <MenuItem as="a">Item B</MenuItem>
              <MenuItem as="a">Item C</MenuItem>
            </MenuItems>
          </Menu>
        `,
        setup: () => ({ clickHandler }),
      })

      assertMenuButton({
        state: MenuState.InvisibleUnmounted,
        attributes: { id: 'headlessui-menu-button-1' },
      })
      assertMenu({ state: MenuState.InvisibleUnmounted })

      // Open menu
      await click(getMenuButton())

      // Verify it is open
      assertMenuButton({ state: MenuState.Visible })

      // Activate the first menu item
      let items = getMenuItems()
      await mouseMove(items[0])

      // Close menu, and invoke the item
      await press(Keys.Enter)

      // Verify it is closed
      assertMenuButton({ state: MenuState.InvisibleUnmounted })
      assertMenu({ state: MenuState.InvisibleUnmounted })

      // Verify the button is focused again
      assertActiveElement(getMenuButton())

      // Verify the "click" went through on the `a` tag
      expect(clickHandler).toHaveBeenCalled()
    })
  })

  it('should be possible to use a button as a menu item and invoke it upon Enter', async () => {
    let clickHandler = jest.fn()

    renderTemplate({
      template: jsx`
        <Menu>
          <MenuButton>Trigger</MenuButton>
          <MenuItems>
            <MenuItem as="a">Item A</MenuItem>
            <MenuItem as="button" @click="clickHandler">
              Item B
            </MenuItem>
            <MenuItem>
              <button @click="clickHandler">Item C</button>
            </MenuItem>
          </MenuItems>
        </Menu>
      `,
      setup: () => ({ clickHandler }),
    })

    assertMenuButton({
      state: MenuState.InvisibleUnmounted,
      attributes: { id: 'headlessui-menu-button-1' },
    })
    assertMenu({ state: MenuState.InvisibleUnmounted })

    // Open menu
    await click(getMenuButton())

    // Verify it is open
    assertMenuButton({ state: MenuState.Visible })

    // Activate the second menu item
    let items = getMenuItems()
    await mouseMove(items[1])

    // Close menu, and invoke the item
    await press(Keys.Enter)

    // Verify it is closed
    assertMenuButton({ state: MenuState.InvisibleUnmounted })
    assertMenu({ state: MenuState.InvisibleUnmounted })

    // Verify the button got "clicked"
    expect(clickHandler).toHaveBeenCalledTimes(1)

    // Verify the button is focused again
    assertActiveElement(getMenuButton())

    // Click the menu button again
    await click(getMenuButton())

    // Activate the last menu item
    await mouseMove(getMenuItems()[2])

    // Close menu, and invoke the item
    await press(Keys.Enter)

    // Verify the button got "clicked"
    expect(clickHandler).toHaveBeenCalledTimes(2)

    // Verify the button is focused again
    assertActiveElement(getMenuButton())
  })

  describe('`Space` key', () => {
    it('should be possible to open the menu with Space', async () => {
      renderTemplate(jsx`
        <Menu>
          <MenuButton>Trigger</MenuButton>
          <MenuItems>
            <MenuItem as="a">Item A</MenuItem>
            <MenuItem as="a">Item B</MenuItem>
            <MenuItem as="a">Item C</MenuItem>
          </MenuItems>
        </Menu>
      `)

      assertMenuButton({
        state: MenuState.InvisibleUnmounted,
        attributes: { id: 'headlessui-menu-button-1' },
      })
      assertMenu({ state: MenuState.InvisibleUnmounted })

      // Focus the button
      getMenuButton()?.focus()

      // Open menu
      await press(Keys.Space)

      // Verify it is open
      assertMenuButton({ state: MenuState.Visible })
      assertMenu({
        state: MenuState.Visible,
        attributes: { id: 'headlessui-menu-items-2' },
      })
      assertMenuButtonLinkedWithMenu()

      // Verify we have menu items
      let items = getMenuItems()
      expect(items).toHaveLength(3)
      items.forEach((item) => assertMenuItem(item))
      assertMenuLinkedWithMenuItem(items[0])
    })

    it('should not be possible to open the menu with Space when the button is disabled', async () => {
      renderTemplate(jsx`
        <Menu>
          <MenuButton disabled>Trigger</MenuButton>
          <MenuItems>
            <MenuItem as="a">Item A</MenuItem>
            <MenuItem as="a">Item B</MenuItem>
            <MenuItem as="a">Item C</MenuItem>
          </MenuItems>
        </Menu>
      `)

      assertMenuButton({
        state: MenuState.InvisibleUnmounted,
        attributes: { id: 'headlessui-menu-button-1' },
      })
      assertMenu({ state: MenuState.InvisibleUnmounted })

      // Focus the button
      getMenuButton()?.focus()

      // Try to open the menu
      await press(Keys.Space)

      // Verify it is still closed
      assertMenuButton({
        state: MenuState.InvisibleUnmounted,
        attributes: { id: 'headlessui-menu-button-1' },
      })
      assertMenu({ state: MenuState.InvisibleUnmounted })
    })

    it('should have no active menu item when there are no menu items at all', async () => {
      renderTemplate(jsx`
        <Menu>
          <MenuButton>Trigger</MenuButton>
          <MenuItems />
        </Menu>
      `)

      assertMenu({ state: MenuState.InvisibleUnmounted })

      // Focus the button
      getMenuButton()?.focus()

      // Open menu
      await press(Keys.Space)
      assertMenu({ state: MenuState.Visible })

      assertNoActiveMenuItem()
    })

    it('should focus the first non disabled menu item when opening with Space', async () => {
      renderTemplate(jsx`
        <Menu>
          <MenuButton>Trigger</MenuButton>
          <MenuItems>
            <MenuItem as="a" disabled>Item A</MenuItem>
            <MenuItem as="a">Item B</MenuItem>
            <MenuItem as="a">Item C</MenuItem>
          </MenuItems>
        </Menu>
      `)

      assertMenuButton({
        state: MenuState.InvisibleUnmounted,
        attributes: { id: 'headlessui-menu-button-1' },
      })
      assertMenu({ state: MenuState.InvisibleUnmounted })

      // Focus the button
      getMenuButton()?.focus()

      // Open menu
      await press(Keys.Space)

      let items = getMenuItems()

      // Verify that the first non-disabled menu item is active
      assertMenuLinkedWithMenuItem(items[1])
    })

    it('should focus the first non disabled menu item when opening with Space (jump over multiple disabled ones)', async () => {
      renderTemplate(jsx`
        <Menu>
          <MenuButton>Trigger</MenuButton>
          <MenuItems>
            <MenuItem as="a" disabled>Item A</MenuItem>
            <MenuItem as="a" disabled>Item B</MenuItem>
            <MenuItem as="a">Item C</MenuItem>
          </MenuItems>
        </Menu>
      `)

      assertMenuButton({
        state: MenuState.InvisibleUnmounted,
        attributes: { id: 'headlessui-menu-button-1' },
      })
      assertMenu({ state: MenuState.InvisibleUnmounted })

      // Focus the button
      getMenuButton()?.focus()

      // Open menu
      await press(Keys.Space)

      let items = getMenuItems()

      // Verify that the first non-disabled menu item is active
      assertMenuLinkedWithMenuItem(items[2])
    })

    it('should have no active menu item upon Space key press, when there are no non-disabled menu items', async () => {
      renderTemplate(jsx`
        <Menu>
          <MenuButton>Trigger</MenuButton>
          <MenuItems>
            <MenuItem as="a" disabled>Item A</MenuItem>
            <MenuItem as="a" disabled>Item B</MenuItem>
            <MenuItem as="a" disabled>Item C</MenuItem>
          </MenuItems>
        </Menu>
      `)

      assertMenuButton({
        state: MenuState.InvisibleUnmounted,
        attributes: { id: 'headlessui-menu-button-1' },
      })
      assertMenu({ state: MenuState.InvisibleUnmounted })

      // Focus the button
      getMenuButton()?.focus()

      // Open menu
      await press(Keys.Space)

      assertNoActiveMenuItem()
    })

    it(
      'should be possible to close the menu with Space when there is no active menuitem',
      suppressConsoleLogs(async () => {
        renderTemplate(jsx`
          <Menu>
            <MenuButton>Trigger</MenuButton>
            <MenuItems>
              <MenuItem as="a">Item A</MenuItem>
              <MenuItem as="a">Item B</MenuItem>
              <MenuItem as="a">Item C</MenuItem>
            </MenuItems>
          </Menu>
        `)

        assertMenuButton({
          state: MenuState.InvisibleUnmounted,
          attributes: { id: 'headlessui-menu-button-1' },
        })
        assertMenu({ state: MenuState.InvisibleUnmounted })

        // Open Menu
        await click(getMenuButton())

        // Verify it is open
        assertMenuButton({ state: MenuState.Visible })

        // Close Menu
        await press(Keys.Space)

        // Verify it is closed
        assertMenuButton({ state: MenuState.InvisibleUnmounted })
        assertMenu({ state: MenuState.InvisibleUnmounted })

        // Verify the button is focused again
        assertActiveElement(getMenuButton())
      })
    )

    it(
      'should be possible to close the menu with Space and invoke the active menu item',
      suppressConsoleLogs(async () => {
        let clickHandler = jest.fn()
        renderTemplate({
          template: jsx`
            <Menu>
              <MenuButton>Trigger</MenuButton>
              <MenuItems>
                <MenuItem as="a" @click="clickHandler">Item A</MenuItem>
                <MenuItem as="a">Item B</MenuItem>
                <MenuItem as="a">Item C</MenuItem>
              </MenuItems>
            </Menu>
          `,
          setup: () => ({ clickHandler }),
        })

        assertMenuButton({
          state: MenuState.InvisibleUnmounted,
          attributes: { id: 'headlessui-menu-button-1' },
        })
        assertMenu({ state: MenuState.InvisibleUnmounted })

        // Open menu
        await click(getMenuButton())

        // Verify it is open
        assertMenuButton({ state: MenuState.Visible })

        // Activate the first menu item
        let items = getMenuItems()
        await mouseMove(items[0])

        // Close menu, and invoke the item
        await press(Keys.Space)

        // Verify it is closed
        assertMenuButton({ state: MenuState.InvisibleUnmounted })
        assertMenu({ state: MenuState.InvisibleUnmounted })

        // Verify the "click" went through on the `a` tag
        expect(clickHandler).toHaveBeenCalled()

        // Verify the button is focused again
        assertActiveElement(getMenuButton())
      })
    )
  })

  describe('`Escape` key', () => {
    it('should be possible to close an open menu with Escape', async () => {
      renderTemplate(jsx`
        <Menu>
          <MenuButton>Trigger</MenuButton>
          <MenuItems>
            <MenuItem as="a">Item A</MenuItem>
            <MenuItem as="a">Item B</MenuItem>
            <MenuItem as="a">Item C</MenuItem>
          </MenuItems>
        </Menu>
      `)

      // Focus the button
      getMenuButton()?.focus()

      // Open menu
      await press(Keys.Space)

      // Verify it is open
      assertMenuButton({ state: MenuState.Visible })
      assertMenu({
        state: MenuState.Visible,
        attributes: { id: 'headlessui-menu-items-2' },
      })
      assertMenuButtonLinkedWithMenu()

      // Close menu
      await press(Keys.Escape)

      // Verify it is closed
      assertMenuButton({ state: MenuState.InvisibleUnmounted })
      assertMenu({ state: MenuState.InvisibleUnmounted })

      // Verify the button is focused again
      assertActiveElement(getMenuButton())
    })
  })

  describe('`Tab` key', () => {
    it('should not focus trap when we use Tab', async () => {
      renderTemplate(jsx`
        <Menu>
          <MenuButton>Trigger</MenuButton>
          <MenuItems>
            <MenuItem as="a">Item A</MenuItem>
            <MenuItem as="a">Item B</MenuItem>
            <MenuItem as="a">Item C</MenuItem>
          </MenuItems>
        </Menu>
      `)

      assertMenuButton({
        state: MenuState.InvisibleUnmounted,
        attributes: { id: 'headlessui-menu-button-1' },
      })
      assertMenu({ state: MenuState.InvisibleUnmounted })

      // Focus the button
      getMenuButton()?.focus()

      // Open menu
      await press(Keys.Enter)

      // Verify it is open
      assertMenuButton({ state: MenuState.Visible })
      assertMenu({
        state: MenuState.Visible,
        attributes: { id: 'headlessui-menu-items-2' },
      })
      assertMenuButtonLinkedWithMenu()

      // Verify we have menu items
      let items = getMenuItems()
      expect(items).toHaveLength(3)
      items.forEach((item) => assertMenuItem(item))
      assertMenuLinkedWithMenuItem(items[0])

      // Try to tab
      await press(Keys.Tab)

      // Verify it is closed
      assertMenuButton({ state: MenuState.InvisibleUnmounted })
      assertMenu({ state: MenuState.InvisibleUnmounted })
    })

    it('should not focus trap when we use Shift+Tab', async () => {
      renderTemplate(jsx`
        <Menu>
          <MenuButton>Trigger</MenuButton>
          <MenuItems>
            <MenuItem as="a">Item A</MenuItem>
            <MenuItem as="a">Item B</MenuItem>
            <MenuItem as="a">Item C</MenuItem>
          </MenuItems>
        </Menu>
      `)

      assertMenuButton({
        state: MenuState.InvisibleUnmounted,
        attributes: { id: 'headlessui-menu-button-1' },
      })
      assertMenu({ state: MenuState.InvisibleUnmounted })

      // Focus the button
      getMenuButton()?.focus()

      // Open menu
      await press(Keys.Enter)

      // Verify it is open
      assertMenuButton({ state: MenuState.Visible })
      assertMenu({
        state: MenuState.Visible,
        attributes: { id: 'headlessui-menu-items-2' },
      })
      assertMenuButtonLinkedWithMenu()

      // Verify we have menu items
      let items = getMenuItems()
      expect(items).toHaveLength(3)
      items.forEach((item) => assertMenuItem(item))
      assertMenuLinkedWithMenuItem(items[0])

      // Try to Shift+Tab
      await press(shift(Keys.Tab))

      // Verify it is closed
      assertMenuButton({ state: MenuState.InvisibleUnmounted })
      assertMenu({ state: MenuState.InvisibleUnmounted })
    })
  })

  describe('`ArrowDown` key', () => {
    it('should be possible to open the menu with ArrowDown', async () => {
      renderTemplate(jsx`
        <Menu>
          <MenuButton>Trigger</MenuButton>
          <MenuItems>
            <MenuItem as="a">Item A</MenuItem>
            <MenuItem as="a">Item B</MenuItem>
            <MenuItem as="a">Item C</MenuItem>
          </MenuItems>
        </Menu>
      `)

      assertMenuButton({
        state: MenuState.InvisibleUnmounted,
        attributes: { id: 'headlessui-menu-button-1' },
      })
      assertMenu({ state: MenuState.InvisibleUnmounted })

      // Focus the button
      getMenuButton()?.focus()

      // Open menu
      await press(Keys.ArrowDown)

      // Verify it is open
      assertMenuButton({ state: MenuState.Visible })
      assertMenu({
        state: MenuState.Visible,
        attributes: { id: 'headlessui-menu-items-2' },
      })
      assertMenuButtonLinkedWithMenu()

      // Verify we have menu items
      let items = getMenuItems()
      expect(items).toHaveLength(3)
      items.forEach((item) => assertMenuItem(item))

      // Verify that the first menu item is active
      assertMenuLinkedWithMenuItem(items[0])
    })

    it('should not be possible to open the menu with ArrowDown when the button is disabled', async () => {
      renderTemplate(jsx`
        <Menu>
          <MenuButton disabled>Trigger</MenuButton>
          <MenuItems>
            <MenuItem as="a">Item A</MenuItem>
            <MenuItem as="a">Item B</MenuItem>
            <MenuItem as="a">Item C</MenuItem>
          </MenuItems>
        </Menu>
      `)

      assertMenuButton({
        state: MenuState.InvisibleUnmounted,
        attributes: { id: 'headlessui-menu-button-1' },
      })
      assertMenu({ state: MenuState.InvisibleUnmounted })

      // Focus the button
      getMenuButton()?.focus()

      // Try to open the menu
      await press(Keys.ArrowDown)

      // Verify it is still closed
      assertMenuButton({
        state: MenuState.InvisibleUnmounted,
        attributes: { id: 'headlessui-menu-button-1' },
      })
      assertMenu({ state: MenuState.InvisibleUnmounted })
    })

    it('should have no active menu item when there are no menu items at all', async () => {
      renderTemplate(jsx`
        <Menu>
          <MenuButton>Trigger</MenuButton>
          <MenuItems />
        </Menu>
      `)

      assertMenu({ state: MenuState.InvisibleUnmounted })

      // Focus the button
      getMenuButton()?.focus()

      // Open menu
      await press(Keys.ArrowDown)
      assertMenu({ state: MenuState.Visible })

      assertNoActiveMenuItem()
    })

    it('should be possible to use ArrowDown to navigate the menu items', async () => {
      renderTemplate(jsx`
        <Menu>
          <MenuButton>Trigger</MenuButton>
          <MenuItems>
            <MenuItem as="a">Item A</MenuItem>
            <MenuItem as="a">Item B</MenuItem>
            <MenuItem as="a">Item C</MenuItem>
          </MenuItems>
        </Menu>
      `)

      assertMenuButton({
        state: MenuState.InvisibleUnmounted,
        attributes: { id: 'headlessui-menu-button-1' },
      })
      assertMenu({ state: MenuState.InvisibleUnmounted })

      // Focus the button
      getMenuButton()?.focus()

      // Open menu
      await press(Keys.Enter)

      // Verify we have menu items
      let items = getMenuItems()
      expect(items).toHaveLength(3)
      items.forEach((item) => assertMenuItem(item))
      assertMenuLinkedWithMenuItem(items[0])

      // We should be able to go down once
      await press(Keys.ArrowDown)
      assertMenuLinkedWithMenuItem(items[1])

      // We should be able to go down again
      await press(Keys.ArrowDown)
      assertMenuLinkedWithMenuItem(items[2])

      // We should NOT be able to go down again (because last item). Current implementation won't go around.
      await press(Keys.ArrowDown)
      assertMenuLinkedWithMenuItem(items[2])
    })

    it('should be possible to use ArrowDown to navigate the menu items and skip the first disabled one', async () => {
      renderTemplate(jsx`
        <Menu>
          <MenuButton>Trigger</MenuButton>
          <MenuItems>
            <MenuItem as="a" disabled>Item A</MenuItem>
            <MenuItem as="a">Item B</MenuItem>
            <MenuItem as="a">Item C</MenuItem>
          </MenuItems>
        </Menu>
      `)

      assertMenuButton({
        state: MenuState.InvisibleUnmounted,
        attributes: { id: 'headlessui-menu-button-1' },
      })
      assertMenu({ state: MenuState.InvisibleUnmounted })

      // Focus the button
      getMenuButton()?.focus()

      // Open menu
      await press(Keys.Enter)

      // Verify we have menu items
      let items = getMenuItems()
      expect(items).toHaveLength(3)
      items.forEach((item) => assertMenuItem(item))
      assertMenuLinkedWithMenuItem(items[1])

      // We should be able to go down once
      await press(Keys.ArrowDown)
      assertMenuLinkedWithMenuItem(items[2])
    })

    it('should be possible to use ArrowDown to navigate the menu items and jump to the first non-disabled one', async () => {
      renderTemplate(jsx`
        <Menu>
          <MenuButton>Trigger</MenuButton>
          <MenuItems>
            <MenuItem as="a" disabled>Item A</MenuItem>
            <MenuItem as="a" disabled>Item B</MenuItem>
            <MenuItem as="a">Item C</MenuItem>
          </MenuItems>
        </Menu>
      `)

      assertMenuButton({
        state: MenuState.InvisibleUnmounted,
        attributes: { id: 'headlessui-menu-button-1' },
      })
      assertMenu({ state: MenuState.InvisibleUnmounted })

      // Focus the button
      getMenuButton()?.focus()

      // Open menu
      await press(Keys.Enter)

      // Verify we have menu items
      let items = getMenuItems()
      expect(items).toHaveLength(3)
      items.forEach((item) => assertMenuItem(item))
      assertMenuLinkedWithMenuItem(items[2])
    })
  })

  describe('`ArrowUp` key', () => {
    it('should be possible to open the menu with ArrowUp and the last item should be active', async () => {
      renderTemplate(jsx`
        <Menu>
          <MenuButton>Trigger</MenuButton>
          <MenuItems>
            <MenuItem as="a">Item A</MenuItem>
            <MenuItem as="a">Item B</MenuItem>
            <MenuItem as="a">Item C</MenuItem>
          </MenuItems>
        </Menu>
      `)

      assertMenuButton({
        state: MenuState.InvisibleUnmounted,
        attributes: { id: 'headlessui-menu-button-1' },
      })
      assertMenu({ state: MenuState.InvisibleUnmounted })

      // Focus the button
      getMenuButton()?.focus()

      // Open menu
      await press(Keys.ArrowUp)

      // Verify it is open
      assertMenuButton({ state: MenuState.Visible })
      assertMenu({
        state: MenuState.Visible,
        attributes: { id: 'headlessui-menu-items-2' },
      })
      assertMenuButtonLinkedWithMenu()

      // Verify we have menu items
      let items = getMenuItems()
      expect(items).toHaveLength(3)
      items.forEach((item) => assertMenuItem(item))

      // ! ALERT: The LAST item should now be active
      assertMenuLinkedWithMenuItem(items[2])
    })

    it('should have no active menu item when there are no menu items at all', async () => {
      renderTemplate(jsx`
        <Menu>
          <MenuButton>Trigger</MenuButton>
          <MenuItems />
        </Menu>
      `)

      assertMenu({ state: MenuState.InvisibleUnmounted })

      // Focus the button
      getMenuButton()?.focus()

      // Open menu
      await press(Keys.ArrowUp)
      assertMenu({ state: MenuState.Visible })

      assertNoActiveMenuItem()
    })

    it('should be possible to use ArrowUp to navigate the menu items and jump to the first non-disabled one', async () => {
      renderTemplate(jsx`
        <Menu>
          <MenuButton>Trigger</MenuButton>
          <MenuItems>
            <MenuItem as="a">Item A</MenuItem>
            <MenuItem as="a" disabled>Item B</MenuItem>
            <MenuItem as="a" disabled>Item C</MenuItem>
          </MenuItems>
        </Menu>
      `)

      assertMenuButton({
        state: MenuState.InvisibleUnmounted,
        attributes: { id: 'headlessui-menu-button-1' },
      })
      assertMenu({ state: MenuState.InvisibleUnmounted })

      // Focus the button
      getMenuButton()?.focus()

      // Open menu
      await press(Keys.ArrowUp)

      // Verify we have menu items
      let items = getMenuItems()
      expect(items).toHaveLength(3)
      items.forEach((item) => assertMenuItem(item))
      assertMenuLinkedWithMenuItem(items[0])
    })

    it('should not be possible to navigate up or down if there is only a single non-disabled item', async () => {
      renderTemplate(jsx`
        <Menu>
          <MenuButton>Trigger</MenuButton>
          <MenuItems>
            <MenuItem as="a" disabled>Item A</MenuItem>
            <MenuItem as="a" disabled>Item B</MenuItem>
            <MenuItem as="a">Item C</MenuItem>
          </MenuItems>
        </Menu>
      `)

      assertMenuButton({
        state: MenuState.InvisibleUnmounted,
        attributes: { id: 'headlessui-menu-button-1' },
      })
      assertMenu({ state: MenuState.InvisibleUnmounted })

      // Focus the button
      getMenuButton()?.focus()

      // Open menu
      await press(Keys.Enter)

      // Verify we have menu items
      let items = getMenuItems()
      expect(items).toHaveLength(3)
      items.forEach((item) => assertMenuItem(item))
      assertMenuLinkedWithMenuItem(items[2])

      // We should not be able to go up (because those are disabled)
      await press(Keys.ArrowUp)
      assertMenuLinkedWithMenuItem(items[2])

      // We should not be able to go down (because this is the last item)
      await press(Keys.ArrowDown)
      assertMenuLinkedWithMenuItem(items[2])
    })

    it('should be possible to use ArrowUp to navigate the menu items', async () => {
      renderTemplate(jsx`
        <Menu>
          <MenuButton>Trigger</MenuButton>
          <MenuItems>
            <MenuItem as="a">Item A</MenuItem>
            <MenuItem as="a">Item B</MenuItem>
            <MenuItem as="a">Item C</MenuItem>
          </MenuItems>
        </Menu>
      `)

      assertMenuButton({
        state: MenuState.InvisibleUnmounted,
        attributes: { id: 'headlessui-menu-button-1' },
      })
      assertMenu({ state: MenuState.InvisibleUnmounted })

      // Focus the button
      getMenuButton()?.focus()

      // Open menu
      await press(Keys.ArrowUp)

      // Verify it is open
      assertMenuButton({ state: MenuState.Visible })
      assertMenu({
        state: MenuState.Visible,
        attributes: { id: 'headlessui-menu-items-2' },
      })
      assertMenuButtonLinkedWithMenu()

      // Verify we have menu items
      let items = getMenuItems()
      expect(items).toHaveLength(3)
      items.forEach((item) => assertMenuItem(item))
      assertMenuLinkedWithMenuItem(items[2])

      // We should be able to go down once
      await press(Keys.ArrowUp)
      assertMenuLinkedWithMenuItem(items[1])

      // We should be able to go down again
      await press(Keys.ArrowUp)
      assertMenuLinkedWithMenuItem(items[0])

      // We should NOT be able to go up again (because first item). Current implementation won't go around.
      await press(Keys.ArrowUp)
      assertMenuLinkedWithMenuItem(items[0])
    })
  })

  describe('`End` key', () => {
    it('should be possible to use the End key to go to the last menu item', async () => {
      renderTemplate(jsx`
        <Menu>
          <MenuButton>Trigger</MenuButton>
          <MenuItems>
            <MenuItem as="a">Item A</MenuItem>
            <MenuItem as="a">Item B</MenuItem>
            <MenuItem as="a">Item C</MenuItem>
          </MenuItems>
        </Menu>
      `)

      // Focus the button
      getMenuButton()?.focus()

      // Open menu
      await press(Keys.Enter)

      let items = getMenuItems()

      // We should be on the first item
      assertMenuLinkedWithMenuItem(items[0])

      // We should be able to go to the last item
      await press(Keys.End)
      assertMenuLinkedWithMenuItem(items[2])
    })

    it('should be possible to use the End key to go to the last non disabled menu item', async () => {
      renderTemplate(jsx`
        <Menu>
          <MenuButton>Trigger</MenuButton>
          <MenuItems>
            <MenuItem as="a">Item A</MenuItem>
            <MenuItem as="a">Item B</MenuItem>
            <MenuItem as="a" disabled>Item C</MenuItem>
            <MenuItem as="a" disabled>Item D</MenuItem>
          </MenuItems>
        </Menu>
      `)

      // Focus the button
      getMenuButton()?.focus()

      // Open menu
      await press(Keys.Enter)

      let items = getMenuItems()

      // We should be on the first item
      assertMenuLinkedWithMenuItem(items[0])

      // We should be able to go to the last non-disabled item
      await press(Keys.End)
      assertMenuLinkedWithMenuItem(items[1])
    })

    it('should be possible to use the End key to go to the first menu item if that is the only non-disabled menu item', async () => {
      renderTemplate(jsx`
        <Menu>
          <MenuButton>Trigger</MenuButton>
          <MenuItems>
            <MenuItem as="a">Item A</MenuItem>
            <MenuItem as="a" disabled>Item B</MenuItem>
            <MenuItem as="a" disabled>Item C</MenuItem>
            <MenuItem as="a" disabled>Item D</MenuItem>
          </MenuItems>
        </Menu>
      `)

      // Open menu
      await click(getMenuButton())

      // We opened via click, we don't have an active item
      assertNoActiveMenuItem()

      // We should not be able to go to the end
      await press(Keys.End)

      let items = getMenuItems()
      assertMenuLinkedWithMenuItem(items[0])
    })

    it('should have no active menu item upon End key press, when there are no non-disabled menu items', async () => {
      renderTemplate(jsx`
        <Menu>
          <MenuButton>Trigger</MenuButton>
          <MenuItems>
            <MenuItem as="a" disabled>Item A</MenuItem>
            <MenuItem as="a" disabled>Item B</MenuItem>
            <MenuItem as="a" disabled>Item C</MenuItem>
            <MenuItem as="a" disabled>Item D</MenuItem>
          </MenuItems>
        </Menu>
      `)

      // Open menu
      await click(getMenuButton())

      // We opened via click, we don't have an active item
      assertNoActiveMenuItem()

      // We should not be able to go to the end
      await press(Keys.End)

      assertNoActiveMenuItem()
    })
  })

  describe('`PageDown` key', () => {
    it('should be possible to use the PageDown key to go to the last menu item', async () => {
      renderTemplate(jsx`
        <Menu>
          <MenuButton>Trigger</MenuButton>
          <MenuItems>
            <MenuItem as="a">Item A</MenuItem>
            <MenuItem as="a">Item B</MenuItem>
            <MenuItem as="a">Item C</MenuItem>
          </MenuItems>
        </Menu>
      `)

      // Focus the button
      getMenuButton()?.focus()

      // Open menu
      await press(Keys.Enter)

      let items = getMenuItems()

      // We should be on the first item
      assertMenuLinkedWithMenuItem(items[0])

      // We should be able to go to the last item
      await press(Keys.PageDown)
      assertMenuLinkedWithMenuItem(items[2])
    })

    it('should be possible to use the PageDown key to go to the last non disabled menu item', async () => {
      renderTemplate(jsx`
        <Menu>
          <MenuButton>Trigger</MenuButton>
          <MenuItems>
            <MenuItem as="a">Item A</MenuItem>
            <MenuItem as="a">Item B</MenuItem>
            <MenuItem as="a" disabled>Item C</MenuItem>
            <MenuItem as="a" disabled>Item D</MenuItem>
          </MenuItems>
        </Menu>
      `)

      // Focus the button
      getMenuButton()?.focus()

      // Open menu
      await press(Keys.Enter)

      let items = getMenuItems()

      // We should be on the first item
      assertMenuLinkedWithMenuItem(items[0])

      // We should be able to go to the last non-disabled item
      await press(Keys.PageDown)
      assertMenuLinkedWithMenuItem(items[1])
    })

    it('should be possible to use the PageDown key to go to the first menu item if that is the only non-disabled menu item', async () => {
      renderTemplate(jsx`
        <Menu>
          <MenuButton>Trigger</MenuButton>
          <MenuItems>
            <MenuItem as="a">Item A</MenuItem>
            <MenuItem as="a" disabled>Item B</MenuItem>
            <MenuItem as="a" disabled>Item C</MenuItem>
            <MenuItem as="a" disabled>Item D</MenuItem>
          </MenuItems>
        </Menu>
      `)

      // Open menu
      await click(getMenuButton())

      // We opened via click, we don't have an active item
      assertNoActiveMenuItem()

      // We should not be able to go to the end
      await press(Keys.PageDown)

      let items = getMenuItems()
      assertMenuLinkedWithMenuItem(items[0])
    })

    it('should have no active menu item upon PageDown key press, when there are no non-disabled menu items', async () => {
      renderTemplate(jsx`
        <Menu>
          <MenuButton>Trigger</MenuButton>
          <MenuItems>
            <MenuItem as="a" disabled>Item A</MenuItem>
            <MenuItem as="a" disabled>Item B</MenuItem>
            <MenuItem as="a" disabled>Item C</MenuItem>
            <MenuItem as="a" disabled>Item D</MenuItem>
          </MenuItems>
        </Menu>
      `)

      // Open menu
      await click(getMenuButton())

      // We opened via click, we don't have an active item
      assertNoActiveMenuItem()

      // We should not be able to go to the end
      await press(Keys.PageDown)

      assertNoActiveMenuItem()
    })
  })

  describe('`Home` key', () => {
    it('should be possible to use the Home key to go to the first menu item', async () => {
      renderTemplate(jsx`
        <Menu>
          <MenuButton>Trigger</MenuButton>
          <MenuItems>
            <MenuItem as="a">Item A</MenuItem>
            <MenuItem as="a">Item B</MenuItem>
            <MenuItem as="a">Item C</MenuItem>
          </MenuItems>
        </Menu>
      `)

      // Focus the button
      getMenuButton()?.focus()

      // Open menu
      await press(Keys.ArrowUp)

      let items = getMenuItems()

      // We should be on the last item
      assertMenuLinkedWithMenuItem(items[2])

      // We should be able to go to the first item
      await press(Keys.Home)
      assertMenuLinkedWithMenuItem(items[0])
    })

    it('should be possible to use the Home key to go to the first non disabled menu item', async () => {
      renderTemplate(jsx`
        <Menu>
          <MenuButton>Trigger</MenuButton>
          <MenuItems>
            <MenuItem as="a" disabled>Item A</MenuItem>
            <MenuItem as="a" disabled>Item B</MenuItem>
            <MenuItem as="a">Item C</MenuItem>
            <MenuItem as="a">Item D</MenuItem>
          </MenuItems>
        </Menu>
      `)

      // Open menu
      await click(getMenuButton())

      // We opened via click, we don't have an active item
      assertNoActiveMenuItem()

      // We should not be able to go to the end
      await press(Keys.Home)

      let items = getMenuItems()

      // We should be on the first non-disabled item
      assertMenuLinkedWithMenuItem(items[2])
    })

    it('should be possible to use the Home key to go to the last menu item if that is the only non-disabled menu item', async () => {
      renderTemplate(jsx`
        <Menu>
          <MenuButton>Trigger</MenuButton>
          <MenuItems>
            <MenuItem as="a" disabled>Item A</MenuItem>
            <MenuItem as="a" disabled>Item B</MenuItem>
            <MenuItem as="a" disabled>Item C</MenuItem>
            <MenuItem as="a">Item D</MenuItem>
          </MenuItems>
        </Menu>
      `)

      // Open menu
      await click(getMenuButton())

      // We opened via click, we don't have an active item
      assertNoActiveMenuItem()

      // We should not be able to go to the end
      await press(Keys.Home)

      let items = getMenuItems()
      assertMenuLinkedWithMenuItem(items[3])
    })

    it('should have no active menu item upon Home key press, when there are no non-disabled menu items', async () => {
      renderTemplate(jsx`
        <Menu>
          <MenuButton>Trigger</MenuButton>
          <MenuItems>
            <MenuItem as="a" disabled>Item A</MenuItem>
            <MenuItem as="a" disabled>Item B</MenuItem>
            <MenuItem as="a" disabled>Item C</MenuItem>
            <MenuItem as="a" disabled>Item D</MenuItem>
          </MenuItems>
        </Menu>
      `)

      // Open menu
      await click(getMenuButton())

      // We opened via click, we don't have an active item
      assertNoActiveMenuItem()

      // We should not be able to go to the end
      await press(Keys.Home)

      assertNoActiveMenuItem()
    })
  })

  describe('`PageUp` key', () => {
    it('should be possible to use the PageUp key to go to the first menu item', async () => {
      renderTemplate(jsx`
        <Menu>
          <MenuButton>Trigger</MenuButton>
          <MenuItems>
            <MenuItem as="a">Item A</MenuItem>
            <MenuItem as="a">Item B</MenuItem>
            <MenuItem as="a">Item C</MenuItem>
          </MenuItems>
        </Menu>
      `)

      // Focus the button
      getMenuButton()?.focus()

      // Open menu
      await press(Keys.ArrowUp)

      let items = getMenuItems()

      // We should be on the last item
      assertMenuLinkedWithMenuItem(items[2])

      // We should be able to go to the first item
      await press(Keys.PageUp)
      assertMenuLinkedWithMenuItem(items[0])
    })

    it('should be possible to use the PageUp key to go to the first non disabled menu item', async () => {
      renderTemplate(jsx`
        <Menu>
          <MenuButton>Trigger</MenuButton>
          <MenuItems>
            <MenuItem as="a" disabled>Item A</MenuItem>
            <MenuItem as="a" disabled>Item B</MenuItem>
            <MenuItem as="a">Item C</MenuItem>
            <MenuItem as="a">Item D</MenuItem>
          </MenuItems>
        </Menu>
      `)

      // Open menu
      await click(getMenuButton())

      // We opened via click, we don't have an active item
      assertNoActiveMenuItem()

      // We should not be able to go to the end
      await press(Keys.PageUp)

      let items = getMenuItems()

      // We should be on the first non-disabled item
      assertMenuLinkedWithMenuItem(items[2])
    })

    it('should be possible to use the PageUp key to go to the last menu item if that is the only non-disabled menu item', async () => {
      renderTemplate(jsx`
        <Menu>
          <MenuButton>Trigger</MenuButton>
          <MenuItems>
            <MenuItem as="a" disabled>Item A</MenuItem>
            <MenuItem as="a" disabled>Item B</MenuItem>
            <MenuItem as="a" disabled>Item C</MenuItem>
            <MenuItem as="a">Item D</MenuItem>
          </MenuItems>
        </Menu>
      `)

      // Open menu
      await click(getMenuButton())

      // We opened via click, we don't have an active item
      assertNoActiveMenuItem()

      // We should not be able to go to the end
      await press(Keys.PageUp)

      let items = getMenuItems()
      assertMenuLinkedWithMenuItem(items[3])
    })

    it('should have no active menu item upon PageUp key press, when there are no non-disabled menu items', async () => {
      renderTemplate(jsx`
        <Menu>
          <MenuButton>Trigger</MenuButton>
          <MenuItems>
            <MenuItem as="a" disabled>Item A</MenuItem>
            <MenuItem as="a" disabled>Item B</MenuItem>
            <MenuItem as="a" disabled>Item C</MenuItem>
            <MenuItem as="a" disabled>Item D</MenuItem>
          </MenuItems>
        </Menu>
      `)

      // Open menu
      await click(getMenuButton())

      // We opened via click, we don't have an active item
      assertNoActiveMenuItem()

      // We should not be able to go to the end
      await press(Keys.PageUp)

      assertNoActiveMenuItem()
    })
  })

  describe('`Any` key aka search', () => {
    it('should be possible to type a full word that has a perfect match', async () => {
      renderTemplate(jsx`
        <Menu>
          <MenuButton>Trigger</MenuButton>
          <MenuItems>
            <MenuItem as="a">alice</MenuItem>
            <MenuItem as="a">bob</MenuItem>
            <MenuItem as="a">charlie</MenuItem>
          </MenuItems>
        </Menu>
      `)

      // Open menu
      await click(getMenuButton())

      let items = getMenuItems()

      // We should be able to go to the second item
      await type(word('bob'))
      assertMenuLinkedWithMenuItem(items[1])

      // We should be able to go to the first item
      await type(word('alice'))
      assertMenuLinkedWithMenuItem(items[0])

      // We should be able to go to the last item
      await type(word('charlie'))
      assertMenuLinkedWithMenuItem(items[2])
    })

    it('should be possible to type a partial of a word', async () => {
      renderTemplate(jsx`
        <Menu>
          <MenuButton>Trigger</MenuButton>
          <MenuItems>
            <MenuItem as="a">alice</MenuItem>
            <MenuItem as="a">bob</MenuItem>
            <MenuItem as="a">charlie</MenuItem>
          </MenuItems>
        </Menu>
      `)

      // Focus the button
      getMenuButton()?.focus()

      // Open menu
      await press(Keys.ArrowUp)

      let items = getMenuItems()

      // We should be on the last item
      assertMenuLinkedWithMenuItem(items[2])

      // We should be able to go to the second item
      await type(word('bo'))
      assertMenuLinkedWithMenuItem(items[1])

      // We should be able to go to the first item
      await type(word('ali'))
      assertMenuLinkedWithMenuItem(items[0])

      // We should be able to go to the last item
      await type(word('char'))
      assertMenuLinkedWithMenuItem(items[2])
    })

    it(
      'should be possible to type words with spaces',
      suppressConsoleLogs(async () => {
        renderTemplate(jsx`
          <Menu>
            <MenuButton>Trigger</MenuButton>
            <MenuItems>
              <MenuItem as="a">value a</MenuItem>
              <MenuItem as="a">value b</MenuItem>
              <MenuItem as="a">value c</MenuItem>
            </MenuItems>
          </Menu>
        `)

        // Focus the button
        getMenuButton()?.focus()

        // Open menu
        await press(Keys.ArrowUp)

        let items = getMenuItems()

        // We should be on the last item
        assertMenuLinkedWithMenuItem(items[2])

        // We should be able to go to the second item
        await type(word('value b'))
        assertMenuLinkedWithMenuItem(items[1])

        // We should be able to go to the first item
        await type(word('value a'))
        assertMenuLinkedWithMenuItem(items[0])

        // We should be able to go to the last item
        await type(word('value c'))
        assertMenuLinkedWithMenuItem(items[2])
      })
    )

    it('should not be possible to search for a disabled item', async () => {
      renderTemplate(jsx`
        <Menu>
          <MenuButton>Trigger</MenuButton>
          <MenuItems>
            <MenuItem as="a">alice</MenuItem>
            <MenuItem as="a" disabled>bob</MenuItem>
            <MenuItem as="a">charlie</MenuItem>
          </MenuItems>
        </Menu>
      `)

      // Focus the button
      getMenuButton()?.focus()

      // Open menu
      await press(Keys.ArrowUp)

      let items = getMenuItems()

      // We should be on the last item
      assertMenuLinkedWithMenuItem(items[2])

      // We should not be able to go to the disabled item
      await type(word('bo'))

      // We should still be on the last item
      assertMenuLinkedWithMenuItem(items[2])
    })

    it('should be possible to search for a word (case insensitive)', async () => {
      renderTemplate(jsx`
        <Menu>
          <MenuButton>Trigger</MenuButton>
          <MenuItems>
            <MenuItem as="a">alice</MenuItem>
            <MenuItem as="a">bob</MenuItem>
            <MenuItem as="a">charlie</MenuItem>
          </MenuItems>
        </Menu>
      `)

      // Focus the button
      getMenuButton()?.focus()

      // Open menu
      await press(Keys.ArrowUp)

      let items = getMenuItems()

      // We should be on the last item
      assertMenuLinkedWithMenuItem(items[2])

      // Search for bob in a different casing
      await type(word('BO'))

      // We should be on `bob`
      assertMenuLinkedWithMenuItem(items[1])
    })

    it('should be possible to search for the next occurence', async () => {
      renderTemplate(jsx`
        <Menu>
          <MenuButton>Trigger</MenuButton>
          <MenuItems>
            <MenuItem as="a">alice</MenuItem>
            <MenuItem as="a">bob</MenuItem>
            <MenuItem as="a">charlie</MenuItem>
            <MenuItem as="a">bob</MenuItem>
          </MenuItems>
        </Menu>
      `)

      // Open menu
      await click(getMenuButton())

      let items = getMenuItems()

      // Search for bob
      await type(word('b'))

      // We should be on the first `bob`
      assertMenuLinkedWithMenuItem(items[1])

      // Search for bob again
      await type(word('b'))

      // We should be on the second `bob`
      assertMenuLinkedWithMenuItem(items[3])
    })

    it(
      'should stay on the same item while keystrokes still match',
      suppressConsoleLogs(async () => {
        renderTemplate(jsx`
          <Menu>
            <MenuButton>Trigger</MenuButton>
            <MenuItems>
              <MenuItem as="a">alice</MenuItem>
              <MenuItem as="a">bob</MenuItem>
              <MenuItem as="a">charlie</MenuItem>
              <MenuItem as="a">bob</MenuItem>
            </MenuItems>
          </Menu>
        `)

        // Open menu
        await click(getMenuButton())

        let items = getMenuItems()

        // ---

        // Reset: Go to first item
        await press(Keys.Home)

        // Search for "b" in "bob"
        await type(word('b'))

        // We should be on the first `bob`
        assertMenuLinkedWithMenuItem(items[1])

        // Search for "b" in "bob" again
        await type(word('b'))

        // We should be on the next `bob`
        assertMenuLinkedWithMenuItem(items[3])

        // ---

        // Reset: Go to first item
        await press(Keys.Home)

        // Search for "bo" in "bob"
        await type(word('bo'))

        // We should be on the first `bob`
        assertMenuLinkedWithMenuItem(items[1])

        // Search for "bo" in "bob" again
        await type(word('bo'))

        // We should be on the next `bob`
        assertMenuLinkedWithMenuItem(items[3])

        // ---

        // Reset: Go to first item
        await press(Keys.Home)

        // Search for "bob" in "bob"
        await type(word('bob'))

        // We should be on the first `bob`
        assertMenuLinkedWithMenuItem(items[1])

        // Search for "bob" in "bob" again
        await type(word('bob'))

        // We should be on the next `bob`
        assertMenuLinkedWithMenuItem(items[3])
      })
    )
  })
})

describe('Mouse interactions', () => {
  it('should be possible to open a menu on click', async () => {
    renderTemplate(jsx`
      <Menu>
        <MenuButton>Trigger</MenuButton>
        <MenuItems>
          <MenuItem as="a">Item A</MenuItem>
          <MenuItem as="a">Item B</MenuItem>
          <MenuItem as="a">Item C</MenuItem>
        </MenuItems>
      </Menu>
    `)

    assertMenuButton({
      state: MenuState.InvisibleUnmounted,
      attributes: { id: 'headlessui-menu-button-1' },
    })
    assertMenu({ state: MenuState.InvisibleUnmounted })

    // Open menu
    await click(getMenuButton())

    // Verify it is open
    assertMenuButton({ state: MenuState.Visible })
    assertMenu({
      state: MenuState.Visible,
      attributes: { id: 'headlessui-menu-items-2' },
    })
    assertMenuButtonLinkedWithMenu()

    // Verify we have menu items
    let items = getMenuItems()
    expect(items).toHaveLength(3)
    items.forEach((item) => assertMenuItem(item))
  })

  it(
    'should not be possible to open a menu on right click',
    suppressConsoleLogs(async () => {
      renderTemplate(jsx`
        <Menu>
          <MenuButton>Trigger</MenuButton>
          <MenuItems>
            <MenuItem as="a">Item A</MenuItem>
            <MenuItem as="a">Item B</MenuItem>
            <MenuItem as="a">Item C</MenuItem>
          </MenuItems>
        </Menu>
      `)

      assertMenuButton({
        state: MenuState.InvisibleUnmounted,
        attributes: { id: 'headlessui-menu-button-1' },
      })
      assertMenu({ state: MenuState.InvisibleUnmounted })

      // Try to open the menu
      await click(getMenuButton(), MouseButton.Right)

      // Verify it is still closed
      assertMenuButton({ state: MenuState.InvisibleUnmounted })
    })
  )

  it('should not be possible to open a menu on click when the button is disabled', async () => {
    renderTemplate(jsx`
      <Menu>
        <MenuButton disabled>Trigger</MenuButton>
        <MenuItems>
          <MenuItem as="a">Item A</MenuItem>
          <MenuItem as="a">Item B</MenuItem>
          <MenuItem as="a">Item C</MenuItem>
        </MenuItems>
      </Menu>
    `)

    assertMenuButton({
      state: MenuState.InvisibleUnmounted,
      attributes: { id: 'headlessui-menu-button-1' },
    })
    assertMenu({ state: MenuState.InvisibleUnmounted })

    // Try to open the menu
    await click(getMenuButton())

    // Verify it is still closed
    assertMenuButton({
      state: MenuState.InvisibleUnmounted,
      attributes: { id: 'headlessui-menu-button-1' },
    })
    assertMenu({ state: MenuState.InvisibleUnmounted })
  })

  it('should be possible to close a menu on click', async () => {
    renderTemplate(jsx`
      <Menu>
        <MenuButton>Trigger</MenuButton>
        <MenuItems>
          <MenuItem as="a">Item A</MenuItem>
          <MenuItem as="a">Item B</MenuItem>
          <MenuItem as="a">Item C</MenuItem>
        </MenuItems>
      </Menu>
    `)

    // Open menu
    await click(getMenuButton())

    // Verify it is open
    assertMenuButton({ state: MenuState.Visible })

    // Click to close
    await click(getMenuButton())

    // Verify it is closed
    assertMenuButton({ state: MenuState.InvisibleUnmounted })
    assertMenu({ state: MenuState.InvisibleUnmounted })
  })

  it('should be a no-op when we click outside of a closed menu', async () => {
    renderTemplate(jsx`
      <Menu>
        <MenuButton>Trigger</MenuButton>
        <MenuItems>
          <MenuItem as="a">alice</MenuItem>
          <MenuItem as="a">bob</MenuItem>
          <MenuItem as="a">charlie</MenuItem>
        </MenuItems>
      </Menu>
    `)

    // Verify that the window is closed
    assertMenu({ state: MenuState.InvisibleUnmounted })

    // Click something that is not related to the menu
    await click(document.body)

    // Should still be closed
    assertMenu({ state: MenuState.InvisibleUnmounted })
  })

  it('should be possible to click outside of the menu which should close the menu', async () => {
    renderTemplate(jsx`
      <Menu>
        <MenuButton>Trigger</MenuButton>
        <MenuItems>
          <MenuItem as="a">alice</MenuItem>
          <MenuItem as="a">bob</MenuItem>
          <MenuItem as="a">charlie</MenuItem>
        </MenuItems>
      </Menu>
    `)

    // Open menu
    await click(getMenuButton())
    assertMenu({ state: MenuState.Visible })

    // Click something that is not related to the menu
    await click(document.body)

    // Should be closed now
    assertMenu({ state: MenuState.InvisibleUnmounted })

    // Verify the button is focused again
    assertActiveElement(getMenuButton())
  })

  it('should be possible to click outside of the menu which should close the menu (even if we press the menu button)', async () => {
    renderTemplate(jsx`
      <Menu>
        <MenuButton>Trigger</MenuButton>
        <MenuItems>
          <MenuItem as="a">alice</MenuItem>
          <MenuItem as="a">bob</MenuItem>
          <MenuItem as="a">charlie</MenuItem>
        </MenuItems>
      </Menu>
    `)

    // Open menu
    await click(getMenuButton())
    assertMenu({ state: MenuState.Visible })

    // Click the menu button again
    await click(getMenuButton())

    // Should be closed now
    assertMenu({ state: MenuState.InvisibleUnmounted })

    // Verify the button is focused again
    assertActiveElement(getMenuButton())
  })

  it(
    'should be possible to click outside of the menu on another menu button which should close the current menu and open the new menu',
    suppressConsoleLogs(async () => {
      renderTemplate(jsx`
        <div>
          <Menu>
            <MenuButton>Trigger</MenuButton>
            <MenuItems>
              <MenuItem as="a">alice</MenuItem>
              <MenuItem as="a">bob</MenuItem>
              <MenuItem as="a">charlie</MenuItem>
            </MenuItems>
          </Menu>

          <Menu>
            <MenuButton>Trigger</MenuButton>
            <MenuItems>
              <MenuItem as="a">alice</MenuItem>
              <MenuItem as="a">bob</MenuItem>
              <MenuItem as="a">charlie</MenuItem>
            </MenuItems>
          </Menu>
        </div>
      `)

      let [button1, button2] = getMenuButtons()

      // Click the first menu button
      await click(button1)
      expect(getMenus()).toHaveLength(1) // Only 1 menu should be visible

      // Ensure the open menu is linked to the first button
      assertMenuButtonLinkedWithMenu(button1, getMenu())

      // Click the second menu button
      await click(button2)

      expect(getMenus()).toHaveLength(1) // Only 1 menu should be visible

      // Ensure the open menu is linked to the second button
      assertMenuButtonLinkedWithMenu(button2, getMenu())
    })
  )

  // TODO: This test doesn't work — and it would be more suited for browser testing anyway
  it.skip(
    'should be possible to click outside of the menu into an iframe and which should close the menu',
    suppressConsoleLogs(async () => {
      renderTemplate(`
        <div>
          <Menu>
            <MenuButton>Trigger</MenuButton>
            <MenuItems>
              <menuitem as="a">alice</menuitem>
              <menuitem as="a">bob</menuitem>
              <menuitem as="a">charlie</menuitem>
            </MenuItems>
          </Menu>
          <iframe :srcdoc="'<button>Trigger</button>'" frameborder="0" width="300" height="300"></iframe>
        </div>
      `)

      // Open menu
      await click(getMenuButton())
      assertMenu({ state: MenuState.Visible })

      // Click the input element in the iframe
      await click(document.querySelector('iframe')?.contentDocument!.querySelector('button')!)

      // Should be closed now
      assertMenu({ state: MenuState.InvisibleUnmounted })

      // Verify the button is focused again
      assertActiveElement(getMenuButton())
    })
  )

  it('should be possible to hover an item and make it active', async () => {
    renderTemplate(jsx`
      <Menu>
        <MenuButton>Trigger</MenuButton>
        <MenuItems>
          <MenuItem as="a">alice</MenuItem>
          <MenuItem as="a">bob</MenuItem>
          <MenuItem as="a">charlie</MenuItem>
        </MenuItems>
      </Menu>
    `)

    // Open menu
    await click(getMenuButton())

    let items = getMenuItems()
    // We should be able to go to the second item
    await mouseMove(items[1])
    assertMenuLinkedWithMenuItem(items[1])

    // We should be able to go to the first item
    await mouseMove(items[0])
    assertMenuLinkedWithMenuItem(items[0])

    // We should be able to go to the last item
    await mouseMove(items[2])
    assertMenuLinkedWithMenuItem(items[2])
  })

  it('should make a menu item active when you move the mouse over it', async () => {
    renderTemplate(jsx`
      <Menu>
        <MenuButton>Trigger</MenuButton>
        <MenuItems>
          <MenuItem as="a">alice</MenuItem>
          <MenuItem as="a">bob</MenuItem>
          <MenuItem as="a">charlie</MenuItem>
        </MenuItems>
      </Menu>
    `)

    // Open menu
    await click(getMenuButton())

    let items = getMenuItems()
    // We should be able to go to the second item
    await mouseMove(items[1])
    assertMenuLinkedWithMenuItem(items[1])
  })

  it('should be a no-op when we move the mouse and the menu item is already active', async () => {
    renderTemplate(jsx`
      <Menu>
        <MenuButton>Trigger</MenuButton>
        <MenuItems>
          <MenuItem as="a">alice</MenuItem>
          <MenuItem as="a">bob</MenuItem>
          <MenuItem as="a">charlie</MenuItem>
        </MenuItems>
      </Menu>
    `)

    // Open menu
    await click(getMenuButton())

    let items = getMenuItems()

    // We should be able to go to the second item
    await mouseMove(items[1])
    assertMenuLinkedWithMenuItem(items[1])

    await mouseMove(items[1])

    // Nothing should be changed
    assertMenuLinkedWithMenuItem(items[1])
  })

  it('should be a no-op when we move the mouse and the menu item is disabled', async () => {
    renderTemplate(jsx`
      <Menu>
        <MenuButton>Trigger</MenuButton>
        <MenuItems>
          <MenuItem as="a">alice</MenuItem>
          <MenuItem as="a" disabled>bob</MenuItem>
          <MenuItem as="a">charlie</MenuItem>
        </MenuItems>
      </Menu>
    `)

    // Open menu
    await click(getMenuButton())

    let items = getMenuItems()

    await mouseMove(items[1])
    assertNoActiveMenuItem()
  })

  it('should not be possible to hover an item that is disabled', async () => {
    renderTemplate(jsx`
      <Menu>
        <MenuButton>Trigger</MenuButton>
        <MenuItems>
          <MenuItem as="a">alice</MenuItem>
          <MenuItem as="a" disabled>bob</MenuItem>
          <MenuItem as="a">charlie</MenuItem>
        </MenuItems>
      </Menu>
    `)

    // Open menu
    await click(getMenuButton())

    let items = getMenuItems()

    // Try to hover over item 1, which is disabled
    await mouseMove(items[1])

    // We should not have an active item now
    assertNoActiveMenuItem()
  })

  it('should be possible to mouse leave an item and make it inactive', async () => {
    renderTemplate(jsx`
      <Menu>
        <MenuButton>Trigger</MenuButton>
        <MenuItems>
          <MenuItem as="a">alice</MenuItem>
          <MenuItem as="a">bob</MenuItem>
          <MenuItem as="a">charlie</MenuItem>
        </MenuItems>
      </Menu>
    `)

    // Open menu
    await click(getMenuButton())

    let items = getMenuItems()

    // We should be able to go to the second item
    await mouseMove(items[1])
    assertMenuLinkedWithMenuItem(items[1])

    await mouseLeave(items[1])
    assertNoActiveMenuItem()

    // We should be able to go to the first item
    await mouseMove(items[0])
    assertMenuLinkedWithMenuItem(items[0])

    await mouseLeave(items[0])
    assertNoActiveMenuItem()

    // We should be able to go to the last item
    await mouseMove(items[2])
    assertMenuLinkedWithMenuItem(items[2])

    await mouseLeave(items[2])
    assertNoActiveMenuItem()
  })

  it('should be possible to mouse leave a disabled item and be a no-op', async () => {
    renderTemplate(jsx`
      <Menu>
        <MenuButton>Trigger</MenuButton>
        <MenuItems>
          <MenuItem as="a">alice</MenuItem>
          <MenuItem as="a" disabled>bob</MenuItem>
          <MenuItem as="a">charlie</MenuItem>
        </MenuItems>
      </Menu>
    `)

    // Open menu
    await click(getMenuButton())

    let items = getMenuItems()

    // Try to hover over item 1, which is disabled
    await mouseMove(items[1])
    assertNoActiveMenuItem()

    await mouseLeave(items[1])
    assertNoActiveMenuItem()
  })

  it('should be possible to click a menu item, which closes the menu', async () => {
    let clickHandler = jest.fn()
    renderTemplate({
      template: jsx`
        <Menu>
          <MenuButton>Trigger</MenuButton>
          <MenuItems>
            <MenuItem as="a">alice</MenuItem>
            <MenuItem as="a" @click="clickHandler">bob</MenuItem>
            <MenuItem as="a">charlie</MenuItem>
          </MenuItems>
        </Menu>
      `,
      setup: () => ({ clickHandler }),
    })

    // Open menu
    await click(getMenuButton())
    assertMenu({ state: MenuState.Visible })

    let items = getMenuItems()

    // We should be able to click the first item
    await click(items[1])

    assertMenu({ state: MenuState.InvisibleUnmounted })
    expect(clickHandler).toHaveBeenCalled()
  })

  it('should be possible to click a menu item, which closes the menu and invokes the @click handler', async () => {
    let clickHandler = jest.fn()
    renderTemplate({
      template: jsx`
        <Menu>
          <MenuButton>Trigger</MenuButton>
          <MenuItems>
            <MenuItem as="a">alice</MenuItem>
            <MenuItem as="button" @click="clickHandler">bob</MenuItem>
            <MenuItem>
              <button @click="clickHandler">charlie</button>
            </MenuItem>
          </MenuItems>
        </Menu>
      `,
      setup: () => ({ clickHandler }),
    })

    // Open menu
    await click(getMenuButton())
    assertMenu({ state: MenuState.Visible })

    // We should be able to click the first item
    await click(getMenuItems()[1])
    assertMenu({ state: MenuState.InvisibleUnmounted })

    // Verify the callback has been called
    expect(clickHandler).toHaveBeenCalledTimes(1)

    // Let's re-open the window for now
    await click(getMenuButton())

    // Click the last item, which should close and invoke the handler
    await click(getMenuItems()[2])
    assertMenu({ state: MenuState.InvisibleUnmounted })

    // Verify the callback has been called
    expect(clickHandler).toHaveBeenCalledTimes(2)
  })

  it('should be possible to click a disabled menu item, which is a no-op', async () => {
    renderTemplate(jsx`
      <Menu>
        <MenuButton>Trigger</MenuButton>
        <MenuItems>
          <MenuItem as="a">alice</MenuItem>
          <MenuItem as="a" disabled>bob</MenuItem>
          <MenuItem as="a">charlie</MenuItem>
        </MenuItems>
      </Menu>
    `)

    // Open menu
    await click(getMenuButton())
    assertMenu({ state: MenuState.Visible })

    let items = getMenuItems()

    // We should be able to click the first item
    await click(items[1])
    assertMenu({ state: MenuState.Visible })
  })

  it('should be possible focus a menu item, so that it becomes active', async () => {
    renderTemplate(jsx`
      <Menu>
        <MenuButton>Trigger</MenuButton>
        <MenuItems>
          <MenuItem as="a">alice</MenuItem>
          <MenuItem as="a">bob</MenuItem>
          <MenuItem as="a">charlie</MenuItem>
        </MenuItems>
      </Menu>
    `)

    // Open menu
    await click(getMenuButton())
    assertMenu({ state: MenuState.Visible })

    let items = getMenuItems()

    // Verify that nothing is active yet
    assertNoActiveMenuItem()

    // We should be able to focus the first item
    await focus(items[1])
    assertMenuLinkedWithMenuItem(items[1])
  })

  it('should not be possible to focus a menu item which is disabled', async () => {
    renderTemplate(jsx`
      <Menu>
        <MenuButton>Trigger</MenuButton>
        <MenuItems>
          <MenuItem as="a">alice</MenuItem>
          <MenuItem as="a" disabled>bob</MenuItem>
          <MenuItem as="a">charlie</MenuItem>
        </MenuItems>
      </Menu>
    `)

    // Open menu
    await click(getMenuButton())
    assertMenu({ state: MenuState.Visible })

    let items = getMenuItems()

    // We should not be able to focus the first item
    await focus(items[1])
    assertNoActiveMenuItem()
  })

  it('should not be possible to activate a disabled item', async () => {
    let clickHandler = jest.fn()

    renderTemplate({
      template: jsx`
        <Menu>
          <MenuButton>Trigger</MenuButton>
          <MenuItems>
            <MenuItem as="button" @click="clickHandler">alice</MenuItem>
            <MenuItem as="button" @click="clickHandler" disabled>
              bob
            </MenuItem>
            <MenuItem disabled>
              <button @click="clickHandler">charlie</button>
            </MenuItem>
          </MenuItems>
        </Menu>
      `,
      setup: () => ({ clickHandler }),
    })

    // Open menu
    await click(getMenuButton())
    assertMenu({ state: MenuState.Visible })

    let items = getMenuItems()

    await focus(items[0])
    await click(items[1])
    expect(clickHandler).not.toHaveBeenCalled()

    // Activate the last item
    await click(getMenuItems()[2])
    expect(clickHandler).not.toHaveBeenCalled()
  })
})
