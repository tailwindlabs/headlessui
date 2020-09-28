import { defineComponent, h, nextTick } from 'vue'
import { render } from '../../test-utils/vue-testing-library'
import { Menu, MenuButton, MenuItems, MenuItem } from './menu'
import { suppressConsoleLogs } from '../../test-utils/suppress-console-logs'
import {
  MenuButtonState,
  MenuState,
  assertMenu,
  assertMenuButton,
  assertMenuButtonLinkedWithMenu,
  assertMenuItem,
  assertMenuLinkedWithMenuItem,
  assertActiveElement,
  assertNoActiveMenuItem,
} from '../../test-utils/accessibility-assertions'
import {
  click,
  focus,
  hover,
  mouseMove,
  press,
  shift,
  type,
  unHover,
  Keys,
  word,
} from '../../test-utils/interactions'

jest.mock('../../hooks/use-id')

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

function getMenuButton(): HTMLElement | null {
  // This is just an assumption for our tests. We assume that we only have 1 button. And if we have
  // more, than we assume that it is the first one.
  return document.querySelector('button')
}

function getMenu(): HTMLElement | null {
  // This is just an assumption for our tests. We assume that our menu has this role and that it is
  // the first item in the DOM.
  return document.querySelector('[role="menu"]')
}

function getMenuItems(): HTMLElement[] {
  // This is just an assumption for our tests. We assume that all menu items have this role.
  return Array.from(document.querySelectorAll('[role="menuitem"]'))
}

beforeAll(() => {
  jest.spyOn(window, 'requestAnimationFrame').mockImplementation(nextTick as any)
  jest.spyOn(window, 'cancelAnimationFrame').mockImplementation(jest.fn())
})

afterAll(() => jest.restoreAllMocks())

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

    assertMenuButton(getMenuButton(), {
      state: MenuButtonState.Closed,
      attributes: { id: 'headlessui-menu-button-1' },
    })
    assertMenu(getMenu(), { state: MenuState.Closed })
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

      assertMenuButton(getMenuButton(), {
        state: MenuButtonState.Closed,
        attributes: { id: 'headlessui-menu-button-1' },
        textContent: 'Trigger hidden',
      })
      assertMenu(getMenu(), { state: MenuState.Closed })

      await click(getMenuButton())

      assertMenuButton(getMenuButton(), {
        state: MenuButtonState.Open,
        attributes: { id: 'headlessui-menu-button-1' },
        textContent: 'Trigger visible',
      })
      assertMenu(getMenu(), { state: MenuState.Open })
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

      assertMenuButton(getMenuButton(), {
        state: MenuButtonState.Closed,
        attributes: { id: 'headlessui-menu-button-1' },
      })
      assertMenu(getMenu(), { state: MenuState.Closed })

      await click(getMenuButton())

      assertMenuButton(getMenuButton(), {
        state: MenuButtonState.Open,
        attributes: { id: 'headlessui-menu-button-1' },
      })
      assertMenu(getMenu(), { state: MenuState.Open })
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

      assertMenuButton(getMenuButton(), {
        state: MenuButtonState.Closed,
        attributes: { id: 'headlessui-menu-button-1' },
        textContent: 'Trigger hidden',
      })
      assertMenu(getMenu(), { state: MenuState.Closed })

      await click(getMenuButton())

      assertMenuButton(getMenuButton(), {
        state: MenuButtonState.Open,
        attributes: { id: 'headlessui-menu-button-1' },
        textContent: 'Trigger visible',
      })
      assertMenu(getMenu(), { state: MenuState.Open })
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

      assertMenuButton(getMenuButton(), {
        state: MenuButtonState.Closed,
        attributes: { id: 'headlessui-menu-button-1', 'data-open': 'false' },
      })
      assertMenu(getMenu(), { state: MenuState.Closed })

      await click(getMenuButton())

      assertMenuButton(getMenuButton(), {
        state: MenuButtonState.Open,
        attributes: { id: 'headlessui-menu-button-1', 'data-open': 'true' },
      })
      assertMenu(getMenu(), { state: MenuState.Open })
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

      assertMenuButton(getMenuButton(), {
        state: MenuButtonState.Closed,
        attributes: { id: 'headlessui-menu-button-1' },
      })
      assertMenu(getMenu(), { state: MenuState.Closed })

      await click(getMenuButton())

      assertMenuButton(getMenuButton(), {
        state: MenuButtonState.Open,
        attributes: { id: 'headlessui-menu-button-1' },
      })
      assertMenu(getMenu(), { state: MenuState.Open })
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

      assertMenuButton(getMenuButton(), {
        state: MenuButtonState.Closed,
        attributes: { id: 'headlessui-menu-button-1' },
      })
      assertMenu(getMenu(), { state: MenuState.Closed })

      await click(getMenuButton())

      assertMenuButton(getMenuButton(), {
        state: MenuButtonState.Open,
        attributes: { id: 'headlessui-menu-button-1' },
      })
      assertMenu(getMenu(), { state: MenuState.Open, attributes: { 'data-open': 'true' } })
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

      assertMenuButton(getMenuButton(), {
        state: MenuButtonState.Closed,
        attributes: { id: 'headlessui-menu-button-1' },
      })
      assertMenu(getMenu(), { state: MenuState.Closed })

      await click(getMenuButton())

      assertMenuButton(getMenuButton(), {
        state: MenuButtonState.Open,
        attributes: { id: 'headlessui-menu-button-1' },
      })
      assertMenu(getMenu(), { state: MenuState.Open })
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

      assertMenuButton(getMenuButton(), {
        state: MenuButtonState.Closed,
        attributes: { id: 'headlessui-menu-button-1' },
      })
      assertMenu(getMenu(), { state: MenuState.Closed })

      getMenuButton()?.focus()

      await press(Keys.Enter)

      assertMenuButton(getMenuButton(), {
        state: MenuButtonState.Open,
        attributes: { id: 'headlessui-menu-button-1' },
      })
      assertMenu(getMenu(), { state: MenuState.Open })
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

    assertMenuButton(getMenuButton(), {
      state: MenuButtonState.Closed,
      attributes: { id: 'headlessui-menu-button-1' },
    })
    assertMenu(getMenu(), { state: MenuState.Closed })

    // Open menu
    await click(getMenuButton())

    const items = getMenuItems()

    // Verify correct classNames
    expect('' + items[0].classList).toEqual(JSON.stringify({ active: false, disabled: false }))
    expect('' + items[1].classList).toEqual(JSON.stringify({ active: false, disabled: true }))
    expect('' + items[2].classList).toEqual('no-special-treatment')

    // Double check that nothing is active
    assertNoActiveMenuItem(getMenu())

    // Make the first item active
    await press(Keys.ArrowDown)

    // Verify the classNames
    expect('' + items[0].classList).toEqual(JSON.stringify({ active: true, disabled: false }))
    expect('' + items[1].classList).toEqual(JSON.stringify({ active: false, disabled: true }))
    expect('' + items[2].classList).toEqual('no-special-treatment')

    // Double check that the first item is the active one
    assertMenuLinkedWithMenuItem(getMenu(), items[0])

    // Let's go down, this should go to the third item since the second item is disabled!
    await press(Keys.ArrowDown)

    // Verify the classNames
    expect('' + items[0].classList).toEqual(JSON.stringify({ active: false, disabled: false }))
    expect('' + items[1].classList).toEqual(JSON.stringify({ active: false, disabled: true }))
    expect('' + items[2].classList).toEqual('no-special-treatment')

    // Double check that the last item is the active one
    assertMenuLinkedWithMenuItem(getMenu(), items[2])
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

      assertMenuButton(getMenuButton(), {
        state: MenuButtonState.Closed,
        attributes: { id: 'headlessui-menu-button-1' },
      })
      assertMenu(getMenu(), { state: MenuState.Closed })

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

describe('Keyboard interactions', () => {
  describe('`Enter` key', () => {
    it('should be possible to open the menu with Enter', async () => {
      renderTemplate(`
        <Menu>
          <MenuButton>Trigger</MenuButton>
          <MenuItems>
            <MenuItem as="a">Item A</MenuItem>
            <MenuItem as="a">Item B</MenuItem>
            <MenuItem as="a">Item C</MenuItem>
          </MenuItems>
        </Menu>
      `)

      assertMenuButton(getMenuButton(), {
        state: MenuButtonState.Closed,
        attributes: { id: 'headlessui-menu-button-1' },
      })
      assertMenu(getMenu(), { state: MenuState.Closed })

      // Focus the button
      getMenuButton()?.focus()

      // Open menu
      await press(Keys.Enter)

      // Verify it is open
      assertMenuButton(getMenuButton(), { state: MenuButtonState.Open })
      assertMenu(getMenu(), {
        state: MenuState.Open,
        attributes: { id: 'headlessui-menu-items-2' },
      })
      assertMenuButtonLinkedWithMenu(getMenuButton(), getMenu())

      // Verify we have menu items
      const items = getMenuItems()
      expect(items).toHaveLength(3)
      items.forEach(item => assertMenuItem(item))

      // Verify that the first menu item is active
      assertMenuLinkedWithMenuItem(getMenu(), items[0])
    })

    it('should have no active menu item when there are no menu items at all', async () => {
      renderTemplate(`
        <Menu>
          <MenuButton>Trigger</MenuButton>
          <MenuItems />
        </Menu>
      `)

      assertMenu(getMenu(), { state: MenuState.Closed })

      // Focus the button
      getMenuButton()?.focus()

      // Open menu
      await press(Keys.Enter)
      assertMenu(getMenu(), { state: MenuState.Open })

      assertNoActiveMenuItem(getMenu())
    })

    it('should focus the first non disabled menu item when opening with Enter', async () => {
      renderTemplate(`
        <Menu>
          <MenuButton>Trigger</MenuButton>
          <MenuItems>
            <MenuItem as="a" disabled>Item A</MenuItem>
            <MenuItem as="a">Item B</MenuItem>
            <MenuItem as="a">Item C</MenuItem>
          </MenuItems>
        </Menu>
      `)

      assertMenuButton(getMenuButton(), {
        state: MenuButtonState.Closed,
        attributes: { id: 'headlessui-menu-button-1' },
      })
      assertMenu(getMenu(), { state: MenuState.Closed })

      // Focus the button
      getMenuButton()?.focus()

      // Open menu
      await press(Keys.Enter)

      const items = getMenuItems()

      // Verify that the first non-disabled menu item is active
      assertMenuLinkedWithMenuItem(getMenu(), items[1])
    })

    it('should focus the first non disabled menu item when opening with Enter (jump over multiple disabled ones)', async () => {
      renderTemplate(`
        <Menu>
          <MenuButton>Trigger</MenuButton>
          <MenuItems>
            <MenuItem as="a" disabled>Item A</MenuItem>
            <MenuItem as="a" disabled>Item B</MenuItem>
            <MenuItem as="a">Item C</MenuItem>
          </MenuItems>
        </Menu>
      `)

      assertMenuButton(getMenuButton(), {
        state: MenuButtonState.Closed,
        attributes: { id: 'headlessui-menu-button-1' },
      })
      assertMenu(getMenu(), { state: MenuState.Closed })

      // Focus the button
      getMenuButton()?.focus()

      // Open menu
      await press(Keys.Enter)

      const items = getMenuItems()

      // Verify that the first non-disabled menu item is active
      assertMenuLinkedWithMenuItem(getMenu(), items[2])
    })

    it('should have no active menu item upon Enter key press, when there are no non-disabled menu items', async () => {
      renderTemplate(`
        <Menu>
          <MenuButton>Trigger</MenuButton>
          <MenuItems>
            <MenuItem disabled>Item A</MenuItem>
            <MenuItem disabled>Item B</MenuItem>
            <MenuItem disabled>Item C</MenuItem>
          </MenuItems>
        </Menu>
      `)

      assertMenuButton(getMenuButton(), {
        state: MenuButtonState.Closed,
        attributes: { id: 'headlessui-menu-button-1' },
      })
      assertMenu(getMenu(), { state: MenuState.Closed })

      // Focus the button
      getMenuButton()?.focus()

      // Open menu
      await press(Keys.Enter)

      assertNoActiveMenuItem(getMenu())
    })

    it('should be possible to close the menu with Enter when there is no active menuitem', async () => {
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

      assertMenuButton(getMenuButton(), {
        state: MenuButtonState.Closed,
        attributes: { id: 'headlessui-menu-button-1' },
      })
      assertMenu(getMenu(), { state: MenuState.Closed })

      // Open menu
      await click(getMenuButton())

      // Verify it is open
      assertMenuButton(getMenuButton(), { state: MenuButtonState.Open })

      // Close menu
      await press(Keys.Enter)

      // Verify it is closed
      assertMenuButton(getMenuButton(), { state: MenuButtonState.Closed })
      assertMenu(getMenu(), { state: MenuState.Closed })
    })

    it('should be possible to close the menu with Enter and invoke the active menu item', async () => {
      const clickHandler = jest.fn()
      renderTemplate({
        template: `
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

      assertMenuButton(getMenuButton(), {
        state: MenuButtonState.Closed,
        attributes: { id: 'headlessui-menu-button-1' },
      })
      assertMenu(getMenu(), { state: MenuState.Closed })

      // Open menu
      await click(getMenuButton())

      // Verify it is open
      assertMenuButton(getMenuButton(), { state: MenuButtonState.Open })

      // Activate the first menu item
      const items = getMenuItems()
      await hover(items[0])

      // Close menu, and invoke the item
      await press(Keys.Enter)

      // Verify it is closed
      assertMenuButton(getMenuButton(), { state: MenuButtonState.Closed })
      assertMenu(getMenu(), { state: MenuState.Closed })

      // Verify the "click" went through on the `a` tag
      expect(clickHandler).toHaveBeenCalled()
    })
  })

  it('should be possible to use a button as a menu item and invoke it upon Enter', async () => {
    const clickHandler = jest.fn()

    renderTemplate({
      template: `
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

    assertMenuButton(getMenuButton(), {
      state: MenuButtonState.Closed,
      attributes: { id: 'headlessui-menu-button-1' },
    })
    assertMenu(getMenu(), { state: MenuState.Closed })

    // Open menu
    await click(getMenuButton())

    // Verify it is open
    assertMenuButton(getMenuButton(), { state: MenuButtonState.Open })

    // Activate the second menu item
    const items = getMenuItems()
    await hover(items[1])

    // Close menu, and invoke the item
    await press(Keys.Enter)

    // Verify it is closed
    assertMenuButton(getMenuButton(), { state: MenuButtonState.Closed })
    assertMenu(getMenu(), { state: MenuState.Closed })

    // Verify the button got "clicked"
    expect(clickHandler).toHaveBeenCalledTimes(1)

    // Click the menu button again
    await click(getMenuButton())

    // Active the last menu item
    await hover(getMenuItems()[2])

    // Close menu, and invoke the item
    await press(Keys.Enter)

    // Verify the button got "clicked"
    expect(clickHandler).toHaveBeenCalledTimes(2)
  })

  describe('`Space` key', () => {
    it('should be possible to open the menu with Space', async () => {
      renderTemplate(`
        <Menu>
          <MenuButton>Trigger</MenuButton>
          <MenuItems>
            <MenuItem as="a">Item A</MenuItem>
            <MenuItem as="a">Item B</MenuItem>
            <MenuItem as="a">Item C</MenuItem>
          </MenuItems>
        </Menu>
      `)

      assertMenuButton(getMenuButton(), {
        state: MenuButtonState.Closed,
        attributes: { id: 'headlessui-menu-button-1' },
      })
      assertMenu(getMenu(), { state: MenuState.Closed })

      // Focus the button
      getMenuButton()?.focus()

      // Open menu
      await press(Keys.Space)

      // Verify it is open
      assertMenuButton(getMenuButton(), { state: MenuButtonState.Open })
      assertMenu(getMenu(), {
        state: MenuState.Open,
        attributes: { id: 'headlessui-menu-items-2' },
      })
      assertMenuButtonLinkedWithMenu(getMenuButton(), getMenu())

      // Verify we have menu items
      const items = getMenuItems()
      expect(items).toHaveLength(3)
      items.forEach(item => assertMenuItem(item))
      assertMenuLinkedWithMenuItem(getMenu(), items[0])
    })

    it('should have no active menu item when there are no menu items at all', async () => {
      renderTemplate(`
        <Menu>
          <MenuButton>Trigger</MenuButton>
          <MenuItems />
        </Menu>
      `)

      assertMenu(getMenu(), { state: MenuState.Closed })

      // Focus the button
      getMenuButton()?.focus()

      // Open menu
      await press(Keys.Space)
      assertMenu(getMenu(), { state: MenuState.Open })

      assertNoActiveMenuItem(getMenu())
    })

    it('should focus the first non disabled menu item when opening with Space', async () => {
      renderTemplate(`
        <Menu>
          <MenuButton>Trigger</MenuButton>
          <MenuItems>
            <MenuItem as="a" disabled>Item A</MenuItem>
            <MenuItem as="a">Item B</MenuItem>
            <MenuItem as="a">Item C</MenuItem>
          </MenuItems>
        </Menu>
      `)

      assertMenuButton(getMenuButton(), {
        state: MenuButtonState.Closed,
        attributes: { id: 'headlessui-menu-button-1' },
      })
      assertMenu(getMenu(), { state: MenuState.Closed })

      // Focus the button
      getMenuButton()?.focus()

      // Open menu
      await press(Keys.Space)

      const items = getMenuItems()

      // Verify that the first non-disabled menu item is active
      assertMenuLinkedWithMenuItem(getMenu(), items[1])
    })

    it('should focus the first non disabled menu item when opening with Space (jump over multiple disabled ones)', async () => {
      renderTemplate(`
        <Menu>
          <MenuButton>Trigger</MenuButton>
          <MenuItems>
            <MenuItem as="a" disabled>Item A</MenuItem>
            <MenuItem as="a" disabled>Item B</MenuItem>
            <MenuItem as="a">Item C</MenuItem>
          </MenuItems>
        </Menu>
      `)

      assertMenuButton(getMenuButton(), {
        state: MenuButtonState.Closed,
        attributes: { id: 'headlessui-menu-button-1' },
      })
      assertMenu(getMenu(), { state: MenuState.Closed })

      // Focus the button
      getMenuButton()?.focus()

      // Open menu
      await press(Keys.Space)

      const items = getMenuItems()

      // Verify that the first non-disabled menu item is active
      assertMenuLinkedWithMenuItem(getMenu(), items[2])
    })

    it('should have no active menu item upon Space key press, when there are no non-disabled menu items', async () => {
      renderTemplate(`
        <Menu>
          <MenuButton>Trigger</MenuButton>
          <MenuItems>
            <MenuItem disabled>Item A</MenuItem>
            <MenuItem disabled>Item B</MenuItem>
            <MenuItem disabled>Item C</MenuItem>
          </MenuItems>
        </Menu>
      `)

      assertMenuButton(getMenuButton(), {
        state: MenuButtonState.Closed,
        attributes: { id: 'headlessui-menu-button-1' },
      })
      assertMenu(getMenu(), { state: MenuState.Closed })

      // Focus the button
      getMenuButton()?.focus()

      // Open menu
      await press(Keys.Space)

      assertNoActiveMenuItem(getMenu())
    })
  })

  describe('`Escape` key', () => {
    it('should be possible to close an open menu with Escape', async () => {
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

      // Focus the button
      getMenuButton()?.focus()

      // Open menu
      await press(Keys.Space)

      // Verify it is open
      assertMenuButton(getMenuButton(), { state: MenuButtonState.Open })
      assertMenu(getMenu(), {
        state: MenuState.Open,
        attributes: { id: 'headlessui-menu-items-2' },
      })
      assertMenuButtonLinkedWithMenu(getMenuButton(), getMenu())

      // Close menu
      await press(Keys.Escape)

      // Verify it is closed
      assertMenuButton(getMenuButton(), { state: MenuButtonState.Closed })
      assertMenu(getMenu(), { state: MenuState.Closed })
    })
  })

  describe('`Tab` key', () => {
    it('should focus trap when we use Tab', async () => {
      renderTemplate(`
        <Menu>
          <MenuButton>Trigger</MenuButton>
          <MenuItems>
            <MenuItem as="a">Item A</MenuItem>
            <MenuItem as="a">Item B</MenuItem>
            <MenuItem as="a">Item C</MenuItem>
          </MenuItems>
        </Menu>
      `)

      assertMenuButton(getMenuButton(), {
        state: MenuButtonState.Closed,
        attributes: { id: 'headlessui-menu-button-1' },
      })
      assertMenu(getMenu(), { state: MenuState.Closed })

      // Focus the button
      getMenuButton()?.focus()

      // Open menu
      await press(Keys.Enter)

      // Verify it is open
      assertMenuButton(getMenuButton(), { state: MenuButtonState.Open })
      assertMenu(getMenu(), {
        state: MenuState.Open,
        attributes: { id: 'headlessui-menu-items-2' },
      })
      assertMenuButtonLinkedWithMenu(getMenuButton(), getMenu())

      // Verify we have menu items
      const items = getMenuItems()
      expect(items).toHaveLength(3)
      items.forEach(item => assertMenuItem(item))
      assertMenuLinkedWithMenuItem(getMenu(), items[0])

      // Try to tab
      await press(Keys.Tab)

      // Verify it is still open
      assertMenuButton(getMenuButton(), { state: MenuButtonState.Open })
      assertMenu(getMenu(), { state: MenuState.Open })
    })

    it('should focus trap when we use Shift+Tab', async () => {
      renderTemplate(`
        <Menu>
          <MenuButton>Trigger</MenuButton>
          <MenuItems>
            <MenuItem as="a">Item A</MenuItem>
            <MenuItem as="a">Item B</MenuItem>
            <MenuItem as="a">Item C</MenuItem>
          </MenuItems>
        </Menu>
      `)

      assertMenuButton(getMenuButton(), {
        state: MenuButtonState.Closed,
        attributes: { id: 'headlessui-menu-button-1' },
      })
      assertMenu(getMenu(), { state: MenuState.Closed })

      // Focus the button
      getMenuButton()?.focus()

      // Open menu
      await press(Keys.Enter)

      // Verify it is open
      assertMenuButton(getMenuButton(), { state: MenuButtonState.Open })
      assertMenu(getMenu(), {
        state: MenuState.Open,
        attributes: { id: 'headlessui-menu-items-2' },
      })
      assertMenuButtonLinkedWithMenu(getMenuButton(), getMenu())

      // Verify we have menu items
      const items = getMenuItems()
      expect(items).toHaveLength(3)
      items.forEach(item => assertMenuItem(item))
      assertMenuLinkedWithMenuItem(getMenu(), items[0])

      // Try to Shift+Tab
      await press(shift(Keys.Tab))

      // Verify it is still open
      assertMenuButton(getMenuButton(), { state: MenuButtonState.Open })
      assertMenu(getMenu(), { state: MenuState.Open })
    })
  })

  describe('`ArrowDown` key', () => {
    it('should be possible to open the menu with ArrowDown', async () => {
      renderTemplate(`
        <Menu>
          <MenuButton>Trigger</MenuButton>
          <MenuItems>
            <MenuItem as="a">Item A</MenuItem>
            <MenuItem as="a">Item B</MenuItem>
            <MenuItem as="a">Item C</MenuItem>
          </MenuItems>
        </Menu>
      `)

      assertMenuButton(getMenuButton(), {
        state: MenuButtonState.Closed,
        attributes: { id: 'headlessui-menu-button-1' },
      })
      assertMenu(getMenu(), { state: MenuState.Closed })

      // Focus the button
      getMenuButton()?.focus()

      // Open menu
      await press(Keys.ArrowDown)

      // Verify it is open
      assertMenuButton(getMenuButton(), { state: MenuButtonState.Open })
      assertMenu(getMenu(), {
        state: MenuState.Open,
        attributes: { id: 'headlessui-menu-items-2' },
      })
      assertMenuButtonLinkedWithMenu(getMenuButton(), getMenu())

      // Verify we have menu items
      const items = getMenuItems()
      expect(items).toHaveLength(3)
      items.forEach(item => assertMenuItem(item))

      // Verify that the first menu item is active
      assertMenuLinkedWithMenuItem(getMenu(), items[0])
    })

    it('should have no active menu item when there are no menu items at all', async () => {
      renderTemplate(`
        <Menu>
          <MenuButton>Trigger</MenuButton>
          <MenuItems />
        </Menu>
      `)

      assertMenu(getMenu(), { state: MenuState.Closed })

      // Focus the button
      getMenuButton()?.focus()

      // Open menu
      await press(Keys.ArrowDown)
      assertMenu(getMenu(), { state: MenuState.Open })

      assertNoActiveMenuItem(getMenu())
    })

    it('should be possible to use ArrowDown to navigate the menu items', async () => {
      renderTemplate(`
        <Menu>
          <MenuButton>Trigger</MenuButton>
          <MenuItems>
            <MenuItem as="a">Item A</MenuItem>
            <MenuItem as="a">Item B</MenuItem>
            <MenuItem as="a">Item C</MenuItem>
          </MenuItems>
        </Menu>
      `)

      assertMenuButton(getMenuButton(), {
        state: MenuButtonState.Closed,
        attributes: { id: 'headlessui-menu-button-1' },
      })
      assertMenu(getMenu(), { state: MenuState.Closed })

      // Focus the button
      getMenuButton()?.focus()

      // Open menu
      await press(Keys.Enter)

      // Verify we have menu items
      const items = getMenuItems()
      expect(items).toHaveLength(3)
      items.forEach(item => assertMenuItem(item))
      assertMenuLinkedWithMenuItem(getMenu(), items[0])

      // We should be able to go down once
      await press(Keys.ArrowDown)
      assertMenuLinkedWithMenuItem(getMenu(), items[1])

      // We should be able to go down again
      await press(Keys.ArrowDown)
      assertMenuLinkedWithMenuItem(getMenu(), items[2])

      // We should NOT be able to go down again (because last item). Current implementation won't go around.
      await press(Keys.ArrowDown)
      assertMenuLinkedWithMenuItem(getMenu(), items[2])
    })

    it('should be possible to use ArrowDown to navigate the menu items and skip the first disabled one', async () => {
      renderTemplate(`
        <Menu>
          <MenuButton>Trigger</MenuButton>
          <MenuItems>
            <MenuItem as="a" disabled>Item A</MenuItem>
            <MenuItem as="a">Item B</MenuItem>
            <MenuItem as="a">Item C</MenuItem>
          </MenuItems>
        </Menu>
      `)

      assertMenuButton(getMenuButton(), {
        state: MenuButtonState.Closed,
        attributes: { id: 'headlessui-menu-button-1' },
      })
      assertMenu(getMenu(), { state: MenuState.Closed })

      // Focus the button
      getMenuButton()?.focus()

      // Open menu
      await press(Keys.Enter)

      // Verify we have menu items
      const items = getMenuItems()
      expect(items).toHaveLength(3)
      items.forEach(item => assertMenuItem(item))
      assertMenuLinkedWithMenuItem(getMenu(), items[1])

      // We should be able to go down once
      await press(Keys.ArrowDown)
      assertMenuLinkedWithMenuItem(getMenu(), items[2])
    })

    it('should be possible to use ArrowDown to navigate the menu items and jump to the first non-disabled one', async () => {
      renderTemplate(`
        <Menu>
          <MenuButton>Trigger</MenuButton>
          <MenuItems>
            <MenuItem as="a" disabled>Item A</MenuItem>
            <MenuItem as="a" disabled>Item B</MenuItem>
            <MenuItem as="a">Item C</MenuItem>
          </MenuItems>
        </Menu>
      `)

      assertMenuButton(getMenuButton(), {
        state: MenuButtonState.Closed,
        attributes: { id: 'headlessui-menu-button-1' },
      })
      assertMenu(getMenu(), { state: MenuState.Closed })

      // Focus the button
      getMenuButton()?.focus()

      // Open menu
      await press(Keys.Enter)

      // Verify we have menu items
      const items = getMenuItems()
      expect(items).toHaveLength(3)
      items.forEach(item => assertMenuItem(item))
      assertMenuLinkedWithMenuItem(getMenu(), items[2])
    })
  })

  describe('`ArrowUp` key', () => {
    it('should be possible to open the menu with ArrowUp and the last item should be active', async () => {
      renderTemplate(`
        <Menu>
          <MenuButton>Trigger</MenuButton>
          <MenuItems>
            <MenuItem as="a">Item A</MenuItem>
            <MenuItem as="a">Item B</MenuItem>
            <MenuItem as="a">Item C</MenuItem>
          </MenuItems>
        </Menu>
      `)

      assertMenuButton(getMenuButton(), {
        state: MenuButtonState.Closed,
        attributes: { id: 'headlessui-menu-button-1' },
      })
      assertMenu(getMenu(), { state: MenuState.Closed })

      // Focus the button
      getMenuButton()?.focus()

      // Open menu
      await press(Keys.ArrowUp)

      // Verify it is open
      assertMenuButton(getMenuButton(), { state: MenuButtonState.Open })
      assertMenu(getMenu(), {
        state: MenuState.Open,
        attributes: { id: 'headlessui-menu-items-2' },
      })
      assertMenuButtonLinkedWithMenu(getMenuButton(), getMenu())

      // Verify we have menu items
      const items = getMenuItems()
      expect(items).toHaveLength(3)
      items.forEach(item => assertMenuItem(item))

      // ! ALERT: The LAST item should now be active
      assertMenuLinkedWithMenuItem(getMenu(), items[2])
    })

    it('should have no active menu item when there are no menu items at all', async () => {
      renderTemplate(`
        <Menu>
          <MenuButton>Trigger</MenuButton>
          <MenuItems />
        </Menu>
      `)

      assertMenu(getMenu(), { state: MenuState.Closed })

      // Focus the button
      getMenuButton()?.focus()

      // Open menu
      await press(Keys.ArrowUp)
      assertMenu(getMenu(), { state: MenuState.Open })

      assertNoActiveMenuItem(getMenu())
    })

    it('should be possible to use ArrowUp to navigate the menu items and jump to the first non-disabled one', async () => {
      renderTemplate(`
        <Menu>
          <MenuButton>Trigger</MenuButton>
          <MenuItems>
            <MenuItem as="a">Item A</MenuItem>
            <MenuItem as="a" disabled>Item B</MenuItem>
            <MenuItem as="a" disabled>Item C</MenuItem>
          </MenuItems>
        </Menu>
      `)

      assertMenuButton(getMenuButton(), {
        state: MenuButtonState.Closed,
        attributes: { id: 'headlessui-menu-button-1' },
      })
      assertMenu(getMenu(), { state: MenuState.Closed })

      // Focus the button
      getMenuButton()?.focus()

      // Open menu
      await press(Keys.ArrowUp)

      // Verify we have menu items
      const items = getMenuItems()
      expect(items).toHaveLength(3)
      items.forEach(item => assertMenuItem(item))
      assertMenuLinkedWithMenuItem(getMenu(), items[0])
    })

    it('should not be possible to navigate up or down if there is only a single non-disabled item', async () => {
      renderTemplate(`
        <Menu>
          <MenuButton>Trigger</MenuButton>
          <MenuItems>
            <MenuItem as="a" disabled>Item A</MenuItem>
            <MenuItem as="a" disabled>Item B</MenuItem>
            <MenuItem as="a">Item C</MenuItem>
          </MenuItems>
        </Menu>
      `)

      assertMenuButton(getMenuButton(), {
        state: MenuButtonState.Closed,
        attributes: { id: 'headlessui-menu-button-1' },
      })
      assertMenu(getMenu(), { state: MenuState.Closed })

      // Focus the button
      getMenuButton()?.focus()

      // Open menu
      await press(Keys.Enter)

      // Verify we have menu items
      const items = getMenuItems()
      expect(items).toHaveLength(3)
      items.forEach(item => assertMenuItem(item))
      assertMenuLinkedWithMenuItem(getMenu(), items[2])

      // We should not be able to go up (because those are disabled)
      await press(Keys.ArrowUp)
      assertMenuLinkedWithMenuItem(getMenu(), items[2])

      // We should not be able to go down (because this is the last item)
      await press(Keys.ArrowDown)
      assertMenuLinkedWithMenuItem(getMenu(), items[2])
    })

    it('should be possible to use ArrowUp to navigate the menu items', async () => {
      renderTemplate(`
        <Menu>
          <MenuButton>Trigger</MenuButton>
          <MenuItems>
            <MenuItem as="a">Item A</MenuItem>
            <MenuItem as="a">Item B</MenuItem>
            <MenuItem as="a">Item C</MenuItem>
          </MenuItems>
        </Menu>
      `)

      assertMenuButton(getMenuButton(), {
        state: MenuButtonState.Closed,
        attributes: { id: 'headlessui-menu-button-1' },
      })
      assertMenu(getMenu(), { state: MenuState.Closed })

      // Focus the button
      getMenuButton()?.focus()

      // Open menu
      await press(Keys.ArrowUp)

      // Verify it is open
      assertMenuButton(getMenuButton(), { state: MenuButtonState.Open })
      assertMenu(getMenu(), {
        state: MenuState.Open,
        attributes: { id: 'headlessui-menu-items-2' },
      })
      assertMenuButtonLinkedWithMenu(getMenuButton(), getMenu())

      // Verify we have menu items
      const items = getMenuItems()
      expect(items).toHaveLength(3)
      items.forEach(item => assertMenuItem(item))
      assertMenuLinkedWithMenuItem(getMenu(), items[2])

      // We should be able to go down once
      await press(Keys.ArrowUp)
      assertMenuLinkedWithMenuItem(getMenu(), items[1])

      // We should be able to go down again
      await press(Keys.ArrowUp)
      assertMenuLinkedWithMenuItem(getMenu(), items[0])

      // We should NOT be able to go up again (because first item). Current implementation won't go around.
      await press(Keys.ArrowUp)
      assertMenuLinkedWithMenuItem(getMenu(), items[0])
    })
  })

  describe('`End` key', () => {
    it('should be possible to use the End key to go to the last menu item', async () => {
      renderTemplate(`
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

      const items = getMenuItems()

      // We should be on the first item
      assertMenuLinkedWithMenuItem(getMenu(), items[0])

      // We should be able to go to the last item
      await press(Keys.End)
      assertMenuLinkedWithMenuItem(getMenu(), items[2])
    })

    it('should be possible to use the End key to go to the last non disabled menu item', async () => {
      renderTemplate(`
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

      const items = getMenuItems()

      // We should be on the first item
      assertMenuLinkedWithMenuItem(getMenu(), items[0])

      // We should be able to go to the last non-disabled item
      await press(Keys.End)
      assertMenuLinkedWithMenuItem(getMenu(), items[1])
    })

    it('should be possible to use the End key to go to the first menu item if that is the only non-disabled menu item', async () => {
      renderTemplate(`
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
      assertNoActiveMenuItem(getMenu())

      // We should not be able to go to the end
      await press(Keys.End)

      const items = getMenuItems()
      assertMenuLinkedWithMenuItem(getMenu(), items[0])
    })

    it('should have no active menu item upon End key press, when there are no non-disabled menu items', async () => {
      renderTemplate(`
        <Menu>
          <MenuButton>Trigger</MenuButton>
          <MenuItems>
            <MenuItem disabled>Item A</MenuItem>
            <MenuItem disabled>Item B</MenuItem>
            <MenuItem disabled>Item C</MenuItem>
            <MenuItem disabled>Item D</MenuItem>
          </MenuItems>
        </Menu>
      `)

      // Open menu
      await click(getMenuButton())

      // We opened via click, we don't have an active item
      assertNoActiveMenuItem(getMenu())

      // We should not be able to go to the end
      await press(Keys.End)

      assertNoActiveMenuItem(getMenu())
    })
  })

  describe('`PageDown` key', () => {
    it('should be possible to use the PageDown key to go to the last menu item', async () => {
      renderTemplate(`
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

      const items = getMenuItems()

      // We should be on the first item
      assertMenuLinkedWithMenuItem(getMenu(), items[0])

      // We should be able to go to the last item
      await press(Keys.PageDown)
      assertMenuLinkedWithMenuItem(getMenu(), items[2])
    })

    it('should be possible to use the PageDown key to go to the last non disabled menu item', async () => {
      renderTemplate(`
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

      const items = getMenuItems()

      // We should be on the first item
      assertMenuLinkedWithMenuItem(getMenu(), items[0])

      // We should be able to go to the last non-disabled item
      await press(Keys.PageDown)
      assertMenuLinkedWithMenuItem(getMenu(), items[1])
    })

    it('should be possible to use the PageDown key to go to the first menu item if that is the only non-disabled menu item', async () => {
      renderTemplate(`
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
      assertNoActiveMenuItem(getMenu())

      // We should not be able to go to the end
      await press(Keys.PageDown)

      const items = getMenuItems()
      assertMenuLinkedWithMenuItem(getMenu(), items[0])
    })

    it('should have no active menu item upon PageDown key press, when there are no non-disabled menu items', async () => {
      renderTemplate(`
        <Menu>
          <MenuButton>Trigger</MenuButton>
          <MenuItems>
            <MenuItem disabled>Item A</MenuItem>
            <MenuItem disabled>Item B</MenuItem>
            <MenuItem disabled>Item C</MenuItem>
            <MenuItem disabled>Item D</MenuItem>
          </MenuItems>
        </Menu>
      `)

      // Open menu
      await click(getMenuButton())

      // We opened via click, we don't have an active item
      assertNoActiveMenuItem(getMenu())

      // We should not be able to go to the end
      await press(Keys.PageDown)

      assertNoActiveMenuItem(getMenu())
    })
  })

  describe('`Home` key', () => {
    it('should be possible to use the Home key to go to the first menu item', async () => {
      renderTemplate(`
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

      const items = getMenuItems()

      // We should be on the last item
      assertMenuLinkedWithMenuItem(getMenu(), items[2])

      // We should be able to go to the first item
      await press(Keys.Home)
      assertMenuLinkedWithMenuItem(getMenu(), items[0])
    })

    it('should be possible to use the Home key to go to the first non disabled menu item', async () => {
      renderTemplate(`
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
      assertNoActiveMenuItem(getMenu())

      // We should not be able to go to the end
      await press(Keys.Home)

      const items = getMenuItems()

      // We should be on the first non-disabled item
      assertMenuLinkedWithMenuItem(getMenu(), items[2])
    })

    it('should be possible to use the Home key to go to the last menu item if that is the only non-disabled menu item', async () => {
      renderTemplate(`
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
      assertNoActiveMenuItem(getMenu())

      // We should not be able to go to the end
      await press(Keys.Home)

      const items = getMenuItems()
      assertMenuLinkedWithMenuItem(getMenu(), items[3])
    })

    it('should have no active menu item upon Home key press, when there are no non-disabled menu items', async () => {
      renderTemplate(`
        <Menu>
          <MenuButton>Trigger</MenuButton>
          <MenuItems>
            <MenuItem disabled>Item A</MenuItem>
            <MenuItem disabled>Item B</MenuItem>
            <MenuItem disabled>Item C</MenuItem>
            <MenuItem disabled>Item D</MenuItem>
          </MenuItems>
        </Menu>
      `)

      // Open menu
      await click(getMenuButton())

      // We opened via click, we don't have an active item
      assertNoActiveMenuItem(getMenu())

      // We should not be able to go to the end
      await press(Keys.Home)

      assertNoActiveMenuItem(getMenu())
    })
  })

  describe('`PageUp` key', () => {
    it('should be possible to use the PageUp key to go to the first menu item', async () => {
      renderTemplate(`
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

      const items = getMenuItems()

      // We should be on the last item
      assertMenuLinkedWithMenuItem(getMenu(), items[2])

      // We should be able to go to the first item
      await press(Keys.PageUp)
      assertMenuLinkedWithMenuItem(getMenu(), items[0])
    })

    it('should be possible to use the PageUp key to go to the first non disabled menu item', async () => {
      renderTemplate(`
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
      assertNoActiveMenuItem(getMenu())

      // We should not be able to go to the end
      await press(Keys.PageUp)

      const items = getMenuItems()

      // We should be on the first non-disabled item
      assertMenuLinkedWithMenuItem(getMenu(), items[2])
    })

    it('should be possible to use the PageUp key to go to the last menu item if that is the only non-disabled menu item', async () => {
      renderTemplate(`
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
      assertNoActiveMenuItem(getMenu())

      // We should not be able to go to the end
      await press(Keys.PageUp)

      const items = getMenuItems()
      assertMenuLinkedWithMenuItem(getMenu(), items[3])
    })

    it('should have no active menu item upon PageUp key press, when there are no non-disabled menu items', async () => {
      renderTemplate(`
        <Menu>
          <MenuButton>Trigger</MenuButton>
          <MenuItems>
            <MenuItem disabled>Item A</MenuItem>
            <MenuItem disabled>Item B</MenuItem>
            <MenuItem disabled>Item C</MenuItem>
            <MenuItem disabled>Item D</MenuItem>
          </MenuItems>
        </Menu>
      `)

      // Open menu
      await click(getMenuButton())

      // We opened via click, we don't have an active item
      assertNoActiveMenuItem(getMenu())

      // We should not be able to go to the end
      await press(Keys.PageUp)

      assertNoActiveMenuItem(getMenu())
    })
  })

  describe('`Any` key aka search', () => {
    it('should be possible to type a full word that has a perfect match', async () => {
      renderTemplate(`
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

      const items = getMenuItems()

      // We should be able to go to the second item
      await type(word('bob'))
      assertMenuLinkedWithMenuItem(getMenu(), items[1])

      // We should be able to go to the first item
      await type(word('alice'))
      assertMenuLinkedWithMenuItem(getMenu(), items[0])

      // We should be able to go to the last item
      await type(word('charlie'))
      assertMenuLinkedWithMenuItem(getMenu(), items[2])
    })

    it('should be possible to type a partial of a word', async () => {
      renderTemplate(`
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

      const items = getMenuItems()

      // We should be on the last item
      assertMenuLinkedWithMenuItem(getMenu(), items[2])

      // We should be able to go to the second item
      await type(word('bo'))
      assertMenuLinkedWithMenuItem(getMenu(), items[1])

      // We should be able to go to the first item
      await type(word('ali'))
      assertMenuLinkedWithMenuItem(getMenu(), items[0])

      // We should be able to go to the last item
      await type(word('char'))
      assertMenuLinkedWithMenuItem(getMenu(), items[2])
    })

    it('should not be possible to search for a disabled item', async () => {
      renderTemplate(`
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

      const items = getMenuItems()

      // We should be on the last item
      assertMenuLinkedWithMenuItem(getMenu(), items[2])

      // We should not be able to go to the disabled item
      await type(word('bo'))

      // We should still be on the last item
      assertMenuLinkedWithMenuItem(getMenu(), items[2])
    })
  })
})

describe('Mouse interactions', () => {
  it('should be possible to open a menu on click', async () => {
    renderTemplate(`
      <Menu>
        <MenuButton>Trigger</MenuButton>
        <MenuItems>
          <MenuItem as="a">Item A</MenuItem>
          <MenuItem as="a">Item B</MenuItem>
          <MenuItem as="a">Item C</MenuItem>
        </MenuItems>
      </Menu>
    `)

    assertMenuButton(getMenuButton(), {
      state: MenuButtonState.Closed,
      attributes: { id: 'headlessui-menu-button-1' },
    })
    assertMenu(getMenu(), { state: MenuState.Closed })

    // Open menu
    await click(getMenuButton())

    // Verify it is open
    assertMenuButton(getMenuButton(), { state: MenuButtonState.Open })
    assertMenu(getMenu(), {
      state: MenuState.Open,
      attributes: { id: 'headlessui-menu-items-2' },
    })
    assertMenuButtonLinkedWithMenu(getMenuButton(), getMenu())

    // Verify we have menu items
    const items = getMenuItems()
    expect(items).toHaveLength(3)
    items.forEach(item => assertMenuItem(item))
  })

  it('should be possible to close a menu on click', async () => {
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

    // Open menu
    await click(getMenuButton())

    // Verify it is open
    assertMenuButton(getMenuButton(), { state: MenuButtonState.Open })

    // Click to close
    await click(getMenuButton())

    // Verify it is closed
    assertMenuButton(getMenuButton(), { state: MenuButtonState.Closed })
    assertMenu(getMenu(), { state: MenuState.Closed })
  })

  it('should focus the menu when you try to focus the button again (when the menu is already open)', async () => {
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

    // Open menu
    await click(getMenuButton())

    // Verify menu is focused
    assertActiveElement(getMenu())

    // Try to Re-focus the button
    getMenuButton()?.focus()

    // Verify menu is still focused
    assertActiveElement(getMenu())
  })

  it('should be a no-op when we click outside of a closed menu', async () => {
    renderTemplate(`
      <Menu>
        <MenuButton>Trigger</MenuButton>
        <MenuItems>
          <MenuItem>alice</MenuItem>
          <MenuItem>bob</MenuItem>
          <MenuItem>charlie</MenuItem>
        </MenuItems>
      </Menu>
    `)

    // Verify that the window is closed
    assertMenu(getMenu(), { state: MenuState.Closed })

    // Click something that is not related to the menu
    await click(document.body)

    // Should still be closed
    assertMenu(getMenu(), { state: MenuState.Closed })
  })

  it('should be possible to click outside of the menu which should close the menu', async () => {
    renderTemplate(`
      <Menu>
        <MenuButton>Trigger</MenuButton>
        <MenuItems>
          <MenuItem>alice</MenuItem>
          <MenuItem>bob</MenuItem>
          <MenuItem>charlie</MenuItem>
        </MenuItems>
      </Menu>
    `)

    // Open menu
    await click(getMenuButton())
    assertMenu(getMenu(), { state: MenuState.Open })

    // Click something that is not related to the menu
    await click(document.body)

    // Should be closed now
    assertMenu(getMenu(), { state: MenuState.Closed })
  })

  it('should be possible to click outside of the menu which should close the menu (even if we press the menu button)', async () => {
    renderTemplate(`
      <Menu>
        <MenuButton>Trigger</MenuButton>
        <MenuItems>
          <MenuItem>alice</MenuItem>
          <MenuItem>bob</MenuItem>
          <MenuItem>charlie</MenuItem>
        </MenuItems>
      </Menu>
    `)

    // Open menu
    await click(getMenuButton())
    assertMenu(getMenu(), { state: MenuState.Open })

    // Click the menu button again
    await click(getMenuButton())

    // Should be closed now
    assertMenu(getMenu(), { state: MenuState.Closed })
  })

  it('should be possible to hover an item and make it active', async () => {
    renderTemplate(`
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

    const items = getMenuItems()
    // We should be able to go to the second item
    await hover(items[1])
    assertMenuLinkedWithMenuItem(getMenu(), items[1])

    // We should be able to go to the first item
    await hover(items[0])
    assertMenuLinkedWithMenuItem(getMenu(), items[0])

    // We should be able to go to the last item
    await hover(items[2])
    assertMenuLinkedWithMenuItem(getMenu(), items[2])
  })

  it('should make a menu item active when you move the mouse over it', async () => {
    renderTemplate(`
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

    const items = getMenuItems()
    // We should be able to go to the second item
    await mouseMove(items[1])
    assertMenuLinkedWithMenuItem(getMenu(), items[1])
  })

  it('should be a no-op when we move the mouse and the menu item is already active', async () => {
    renderTemplate(`
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

    const items = getMenuItems()

    // We should be able to go to the second item
    await mouseMove(items[1])
    assertMenuLinkedWithMenuItem(getMenu(), items[1])

    await mouseMove(items[1])

    // Nothing should be changed
    assertMenuLinkedWithMenuItem(getMenu(), items[1])
  })

  it('should be a no-op when we move the mouse and the menu item is disabled', async () => {
    renderTemplate(`
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

    const items = getMenuItems()

    await mouseMove(items[1])
    assertNoActiveMenuItem(getMenu())
  })

  it('should not be possible to hover an item that is disabled', async () => {
    renderTemplate(`
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

    const items = getMenuItems()

    // Try to hover over item 1, which is disabled
    await hover(items[1])

    // We should not have an active item now
    assertNoActiveMenuItem(getMenu())
  })

  it('should be possible to mouse leave an item and make it inactive', async () => {
    renderTemplate(`
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

    const items = getMenuItems()

    // We should be able to go to the second item
    await hover(items[1])
    assertMenuLinkedWithMenuItem(getMenu(), items[1])

    await unHover(items[1])
    assertNoActiveMenuItem(getMenu())

    // We should be able to go to the first item
    await hover(items[0])
    assertMenuLinkedWithMenuItem(getMenu(), items[0])

    await unHover(items[0])
    assertNoActiveMenuItem(getMenu())

    // We should be able to go to the last item
    await hover(items[2])
    assertMenuLinkedWithMenuItem(getMenu(), items[2])

    await unHover(items[2])
    assertNoActiveMenuItem(getMenu())
  })

  it('should be possible to mouse leave a disabled item and be a no-op', async () => {
    renderTemplate(`
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

    const items = getMenuItems()

    // Try to hover over item 1, which is disabled
    await hover(items[1])
    assertNoActiveMenuItem(getMenu())

    await unHover(items[1])
    assertNoActiveMenuItem(getMenu())
  })

  it('should be possible to click a menu item, which closes the menu', async () => {
    const clickHandler = jest.fn()
    renderTemplate({
      template: `
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
    assertMenu(getMenu(), { state: MenuState.Open })

    const items = getMenuItems()

    // We should be able to click the first item
    await click(items[1])
    assertMenu(getMenu(), { state: MenuState.Closed })
    expect(clickHandler).toHaveBeenCalled()
  })

  it('should be possible to click a menu item, which closes the menu and invokes the @click handler', async () => {
    const clickHandler = jest.fn()
    renderTemplate({
      template: `
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
    assertMenu(getMenu(), { state: MenuState.Open })

    // We should be able to click the first item
    await click(getMenuItems()[1])
    assertMenu(getMenu(), { state: MenuState.Closed })

    // Verify the callback has been called
    expect(clickHandler).toHaveBeenCalledTimes(1)

    // Let's re-open the window for now
    await click(getMenuButton())

    // Click the last item, which should close and invoke the handler
    await click(getMenuItems()[2])
    assertMenu(getMenu(), { state: MenuState.Closed })

    // Verify the callback has been called
    expect(clickHandler).toHaveBeenCalledTimes(2)
  })

  it('should be possible to click a disabled menu item, which is a no-op', async () => {
    renderTemplate(`
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
    assertMenu(getMenu(), { state: MenuState.Open })

    const items = getMenuItems()

    // We should be able to click the first item
    await click(items[1])
    assertMenu(getMenu(), { state: MenuState.Open })
  })

  it('should be possible focus a menu item, so that it becomes active', async () => {
    renderTemplate(`
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
    assertMenu(getMenu(), { state: MenuState.Open })

    const items = getMenuItems()

    // Verify that nothing is active yet
    assertNoActiveMenuItem(getMenu())

    // We should be able to focus the first item
    await focus(items[1])
    assertMenuLinkedWithMenuItem(getMenu(), items[1])
  })

  it('should not be possible to focus a menu item which is disabled', async () => {
    renderTemplate(`
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
    assertMenu(getMenu(), { state: MenuState.Open })

    const items = getMenuItems()

    // We should not be able to focus the first item
    await focus(items[1])
    assertNoActiveMenuItem(getMenu())
  })

  it('should not be possible to activate a disabled item', async () => {
    const clickHandler = jest.fn()

    renderTemplate({
      template: `
        <Menu>
          <MenuButton>Trigger</MenuButton>
          <MenuItems>
            <MenuItem as="a" @click="clickHandler">alice</MenuItem>
            <MenuItem as="a" @click="clickHandler" disabled>
              bob
            </MenuItem>
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
    assertMenu(getMenu(), { state: MenuState.Open })

    const items = getMenuItems()

    await focus(items[0])
    await focus(items[1])
    await press(Keys.Enter)
    expect(clickHandler).not.toHaveBeenCalled()

    // Activate the last item
    await focus(items[2])
    await press(Keys.Enter)
    expect(clickHandler).not.toHaveBeenCalled()
  })
})
