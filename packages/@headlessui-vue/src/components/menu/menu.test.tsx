import { defineComponent, h } from 'vue'
import { render } from '../../test-utils/vue-testing-library'
import { menu } from '@headlessui/tests/suits'
import { suppressConsoleLogs } from '@headlessui/tests/utils'
import {
  MenuState,
  assertMenu,
  assertMenuButton,
  assertMenuItem,
  assertMenuLinkedWithMenuItem,
  assertNoActiveMenuItem,
  getMenuButton,
  getMenu,
  getMenuItems,
} from '@headlessui/tests/accessibility-assertions'
import { click, press, Keys } from '@headlessui/tests/interactions'

import { Menu, MenuButton, MenuItems, MenuItem } from './menu'

jest.mock('../../hooks/use-id')

beforeAll(() => {
  jest.spyOn(window, 'requestAnimationFrame').mockImplementation(setImmediate as any)
  jest.spyOn(window, 'cancelAnimationFrame').mockImplementation(clearImmediate as any)
})

afterAll(() => jest.restoreAllMocks())

function renderTemplate(input: string | Partial<Parameters<typeof defineComponent>[0]>) {
  const defaultComponents = { Menu, MenuButton, MenuItems, MenuItem }

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
    renderTemplate(`
      <Menu>
        <MenuButton>Trigger</MenuButton>
        <MenuItems>
          <MenuItem>Item A</MenuItem>
          <MenuItem>Item B</MenuItem>
          <MenuItem>Item C</MenuItem>
        </MenuItems>
      </Menu>
    `)

    assertMenuButton({
      state: MenuState.Closed,
      attributes: { id: 'headlessui-menu-button-1' },
    })
    assertMenu({ state: MenuState.Closed })
  })
})

describe('Rendering', () => {
  describe('Menu', () => {
    it('should be possible to render a Menu using a default render prop', async () => {
      renderTemplate(`
        <Menu v-slot="{ open }">
          <MenuButton>Trigger {{ open ? "visible" : "hidden" }}</MenuButton>
          <MenuItems>
            <MenuItem>Item A</MenuItem>
            <MenuItem>Item B</MenuItem>
            <MenuItem>Item C</MenuItem>
          </MenuItems>
        </Menu>
      `)

      assertMenuButton({
        state: MenuState.Closed,
        attributes: { id: 'headlessui-menu-button-1' },
        textContent: 'Trigger hidden',
      })
      assertMenu({ state: MenuState.Closed })

      await click(getMenuButton())

      assertMenuButton({
        state: MenuState.Open,
        attributes: { id: 'headlessui-menu-button-1' },
        textContent: 'Trigger visible',
      })
      assertMenu({ state: MenuState.Open })
    })

    it('should be possible to render a Menu using a template `as` prop', async () => {
      renderTemplate(`
        <Menu as="template">
          <div>
            <MenuButton>Trigger</MenuButton>
            <MenuItems>
              <MenuItem>Item A</MenuItem>
              <MenuItem>Item B</MenuItem>
              <MenuItem>Item C</MenuItem>
            </MenuItems>
          </div>
        </Menu>
      `)

      assertMenuButton({
        state: MenuState.Closed,
        attributes: { id: 'headlessui-menu-button-1' },
      })
      assertMenu({ state: MenuState.Closed })

      await click(getMenuButton())

      assertMenuButton({
        state: MenuState.Open,
        attributes: { id: 'headlessui-menu-button-1' },
      })
      assertMenu({ state: MenuState.Open })
    })

    it(
      'should yell when we render a Menu using a template `as` prop (default) that contains multiple children (if we passthrough props)',
      suppressConsoleLogs(() => {
        expect(() =>
          renderTemplate(`
            <Menu class="relative">
              <MenuButton>Trigger</MenuButton>
              <MenuItems>
                <MenuItem>Item A</MenuItem>
                <MenuItem>Item B</MenuItem>
                <MenuItem>Item C</MenuItem>
              </MenuItems>
            </Menu>
          `)
        ).toThrowErrorMatchingInlineSnapshot(
          `"You should only render 1 child or use the \`as=\\"...\\"\` prop"`
        )
      })
    )
  })

  describe('MenuButton', () => {
    it('should be possible to render a MenuButton using a default render prop', async () => {
      renderTemplate(`
        <Menu>
          <MenuButton v-slot="{ open }">
            Trigger {{ open ? "visible" : "hidden" }}
          </MenuButton>
          <MenuItems>
            <MenuItem>Item A</MenuItem>
            <MenuItem>Item B</MenuItem>
            <MenuItem>Item C</MenuItem>
          </MenuItems>
        </Menu>
      `)

      assertMenuButton({
        state: MenuState.Closed,
        attributes: { id: 'headlessui-menu-button-1' },
        textContent: 'Trigger hidden',
      })
      assertMenu({ state: MenuState.Closed })

      await click(getMenuButton())

      assertMenuButton({
        state: MenuState.Open,
        attributes: { id: 'headlessui-menu-button-1' },
        textContent: 'Trigger visible',
      })
      assertMenu({ state: MenuState.Open })
    })

    it('should be possible to render a MenuButton using a template `as` prop', async () => {
      renderTemplate(`
        <Menu>
          <MenuButton as="template" v-slot="{ open }">
            <button :data-open="open">Trigger</button>
          </MenuButton>
          <MenuItems>
            <MenuItem>Item A</MenuItem>
            <MenuItem>Item B</MenuItem>
            <MenuItem>Item C</MenuItem>
          </MenuItems>
        </Menu>
      `)

      assertMenuButton({
        state: MenuState.Closed,
        attributes: { id: 'headlessui-menu-button-1', 'data-open': 'false' },
      })
      assertMenu({ state: MenuState.Closed })

      await click(getMenuButton())

      assertMenuButton({
        state: MenuState.Open,
        attributes: { id: 'headlessui-menu-button-1', 'data-open': 'true' },
      })
      assertMenu({ state: MenuState.Open })
    })

    it(
      'should yell when we render a MenuButton using a template `as` prop that contains multiple children',
      suppressConsoleLogs(() => {
        expect(() =>
          renderTemplate(`
            <Menu>
              <MenuButton as="template">
                <span>Trigger</span>
                <svg />
              </MenuButton>
              <MenuItems>
                <MenuItem>Item A</MenuItem>
                <MenuItem>Item B</MenuItem>
                <MenuItem>Item C</MenuItem>
              </MenuItems>
            </Menu>
          `)
        ).toThrowErrorMatchingInlineSnapshot(
          `"You should only render 1 child or use the \`as=\\"...\\"\` prop"`
        )
      })
    )
  })

  describe('MenuItems', () => {
    it('should be possible to render MenuItems using a default render prop', async () => {
      renderTemplate(`
        <Menu>
          <MenuButton>Trigger</MenuButton>
          <MenuItems v-slot="{ open }">
            <span>{{ open ? "visible" : "hidden" }}</span>
            <MenuItem>Item A</MenuItem>
            <MenuItem>Item B</MenuItem>
            <MenuItem>Item C</MenuItem>
          </MenuItems>
        </Menu>
      `)

      assertMenuButton({
        state: MenuState.Closed,
        attributes: { id: 'headlessui-menu-button-1' },
      })
      assertMenu({ state: MenuState.Closed })

      await click(getMenuButton())

      assertMenuButton({
        state: MenuState.Open,
        attributes: { id: 'headlessui-menu-button-1' },
      })
      assertMenu({ state: MenuState.Open })
      expect(getMenu()?.firstChild?.textContent).toBe('visible')
    })

    it('should be possible to render MenuItems using a template `as` prop', async () => {
      renderTemplate(`
        <Menu>
          <MenuButton>Trigger</MenuButton>
          <MenuItems as="template" v-slot="{ open }">
            <div :data-open="open">
              <MenuItem>Item A</MenuItem>
              <MenuItem>Item B</MenuItem>
              <MenuItem>Item C</MenuItem>
            </div>
          </MenuItems>
        </Menu>
      `)

      assertMenuButton({
        state: MenuState.Closed,
        attributes: { id: 'headlessui-menu-button-1' },
      })
      assertMenu({ state: MenuState.Closed })

      await click(getMenuButton())

      assertMenuButton({
        state: MenuState.Open,
        attributes: { id: 'headlessui-menu-button-1' },
      })
      assertMenu({ state: MenuState.Open, attributes: { 'data-open': 'true' } })
    })

    it('should yell when we render MenuItems using a template `as` prop that contains multiple children', async () => {
      const state = {
        resolve(_value: Error | PromiseLike<Error>) {},
        done(error: unknown) {
          state.resolve(error as Error)
          return true
        },
        promise: new Promise<Error>(() => {}),
      }

      state.promise = new Promise<Error>(resolve => {
        state.resolve = resolve
      })

      renderTemplate({
        template: `
          <Menu>
            <MenuButton>Trigger</MenuButton>
            <MenuItems as="template">
              <MenuItem>Item A</MenuItem>
              <MenuItem>Item B</MenuItem>
              <MenuItem>Item C</MenuItem>
            </MenuItems>
          </Menu>
        `,
        errorCaptured: state.done,
      })

      await click(getMenuButton())
      const error = await state.promise
      expect(error.message).toMatchInlineSnapshot(
        `"You should only render 1 child or use the \`as=\\"...\\"\` prop"`
      )
    })

    it('should be possible to always render the MenuItems if we provide it a `static` prop', () => {
      renderTemplate(`
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
  })

  describe('MenuItem', () => {
    it('should be possible to render MenuItem using a default render prop', async () => {
      renderTemplate(`
        <Menu>
          <MenuButton>Trigger</MenuButton>
          <MenuItems>
            <MenuItem v-slot="{ active, disabled }">
              <span>Item A - {{ JSON.stringify({ active, disabled }) }}</span>
            </MenuItem>
            <MenuItem>Item B</MenuItem>
            <MenuItem>Item C</MenuItem>
          </MenuItems>
        </Menu>
      `)

      assertMenuButton({
        state: MenuState.Closed,
        attributes: { id: 'headlessui-menu-button-1' },
      })
      assertMenu({ state: MenuState.Closed })

      await click(getMenuButton())

      assertMenuButton({
        state: MenuState.Open,
        attributes: { id: 'headlessui-menu-button-1' },
      })
      assertMenu({ state: MenuState.Open })
      expect(getMenuItems()[0]?.textContent).toBe(
        `Item A - ${JSON.stringify({ active: false, disabled: false })}`
      )
    })

    it('should be possible to render a MenuItem using a template `as` prop', async () => {
      renderTemplate(`
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
        state: MenuState.Closed,
        attributes: { id: 'headlessui-menu-button-1' },
      })
      assertMenu({ state: MenuState.Closed })

      getMenuButton()?.focus()

      await press(Keys.Enter)

      assertMenuButton({
        state: MenuState.Open,
        attributes: { id: 'headlessui-menu-button-1' },
      })
      assertMenu({ state: MenuState.Open })
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
      const state = {
        resolve(_value: Error | PromiseLike<Error>) {},
        done(error: unknown) {
          state.resolve(error as Error)
          return true
        },
        promise: new Promise<Error>(() => {}),
      }

      state.promise = new Promise<Error>(resolve => {
        state.resolve = resolve
      })

      renderTemplate({
        template: `
          <Menu>
            <MenuButton>Trigger</MenuButton>
            <MenuItems>
              <MenuItem>
                <span>Item A</span>
                <svg />
              </MenuItem>
              <MenuItem>Item B</MenuItem>
              <MenuItem>Item C</MenuItem>
            </MenuItems>
          </Menu>
        `,
        errorCaptured: state.done,
      })

      await click(getMenuButton())
      const error = await state.promise
      expect(error.message).toMatchInlineSnapshot(
        `"You should only render 1 child or use the \`as=\\"...\\"\` prop"`
      )
    })
  })
})

describe('Rendering composition', () => {
  it('should be possible to conditionally render classNames (aka className can be a function?!)', async () => {
    renderTemplate(`
      <Menu>
        <MenuButton>Trigger</MenuButton>
        <MenuItems>
          <MenuItem as="a" :className="JSON.stringify">Item A</MenuItem>
          <MenuItem as="a" disabled :className="JSON.stringify">Item B</MenuItem>
          <MenuItem as="a" class="no-special-treatment">Item C</MenuItem>
        </MenuItems>
      </Menu>
    `)

    assertMenuButton({
      state: MenuState.Closed,
      attributes: { id: 'headlessui-menu-button-1' },
    })
    assertMenu({ state: MenuState.Closed })

    // Open menu
    await click(getMenuButton())

    const items = getMenuItems()

    // Verify correct classNames
    expect('' + items[0].classList).toEqual(JSON.stringify({ active: false, disabled: false }))
    expect('' + items[1].classList).toEqual(JSON.stringify({ active: false, disabled: true }))
    expect('' + items[2].classList).toEqual('no-special-treatment')

    // Double check that nothing is active
    assertNoActiveMenuItem()

    // Make the first item active
    await press(Keys.ArrowDown)

    // Verify the classNames
    expect('' + items[0].classList).toEqual(JSON.stringify({ active: true, disabled: false }))
    expect('' + items[1].classList).toEqual(JSON.stringify({ active: false, disabled: true }))
    expect('' + items[2].classList).toEqual('no-special-treatment')

    // Double check that the first item is the active one
    assertMenuLinkedWithMenuItem(items[0])

    // Let's go down, this should go to the third item since the second item is disabled!
    await press(Keys.ArrowDown)

    // Verify the classNames
    expect('' + items[0].classList).toEqual(JSON.stringify({ active: false, disabled: false }))
    expect('' + items[1].classList).toEqual(JSON.stringify({ active: false, disabled: true }))
    expect('' + items[2].classList).toEqual('no-special-treatment')

    // Double check that the last item is the active one
    assertMenuLinkedWithMenuItem(items[2])
  })

  it(
    'should be possible to swap the menu item with a button for example',
    suppressConsoleLogs(async () => {
      const MyButton = defineComponent({
        setup(props) {
          return () => h('button', { 'data-my-custom-button': true, ...props })
        },
      })

      renderTemplate({
        template: `
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
        state: MenuState.Closed,
        attributes: { id: 'headlessui-menu-button-1' },
      })
      assertMenu({ state: MenuState.Closed })

      // Open menu
      await click(getMenuButton())

      // Verify items are buttons now
      const items = getMenuItems()
      items.forEach(item =>
        assertMenuItem(item, { tag: 'button', attributes: { 'data-my-custom-button': 'true' } })
      )
    })
  )
})

menu.run({
  [menu.scenarios.Default]({ button, items }) {
    return renderTemplate({
      template: `
        <Menu>
          <MenuButton :disabled="button.disabled">{{button.children}}</MenuButton>
          <MenuItems>
            <MenuItem
              v-for="item in items"
              :as="item.as"
              :disabled="item.disabled"
              @click="item.onClick?.($event)"
            >{{item.children}}</MenuItem>
          </MenuItems>
        </Menu>
      `,
      setup: () => ({ items, button }),
    })
  },
  [menu.scenarios.LastItemButton]({ button, items, lastItem }) {
    const { props: lastItemProps, ...lastItemButtonProps } = lastItem

    return renderTemplate({
      template: `
        <Menu>
          <MenuButton :disabled="button.disabled">{{button.children}}</MenuButton>
          <MenuItems>
            <MenuItem
              v-for="item in items"
              :as="item.as"
              :disabled="item.disabled"
              @click="item.onClick?.($event)"
            >{{item.children}}</MenuItem>
            <MenuItem 
              :as="lastItemProps.as"
              :disabled="lastItemProps.disabled"
              @click="lastItemProps.onClick?.($event)"
            >
              <button
                :disabled="lastItemButtonProps.disabled"
                @click="lastItemButtonProps.onClick?.($event)"
              >{{lastItemButtonProps.children}}</button>
            </MenuItem>
          </MenuItems>
        </Menu>
      `,
      setup: () => ({ items, button, lastItemProps, lastItemButtonProps }),
    })
  },
  [menu.scenarios.MultipleMenus](menus) {
    return renderTemplate({
      template: `
        <div>
          <Menu v-for="(menu, i) in menus" key="i">
            <MenuButton
              :disabled="menu.button.disabled"
              @click="menu.button.onClick?.($event)"
            >{{menu.button.children}}</MenuButton>
            <MenuItems>
              <MenuItem
                v-for="item in menu.items"
                :as="item.as"
                :disabled="item.disabled"
                @click="item.onClick?.($event)"
              >{{item.children}}</MenuItem>
            </MenuItems>
          </Menu>
        </div>
      `,
      setup: () => ({ menus }),
    })
  },
})
