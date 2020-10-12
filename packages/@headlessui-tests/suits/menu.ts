import { createTestSuit } from '../create-test-suit'
import { suppressConsoleLogs } from '../utils/suppress-console-logs'
import {
  MenuState,
  assertMenu,
  assertMenuButton,
  assertMenuButtonLinkedWithMenu,
  assertMenuItem,
  assertMenuLinkedWithMenuItem,
  assertActiveElement,
  assertNoActiveMenuItem,
  getMenuButton,
  getMenuButtons,
  getMenu,
  getMenus,
  getMenuItems,
} from '../accessibility-assertions'
import {
  click,
  focus,
  mouseMove,
  mouseLeave,
  press,
  shift,
  type,
  word,
  Keys,
} from '../interactions'

enum Scenarios {
  Default,
  LastItemButton,
  MultipleMenus,
}

export const menu = createTestSuit(Scenarios, ({ use }) => {
  describe('Keyboard interactions', () => {
    describe('`Enter` key', () => {
      it(
        'should be possible to open the menu with Enter',
        suppressConsoleLogs(async () => {
          use(Scenarios.Default, {
            button: { children: 'Trigger' },
            items: [
              { as: 'a', children: 'Item A' },
              { as: 'a', children: 'Item B' },
              { as: 'a', children: 'Item C' },
            ],
          })

          assertMenuButton({
            state: MenuState.Closed,
            attributes: { id: 'headlessui-menu-button-1' },
          })
          assertMenu({ state: MenuState.Closed })

          // Focus the button
          getMenuButton()?.focus()

          // Open menu
          await press(Keys.Enter)

          // Verify it is open
          assertMenuButton({ state: MenuState.Open })
          assertMenu({
            state: MenuState.Open,
            attributes: { id: 'headlessui-menu-items-2' },
          })
          assertMenuButtonLinkedWithMenu()

          // Verify we have menu items
          const items = getMenuItems()
          expect(items).toHaveLength(3)
          items.forEach(item => assertMenuItem(item))

          // Verify that the first menu item is active
          assertMenuLinkedWithMenuItem(items[0])
        })
      )

      it(
        'should not be possible to open the menu with Enter when the button is disabled',
        suppressConsoleLogs(async () => {
          use(Scenarios.Default, {
            button: { children: 'Trigger', disabled: true },
            items: [
              { as: 'a', children: 'Item A' },
              { as: 'a', children: 'Item B' },
              { as: 'a', children: 'Item C' },
            ],
          })

          assertMenuButton({
            state: MenuState.Closed,
            attributes: { id: 'headlessui-menu-button-1' },
          })
          assertMenu({ state: MenuState.Closed })

          // Focus the button
          getMenuButton()?.focus()

          // Try to open the menu
          await press(Keys.Enter)

          // Verify it is still closed
          assertMenuButton({
            state: MenuState.Closed,
            attributes: { id: 'headlessui-menu-button-1' },
          })
          assertMenu({ state: MenuState.Closed })
        })
      )

      it(
        'should have no active menu item when there are no menu items at all',
        suppressConsoleLogs(async () => {
          use(Scenarios.Default, {
            button: { children: 'Trigger' },
            items: [],
          })

          assertMenu({ state: MenuState.Closed })

          // Focus the button
          getMenuButton()?.focus()

          // Open menu
          await press(Keys.Enter)
          assertMenu({ state: MenuState.Open })

          assertNoActiveMenuItem()
        })
      )

      it(
        'should focus the first non disabled menu item when opening with Enter',
        suppressConsoleLogs(async () => {
          use(Scenarios.Default, {
            button: { children: 'Trigger' },
            items: [
              { as: 'a', children: 'Item A', disabled: true },
              { as: 'a', children: 'Item B' },
              { as: 'a', children: 'Item C' },
            ],
          })

          assertMenuButton({
            state: MenuState.Closed,
            attributes: { id: 'headlessui-menu-button-1' },
          })
          assertMenu({ state: MenuState.Closed })

          // Focus the button
          getMenuButton()?.focus()

          // Open menu
          await press(Keys.Enter)

          const items = getMenuItems()

          // Verify that the first non-disabled menu item is active
          assertMenuLinkedWithMenuItem(items[1])
        })
      )

      it(
        'should focus the first non disabled menu item when opening with Enter (jump over multiple disabled ones)',
        suppressConsoleLogs(async () => {
          use(Scenarios.Default, {
            button: { children: 'Trigger' },
            items: [
              { as: 'a', children: 'Item A', disabled: true },
              { as: 'a', children: 'Item B', disabled: true },
              { as: 'a', children: 'Item C' },
            ],
          })

          assertMenuButton({
            state: MenuState.Closed,
            attributes: { id: 'headlessui-menu-button-1' },
          })
          assertMenu({ state: MenuState.Closed })

          // Focus the button
          getMenuButton()?.focus()

          // Open menu
          await press(Keys.Enter)

          const items = getMenuItems()

          // Verify that the first non-disabled menu item is active
          assertMenuLinkedWithMenuItem(items[2])
        })
      )

      it(
        'should have no active menu item upon Enter key press, when there are no non-disabled menu items',
        suppressConsoleLogs(async () => {
          use(Scenarios.Default, {
            button: { children: 'Trigger' },
            items: [
              { as: 'a', children: 'Item A', disabled: true },
              { as: 'a', children: 'Item B', disabled: true },
              { as: 'a', children: 'Item C', disabled: true },
            ],
          })

          assertMenuButton({
            state: MenuState.Closed,
            attributes: { id: 'headlessui-menu-button-1' },
          })
          assertMenu({ state: MenuState.Closed })

          // Focus the button
          getMenuButton()?.focus()

          // Open menu
          await press(Keys.Enter)

          assertNoActiveMenuItem()
        })
      )

      it(
        'should be possible to close the menu with Enter when there is no active menuitem',
        suppressConsoleLogs(async () => {
          use(Scenarios.Default, {
            button: { children: 'Trigger' },
            items: [
              { as: 'a', children: 'Item A' },
              { as: 'a', children: 'Item B' },
              { as: 'a', children: 'Item C' },
            ],
          })

          assertMenuButton({
            state: MenuState.Closed,
            attributes: { id: 'headlessui-menu-button-1' },
          })
          assertMenu({ state: MenuState.Closed })

          // Open menu
          await click(getMenuButton())

          // Verify it is open
          assertMenuButton({ state: MenuState.Open })

          // Close menu
          await press(Keys.Enter)

          // Verify it is closed
          assertMenuButton({ state: MenuState.Closed })
          assertMenu({ state: MenuState.Closed })

          // Verify the button is focused again
          assertActiveElement(getMenuButton())
        })
      )

      it(
        'should be possible to close the menu with Enter and invoke the active menu item',
        suppressConsoleLogs(async () => {
          const clickHandler = jest.fn()
          use(Scenarios.Default, {
            button: { children: 'Trigger' },
            items: [
              { as: 'a', children: 'Item A', onClick: clickHandler },
              { as: 'a', children: 'Item B' },
              { as: 'a', children: 'Item C' },
            ],
          })

          assertMenuButton({
            state: MenuState.Closed,
            attributes: { id: 'headlessui-menu-button-1' },
          })
          assertMenu({ state: MenuState.Closed })

          // Open menu
          await click(getMenuButton())

          // Verify it is open
          assertMenuButton({ state: MenuState.Open })

          // Activate the first menu item
          const items = getMenuItems()
          await mouseMove(items[0])

          // Close menu, and invoke the item
          await press(Keys.Enter)

          // Verify it is closed
          assertMenuButton({ state: MenuState.Closed })
          assertMenu({ state: MenuState.Closed })

          // Verify the button is focused again
          assertActiveElement(getMenuButton())

          // Verify the "click" went through on the `a` tag
          expect(clickHandler).toHaveBeenCalled()
        })
      )

      it(
        'should be possible to use a button as a menu item and invoke it upon Enter',
        suppressConsoleLogs(async () => {
          const clickHandler = jest.fn()
          use(Scenarios.LastItemButton, {
            button: { children: 'Trigger' },
            items: [
              { as: 'a', children: 'Item A' },
              { as: 'button', children: 'Item B', onClick: clickHandler },
            ],
            lastItem: {
              props: {},
              onClick: clickHandler,
              children: 'Item C',
            },
          })

          assertMenuButton({
            state: MenuState.Closed,
            attributes: { id: 'headlessui-menu-button-1' },
          })
          assertMenu({ state: MenuState.Closed })

          // Open menu
          await click(getMenuButton())

          // Verify it is open
          assertMenuButton({ state: MenuState.Open })

          // Activate the second menu item
          const items = getMenuItems()
          await mouseMove(items[1])

          // Close menu, and invoke the item
          await press(Keys.Enter)

          // Verify it is closed
          assertMenuButton({ state: MenuState.Closed })
          assertMenu({ state: MenuState.Closed })

          // Verify the button got "clicked"
          expect(clickHandler).toHaveBeenCalledTimes(1)

          // Verify the button is focused again
          assertActiveElement(getMenuButton())

          // Click the menu button again
          await click(getMenuButton())

          // Active the last menu item
          await mouseMove(getMenuItems()[2])

          // Close menu, and invoke the item
          await press(Keys.Enter)

          // Verify the button got "clicked"
          expect(clickHandler).toHaveBeenCalledTimes(2)

          // Verify the button is focused again
          assertActiveElement(getMenuButton())
        })
      )
    })

    describe('`Space` key', () => {
      it(
        'should be possible to open the menu with Space',
        suppressConsoleLogs(async () => {
          use(Scenarios.Default, {
            button: { children: 'Trigger' },
            items: [
              { as: 'a', children: 'Item A' },
              { as: 'a', children: 'Item B' },
              { as: 'a', children: 'Item C' },
            ],
          })

          assertMenuButton({
            state: MenuState.Closed,
            attributes: { id: 'headlessui-menu-button-1' },
          })
          assertMenu({ state: MenuState.Closed })

          // Focus the button
          getMenuButton()?.focus()

          // Open menu
          await press(Keys.Space)

          // Verify it is open
          assertMenuButton({ state: MenuState.Open })
          assertMenu({
            state: MenuState.Open,
            attributes: { id: 'headlessui-menu-items-2' },
          })
          assertMenuButtonLinkedWithMenu()

          // Verify we have menu items
          const items = getMenuItems()
          expect(items).toHaveLength(3)
          items.forEach(item => assertMenuItem(item))
          assertMenuLinkedWithMenuItem(items[0])
        })
      )

      it(
        'should not be possible to open the menu with Space when the button is disabled',
        suppressConsoleLogs(async () => {
          use(Scenarios.Default, {
            button: { children: 'Trigger', disabled: true },
            items: [
              { as: 'a', children: 'Item A' },
              { as: 'a', children: 'Item B' },
              { as: 'a', children: 'Item C' },
            ],
          })

          assertMenuButton({
            state: MenuState.Closed,
            attributes: { id: 'headlessui-menu-button-1' },
          })
          assertMenu({ state: MenuState.Closed })

          // Focus the button
          getMenuButton()?.focus()

          // Try to open the menu
          await press(Keys.Space)

          // Verify it is still closed
          assertMenuButton({
            state: MenuState.Closed,
            attributes: { id: 'headlessui-menu-button-1' },
          })
          assertMenu({ state: MenuState.Closed })
        })
      )

      it(
        'should have no active menu item when there are no menu items at all',
        suppressConsoleLogs(async () => {
          use(Scenarios.Default, {
            button: { children: 'Trigger' },
            items: [],
          })

          assertMenu({ state: MenuState.Closed })

          // Focus the button
          getMenuButton()?.focus()

          // Open menu
          await press(Keys.Space)
          assertMenu({ state: MenuState.Open })

          assertNoActiveMenuItem()
        })
      )

      it(
        'should focus the first non disabled menu item when opening with Space',
        suppressConsoleLogs(async () => {
          use(Scenarios.Default, {
            button: { children: 'Trigger' },
            items: [
              { as: 'a', children: 'Item A', disabled: true },
              { as: 'a', children: 'Item B' },
              { as: 'a', children: 'Item C' },
            ],
          })

          assertMenuButton({
            state: MenuState.Closed,
            attributes: { id: 'headlessui-menu-button-1' },
          })
          assertMenu({ state: MenuState.Closed })

          // Focus the button
          getMenuButton()?.focus()

          // Open menu
          await press(Keys.Space)

          const items = getMenuItems()

          // Verify that the first non-disabled menu item is active
          assertMenuLinkedWithMenuItem(items[1])
        })
      )

      it(
        'should focus the first non disabled menu item when opening with Space (jump over multiple disabled ones)',
        suppressConsoleLogs(async () => {
          use(Scenarios.Default, {
            button: { children: 'Trigger' },
            items: [
              { as: 'a', children: 'Item A', disabled: true },
              { as: 'a', children: 'Item B', disabled: true },
              { as: 'a', children: 'Item C' },
            ],
          })

          assertMenuButton({
            state: MenuState.Closed,
            attributes: { id: 'headlessui-menu-button-1' },
          })
          assertMenu({ state: MenuState.Closed })

          // Focus the button
          getMenuButton()?.focus()

          // Open menu
          await press(Keys.Space)

          const items = getMenuItems()

          // Verify that the first non-disabled menu item is active
          assertMenuLinkedWithMenuItem(items[2])
        })
      )

      it(
        'should have no active menu item upon Space key press, when there are no non-disabled menu items',
        suppressConsoleLogs(async () => {
          use(Scenarios.Default, {
            button: { children: 'Trigger' },
            items: [
              { as: 'a', children: 'Item A', disabled: true },
              { as: 'a', children: 'Item B', disabled: true },
              { as: 'a', children: 'Item C', disabled: true },
            ],
          })

          assertMenuButton({
            state: MenuState.Closed,
            attributes: { id: 'headlessui-menu-button-1' },
          })
          assertMenu({ state: MenuState.Closed })

          // Focus the button
          getMenuButton()?.focus()

          // Open menu
          await press(Keys.Space)

          assertNoActiveMenuItem()
        })
      )

      it(
        'should be possible to close the menu with Space when there is no active menuitem',
        suppressConsoleLogs(async () => {
          use(Scenarios.Default, {
            button: { children: 'Trigger' },
            items: [
              { as: 'a', children: 'Item A' },
              { as: 'a', children: 'Item B' },
              { as: 'a', children: 'Item C' },
            ],
          })

          assertMenuButton({
            state: MenuState.Closed,
            attributes: { id: 'headlessui-menu-button-1' },
          })
          assertMenu({ state: MenuState.Closed })

          // Open menu
          await click(getMenuButton())

          // Verify it is open
          assertMenuButton({ state: MenuState.Open })

          // Close menu
          await press(Keys.Space)

          // Verify it is closed
          assertMenuButton({ state: MenuState.Closed })
          assertMenu({ state: MenuState.Closed })

          // Verify the button is focused again
          assertActiveElement(getMenuButton())
        })
      )

      it(
        'should be possible to close the menu with Space and invoke the active menu item',
        suppressConsoleLogs(async () => {
          const clickHandler = jest.fn()
          use(Scenarios.Default, {
            button: { children: 'Trigger' },
            items: [
              { as: 'a', children: 'Item A', onClick: clickHandler },
              { as: 'a', children: 'Item B' },
              { as: 'a', children: 'Item C' },
            ],
          })

          assertMenuButton({
            state: MenuState.Closed,
            attributes: { id: 'headlessui-menu-button-1' },
          })
          assertMenu({ state: MenuState.Closed })

          // Open menu
          await click(getMenuButton())

          // Verify it is open
          assertMenuButton({ state: MenuState.Open })

          // Activate the first menu item
          const items = getMenuItems()
          await mouseMove(items[0])

          // Close menu, and invoke the item
          await press(Keys.Space)

          // Verify it is closed
          assertMenuButton({ state: MenuState.Closed })
          assertMenu({ state: MenuState.Closed })

          // Verify the "click" went through on the `a` tag
          expect(clickHandler).toHaveBeenCalled()

          // Verify the button is focused again
          assertActiveElement(getMenuButton())
        })
      )
    })

    describe('`Escape` key', () => {
      it(
        'should be possible to close an open menu with Escape',
        suppressConsoleLogs(async () => {
          use(Scenarios.Default, {
            button: { children: 'Trigger' },
            items: [
              { as: 'a', children: 'Item A' },
              { as: 'a', children: 'Item B' },
              { as: 'a', children: 'Item C' },
            ],
          })

          // Focus the button
          getMenuButton()?.focus()

          // Open menu
          await press(Keys.Space)

          // Verify it is open
          assertMenuButton({ state: MenuState.Open })
          assertMenu({
            state: MenuState.Open,
            attributes: { id: 'headlessui-menu-items-2' },
          })
          assertMenuButtonLinkedWithMenu()

          // Close menu
          await press(Keys.Escape)

          // Verify it is closed
          assertMenuButton({ state: MenuState.Closed })
          assertMenu({ state: MenuState.Closed })

          // Verify the button is focused again
          assertActiveElement(getMenuButton())
        })
      )
    })

    describe('`Tab` key', () => {
      it(
        'should focus trap when we use Tab',
        suppressConsoleLogs(async () => {
          use(Scenarios.Default, {
            button: { children: 'Trigger' },
            items: [
              { as: 'a', children: 'Item A' },
              { as: 'a', children: 'Item B' },
              { as: 'a', children: 'Item C' },
            ],
          })

          assertMenuButton({
            state: MenuState.Closed,
            attributes: { id: 'headlessui-menu-button-1' },
          })
          assertMenu({ state: MenuState.Closed })

          // Focus the button
          getMenuButton()?.focus()

          // Open menu
          await press(Keys.Enter)

          // Verify it is open
          assertMenuButton({ state: MenuState.Open })
          assertMenu({
            state: MenuState.Open,
            attributes: { id: 'headlessui-menu-items-2' },
          })
          assertMenuButtonLinkedWithMenu()

          // Verify we have menu items
          const items = getMenuItems()
          expect(items).toHaveLength(3)
          items.forEach(item => assertMenuItem(item))
          assertMenuLinkedWithMenuItem(items[0])

          // Try to tab
          await press(Keys.Tab)

          // Verify it is still open
          assertMenuButton({ state: MenuState.Open })
          assertMenu({ state: MenuState.Open })
        })
      )

      it(
        'should focus trap when we use Shift+Tab',
        suppressConsoleLogs(async () => {
          use(Scenarios.Default, {
            button: { children: 'Trigger' },
            items: [
              { as: 'a', children: 'Item A' },
              { as: 'a', children: 'Item B' },
              { as: 'a', children: 'Item C' },
            ],
          })

          assertMenuButton({
            state: MenuState.Closed,
            attributes: { id: 'headlessui-menu-button-1' },
          })
          assertMenu({ state: MenuState.Closed })

          // Focus the button
          getMenuButton()?.focus()

          // Open menu
          await press(Keys.Enter)

          // Verify it is open
          assertMenuButton({ state: MenuState.Open })
          assertMenu({
            state: MenuState.Open,
            attributes: { id: 'headlessui-menu-items-2' },
          })
          assertMenuButtonLinkedWithMenu()

          // Verify we have menu items
          const items = getMenuItems()
          expect(items).toHaveLength(3)
          items.forEach(item => assertMenuItem(item))
          assertMenuLinkedWithMenuItem(items[0])

          // Try to Shift+Tab
          await press(shift(Keys.Tab))

          // Verify it is still open
          assertMenuButton({ state: MenuState.Open })
          assertMenu({ state: MenuState.Open })
        })
      )
    })

    describe('`ArrowDown` key', () => {
      it(
        'should be possible to open the menu with ArrowDown',
        suppressConsoleLogs(async () => {
          use(Scenarios.Default, {
            button: { children: 'Trigger' },
            items: [
              { as: 'a', children: 'Item A' },
              { as: 'a', children: 'Item B' },
              { as: 'a', children: 'Item C' },
            ],
          })

          assertMenuButton({
            state: MenuState.Closed,
            attributes: { id: 'headlessui-menu-button-1' },
          })
          assertMenu({ state: MenuState.Closed })

          // Focus the button
          getMenuButton()?.focus()

          // Open menu
          await press(Keys.ArrowDown)

          // Verify it is open
          assertMenuButton({ state: MenuState.Open })
          assertMenu({
            state: MenuState.Open,
            attributes: { id: 'headlessui-menu-items-2' },
          })
          assertMenuButtonLinkedWithMenu()

          // Verify we have menu items
          const items = getMenuItems()
          expect(items).toHaveLength(3)
          items.forEach(item => assertMenuItem(item))

          // Verify that the first menu item is active
          assertMenuLinkedWithMenuItem(items[0])
        })
      )

      it(
        'should not be possible to open the menu with ArrowDown when the button is disabled',
        suppressConsoleLogs(async () => {
          use(Scenarios.Default, {
            button: { children: 'Trigger', disabled: true },
            items: [
              { as: 'a', children: 'Item A' },
              { as: 'a', children: 'Item B' },
              { as: 'a', children: 'Item C' },
            ],
          })

          assertMenuButton({
            state: MenuState.Closed,
            attributes: { id: 'headlessui-menu-button-1' },
          })
          assertMenu({ state: MenuState.Closed })

          // Focus the button
          getMenuButton()?.focus()

          // Try to open the menu
          await press(Keys.ArrowDown)

          // Verify it is still closed
          assertMenuButton({
            state: MenuState.Closed,
            attributes: { id: 'headlessui-menu-button-1' },
          })
          assertMenu({ state: MenuState.Closed })
        })
      )

      it(
        'should have no active menu item when there are no menu items at all',
        suppressConsoleLogs(async () => {
          use(Scenarios.Default, {
            button: { children: 'Trigger' },
            items: [],
          })

          assertMenu({ state: MenuState.Closed })

          // Focus the button
          getMenuButton()?.focus()

          // Open menu
          await press(Keys.ArrowDown)
          assertMenu({ state: MenuState.Open })

          assertNoActiveMenuItem()
        })
      )

      it(
        'should be possible to use ArrowDown to navigate the menu items',
        suppressConsoleLogs(async () => {
          use(Scenarios.Default, {
            button: { children: 'Trigger' },
            items: [
              { as: 'a', children: 'Item A' },
              { as: 'a', children: 'Item B' },
              { as: 'a', children: 'Item C' },
            ],
          })

          assertMenuButton({
            state: MenuState.Closed,
            attributes: { id: 'headlessui-menu-button-1' },
          })
          assertMenu({ state: MenuState.Closed })

          // Focus the button
          getMenuButton()?.focus()

          // Open menu
          await press(Keys.Enter)

          // Verify we have menu items
          const items = getMenuItems()
          expect(items).toHaveLength(3)
          items.forEach(item => assertMenuItem(item))
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
      )

      it(
        'should be possible to use ArrowDown to navigate the menu items and skip the first disabled one',
        suppressConsoleLogs(async () => {
          use(Scenarios.Default, {
            button: { children: 'Trigger' },
            items: [
              { as: 'a', children: 'Item A', disabled: true },
              { as: 'a', children: 'Item B' },
              { as: 'a', children: 'Item C' },
            ],
          })

          assertMenuButton({
            state: MenuState.Closed,
            attributes: { id: 'headlessui-menu-button-1' },
          })
          assertMenu({ state: MenuState.Closed })

          // Focus the button
          getMenuButton()?.focus()

          // Open menu
          await press(Keys.Enter)

          // Verify we have menu items
          const items = getMenuItems()
          expect(items).toHaveLength(3)
          items.forEach(item => assertMenuItem(item))
          assertMenuLinkedWithMenuItem(items[1])

          // We should be able to go down once
          await press(Keys.ArrowDown)
          assertMenuLinkedWithMenuItem(items[2])
        })
      )

      it(
        'should be possible to use ArrowDown to navigate the menu items and jump to the first non-disabled one',
        suppressConsoleLogs(async () => {
          use(Scenarios.Default, {
            button: { children: 'Trigger' },
            items: [
              { as: 'a', children: 'Item A', disabled: true },
              { as: 'a', children: 'Item B', disabled: true },
              { as: 'a', children: 'Item C' },
            ],
          })

          assertMenuButton({
            state: MenuState.Closed,
            attributes: { id: 'headlessui-menu-button-1' },
          })
          assertMenu({ state: MenuState.Closed })

          // Focus the button
          getMenuButton()?.focus()

          // Open menu
          await press(Keys.Enter)

          // Verify we have menu items
          const items = getMenuItems()
          expect(items).toHaveLength(3)
          items.forEach(item => assertMenuItem(item))
          assertMenuLinkedWithMenuItem(items[2])
        })
      )
    })

    describe('`ArrowUp` key', () => {
      it(
        'should be possible to open the menu with ArrowUp and the last item should be active',
        suppressConsoleLogs(async () => {
          use(Scenarios.Default, {
            button: { children: 'Trigger' },
            items: [
              { as: 'a', children: 'Item A' },
              { as: 'a', children: 'Item B' },
              { as: 'a', children: 'Item C' },
            ],
          })

          assertMenuButton({
            state: MenuState.Closed,
            attributes: { id: 'headlessui-menu-button-1' },
          })
          assertMenu({ state: MenuState.Closed })

          // Focus the button
          getMenuButton()?.focus()

          // Open menu
          await press(Keys.ArrowUp)

          // Verify it is open
          assertMenuButton({ state: MenuState.Open })
          assertMenu({
            state: MenuState.Open,
            attributes: { id: 'headlessui-menu-items-2' },
          })
          assertMenuButtonLinkedWithMenu()

          // Verify we have menu items
          const items = getMenuItems()
          expect(items).toHaveLength(3)
          items.forEach(item => assertMenuItem(item))

          // ! ALERT: The LAST item should now be active
          assertMenuLinkedWithMenuItem(items[2])
        })
      )

      it(
        'should not be possible to open the menu with ArrowUp and the last item should be active when the button is disabled',
        suppressConsoleLogs(async () => {
          use(Scenarios.Default, {
            button: { children: 'Trigger', disabled: true },
            items: [
              { as: 'a', children: 'Item A' },
              { as: 'a', children: 'Item B' },
              { as: 'a', children: 'Item C' },
            ],
          })

          assertMenuButton({
            state: MenuState.Closed,
            attributes: { id: 'headlessui-menu-button-1' },
          })
          assertMenu({ state: MenuState.Closed })

          // Focus the button
          getMenuButton()?.focus()

          // Try to open the menu
          await press(Keys.ArrowUp)

          // Verify it is still closed
          assertMenuButton({
            state: MenuState.Closed,
            attributes: { id: 'headlessui-menu-button-1' },
          })
          assertMenu({ state: MenuState.Closed })
        })
      )

      it(
        'should have no active menu item when there are no menu items at all',
        suppressConsoleLogs(async () => {
          use(Scenarios.Default, {
            button: { children: 'Trigger' },
            items: [],
          })

          assertMenu({ state: MenuState.Closed })

          // Focus the button
          getMenuButton()?.focus()

          // Open menu
          await press(Keys.ArrowUp)
          assertMenu({ state: MenuState.Open })

          assertNoActiveMenuItem()
        })
      )

      it(
        'should be possible to use ArrowUp to navigate the menu items and jump to the first non-disabled one',
        suppressConsoleLogs(async () => {
          use(Scenarios.Default, {
            button: { children: 'Trigger' },
            items: [
              { as: 'a', children: 'Item A' },
              { as: 'a', children: 'Item B', disabled: true },
              { as: 'a', children: 'Item C', disabled: true },
            ],
          })

          assertMenuButton({
            state: MenuState.Closed,
            attributes: { id: 'headlessui-menu-button-1' },
          })
          assertMenu({ state: MenuState.Closed })

          // Focus the button
          getMenuButton()?.focus()

          // Open menu
          await press(Keys.ArrowUp)

          // Verify we have menu items
          const items = getMenuItems()
          expect(items).toHaveLength(3)
          items.forEach(item => assertMenuItem(item))
          assertMenuLinkedWithMenuItem(items[0])
        })
      )

      it(
        'should not be possible to navigate up or down if there is only a single non-disabled item',
        suppressConsoleLogs(async () => {
          use(Scenarios.Default, {
            button: { children: 'Trigger' },
            items: [
              { as: 'a', children: 'Item A', disabled: true },
              { as: 'a', children: 'Item B', disabled: true },
              { as: 'a', children: 'Item C' },
            ],
          })

          assertMenuButton({
            state: MenuState.Closed,
            attributes: { id: 'headlessui-menu-button-1' },
          })
          assertMenu({ state: MenuState.Closed })

          // Focus the button
          getMenuButton()?.focus()

          // Open menu
          await press(Keys.Enter)

          // Verify we have menu items
          const items = getMenuItems()
          expect(items).toHaveLength(3)
          items.forEach(item => assertMenuItem(item))
          assertMenuLinkedWithMenuItem(items[2])

          // We should not be able to go up (because those are disabled)
          await press(Keys.ArrowUp)
          assertMenuLinkedWithMenuItem(items[2])

          // We should not be able to go down (because this is the last item)
          await press(Keys.ArrowDown)
          assertMenuLinkedWithMenuItem(items[2])
        })
      )

      it(
        'should be possible to use ArrowUp to navigate the menu items',
        suppressConsoleLogs(async () => {
          use(Scenarios.Default, {
            button: { children: 'Trigger' },
            items: [
              { as: 'a', children: 'Item A' },
              { as: 'a', children: 'Item B' },
              { as: 'a', children: 'Item C' },
            ],
          })

          assertMenuButton({
            state: MenuState.Closed,
            attributes: { id: 'headlessui-menu-button-1' },
          })
          assertMenu({ state: MenuState.Closed })

          // Focus the button
          getMenuButton()?.focus()

          // Open menu
          await press(Keys.ArrowUp)

          // Verify it is open
          assertMenuButton({ state: MenuState.Open })
          assertMenu({
            state: MenuState.Open,
            attributes: { id: 'headlessui-menu-items-2' },
          })
          assertMenuButtonLinkedWithMenu()

          // Verify we have menu items
          const items = getMenuItems()
          expect(items).toHaveLength(3)
          items.forEach(item => assertMenuItem(item))
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
      )
    })

    describe('`End` key', () => {
      it(
        'should be possible to use the End key to go to the last menu item',
        suppressConsoleLogs(async () => {
          use(Scenarios.Default, {
            button: { children: 'Trigger' },
            items: [
              { as: 'a', children: 'Item A' },
              { as: 'a', children: 'Item B' },
              { as: 'a', children: 'Item C' },
            ],
          })

          // Focus the button
          getMenuButton()?.focus()

          // Open menu
          await press(Keys.Enter)

          const items = getMenuItems()

          // We should be on the first item
          assertMenuLinkedWithMenuItem(items[0])

          // We should be able to go to the last item
          await press(Keys.End)
          assertMenuLinkedWithMenuItem(items[2])
        })
      )

      it(
        'should be possible to use the End key to go to the last non disabled menu item',
        suppressConsoleLogs(async () => {
          use(Scenarios.Default, {
            button: { children: 'Trigger' },
            items: [
              { as: 'a', children: 'Item A' },
              { as: 'a', children: 'Item B' },
              { as: 'a', children: 'Item C', disabled: true },
              { as: 'a', children: 'Item D', disabled: true },
            ],
          })

          // Focus the button
          getMenuButton()?.focus()

          // Open menu
          await press(Keys.Enter)

          const items = getMenuItems()

          // We should be on the first item
          assertMenuLinkedWithMenuItem(items[0])

          // We should be able to go to the last non-disabled item
          await press(Keys.End)
          assertMenuLinkedWithMenuItem(items[1])
        })
      )

      it(
        'should be possible to use the End key to go to the first menu item if that is the only non-disabled menu item',
        suppressConsoleLogs(async () => {
          use(Scenarios.Default, {
            button: { children: 'Trigger' },
            items: [
              { as: 'a', children: 'Item A' },
              { as: 'a', children: 'Item B', disabled: true },
              { as: 'a', children: 'Item C', disabled: true },
              { as: 'a', children: 'Item D', disabled: true },
            ],
          })

          // Open menu
          await click(getMenuButton())

          // We opened via click, we don't have an active item
          assertNoActiveMenuItem()

          // We should not be able to go to the end
          await press(Keys.End)

          const items = getMenuItems()
          assertMenuLinkedWithMenuItem(items[0])
        })
      )

      it(
        'should have no active menu item upon End key press, when there are no non-disabled menu items',
        suppressConsoleLogs(async () => {
          use(Scenarios.Default, {
            button: { children: 'Trigger' },
            items: [
              { as: 'a', children: 'Item A', disabled: true },
              { as: 'a', children: 'Item B', disabled: true },
              { as: 'a', children: 'Item C', disabled: true },
              { as: 'a', children: 'Item D', disabled: true },
            ],
          })

          // Open menu
          await click(getMenuButton())

          // We opened via click, we don't have an active item
          assertNoActiveMenuItem()

          // We should not be able to go to the end
          await press(Keys.End)

          assertNoActiveMenuItem()
        })
      )
    })

    describe('`PageDown` key', () => {
      it(
        'should be possible to use the PageDown key to go to the last menu item',
        suppressConsoleLogs(async () => {
          use(Scenarios.Default, {
            button: { children: 'Trigger' },
            items: [
              { as: 'a', children: 'Item A' },
              { as: 'a', children: 'Item B' },
              { as: 'a', children: 'Item C' },
            ],
          })

          // Focus the button
          getMenuButton()?.focus()

          // Open menu
          await press(Keys.Enter)

          const items = getMenuItems()

          // We should be on the first item
          assertMenuLinkedWithMenuItem(items[0])

          // We should be able to go to the last item
          await press(Keys.PageDown)
          assertMenuLinkedWithMenuItem(items[2])
        })
      )

      it(
        'should be possible to use the PageDown key to go to the last non disabled menu item',
        suppressConsoleLogs(async () => {
          use(Scenarios.Default, {
            button: { children: 'Trigger' },
            items: [
              { as: 'a', children: 'Item A' },
              { as: 'a', children: 'Item B' },
              { as: 'a', children: 'Item C', disabled: true },
              { as: 'a', children: 'Item D', disabled: true },
            ],
          })

          // Focus the button
          getMenuButton()?.focus()

          // Open menu
          await press(Keys.Enter)

          const items = getMenuItems()

          // We should be on the first item
          assertMenuLinkedWithMenuItem(items[0])

          // We should be able to go to the last non-disabled item
          await press(Keys.PageDown)
          assertMenuLinkedWithMenuItem(items[1])
        })
      )

      it(
        'should be possible to use the PageDown key to go to the first menu item if that is the only non-disabled menu item',
        suppressConsoleLogs(async () => {
          use(Scenarios.Default, {
            button: { children: 'Trigger' },
            items: [
              { as: 'a', children: 'Item A' },
              { as: 'a', children: 'Item B', disabled: true },
              { as: 'a', children: 'Item C', disabled: true },
              { as: 'a', children: 'Item D', disabled: true },
            ],
          })

          // Open menu
          await click(getMenuButton())

          // We opened via click, we don't have an active item
          assertNoActiveMenuItem()

          // We should not be able to go to the end
          await press(Keys.PageDown)

          const items = getMenuItems()
          assertMenuLinkedWithMenuItem(items[0])
        })
      )

      it(
        'should have no active menu item upon PageDown key press, when there are no non-disabled menu items',
        suppressConsoleLogs(async () => {
          use(Scenarios.Default, {
            button: { children: 'Trigger' },
            items: [
              { as: 'a', children: 'Item A', disabled: true },
              { as: 'a', children: 'Item B', disabled: true },
              { as: 'a', children: 'Item C', disabled: true },
              { as: 'a', children: 'Item D', disabled: true },
            ],
          })

          // Open menu
          await click(getMenuButton())

          // We opened via click, we don't have an active item
          assertNoActiveMenuItem()

          // We should not be able to go to the end
          await press(Keys.PageDown)

          assertNoActiveMenuItem()
        })
      )
    })

    describe('`Home` key', () => {
      it(
        'should be possible to use the Home key to go to the first menu item',
        suppressConsoleLogs(async () => {
          use(Scenarios.Default, {
            button: { children: 'Trigger' },
            items: [
              { as: 'a', children: 'Item A' },
              { as: 'a', children: 'Item B' },
              { as: 'a', children: 'Item C' },
            ],
          })

          // Focus the button
          getMenuButton()?.focus()

          // Open menu
          await press(Keys.ArrowUp)

          const items = getMenuItems()

          // We should be on the last item
          assertMenuLinkedWithMenuItem(items[2])

          // We should be able to go to the first item
          await press(Keys.Home)
          assertMenuLinkedWithMenuItem(items[0])
        })
      )

      it(
        'should be possible to use the Home key to go to the first non disabled menu item',
        suppressConsoleLogs(async () => {
          use(Scenarios.Default, {
            button: { children: 'Trigger' },
            items: [
              { as: 'a', children: 'Item A', disabled: true },
              { as: 'a', children: 'Item B', disabled: true },
              { as: 'a', children: 'Item C' },
              { as: 'a', children: 'Item D' },
            ],
          })

          // Open menu
          await click(getMenuButton())

          // We opened via click, we don't have an active item
          assertNoActiveMenuItem()

          // We should not be able to go to the end
          await press(Keys.Home)

          const items = getMenuItems()

          // We should be on the first non-disabled item
          assertMenuLinkedWithMenuItem(items[2])
        })
      )

      it(
        'should be possible to use the Home key to go to the last menu item if that is the only non-disabled menu item',
        suppressConsoleLogs(async () => {
          use(Scenarios.Default, {
            button: { children: 'Trigger' },
            items: [
              { as: 'a', children: 'Item A', disabled: true },
              { as: 'a', children: 'Item B', disabled: true },
              { as: 'a', children: 'Item C', disabled: true },
              { as: 'a', children: 'Item D' },
            ],
          })

          // Open menu
          await click(getMenuButton())

          // We opened via click, we don't have an active item
          assertNoActiveMenuItem()

          // We should not be able to go to the end
          await press(Keys.Home)

          const items = getMenuItems()
          assertMenuLinkedWithMenuItem(items[3])
        })
      )

      it(
        'should have no active menu item upon Home key press, when there are no non-disabled menu items',
        suppressConsoleLogs(async () => {
          use(Scenarios.Default, {
            button: { children: 'Trigger' },
            items: [
              { as: 'a', children: 'Item A', disabled: true },
              { as: 'a', children: 'Item B', disabled: true },
              { as: 'a', children: 'Item C', disabled: true },
              { as: 'a', children: 'Item D', disabled: true },
            ],
          })

          // Open menu
          await click(getMenuButton())

          // We opened via click, we don't have an active item
          assertNoActiveMenuItem()

          // We should not be able to go to the end
          await press(Keys.Home)

          assertNoActiveMenuItem()
        })
      )
    })

    describe('`PageUp` key', () => {
      it(
        'should be possible to use the PageUp key to go to the first menu item',
        suppressConsoleLogs(async () => {
          use(Scenarios.Default, {
            button: { children: 'Trigger' },
            items: [
              { as: 'a', children: 'Item A' },
              { as: 'a', children: 'Item B' },
              { as: 'a', children: 'Item C' },
            ],
          })

          // Focus the button
          getMenuButton()?.focus()

          // Open menu
          await press(Keys.ArrowUp)

          const items = getMenuItems()

          // We should be on the last item
          assertMenuLinkedWithMenuItem(items[2])

          // We should be able to go to the first item
          await press(Keys.PageUp)
          assertMenuLinkedWithMenuItem(items[0])
        })
      )

      it(
        'should be possible to use the PageUp key to go to the first non disabled menu item',
        suppressConsoleLogs(async () => {
          use(Scenarios.Default, {
            button: { children: 'Trigger' },
            items: [
              { as: 'a', children: 'Item A', disabled: true },
              { as: 'a', children: 'Item B', disabled: true },
              { as: 'a', children: 'Item C' },
              { as: 'a', children: 'Item D' },
            ],
          })

          // Open menu
          await click(getMenuButton())

          // We opened via click, we don't have an active item
          assertNoActiveMenuItem()

          // We should not be able to go to the end
          await press(Keys.PageUp)

          const items = getMenuItems()

          // We should be on the first non-disabled item
          assertMenuLinkedWithMenuItem(items[2])
        })
      )

      it(
        'should be possible to use the PageUp key to go to the last menu item if that is the only non-disabled menu item',
        suppressConsoleLogs(async () => {
          use(Scenarios.Default, {
            button: { children: 'Trigger' },
            items: [
              { as: 'a', children: 'Item A', disabled: true },
              { as: 'a', children: 'Item B', disabled: true },
              { as: 'a', children: 'Item C', disabled: true },
              { as: 'a', children: 'Item D' },
            ],
          })

          // Open menu
          await click(getMenuButton())

          // We opened via click, we don't have an active item
          assertNoActiveMenuItem()

          // We should not be able to go to the end
          await press(Keys.PageUp)

          const items = getMenuItems()
          assertMenuLinkedWithMenuItem(items[3])
        })
      )

      it(
        'should have no active menu item upon PageUp key press, when there are no non-disabled menu items',
        suppressConsoleLogs(async () => {
          use(Scenarios.Default, {
            button: { children: 'Trigger' },
            items: [
              { as: 'a', children: 'Item A', disabled: true },
              { as: 'a', children: 'Item B', disabled: true },
              { as: 'a', children: 'Item C', disabled: true },
              { as: 'a', children: 'Item D', disabled: true },
            ],
          })

          // Open menu
          await click(getMenuButton())

          // We opened via click, we don't have an active item
          assertNoActiveMenuItem()

          // We should not be able to go to the end
          await press(Keys.PageUp)

          assertNoActiveMenuItem()
        })
      )
    })

    describe('`Any` key aka search', () => {
      it(
        'should be possible to type a full word that has a perfect match',
        suppressConsoleLogs(async () => {
          use(Scenarios.Default, {
            button: { children: 'Trigger' },
            items: [
              { as: 'a', children: 'alice' },
              { as: 'a', children: 'bob' },
              { as: 'a', children: 'charlie' },
            ],
          })

          // Open menu
          await click(getMenuButton())

          const items = getMenuItems()

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
      )

      it(
        'should be possible to type a partial of a word',
        suppressConsoleLogs(async () => {
          use(Scenarios.Default, {
            button: { children: 'Trigger' },
            items: [
              { as: 'a', children: 'alice' },
              { as: 'a', children: 'bob' },
              { as: 'a', children: 'charlie' },
            ],
          })

          // Focus the button
          getMenuButton()?.focus()

          // Open menu
          await press(Keys.ArrowUp)

          const items = getMenuItems()

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
      )

      it(
        'should be possible to type words with spaces',
        suppressConsoleLogs(async () => {
          use(Scenarios.Default, {
            button: { children: 'Trigger' },
            items: [
              { as: 'a', children: 'value a' },
              { as: 'a', children: 'value b' },
              { as: 'a', children: 'value c' },
            ],
          })

          // Focus the button
          getMenuButton()?.focus()

          // Open menu
          await press(Keys.ArrowUp)

          const items = getMenuItems()

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

      it(
        'should not be possible to search for a disabled item',
        suppressConsoleLogs(async () => {
          use(Scenarios.Default, {
            button: { children: 'Trigger' },
            items: [
              { as: 'a', children: 'alice' },
              { as: 'a', children: 'bob', disabled: true },
              { as: 'a', children: 'charlie' },
            ],
          })

          // Focus the button
          getMenuButton()?.focus()

          // Open menu
          await press(Keys.ArrowUp)

          const items = getMenuItems()

          // We should be on the last item
          assertMenuLinkedWithMenuItem(items[2])

          // We should not be able to go to the disabled item
          await type(word('bo'))

          // We should still be on the last item
          assertMenuLinkedWithMenuItem(items[2])
        })
      )
    })
  })

  describe('Mouse interactions', () => {
    it(
      'should be possible to open a menu on click',
      suppressConsoleLogs(async () => {
        use(Scenarios.Default, {
          button: { children: 'Trigger' },
          items: [
            { as: 'a', children: 'Item A' },
            { as: 'a', children: 'Item B' },
            { as: 'a', children: 'Item C' },
          ],
        })

        assertMenuButton({
          state: MenuState.Closed,
          attributes: { id: 'headlessui-menu-button-1' },
        })
        assertMenu({ state: MenuState.Closed })

        // Open menu
        await click(getMenuButton())

        // Verify it is open
        assertMenuButton({ state: MenuState.Open })
        assertMenu({
          state: MenuState.Open,
          attributes: { id: 'headlessui-menu-items-2' },
        })
        assertMenuButtonLinkedWithMenu()

        // Verify we have menu items
        const items = getMenuItems()
        expect(items).toHaveLength(3)
        items.forEach(item => assertMenuItem(item))
      })
    )

    it(
      'should not be possible to open a menu on click when the button is disabled',
      suppressConsoleLogs(async () => {
        use(Scenarios.Default, {
          button: { children: 'Trigger', disabled: true },
          items: [
            { as: 'a', children: 'Item A' },
            { as: 'a', children: 'Item B' },
            { as: 'a', children: 'Item C' },
          ],
        })

        assertMenuButton({
          state: MenuState.Closed,
          attributes: { id: 'headlessui-menu-button-1' },
        })
        assertMenu({ state: MenuState.Closed })

        // Try to open the menu
        await click(getMenuButton())

        // Verify it is still closed
        assertMenuButton({
          state: MenuState.Closed,
          attributes: { id: 'headlessui-menu-button-1' },
        })
        assertMenu({ state: MenuState.Closed })
      })
    )

    it(
      'should be possible to close a menu on click',
      suppressConsoleLogs(async () => {
        use(Scenarios.Default, {
          button: { children: 'Trigger' },
          items: [
            { as: 'a', children: 'Item A' },
            { as: 'a', children: 'Item B' },
            { as: 'a', children: 'Item C' },
          ],
        })

        // Open menu
        await click(getMenuButton())

        // Verify it is open
        assertMenuButton({ state: MenuState.Open })

        // Click to close
        await click(getMenuButton())

        // Verify it is closed
        assertMenuButton({ state: MenuState.Closed })
        assertMenu({ state: MenuState.Closed })
      })
    )

    it('should focus the menu when you try to focus the button again (when the menu is already open)', async () => {
      use(Scenarios.Default, {
        button: { children: 'Trigger' },
        items: [
          { as: 'a', children: 'Item A' },
          { as: 'a', children: 'Item B' },
          { as: 'a', children: 'Item C' },
        ],
      })

      // Open menu
      await click(getMenuButton())

      // Verify menu is focused
      assertActiveElement(getMenu())

      // Try to Re-focus the button
      getMenuButton()?.focus()

      // Verify menu is still focused
      assertActiveElement(getMenu())
    })

    it(
      'should be a no-op when we click outside of a closed menu',
      suppressConsoleLogs(async () => {
        use(Scenarios.Default, {
          button: { children: 'Trigger' },
          items: [
            { as: 'a', children: 'alice' },
            { as: 'a', children: 'bob' },
            { as: 'a', children: 'charlie' },
          ],
        })

        // Verify that the window is closed
        assertMenu({ state: MenuState.Closed })

        // Click something that is not related to the menu
        await click(document.body)

        // Should still be closed
        assertMenu({ state: MenuState.Closed })
      })
    )

    it(
      'should be possible to click outside of the menu which should close the menu',
      suppressConsoleLogs(async () => {
        use(Scenarios.Default, {
          button: { children: 'Trigger' },
          items: [
            { as: 'a', children: 'alice' },
            { as: 'a', children: 'bob' },
            { as: 'a', children: 'charlie' },
          ],
        })

        // Open menu
        await click(getMenuButton())
        assertMenu({ state: MenuState.Open })

        // Click something that is not related to the menu
        await click(document.body)

        // Should be closed now
        assertMenu({ state: MenuState.Closed })

        // Verify the button is focused again
        assertActiveElement(getMenuButton())
      })
    )

    it(
      'should be possible to click outside of the menu which should close the menu (even if we press the menu button)',
      suppressConsoleLogs(async () => {
        use(Scenarios.Default, {
          button: { children: 'Trigger' },
          items: [
            { as: 'a', children: 'alice' },
            { as: 'a', children: 'bob' },
            { as: 'a', children: 'charlie' },
          ],
        })

        // Open menu
        await click(getMenuButton())
        assertMenu({ state: MenuState.Open })

        // Click the menu button again
        await click(getMenuButton())

        // Should be closed now
        assertMenu({ state: MenuState.Closed })

        // Verify the button is focused again
        assertActiveElement(getMenuButton())
      })
    )

    it(
      'should be possible to click outside of the menu on another menu button which should close the current menu and open the new menu',
      suppressConsoleLogs(async () => {
        use(Scenarios.MultipleMenus, [
          // Menu 1
          {
            button: { children: 'Trigger' },
            items: [
              { as: 'a', children: 'alice' },
              { as: 'a', children: 'bob' },
              { as: 'a', children: 'charlie' },
            ],
          },

          // Menu 2
          {
            button: { children: 'Trigger' },
            items: [
              { as: 'a', children: 'alice' },
              { as: 'a', children: 'bob' },
              { as: 'a', children: 'charlie' },
            ],
          },
        ])

        const [button1, button2] = getMenuButtons()

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

    it(
      'should be possible to hover an item and make it active',
      suppressConsoleLogs(async () => {
        use(Scenarios.Default, {
          button: { children: 'Trigger' },
          items: [
            { as: 'a', children: 'alice' },
            { as: 'a', children: 'bob' },
            { as: 'a', children: 'charlie' },
          ],
        })

        // Open menu
        await click(getMenuButton())

        const items = getMenuItems()
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
    )

    it(
      'should make a menu item active when you move the mouse over it',
      suppressConsoleLogs(async () => {
        use(Scenarios.Default, {
          button: { children: 'Trigger' },
          items: [
            { as: 'a', children: 'alice' },
            { as: 'a', children: 'bob' },
            { as: 'a', children: 'charlie' },
          ],
        })

        // Open menu
        await click(getMenuButton())

        const items = getMenuItems()
        // We should be able to go to the second item
        await mouseMove(items[1])
        assertMenuLinkedWithMenuItem(items[1])
      })
    )

    it(
      'should be a no-op when we move the mouse and the menu item is already active',
      suppressConsoleLogs(async () => {
        use(Scenarios.Default, {
          button: { children: 'Trigger' },
          items: [
            { as: 'a', children: 'alice' },
            { as: 'a', children: 'bob' },
            { as: 'a', children: 'charlie' },
          ],
        })

        // Open menu
        await click(getMenuButton())

        const items = getMenuItems()

        // We should be able to go to the second item
        await mouseMove(items[1])
        assertMenuLinkedWithMenuItem(items[1])

        await mouseMove(items[1])

        // Nothing should be changed
        assertMenuLinkedWithMenuItem(items[1])
      })
    )

    it(
      'should be a no-op when we move the mouse and the menu item is disabled',
      suppressConsoleLogs(async () => {
        use(Scenarios.Default, {
          button: { children: 'Trigger' },
          items: [
            { as: 'a', children: 'alice' },
            { as: 'a', children: 'bob', disabled: true },
            { as: 'a', children: 'charlie' },
          ],
        })

        // Open menu
        await click(getMenuButton())

        const items = getMenuItems()

        await mouseMove(items[1])
        assertNoActiveMenuItem()
      })
    )

    it(
      'should not be possible to hover an item that is disabled',
      suppressConsoleLogs(async () => {
        use(Scenarios.Default, {
          button: { children: 'Trigger' },
          items: [
            { as: 'a', children: 'alice' },
            { as: 'a', children: 'bob', disabled: true },
            { as: 'a', children: 'charlie' },
          ],
        })

        // Open menu
        await click(getMenuButton())

        const items = getMenuItems()

        // Try to hover over item 1, which is disabled
        await mouseMove(items[1])

        // We should not have an active item now
        assertNoActiveMenuItem()
      })
    )

    it(
      'should be possible to mouse leave an item and make it inactive',
      suppressConsoleLogs(async () => {
        use(Scenarios.Default, {
          button: { children: 'Trigger' },
          items: [
            { as: 'a', children: 'alice' },
            { as: 'a', children: 'bob' },
            { as: 'a', children: 'charlie' },
          ],
        })

        // Open menu
        await click(getMenuButton())

        const items = getMenuItems()

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
    )

    it(
      'should be possible to mouse leave a disabled item and be a no-op',
      suppressConsoleLogs(async () => {
        use(Scenarios.Default, {
          button: { children: 'Trigger' },
          items: [
            { as: 'a', children: 'alice' },
            { as: 'a', children: 'bob', disabled: true },
            { as: 'a', children: 'charlie' },
          ],
        })

        // Open menu
        await click(getMenuButton())

        const items = getMenuItems()

        // Try to hover over item 1, which is disabled
        await mouseMove(items[1])
        assertNoActiveMenuItem()

        await mouseLeave(items[1])
        assertNoActiveMenuItem()
      })
    )

    it(
      'should be possible to click a menu item, which closes the menu',
      suppressConsoleLogs(async () => {
        const clickHandler = jest.fn()
        use(Scenarios.Default, {
          button: { children: 'Trigger' },
          items: [
            { as: 'a', children: 'alice' },
            { as: 'a', children: 'bob', onClick: clickHandler },
            { as: 'a', children: 'charlie' },
          ],
        })

        // Open menu
        await click(getMenuButton())
        assertMenu({ state: MenuState.Open })

        const items = getMenuItems()

        // We should be able to click the first item
        await click(items[1])

        assertMenu({ state: MenuState.Closed })
        expect(clickHandler).toHaveBeenCalled()
      })
    )

    it(
      'should be possible to click a menu item, which closes the menu and invokes the @click handler',
      suppressConsoleLogs(async () => {
        const clickHandler = jest.fn()
        use(Scenarios.LastItemButton, {
          button: { children: 'Trigger' },
          items: [
            { as: 'a', children: 'alice' },
            { as: 'button', children: 'bob', onClick: clickHandler },
          ],
          lastItem: {
            props: {},
            onClick: clickHandler,
            children: 'charlie',
          },
        })

        // Open menu
        await click(getMenuButton())
        assertMenu({ state: MenuState.Open })

        // We should be able to click the first item
        await click(getMenuItems()[1])
        assertMenu({ state: MenuState.Closed })

        // Verify the callback has been called
        expect(clickHandler).toHaveBeenCalledTimes(1)

        // Let's re-open the window for now
        await click(getMenuButton())

        // Click the last item, which should close and invoke the handler
        await click(getMenuItems()[2])
        assertMenu({ state: MenuState.Closed })

        // Verify the callback has been called
        expect(clickHandler).toHaveBeenCalledTimes(2)
      })
    )

    it(
      'should be possible to click a disabled menu item, which is a no-op',
      suppressConsoleLogs(async () => {
        use(Scenarios.Default, {
          button: { children: 'Trigger' },
          items: [
            { as: 'a', children: 'alice' },
            { as: 'a', children: 'bob', disabled: true },
            { as: 'a', children: 'charlie' },
          ],
        })

        // Open menu
        await click(getMenuButton())
        assertMenu({ state: MenuState.Open })

        const items = getMenuItems()

        // We should be able to click the first item
        await click(items[1])
        assertMenu({ state: MenuState.Open })
      })
    )

    it(
      'should be possible focus a menu item, so that it becomes active',
      suppressConsoleLogs(async () => {
        use(Scenarios.Default, {
          button: { children: 'Trigger' },
          items: [
            { as: 'a', children: 'alice' },
            { as: 'a', children: 'bob' },
            { as: 'a', children: 'charlie' },
          ],
        })

        // Open menu
        await click(getMenuButton())
        assertMenu({ state: MenuState.Open })

        const items = getMenuItems()

        // Verify that nothing is active yet
        assertNoActiveMenuItem()

        // We should be able to focus the first item
        await focus(items[1])
        assertMenuLinkedWithMenuItem(items[1])
      })
    )

    it(
      'should not be possible to focus a menu item which is disabled',
      suppressConsoleLogs(async () => {
        use(Scenarios.Default, {
          button: { children: 'Trigger' },
          items: [
            { as: 'a', children: 'alice' },
            { as: 'a', children: 'bob', disabled: true },
            { as: 'a', children: 'charlie' },
          ],
        })

        // Open menu
        await click(getMenuButton())
        assertMenu({ state: MenuState.Open })

        const items = getMenuItems()

        // We should not be able to focus the first item
        await focus(items[1])
        assertNoActiveMenuItem()
      })
    )

    it(
      'should not be possible to activate a disabled item',
      suppressConsoleLogs(async () => {
        const clickHandler = jest.fn()
        use(Scenarios.LastItemButton, {
          button: { children: 'Trigger' },
          items: [
            { as: 'a', children: 'alice' },
            { as: 'a', children: 'bob', onClick: clickHandler, disabled: true },
          ],
          lastItem: {
            props: { disabled: true },
            onClick: clickHandler,
            children: 'charlie',
          },
        })

        // Open menu
        await click(getMenuButton())
        assertMenu({ state: MenuState.Open })

        const items = getMenuItems()

        await focus(items[0])
        await click(items[1])
        expect(clickHandler).not.toHaveBeenCalled()

        // Activate the last item
        await click(getMenuItems()[2])
        expect(clickHandler).not.toHaveBeenCalled()
      })
    )
  })
})
