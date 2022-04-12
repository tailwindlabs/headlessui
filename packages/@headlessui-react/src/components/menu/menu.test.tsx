import React, { createElement, useEffect } from 'react'
import { render } from '@testing-library/react'

import { Menu } from './menu'
import { suppressConsoleLogs } from '../../test-utils/suppress-console-logs'
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
  getByText,
} from '../../test-utils/accessibility-assertions'
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
  MouseButton,
} from '../../test-utils/interactions'
import { Transition } from '../transitions/transition'

jest.mock('../../hooks/use-id')

beforeAll(() => {
  jest.spyOn(window, 'requestAnimationFrame').mockImplementation(setImmediate as any)
  jest.spyOn(window, 'cancelAnimationFrame').mockImplementation(clearImmediate as any)
})

afterAll(() => jest.restoreAllMocks())

describe('Safe guards', () => {
  it.each([
    ['Menu.Button', Menu.Button],
    ['Menu.Items', Menu.Items],
    ['Menu.Item', Menu.Item],
  ])(
    'should error when we are using a <%s /> without a parent <Menu />',
    suppressConsoleLogs((name, Component) => {
      expect(() => render(createElement(Component))).toThrowError(
        `<${name} /> is missing a parent <Menu /> component.`
      )
    })
  )

  it(
    'should be possible to render a Menu without crashing',
    suppressConsoleLogs(async () => {
      render(
        <Menu>
          <Menu.Button>Trigger</Menu.Button>
          <Menu.Items>
            <Menu.Item as="a">Item A</Menu.Item>
            <Menu.Item as="a">Item B</Menu.Item>
            <Menu.Item as="a">Item C</Menu.Item>
          </Menu.Items>
        </Menu>
      )

      assertMenuButton({
        state: MenuState.InvisibleUnmounted,
        attributes: { id: 'headlessui-menu-button-1' },
      })
      assertMenu({ state: MenuState.InvisibleUnmounted })
    })
  )
})

describe('Rendering', () => {
  describe('Menu', () => {
    it(
      'should be possible to render a Menu using a render prop',
      suppressConsoleLogs(async () => {
        render(
          <Menu>
            {({ open }) => (
              <>
                <Menu.Button>Trigger</Menu.Button>
                {open && (
                  <Menu.Items>
                    <Menu.Item as="a">Item A</Menu.Item>
                    <Menu.Item as="a">Item B</Menu.Item>
                    <Menu.Item as="a">Item C</Menu.Item>
                  </Menu.Items>
                )}
              </>
            )}
          </Menu>
        )

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
    )
  })

  describe('Menu.Button', () => {
    it(
      'should be possible to render a Menu.Button using a render prop',
      suppressConsoleLogs(async () => {
        render(
          <Menu>
            <Menu.Button>{JSON.stringify}</Menu.Button>
            <Menu.Items>
              <Menu.Item as="a">Item A</Menu.Item>
              <Menu.Item as="a">Item B</Menu.Item>
              <Menu.Item as="a">Item C</Menu.Item>
            </Menu.Items>
          </Menu>
        )

        assertMenuButton({
          state: MenuState.InvisibleUnmounted,
          attributes: { id: 'headlessui-menu-button-1' },
          textContent: JSON.stringify({ open: false }),
        })
        assertMenu({ state: MenuState.InvisibleUnmounted })

        await click(getMenuButton())

        assertMenuButton({
          state: MenuState.Visible,
          attributes: { id: 'headlessui-menu-button-1' },
          textContent: JSON.stringify({ open: true }),
        })
        assertMenu({ state: MenuState.Visible })
      })
    )

    it(
      'should be possible to render a Menu.Button using a render prop and an `as` prop',
      suppressConsoleLogs(async () => {
        render(
          <Menu>
            <Menu.Button as="div" role="button">
              {JSON.stringify}
            </Menu.Button>
            <Menu.Items>
              <Menu.Item as="a">Item A</Menu.Item>
              <Menu.Item as="a">Item B</Menu.Item>
              <Menu.Item as="a">Item C</Menu.Item>
            </Menu.Items>
          </Menu>
        )

        assertMenuButton({
          state: MenuState.InvisibleUnmounted,
          attributes: { id: 'headlessui-menu-button-1' },
          textContent: JSON.stringify({ open: false }),
        })
        assertMenu({ state: MenuState.InvisibleUnmounted })

        await click(getMenuButton())

        assertMenuButton({
          state: MenuState.Visible,
          attributes: { id: 'headlessui-menu-button-1' },
          textContent: JSON.stringify({ open: true }),
        })
        assertMenu({ state: MenuState.Visible })
      })
    )
    describe('`type` attribute', () => {
      it('should set the `type` to "button" by default', async () => {
        render(
          <Menu>
            <Menu.Button>Trigger</Menu.Button>
          </Menu>
        )

        expect(getMenuButton()).toHaveAttribute('type', 'button')
      })

      it('should not set the `type` to "button" if it already contains a `type`', async () => {
        render(
          <Menu>
            <Menu.Button type="submit">Trigger</Menu.Button>
          </Menu>
        )

        expect(getMenuButton()).toHaveAttribute('type', 'submit')
      })

      it('should set the `type` to "button" when using the `as` prop which resolves to a "button"', async () => {
        let CustomButton = React.forwardRef<HTMLButtonElement>((props, ref) => (
          <button ref={ref} {...props} />
        ))

        render(
          <Menu>
            <Menu.Button as={CustomButton}>Trigger</Menu.Button>
          </Menu>
        )

        expect(getMenuButton()).toHaveAttribute('type', 'button')
      })

      it('should not set the type if the "as" prop is not a "button"', async () => {
        render(
          <Menu>
            <Menu.Button as="div">Trigger</Menu.Button>
          </Menu>
        )

        expect(getMenuButton()).not.toHaveAttribute('type')
      })

      it('should not set the `type` to "button" when using the `as` prop which resolves to a "div"', async () => {
        let CustomButton = React.forwardRef<HTMLDivElement>((props, ref) => (
          <div ref={ref} {...props} />
        ))

        render(
          <Menu>
            <Menu.Button as={CustomButton}>Trigger</Menu.Button>
          </Menu>
        )

        expect(getMenuButton()).not.toHaveAttribute('type')
      })
    })
  })

  describe('Menu.Items', () => {
    it(
      'should be possible to render Menu.Items using a render prop',
      suppressConsoleLogs(async () => {
        render(
          <Menu>
            <Menu.Button>Trigger</Menu.Button>
            <Menu.Items>
              {(data) => (
                <>
                  <Menu.Item as="a">{JSON.stringify(data)}</Menu.Item>
                </>
              )}
            </Menu.Items>
          </Menu>
        )

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
        assertMenu({
          state: MenuState.Visible,
          textContent: JSON.stringify({ open: true }),
        })
      })
    )

    it('should be possible to always render the Menu.Items if we provide it a `static` prop', () => {
      render(
        <Menu>
          <Menu.Button>Trigger</Menu.Button>
          <Menu.Items static>
            <Menu.Item as="a">Item A</Menu.Item>
            <Menu.Item as="a">Item B</Menu.Item>
            <Menu.Item as="a">Item C</Menu.Item>
          </Menu.Items>
        </Menu>
      )

      // Let's verify that the Menu is already there
      expect(getMenu()).not.toBe(null)
    })

    it('should be possible to use a different render strategy for the Menu.Items', async () => {
      render(
        <Menu>
          <Menu.Button>Trigger</Menu.Button>
          <Menu.Items unmount={false}>
            <Menu.Item as="a">Item A</Menu.Item>
            <Menu.Item as="a">Item B</Menu.Item>
            <Menu.Item as="a">Item C</Menu.Item>
          </Menu.Items>
        </Menu>
      )

      assertMenu({ state: MenuState.InvisibleHidden })

      // Let's open the Menu, to see if it is not hidden anymore
      await click(getMenuButton())

      assertMenu({ state: MenuState.Visible })
    })
  })

  describe('Menu.Item', () => {
    it(
      'should be possible to render a Menu.Item using a render prop',
      suppressConsoleLogs(async () => {
        render(
          <Menu>
            <Menu.Button>Trigger</Menu.Button>
            <Menu.Items>
              <Menu.Item as="a">{JSON.stringify}</Menu.Item>
            </Menu.Items>
          </Menu>
        )

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
        assertMenu({
          state: MenuState.Visible,
          textContent: JSON.stringify({ active: false, disabled: false }),
        })
      })
    )
  })

  it('should guarantee the order of DOM nodes when performing actions', async () => {
    function Example({ hide = false }) {
      return (
        <>
          <Menu>
            <Menu.Button>Trigger</Menu.Button>
            <Menu.Items>
              <Menu.Item as="button">Item 1</Menu.Item>
              {!hide && <Menu.Item as="button">Item 2</Menu.Item>}
              <Menu.Item as="button">Item 3</Menu.Item>
            </Menu.Items>
          </Menu>
        </>
      )
    }

    let { rerender } = render(<Example />)

    // Open the Menu
    await click(getByText('Trigger'))

    rerender(<Example hide={true} />) // Remove Menu.Item 2
    rerender(<Example hide={false} />) // Re-add Menu.Item 2

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
})

describe('Rendering composition', () => {
  it(
    'should be possible to conditionally render classNames (aka className can be a function?!)',
    suppressConsoleLogs(async () => {
      render(
        <Menu>
          <Menu.Button>Trigger</Menu.Button>
          <Menu.Items>
            <Menu.Item as="a" className={(bag) => JSON.stringify(bag)}>
              Item A
            </Menu.Item>
            <Menu.Item as="a" disabled className={(bag) => JSON.stringify(bag)}>
              Item B
            </Menu.Item>
            <Menu.Item as="a" className="no-special-treatment">
              Item C
            </Menu.Item>
          </Menu.Items>
        </Menu>
      )

      assertMenuButton({
        state: MenuState.InvisibleUnmounted,
        attributes: { id: 'headlessui-menu-button-1' },
      })
      assertMenu({ state: MenuState.InvisibleUnmounted })

      // Open menu
      await click(getMenuButton())

      let items = getMenuItems()

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
  )

  it(
    'should be possible to swap the menu item with a button for example',
    suppressConsoleLogs(async () => {
      render(
        <Menu>
          <Menu.Button>Trigger</Menu.Button>
          <Menu.Items>
            <Menu.Item as="button">Item A</Menu.Item>
            <Menu.Item as="button">Item B</Menu.Item>
            <Menu.Item as="button">Item C</Menu.Item>
          </Menu.Items>
        </Menu>
      )

      assertMenuButton({
        state: MenuState.InvisibleUnmounted,
        attributes: { id: 'headlessui-menu-button-1' },
      })
      assertMenu({ state: MenuState.InvisibleUnmounted })

      // Open menu
      await click(getMenuButton())

      // Verify items are buttons now
      let items = getMenuItems()
      items.forEach((item) => assertMenuItem(item, { tag: 'button' }))
    })
  )

  it(
    'should mark all the elements between Menu.Items and Menu.Item with role none',
    suppressConsoleLogs(async () => {
      render(
        <Menu>
          <Menu.Button>Trigger</Menu.Button>
          <div className="outer">
            <Menu.Items>
              <div className="inner py-1">
                <Menu.Item as="button">Item A</Menu.Item>
                <Menu.Item as="button">Item B</Menu.Item>
              </div>
              <div className="inner py-1">
                <Menu.Item as="button">Item C</Menu.Item>
                <Menu.Item>
                  <div>
                    <div className="outer">Item D</div>
                  </div>
                </Menu.Item>
              </div>
              <div className="inner py-1">
                <form className="inner">
                  <Menu.Item as="button">Item E</Menu.Item>
                </form>
              </div>
            </Menu.Items>
          </div>
        </Menu>
      )

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
  function Debug({ fn, name }: { fn: (text: string) => void; name: string }) {
    useEffect(() => {
      fn(`Mounting - ${name}`)
      return () => {
        fn(`Unmounting - ${name}`)
      }
    }, [fn, name])
    return null
  }

  it(
    'should be possible to wrap the Menu.Items with a Transition component',
    suppressConsoleLogs(async () => {
      let orderFn = jest.fn()
      render(
        <Menu>
          <Menu.Button>Trigger</Menu.Button>
          <Debug name="Menu" fn={orderFn} />
          <Transition>
            <Debug name="Transition" fn={orderFn} />
            <Menu.Items>
              <Menu.Item as="a">
                {(data) => (
                  <>
                    {JSON.stringify(data)}
                    <Debug name="Menu.Item" fn={orderFn} />
                  </>
                )}
              </Menu.Item>
            </Menu.Items>
          </Transition>
        </Menu>
      )

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
      assertMenu({
        state: MenuState.Visible,
        textContent: JSON.stringify({ active: false, disabled: false }),
      })

      await click(getMenuButton())

      // Verify that we tracked the `mounts` and `unmounts` in the correct order
      expect(orderFn.mock.calls).toEqual([
        ['Mounting - Menu'],
        ['Mounting - Transition'],
        ['Mounting - Menu.Item'],
        ['Unmounting - Transition'],
        ['Unmounting - Menu.Item'],
      ])
    })
  )

  it(
    'should be possible to wrap the Menu.Items with a Transition.Child component',
    suppressConsoleLogs(async () => {
      let orderFn = jest.fn()
      render(
        <Menu>
          <Menu.Button>Trigger</Menu.Button>
          <Debug name="Menu" fn={orderFn} />
          <Transition.Child>
            <Debug name="Transition" fn={orderFn} />
            <Menu.Items>
              <Menu.Item as="a">
                {(data) => (
                  <>
                    {JSON.stringify(data)}
                    <Debug name="Menu.Item" fn={orderFn} />
                  </>
                )}
              </Menu.Item>
            </Menu.Items>
          </Transition.Child>
        </Menu>
      )

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
      assertMenu({
        state: MenuState.Visible,
        textContent: JSON.stringify({ active: false, disabled: false }),
      })

      await click(getMenuButton())

      // Verify that we tracked the `mounts` and `unmounts` in the correct order
      expect(orderFn.mock.calls).toEqual([
        ['Mounting - Menu'],
        ['Mounting - Transition'],
        ['Mounting - Menu.Item'],
        ['Unmounting - Transition'],
        ['Unmounting - Menu.Item'],
      ])
    })
  )
})

describe('Keyboard interactions', () => {
  describe('`Enter` key', () => {
    it(
      'should be possible to open the menu with Enter',
      suppressConsoleLogs(async () => {
        render(
          <Menu>
            <Menu.Button>Trigger</Menu.Button>
            <Menu.Items>
              <Menu.Item as="a">Item A</Menu.Item>
              <Menu.Item as="a">Item B</Menu.Item>
              <Menu.Item as="a">Item C</Menu.Item>
            </Menu.Items>
          </Menu>
        )

        assertMenuButton({
          state: MenuState.InvisibleUnmounted,
          attributes: { id: 'headlessui-menu-button-1' },
        })
        assertMenu({ state: MenuState.InvisibleUnmounted })

        // Focus the button
        await focus(getMenuButton())

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
    )

    it(
      'should not be possible to open the menu with Enter when the button is disabled',
      suppressConsoleLogs(async () => {
        render(
          <Menu>
            <Menu.Button disabled>Trigger</Menu.Button>
            <Menu.Items>
              <Menu.Item as="a">Item A</Menu.Item>
              <Menu.Item as="a">Item B</Menu.Item>
              <Menu.Item as="a">Item C</Menu.Item>
            </Menu.Items>
          </Menu>
        )

        assertMenuButton({
          state: MenuState.InvisibleUnmounted,
          attributes: { id: 'headlessui-menu-button-1' },
        })
        assertMenu({ state: MenuState.InvisibleUnmounted })

        // Focus the button
        await focus(getMenuButton())

        // Try to open the menu
        await press(Keys.Enter)

        // Verify it is still closed
        assertMenuButton({
          state: MenuState.InvisibleUnmounted,
          attributes: { id: 'headlessui-menu-button-1' },
        })
        assertMenu({ state: MenuState.InvisibleUnmounted })
      })
    )

    it(
      'should have no active menu item when there are no menu items at all',
      suppressConsoleLogs(async () => {
        render(
          <Menu>
            <Menu.Button>Trigger</Menu.Button>
            <Menu.Items />
          </Menu>
        )

        assertMenu({ state: MenuState.InvisibleUnmounted })

        // Focus the button
        await focus(getMenuButton())

        // Open menu
        await press(Keys.Enter)
        assertMenu({ state: MenuState.Visible })

        assertNoActiveMenuItem()
      })
    )

    it(
      'should focus the first non disabled menu item when opening with Enter',
      suppressConsoleLogs(async () => {
        render(
          <Menu>
            <Menu.Button>Trigger</Menu.Button>
            <Menu.Items>
              <Menu.Item as="a" disabled>
                Item A
              </Menu.Item>
              <Menu.Item as="a">Item B</Menu.Item>
              <Menu.Item as="a">Item C</Menu.Item>
            </Menu.Items>
          </Menu>
        )

        assertMenuButton({
          state: MenuState.InvisibleUnmounted,
          attributes: { id: 'headlessui-menu-button-1' },
        })
        assertMenu({ state: MenuState.InvisibleUnmounted })

        // Focus the button
        await focus(getMenuButton())

        // Open menu
        await press(Keys.Enter)

        let items = getMenuItems()

        // Verify that the first non-disabled menu item is active
        assertMenuLinkedWithMenuItem(items[1])
      })
    )

    it(
      'should focus the first non disabled menu item when opening with Enter (jump over multiple disabled ones)',
      suppressConsoleLogs(async () => {
        render(
          <Menu>
            <Menu.Button>Trigger</Menu.Button>
            <Menu.Items>
              <Menu.Item as="a" disabled>
                Item A
              </Menu.Item>
              <Menu.Item as="a" disabled>
                Item B
              </Menu.Item>
              <Menu.Item as="a">Item C</Menu.Item>
            </Menu.Items>
          </Menu>
        )

        assertMenuButton({
          state: MenuState.InvisibleUnmounted,
          attributes: { id: 'headlessui-menu-button-1' },
        })
        assertMenu({ state: MenuState.InvisibleUnmounted })

        // Focus the button
        await focus(getMenuButton())

        // Open menu
        await press(Keys.Enter)

        let items = getMenuItems()

        // Verify that the first non-disabled menu item is active
        assertMenuLinkedWithMenuItem(items[2])
      })
    )

    it(
      'should have no active menu item upon Enter key press, when there are no non-disabled menu items',
      suppressConsoleLogs(async () => {
        render(
          <Menu>
            <Menu.Button>Trigger</Menu.Button>
            <Menu.Items>
              <Menu.Item as="a" disabled>
                Item A
              </Menu.Item>
              <Menu.Item as="a" disabled>
                Item B
              </Menu.Item>
              <Menu.Item as="a" disabled>
                Item C
              </Menu.Item>
            </Menu.Items>
          </Menu>
        )

        assertMenuButton({
          state: MenuState.InvisibleUnmounted,
          attributes: { id: 'headlessui-menu-button-1' },
        })
        assertMenu({ state: MenuState.InvisibleUnmounted })

        // Focus the button
        await focus(getMenuButton())

        // Open menu
        await press(Keys.Enter)

        assertNoActiveMenuItem()
      })
    )

    it(
      'should be possible to close the menu with Enter when there is no active menuitem',
      suppressConsoleLogs(async () => {
        render(
          <Menu>
            <Menu.Button>Trigger</Menu.Button>
            <Menu.Items>
              <Menu.Item as="a">Item A</Menu.Item>
              <Menu.Item as="a">Item B</Menu.Item>
              <Menu.Item as="a">Item C</Menu.Item>
            </Menu.Items>
          </Menu>
        )

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
    )

    it(
      'should be possible to close the menu with Enter and invoke the active menu item',
      suppressConsoleLogs(async () => {
        let clickHandler = jest.fn()
        render(
          <Menu>
            <Menu.Button>Trigger</Menu.Button>
            <Menu.Items>
              <Menu.Item as="a" onClick={clickHandler}>
                Item A
              </Menu.Item>
              <Menu.Item as="a">Item B</Menu.Item>
              <Menu.Item as="a">Item C</Menu.Item>
            </Menu.Items>
          </Menu>
        )

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
    )
  })

  it(
    'should be possible to use a button as a menu item and invoke it upon Enter',
    suppressConsoleLogs(async () => {
      let clickHandler = jest.fn()

      render(
        <Menu>
          <Menu.Button>Trigger</Menu.Button>
          <Menu.Items>
            <Menu.Item as="a">Item A</Menu.Item>
            <Menu.Item as="button" onClick={clickHandler}>
              Item B
            </Menu.Item>
            <Menu.Item>
              <button onClick={clickHandler}>Item C</button>
            </Menu.Item>
          </Menu.Items>
        </Menu>
      )

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
  )

  describe('`Space` key', () => {
    it(
      'should be possible to open the menu with Space',
      suppressConsoleLogs(async () => {
        render(
          <Menu>
            <Menu.Button>Trigger</Menu.Button>
            <Menu.Items>
              <Menu.Item as="a">Item A</Menu.Item>
              <Menu.Item as="a">Item B</Menu.Item>
              <Menu.Item as="a">Item C</Menu.Item>
            </Menu.Items>
          </Menu>
        )

        assertMenuButton({
          state: MenuState.InvisibleUnmounted,
          attributes: { id: 'headlessui-menu-button-1' },
        })
        assertMenu({ state: MenuState.InvisibleUnmounted })

        // Focus the button
        await focus(getMenuButton())

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
    )

    it(
      'should not be possible to open the menu with Space when the button is disabled',
      suppressConsoleLogs(async () => {
        render(
          <Menu>
            <Menu.Button disabled>Trigger</Menu.Button>
            <Menu.Items>
              <Menu.Item as="a">Item A</Menu.Item>
              <Menu.Item as="a">Item B</Menu.Item>
              <Menu.Item as="a">Item C</Menu.Item>
            </Menu.Items>
          </Menu>
        )

        assertMenuButton({
          state: MenuState.InvisibleUnmounted,
          attributes: { id: 'headlessui-menu-button-1' },
        })
        assertMenu({ state: MenuState.InvisibleUnmounted })

        // Focus the button
        await focus(getMenuButton())

        // Try to open the menu
        await press(Keys.Space)

        // Verify it is still closed
        assertMenuButton({
          state: MenuState.InvisibleUnmounted,
          attributes: { id: 'headlessui-menu-button-1' },
        })
        assertMenu({ state: MenuState.InvisibleUnmounted })
      })
    )

    it(
      'should have no active menu item when there are no menu items at all',
      suppressConsoleLogs(async () => {
        render(
          <Menu>
            <Menu.Button>Trigger</Menu.Button>
            <Menu.Items />
          </Menu>
        )

        assertMenu({ state: MenuState.InvisibleUnmounted })

        // Focus the button
        await focus(getMenuButton())

        // Open menu
        await press(Keys.Space)
        assertMenu({ state: MenuState.Visible })

        assertNoActiveMenuItem()
      })
    )

    it(
      'should focus the first non disabled menu item when opening with Space',
      suppressConsoleLogs(async () => {
        render(
          <Menu>
            <Menu.Button>Trigger</Menu.Button>
            <Menu.Items>
              <Menu.Item as="a" disabled>
                Item A
              </Menu.Item>
              <Menu.Item as="a">Item B</Menu.Item>
              <Menu.Item as="a">Item C</Menu.Item>
            </Menu.Items>
          </Menu>
        )

        assertMenuButton({
          state: MenuState.InvisibleUnmounted,
          attributes: { id: 'headlessui-menu-button-1' },
        })
        assertMenu({ state: MenuState.InvisibleUnmounted })

        // Focus the button
        await focus(getMenuButton())

        // Open menu
        await press(Keys.Space)

        let items = getMenuItems()

        // Verify that the first non-disabled menu item is active
        assertMenuLinkedWithMenuItem(items[1])
      })
    )

    it(
      'should focus the first non disabled menu item when opening with Space (jump over multiple disabled ones)',
      suppressConsoleLogs(async () => {
        render(
          <Menu>
            <Menu.Button>Trigger</Menu.Button>
            <Menu.Items>
              <Menu.Item as="a" disabled>
                Item A
              </Menu.Item>
              <Menu.Item as="a" disabled>
                Item B
              </Menu.Item>
              <Menu.Item as="a">Item C</Menu.Item>
            </Menu.Items>
          </Menu>
        )

        assertMenuButton({
          state: MenuState.InvisibleUnmounted,
          attributes: { id: 'headlessui-menu-button-1' },
        })
        assertMenu({ state: MenuState.InvisibleUnmounted })

        // Focus the button
        await focus(getMenuButton())

        // Open menu
        await press(Keys.Space)

        let items = getMenuItems()

        // Verify that the first non-disabled menu item is active
        assertMenuLinkedWithMenuItem(items[2])
      })
    )

    it(
      'should have no active menu item upon Space key press, when there are no non-disabled menu items',
      suppressConsoleLogs(async () => {
        render(
          <Menu>
            <Menu.Button>Trigger</Menu.Button>
            <Menu.Items>
              <Menu.Item as="a" disabled>
                Item A
              </Menu.Item>
              <Menu.Item as="a" disabled>
                Item B
              </Menu.Item>
              <Menu.Item as="a" disabled>
                Item C
              </Menu.Item>
            </Menu.Items>
          </Menu>
        )

        assertMenuButton({
          state: MenuState.InvisibleUnmounted,
          attributes: { id: 'headlessui-menu-button-1' },
        })
        assertMenu({ state: MenuState.InvisibleUnmounted })

        // Focus the button
        await focus(getMenuButton())

        // Open menu
        await press(Keys.Space)

        assertNoActiveMenuItem()
      })
    )

    it(
      'should be possible to close the menu with Space when there is no active menuitem',
      suppressConsoleLogs(async () => {
        render(
          <Menu>
            <Menu.Button>Trigger</Menu.Button>
            <Menu.Items>
              <Menu.Item as="a">Item A</Menu.Item>
              <Menu.Item as="a">Item B</Menu.Item>
              <Menu.Item as="a">Item C</Menu.Item>
            </Menu.Items>
          </Menu>
        )

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
        render(
          <Menu>
            <Menu.Button>Trigger</Menu.Button>
            <Menu.Items>
              <Menu.Item as="a" onClick={clickHandler}>
                Item A
              </Menu.Item>
              <Menu.Item as="a">Item B</Menu.Item>
              <Menu.Item as="a">Item C</Menu.Item>
            </Menu.Items>
          </Menu>
        )

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
    it(
      'should be possible to close an open menu with Escape',
      suppressConsoleLogs(async () => {
        render(
          <Menu>
            <Menu.Button>Trigger</Menu.Button>
            <Menu.Items>
              <Menu.Item as="a">Item A</Menu.Item>
              <Menu.Item as="a">Item B</Menu.Item>
              <Menu.Item as="a">Item C</Menu.Item>
            </Menu.Items>
          </Menu>
        )

        // Focus the button
        await focus(getMenuButton())

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
    )
  })

  describe('`Tab` key', () => {
    it(
      'should focus trap when we use Tab',
      suppressConsoleLogs(async () => {
        render(
          <Menu>
            <Menu.Button>Trigger</Menu.Button>
            <Menu.Items>
              <Menu.Item as="a">Item A</Menu.Item>
              <Menu.Item as="a">Item B</Menu.Item>
              <Menu.Item as="a">Item C</Menu.Item>
            </Menu.Items>
          </Menu>
        )

        assertMenuButton({
          state: MenuState.InvisibleUnmounted,
          attributes: { id: 'headlessui-menu-button-1' },
        })
        assertMenu({ state: MenuState.InvisibleUnmounted })

        // Focus the button
        await focus(getMenuButton())

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

        // Verify it is still open
        assertMenuButton({ state: MenuState.Visible })
        assertMenu({ state: MenuState.Visible })
      })
    )

    it(
      'should focus trap when we use Shift+Tab',
      suppressConsoleLogs(async () => {
        render(
          <Menu>
            <Menu.Button>Trigger</Menu.Button>
            <Menu.Items>
              <Menu.Item as="a">Item A</Menu.Item>
              <Menu.Item as="a">Item B</Menu.Item>
              <Menu.Item as="a">Item C</Menu.Item>
            </Menu.Items>
          </Menu>
        )

        assertMenuButton({
          state: MenuState.InvisibleUnmounted,
          attributes: { id: 'headlessui-menu-button-1' },
        })
        assertMenu({ state: MenuState.InvisibleUnmounted })

        // Focus the button
        await focus(getMenuButton())

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

        // Verify it is still open
        assertMenuButton({ state: MenuState.Visible })
        assertMenu({ state: MenuState.Visible })
      })
    )
  })

  describe('`ArrowDown` key', () => {
    it(
      'should be possible to open the menu with ArrowDown',
      suppressConsoleLogs(async () => {
        render(
          <Menu>
            <Menu.Button>Trigger</Menu.Button>
            <Menu.Items>
              <Menu.Item as="a">Item A</Menu.Item>
              <Menu.Item as="a">Item B</Menu.Item>
              <Menu.Item as="a">Item C</Menu.Item>
            </Menu.Items>
          </Menu>
        )

        assertMenuButton({
          state: MenuState.InvisibleUnmounted,
          attributes: { id: 'headlessui-menu-button-1' },
        })
        assertMenu({ state: MenuState.InvisibleUnmounted })

        // Focus the button
        await focus(getMenuButton())

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
    )

    it(
      'should not be possible to open the menu with ArrowDown when the button is disabled',
      suppressConsoleLogs(async () => {
        render(
          <Menu>
            <Menu.Button disabled>Trigger</Menu.Button>
            <Menu.Items>
              <Menu.Item as="a">Item A</Menu.Item>
              <Menu.Item as="a">Item B</Menu.Item>
              <Menu.Item as="a">Item C</Menu.Item>
            </Menu.Items>
          </Menu>
        )

        assertMenuButton({
          state: MenuState.InvisibleUnmounted,
          attributes: { id: 'headlessui-menu-button-1' },
        })
        assertMenu({ state: MenuState.InvisibleUnmounted })

        // Focus the button
        await focus(getMenuButton())

        // Try to open the menu
        await press(Keys.ArrowDown)

        // Verify it is still closed
        assertMenuButton({
          state: MenuState.InvisibleUnmounted,
          attributes: { id: 'headlessui-menu-button-1' },
        })
        assertMenu({ state: MenuState.InvisibleUnmounted })
      })
    )

    it(
      'should have no active menu item when there are no menu items at all',
      suppressConsoleLogs(async () => {
        render(
          <Menu>
            <Menu.Button>Trigger</Menu.Button>
            <Menu.Items />
          </Menu>
        )

        assertMenu({ state: MenuState.InvisibleUnmounted })

        // Focus the button
        await focus(getMenuButton())

        // Open menu
        await press(Keys.ArrowDown)
        assertMenu({ state: MenuState.Visible })

        assertNoActiveMenuItem()
      })
    )

    it(
      'should be possible to use ArrowDown to navigate the menu items',
      suppressConsoleLogs(async () => {
        render(
          <Menu>
            <Menu.Button>Trigger</Menu.Button>
            <Menu.Items>
              <Menu.Item as="a">Item A</Menu.Item>
              <Menu.Item as="a">Item B</Menu.Item>
              <Menu.Item as="a">Item C</Menu.Item>
            </Menu.Items>
          </Menu>
        )

        assertMenuButton({
          state: MenuState.InvisibleUnmounted,
          attributes: { id: 'headlessui-menu-button-1' },
        })
        assertMenu({ state: MenuState.InvisibleUnmounted })

        // Focus the button
        await focus(getMenuButton())

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
    )

    it(
      'should be possible to use ArrowDown to navigate the menu items and skip the first disabled one',
      suppressConsoleLogs(async () => {
        render(
          <Menu>
            <Menu.Button>Trigger</Menu.Button>
            <Menu.Items>
              <Menu.Item as="a" disabled>
                Item A
              </Menu.Item>
              <Menu.Item as="a">Item B</Menu.Item>
              <Menu.Item as="a">Item C</Menu.Item>
            </Menu.Items>
          </Menu>
        )

        assertMenuButton({
          state: MenuState.InvisibleUnmounted,
          attributes: { id: 'headlessui-menu-button-1' },
        })
        assertMenu({ state: MenuState.InvisibleUnmounted })

        // Focus the button
        await focus(getMenuButton())

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
    )

    it(
      'should be possible to use ArrowDown to navigate the menu items and jump to the first non-disabled one',
      suppressConsoleLogs(async () => {
        render(
          <Menu>
            <Menu.Button>Trigger</Menu.Button>
            <Menu.Items>
              <Menu.Item as="a" disabled>
                Item A
              </Menu.Item>
              <Menu.Item as="a" disabled>
                Item B
              </Menu.Item>
              <Menu.Item as="a">Item C</Menu.Item>
            </Menu.Items>
          </Menu>
        )

        assertMenuButton({
          state: MenuState.InvisibleUnmounted,
          attributes: { id: 'headlessui-menu-button-1' },
        })
        assertMenu({ state: MenuState.InvisibleUnmounted })

        // Focus the button
        await focus(getMenuButton())

        // Open menu
        await press(Keys.Enter)

        // Verify we have menu items
        let items = getMenuItems()
        expect(items).toHaveLength(3)
        items.forEach((item) => assertMenuItem(item))
        assertMenuLinkedWithMenuItem(items[2])
      })
    )
  })

  describe('`ArrowUp` key', () => {
    it(
      'should be possible to open the menu with ArrowUp and the last item should be active',
      suppressConsoleLogs(async () => {
        render(
          <Menu>
            <Menu.Button>Trigger</Menu.Button>
            <Menu.Items>
              <Menu.Item as="a">Item A</Menu.Item>
              <Menu.Item as="a">Item B</Menu.Item>
              <Menu.Item as="a">Item C</Menu.Item>
            </Menu.Items>
          </Menu>
        )

        assertMenuButton({
          state: MenuState.InvisibleUnmounted,
          attributes: { id: 'headlessui-menu-button-1' },
        })
        assertMenu({ state: MenuState.InvisibleUnmounted })

        // Focus the button
        await focus(getMenuButton())

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
    )

    it(
      'should not be possible to open the menu with ArrowUp and the last item should be active when the button is disabled',
      suppressConsoleLogs(async () => {
        render(
          <Menu>
            <Menu.Button disabled>Trigger</Menu.Button>
            <Menu.Items>
              <Menu.Item as="a">Item A</Menu.Item>
              <Menu.Item as="a">Item B</Menu.Item>
              <Menu.Item as="a">Item C</Menu.Item>
            </Menu.Items>
          </Menu>
        )

        assertMenuButton({
          state: MenuState.InvisibleUnmounted,
          attributes: { id: 'headlessui-menu-button-1' },
        })
        assertMenu({ state: MenuState.InvisibleUnmounted })

        // Focus the button
        await focus(getMenuButton())

        // Try to open the menu
        await press(Keys.ArrowUp)

        // Verify it is still closed
        assertMenuButton({
          state: MenuState.InvisibleUnmounted,
          attributes: { id: 'headlessui-menu-button-1' },
        })
        assertMenu({ state: MenuState.InvisibleUnmounted })
      })
    )

    it(
      'should have no active menu item when there are no menu items at all',
      suppressConsoleLogs(async () => {
        render(
          <Menu>
            <Menu.Button>Trigger</Menu.Button>
            <Menu.Items />
          </Menu>
        )

        assertMenu({ state: MenuState.InvisibleUnmounted })

        // Focus the button
        await focus(getMenuButton())

        // Open menu
        await press(Keys.ArrowUp)
        assertMenu({ state: MenuState.Visible })

        assertNoActiveMenuItem()
      })
    )

    it(
      'should be possible to use ArrowUp to navigate the menu items and jump to the first non-disabled one',
      suppressConsoleLogs(async () => {
        render(
          <Menu>
            <Menu.Button>Trigger</Menu.Button>
            <Menu.Items>
              <Menu.Item as="a">Item A</Menu.Item>
              <Menu.Item as="a" disabled>
                Item B
              </Menu.Item>
              <Menu.Item as="a" disabled>
                Item C
              </Menu.Item>
            </Menu.Items>
          </Menu>
        )

        assertMenuButton({
          state: MenuState.InvisibleUnmounted,
          attributes: { id: 'headlessui-menu-button-1' },
        })
        assertMenu({ state: MenuState.InvisibleUnmounted })

        // Focus the button
        await focus(getMenuButton())

        // Open menu
        await press(Keys.ArrowUp)

        // Verify we have menu items
        let items = getMenuItems()
        expect(items).toHaveLength(3)
        items.forEach((item) => assertMenuItem(item))
        assertMenuLinkedWithMenuItem(items[0])
      })
    )

    it(
      'should not be possible to navigate up or down if there is only a single non-disabled item',
      suppressConsoleLogs(async () => {
        render(
          <Menu>
            <Menu.Button>Trigger</Menu.Button>
            <Menu.Items>
              <Menu.Item as="a" disabled>
                Item A
              </Menu.Item>
              <Menu.Item as="a" disabled>
                Item B
              </Menu.Item>
              <Menu.Item as="a">Item C</Menu.Item>
            </Menu.Items>
          </Menu>
        )

        assertMenuButton({
          state: MenuState.InvisibleUnmounted,
          attributes: { id: 'headlessui-menu-button-1' },
        })
        assertMenu({ state: MenuState.InvisibleUnmounted })

        // Focus the button
        await focus(getMenuButton())

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
    )

    it(
      'should be possible to use ArrowUp to navigate the menu items',
      suppressConsoleLogs(async () => {
        render(
          <Menu>
            <Menu.Button>Trigger</Menu.Button>
            <Menu.Items>
              <Menu.Item as="a">Item A</Menu.Item>
              <Menu.Item as="a">Item B</Menu.Item>
              <Menu.Item as="a">Item C</Menu.Item>
            </Menu.Items>
          </Menu>
        )

        assertMenuButton({
          state: MenuState.InvisibleUnmounted,
          attributes: { id: 'headlessui-menu-button-1' },
        })
        assertMenu({ state: MenuState.InvisibleUnmounted })

        // Focus the button
        await focus(getMenuButton())

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
    )
  })

  describe('`End` key', () => {
    it(
      'should be possible to use the End key to go to the last menu item',
      suppressConsoleLogs(async () => {
        render(
          <Menu>
            <Menu.Button>Trigger</Menu.Button>
            <Menu.Items>
              <Menu.Item as="a">Item A</Menu.Item>
              <Menu.Item as="a">Item B</Menu.Item>
              <Menu.Item as="a">Item C</Menu.Item>
            </Menu.Items>
          </Menu>
        )

        // Focus the button
        await focus(getMenuButton())

        // Open menu
        await press(Keys.Enter)

        let items = getMenuItems()

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
        render(
          <Menu>
            <Menu.Button>Trigger</Menu.Button>
            <Menu.Items>
              <Menu.Item as="a">Item A</Menu.Item>
              <Menu.Item as="a">Item B</Menu.Item>
              <Menu.Item as="a" disabled>
                Item C
              </Menu.Item>
              <Menu.Item as="a" disabled>
                Item D
              </Menu.Item>
            </Menu.Items>
          </Menu>
        )

        // Focus the button
        await focus(getMenuButton())

        // Open menu
        await press(Keys.Enter)

        let items = getMenuItems()

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
        render(
          <Menu>
            <Menu.Button>Trigger</Menu.Button>
            <Menu.Items>
              <Menu.Item as="a">Item A</Menu.Item>
              <Menu.Item as="a" disabled>
                Item B
              </Menu.Item>
              <Menu.Item as="a" disabled>
                Item C
              </Menu.Item>
              <Menu.Item as="a" disabled>
                Item D
              </Menu.Item>
            </Menu.Items>
          </Menu>
        )

        // Open menu
        await click(getMenuButton())

        // We opened via click, we don't have an active item
        assertNoActiveMenuItem()

        // We should not be able to go to the end
        await press(Keys.End)

        let items = getMenuItems()
        assertMenuLinkedWithMenuItem(items[0])
      })
    )

    it(
      'should have no active menu item upon End key press, when there are no non-disabled menu items',
      suppressConsoleLogs(async () => {
        render(
          <Menu>
            <Menu.Button>Trigger</Menu.Button>
            <Menu.Items>
              <Menu.Item as="a" disabled>
                Item A
              </Menu.Item>
              <Menu.Item as="a" disabled>
                Item B
              </Menu.Item>
              <Menu.Item as="a" disabled>
                Item C
              </Menu.Item>
              <Menu.Item as="a" disabled>
                Item D
              </Menu.Item>
            </Menu.Items>
          </Menu>
        )

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
        render(
          <Menu>
            <Menu.Button>Trigger</Menu.Button>
            <Menu.Items>
              <Menu.Item as="a">Item A</Menu.Item>
              <Menu.Item as="a">Item B</Menu.Item>
              <Menu.Item as="a">Item C</Menu.Item>
            </Menu.Items>
          </Menu>
        )

        // Focus the button
        await focus(getMenuButton())

        // Open menu
        await press(Keys.Enter)

        let items = getMenuItems()

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
        render(
          <Menu>
            <Menu.Button>Trigger</Menu.Button>
            <Menu.Items>
              <Menu.Item as="a">Item A</Menu.Item>
              <Menu.Item as="a">Item B</Menu.Item>
              <Menu.Item as="a" disabled>
                Item C
              </Menu.Item>
              <Menu.Item as="a" disabled>
                Item D
              </Menu.Item>
            </Menu.Items>
          </Menu>
        )

        // Focus the button
        await focus(getMenuButton())

        // Open menu
        await press(Keys.Enter)

        let items = getMenuItems()

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
        render(
          <Menu>
            <Menu.Button>Trigger</Menu.Button>
            <Menu.Items>
              <Menu.Item as="a">Item A</Menu.Item>
              <Menu.Item as="a" disabled>
                Item B
              </Menu.Item>
              <Menu.Item as="a" disabled>
                Item C
              </Menu.Item>
              <Menu.Item as="a" disabled>
                Item D
              </Menu.Item>
            </Menu.Items>
          </Menu>
        )

        // Open menu
        await click(getMenuButton())

        // We opened via click, we don't have an active item
        assertNoActiveMenuItem()

        // We should not be able to go to the end
        await press(Keys.PageDown)

        let items = getMenuItems()
        assertMenuLinkedWithMenuItem(items[0])
      })
    )

    it(
      'should have no active menu item upon PageDown key press, when there are no non-disabled menu items',
      suppressConsoleLogs(async () => {
        render(
          <Menu>
            <Menu.Button>Trigger</Menu.Button>
            <Menu.Items>
              <Menu.Item as="a" disabled>
                Item A
              </Menu.Item>
              <Menu.Item as="a" disabled>
                Item B
              </Menu.Item>
              <Menu.Item as="a" disabled>
                Item C
              </Menu.Item>
              <Menu.Item as="a" disabled>
                Item D
              </Menu.Item>
            </Menu.Items>
          </Menu>
        )

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
        render(
          <Menu>
            <Menu.Button>Trigger</Menu.Button>
            <Menu.Items>
              <Menu.Item as="a">Item A</Menu.Item>
              <Menu.Item as="a">Item B</Menu.Item>
              <Menu.Item as="a">Item C</Menu.Item>
            </Menu.Items>
          </Menu>
        )

        // Focus the button
        await focus(getMenuButton())

        // Open menu
        await press(Keys.ArrowUp)

        let items = getMenuItems()

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
        render(
          <Menu>
            <Menu.Button>Trigger</Menu.Button>
            <Menu.Items>
              <Menu.Item as="a" disabled>
                Item A
              </Menu.Item>
              <Menu.Item as="a" disabled>
                Item B
              </Menu.Item>
              <Menu.Item as="a">Item C</Menu.Item>
              <Menu.Item as="a">Item D</Menu.Item>
            </Menu.Items>
          </Menu>
        )

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
    )

    it(
      'should be possible to use the Home key to go to the last menu item if that is the only non-disabled menu item',
      suppressConsoleLogs(async () => {
        render(
          <Menu>
            <Menu.Button>Trigger</Menu.Button>
            <Menu.Items>
              <Menu.Item as="a" disabled>
                Item A
              </Menu.Item>
              <Menu.Item as="a" disabled>
                Item B
              </Menu.Item>
              <Menu.Item as="a" disabled>
                Item C
              </Menu.Item>
              <Menu.Item as="a">Item D</Menu.Item>
            </Menu.Items>
          </Menu>
        )

        // Open menu
        await click(getMenuButton())

        // We opened via click, we don't have an active item
        assertNoActiveMenuItem()

        // We should not be able to go to the end
        await press(Keys.Home)

        let items = getMenuItems()
        assertMenuLinkedWithMenuItem(items[3])
      })
    )

    it(
      'should have no active menu item upon Home key press, when there are no non-disabled menu items',
      suppressConsoleLogs(async () => {
        render(
          <Menu>
            <Menu.Button>Trigger</Menu.Button>
            <Menu.Items>
              <Menu.Item as="a" disabled>
                Item A
              </Menu.Item>
              <Menu.Item as="a" disabled>
                Item B
              </Menu.Item>
              <Menu.Item as="a" disabled>
                Item C
              </Menu.Item>
              <Menu.Item as="a" disabled>
                Item D
              </Menu.Item>
            </Menu.Items>
          </Menu>
        )

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
        render(
          <Menu>
            <Menu.Button>Trigger</Menu.Button>
            <Menu.Items>
              <Menu.Item as="a">Item A</Menu.Item>
              <Menu.Item as="a">Item B</Menu.Item>
              <Menu.Item as="a">Item C</Menu.Item>
            </Menu.Items>
          </Menu>
        )

        // Focus the button
        await focus(getMenuButton())

        // Open menu
        await press(Keys.ArrowUp)

        let items = getMenuItems()

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
        render(
          <Menu>
            <Menu.Button>Trigger</Menu.Button>
            <Menu.Items>
              <Menu.Item as="a" disabled>
                Item A
              </Menu.Item>
              <Menu.Item as="a" disabled>
                Item B
              </Menu.Item>
              <Menu.Item as="a">Item C</Menu.Item>
              <Menu.Item as="a">Item D</Menu.Item>
            </Menu.Items>
          </Menu>
        )

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
    )

    it(
      'should be possible to use the PageUp key to go to the last menu item if that is the only non-disabled menu item',
      suppressConsoleLogs(async () => {
        render(
          <Menu>
            <Menu.Button>Trigger</Menu.Button>
            <Menu.Items>
              <Menu.Item as="a" disabled>
                Item A
              </Menu.Item>
              <Menu.Item as="a" disabled>
                Item B
              </Menu.Item>
              <Menu.Item as="a" disabled>
                Item C
              </Menu.Item>
              <Menu.Item as="a">Item D</Menu.Item>
            </Menu.Items>
          </Menu>
        )

        // Open menu
        await click(getMenuButton())

        // We opened via click, we don't have an active item
        assertNoActiveMenuItem()

        // We should not be able to go to the end
        await press(Keys.PageUp)

        let items = getMenuItems()
        assertMenuLinkedWithMenuItem(items[3])
      })
    )

    it(
      'should have no active menu item upon PageUp key press, when there are no non-disabled menu items',
      suppressConsoleLogs(async () => {
        render(
          <Menu>
            <Menu.Button>Trigger</Menu.Button>
            <Menu.Items>
              <Menu.Item as="a" disabled>
                Item A
              </Menu.Item>
              <Menu.Item as="a" disabled>
                Item B
              </Menu.Item>
              <Menu.Item as="a" disabled>
                Item C
              </Menu.Item>
              <Menu.Item as="a" disabled>
                Item D
              </Menu.Item>
            </Menu.Items>
          </Menu>
        )

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
        render(
          <Menu>
            <Menu.Button>Trigger</Menu.Button>
            <Menu.Items>
              <Menu.Item as="a">alice</Menu.Item>
              <Menu.Item as="a">bob</Menu.Item>
              <Menu.Item as="a">charlie</Menu.Item>
            </Menu.Items>
          </Menu>
        )

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
    )

    it(
      'should be possible to type a partial of a word',
      suppressConsoleLogs(async () => {
        render(
          <Menu>
            <Menu.Button>Trigger</Menu.Button>
            <Menu.Items>
              <Menu.Item as="a">alice</Menu.Item>
              <Menu.Item as="a">bob</Menu.Item>
              <Menu.Item as="a">charlie</Menu.Item>
            </Menu.Items>
          </Menu>
        )

        // Focus the button
        await focus(getMenuButton())

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
    )

    it(
      'should be possible to type words with spaces',
      suppressConsoleLogs(async () => {
        render(
          <Menu>
            <Menu.Button>Trigger</Menu.Button>
            <Menu.Items>
              <Menu.Item as="a">value a</Menu.Item>
              <Menu.Item as="a">value b</Menu.Item>
              <Menu.Item as="a">value c</Menu.Item>
            </Menu.Items>
          </Menu>
        )

        // Focus the button
        await focus(getMenuButton())

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

    it(
      'should not be possible to search for a disabled item',
      suppressConsoleLogs(async () => {
        render(
          <Menu>
            <Menu.Button>Trigger</Menu.Button>
            <Menu.Items>
              <Menu.Item as="a">alice</Menu.Item>
              <Menu.Item as="a" disabled>
                bob
              </Menu.Item>
              <Menu.Item as="a">charlie</Menu.Item>
            </Menu.Items>
          </Menu>
        )

        // Focus the button
        await focus(getMenuButton())

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
    )

    it(
      'should be possible to search for a word (case insensitive)',
      suppressConsoleLogs(async () => {
        render(
          <Menu>
            <Menu.Button>Trigger</Menu.Button>
            <Menu.Items>
              <Menu.Item as="a">alice</Menu.Item>
              <Menu.Item as="a">bob</Menu.Item>
              <Menu.Item as="a">charlie</Menu.Item>
            </Menu.Items>
          </Menu>
        )

        // Focus the button
        await focus(getMenuButton())

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
    )

    it(
      'should be possible to search for the next occurence',
      suppressConsoleLogs(async () => {
        render(
          <Menu>
            <Menu.Button>Trigger</Menu.Button>
            <Menu.Items>
              <Menu.Item as="a">alice</Menu.Item>
              <Menu.Item as="a">bob</Menu.Item>
              <Menu.Item as="a">charlie</Menu.Item>
              <Menu.Item as="a">bob</Menu.Item>
            </Menu.Items>
          </Menu>
        )

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
    )

    it(
      'should stay on the same item while keystrokes still match',
      suppressConsoleLogs(async () => {
        render(
          <Menu>
            <Menu.Button>Trigger</Menu.Button>
            <Menu.Items>
              <Menu.Item as="a">alice</Menu.Item>
              <Menu.Item as="a">bob</Menu.Item>
              <Menu.Item as="a">charlie</Menu.Item>
              <Menu.Item as="a">bob</Menu.Item>
            </Menu.Items>
          </Menu>
        )

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
  it(
    'should be possible to open a menu on click',
    suppressConsoleLogs(async () => {
      render(
        <Menu>
          <Menu.Button>Trigger</Menu.Button>
          <Menu.Items>
            <Menu.Item as="a">Item A</Menu.Item>
            <Menu.Item as="a">Item B</Menu.Item>
            <Menu.Item as="a">Item C</Menu.Item>
          </Menu.Items>
        </Menu>
      )

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
  )

  it(
    'should not be possible to open a menu on right click',
    suppressConsoleLogs(async () => {
      render(
        <Menu>
          <Menu.Button>Trigger</Menu.Button>
          <Menu.Items>
            <Menu.Item as="a">Item A</Menu.Item>
            <Menu.Item as="a">Item B</Menu.Item>
            <Menu.Item as="a">Item C</Menu.Item>
          </Menu.Items>
        </Menu>
      )

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

  it(
    'should not be possible to open a menu on click when the button is disabled',
    suppressConsoleLogs(async () => {
      render(
        <Menu>
          <Menu.Button disabled>Trigger</Menu.Button>
          <Menu.Items>
            <Menu.Item as="a">Item A</Menu.Item>
            <Menu.Item as="a">Item B</Menu.Item>
            <Menu.Item as="a">Item C</Menu.Item>
          </Menu.Items>
        </Menu>
      )

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
  )

  it(
    'should be possible to close a menu on click',
    suppressConsoleLogs(async () => {
      render(
        <Menu>
          <Menu.Button>Trigger</Menu.Button>
          <Menu.Items>
            <Menu.Item as="a">Item A</Menu.Item>
            <Menu.Item as="a">Item B</Menu.Item>
            <Menu.Item as="a">Item C</Menu.Item>
          </Menu.Items>
        </Menu>
      )

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
  )

  it(
    'should be a no-op when we click outside of a closed menu',
    suppressConsoleLogs(async () => {
      render(
        <Menu>
          <Menu.Button>Trigger</Menu.Button>
          <Menu.Items>
            <Menu.Item as="a">alice</Menu.Item>
            <Menu.Item as="a">bob</Menu.Item>
            <Menu.Item as="a">charlie</Menu.Item>
          </Menu.Items>
        </Menu>
      )

      // Verify that the window is closed
      assertMenu({ state: MenuState.InvisibleUnmounted })

      // Click something that is not related to the menu
      await click(document.body)

      // Should still be closed
      assertMenu({ state: MenuState.InvisibleUnmounted })
    })
  )

  it(
    'should be possible to click outside of the menu which should close the menu',
    suppressConsoleLogs(async () => {
      render(
        <Menu>
          <Menu.Button>Trigger</Menu.Button>
          <Menu.Items>
            <Menu.Item as="a">alice</Menu.Item>
            <Menu.Item as="a">bob</Menu.Item>
            <Menu.Item as="a">charlie</Menu.Item>
          </Menu.Items>
        </Menu>
      )

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
  )

  it(
    'should be possible to click outside of the menu which should close the menu (even if we press the menu button)',
    suppressConsoleLogs(async () => {
      render(
        <Menu>
          <Menu.Button>Trigger</Menu.Button>
          <Menu.Items>
            <Menu.Item as="a">alice</Menu.Item>
            <Menu.Item as="a">bob</Menu.Item>
            <Menu.Item as="a">charlie</Menu.Item>
          </Menu.Items>
        </Menu>
      )

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
  )

  it(
    'should be possible to click outside of the menu on another menu button which should close the current menu and open the new menu',
    suppressConsoleLogs(async () => {
      render(
        <div>
          <Menu>
            <Menu.Button>Trigger</Menu.Button>
            <Menu.Items>
              <Menu.Item as="a">alice</Menu.Item>
              <Menu.Item as="a">bob</Menu.Item>
              <Menu.Item as="a">charlie</Menu.Item>
            </Menu.Items>
          </Menu>

          <Menu>
            <Menu.Button>Trigger</Menu.Button>
            <Menu.Items>
              <Menu.Item as="a">alice</Menu.Item>
              <Menu.Item as="a">bob</Menu.Item>
              <Menu.Item as="a">charlie</Menu.Item>
            </Menu.Items>
          </Menu>
        </div>
      )

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

  it(
    'should be possible to click outside of the menu, on an element which is within a focusable element, which closes the menu',
    suppressConsoleLogs(async () => {
      let focusFn = jest.fn()
      render(
        <div>
          <Menu>
            <Menu.Button onFocus={focusFn}>Trigger</Menu.Button>
            <Menu.Items>
              <Menu.Item as="a">alice</Menu.Item>
              <Menu.Item as="a">bob</Menu.Item>
              <Menu.Item as="a">charlie</Menu.Item>
            </Menu.Items>
          </Menu>

          <button id="btn">
            <span>Next</span>
          </button>
        </div>
      )

      // Click the menu button
      await click(getMenuButton())

      // Ensure the menu is open
      assertMenu({ state: MenuState.Visible })

      // Click the span inside the button
      await click(getByText('Next'))

      // Ensure the menu is closed
      assertMenu({ state: MenuState.InvisibleUnmounted })

      // Ensure the outside button is focused
      assertActiveElement(document.getElementById('btn'))

      // Ensure that the focus button only got focus once (first click)
      expect(focusFn).toHaveBeenCalledTimes(1)
    })
  )

  it(
    'should be possible to hover an item and make it active',
    suppressConsoleLogs(async () => {
      render(
        <Menu>
          <Menu.Button>Trigger</Menu.Button>
          <Menu.Items>
            <Menu.Item as="a">alice</Menu.Item>
            <Menu.Item as="a">bob</Menu.Item>
            <Menu.Item as="a">charlie</Menu.Item>
          </Menu.Items>
        </Menu>
      )

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
  )

  it(
    'should make a menu item active when you move the mouse over it',
    suppressConsoleLogs(async () => {
      render(
        <Menu>
          <Menu.Button>Trigger</Menu.Button>
          <Menu.Items>
            <Menu.Item as="a">alice</Menu.Item>
            <Menu.Item as="a">bob</Menu.Item>
            <Menu.Item as="a">charlie</Menu.Item>
          </Menu.Items>
        </Menu>
      )

      // Open menu
      await click(getMenuButton())

      let items = getMenuItems()
      // We should be able to go to the second item
      await mouseMove(items[1])
      assertMenuLinkedWithMenuItem(items[1])
    })
  )

  it(
    'should be a no-op when we move the mouse and the menu item is already active',
    suppressConsoleLogs(async () => {
      render(
        <Menu>
          <Menu.Button>Trigger</Menu.Button>
          <Menu.Items>
            <Menu.Item as="a">alice</Menu.Item>
            <Menu.Item as="a">bob</Menu.Item>
            <Menu.Item as="a">charlie</Menu.Item>
          </Menu.Items>
        </Menu>
      )

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
  )

  it(
    'should be a no-op when we move the mouse and the menu item is disabled',
    suppressConsoleLogs(async () => {
      render(
        <Menu>
          <Menu.Button>Trigger</Menu.Button>
          <Menu.Items>
            <Menu.Item as="a">alice</Menu.Item>
            <Menu.Item as="a" disabled>
              bob
            </Menu.Item>
            <Menu.Item as="a">charlie</Menu.Item>
          </Menu.Items>
        </Menu>
      )

      // Open menu
      await click(getMenuButton())

      let items = getMenuItems()

      await mouseMove(items[1])
      assertNoActiveMenuItem()
    })
  )

  it(
    'should not be possible to hover an item that is disabled',
    suppressConsoleLogs(async () => {
      render(
        <Menu>
          <Menu.Button>Trigger</Menu.Button>
          <Menu.Items>
            <Menu.Item as="a">alice</Menu.Item>
            <Menu.Item as="a" disabled>
              bob
            </Menu.Item>
            <Menu.Item as="a">charlie</Menu.Item>
          </Menu.Items>
        </Menu>
      )

      // Open menu
      await click(getMenuButton())

      let items = getMenuItems()

      // Try to hover over item 1, which is disabled
      await mouseMove(items[1])

      // We should not have an active item now
      assertNoActiveMenuItem()
    })
  )

  it(
    'should be possible to mouse leave an item and make it inactive',
    suppressConsoleLogs(async () => {
      render(
        <Menu>
          <Menu.Button>Trigger</Menu.Button>
          <Menu.Items>
            <Menu.Item as="a">alice</Menu.Item>
            <Menu.Item as="a">bob</Menu.Item>
            <Menu.Item as="a">charlie</Menu.Item>
          </Menu.Items>
        </Menu>
      )

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
  )

  it(
    'should be possible to mouse leave a disabled item and be a no-op',
    suppressConsoleLogs(async () => {
      render(
        <Menu>
          <Menu.Button>Trigger</Menu.Button>
          <Menu.Items>
            <Menu.Item as="a">alice</Menu.Item>
            <Menu.Item as="a" disabled>
              bob
            </Menu.Item>
            <Menu.Item as="a">charlie</Menu.Item>
          </Menu.Items>
        </Menu>
      )

      // Open menu
      await click(getMenuButton())

      let items = getMenuItems()

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
      let clickHandler = jest.fn()
      render(
        <Menu>
          <Menu.Button>Trigger</Menu.Button>
          <Menu.Items>
            <Menu.Item as="a">alice</Menu.Item>
            <Menu.Item as="a" onClick={clickHandler}>
              bob
            </Menu.Item>
            <Menu.Item as="a">charlie</Menu.Item>
          </Menu.Items>
        </Menu>
      )

      // Open menu
      await click(getMenuButton())
      assertMenu({ state: MenuState.Visible })

      let items = getMenuItems()

      // We should be able to click the first item
      await click(items[1])

      assertMenu({ state: MenuState.InvisibleUnmounted })
      expect(clickHandler).toHaveBeenCalled()
    })
  )

  it(
    'should be possible to click a menu item, which closes the menu and invokes the @click handler',
    suppressConsoleLogs(async () => {
      let clickHandler = jest.fn()
      render(
        <Menu>
          <Menu.Button>Trigger</Menu.Button>
          <Menu.Items>
            <Menu.Item as="a">alice</Menu.Item>
            <Menu.Item as="button" onClick={clickHandler}>
              bob
            </Menu.Item>
            <Menu.Item>
              <button onClick={clickHandler}>charlie</button>
            </Menu.Item>
          </Menu.Items>
        </Menu>
      )

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
  )

  it(
    'should be possible to click a disabled menu item, which is a no-op',
    suppressConsoleLogs(async () => {
      render(
        <Menu>
          <Menu.Button>Trigger</Menu.Button>
          <Menu.Items>
            <Menu.Item as="a">alice</Menu.Item>
            <Menu.Item as="a" disabled>
              bob
            </Menu.Item>
            <Menu.Item as="a">charlie</Menu.Item>
          </Menu.Items>
        </Menu>
      )

      // Open menu
      await click(getMenuButton())
      assertMenu({ state: MenuState.Visible })

      let items = getMenuItems()

      // We should be able to click the first item
      await click(items[1])
      assertMenu({ state: MenuState.Visible })
    })
  )

  it(
    'should be possible focus a menu item, so that it becomes active',
    suppressConsoleLogs(async () => {
      render(
        <Menu>
          <Menu.Button>Trigger</Menu.Button>
          <Menu.Items>
            <Menu.Item as="a">alice</Menu.Item>
            <Menu.Item as="a">bob</Menu.Item>
            <Menu.Item as="a">charlie</Menu.Item>
          </Menu.Items>
        </Menu>
      )

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
  )

  it(
    'should not be possible to focus a menu item which is disabled',
    suppressConsoleLogs(async () => {
      render(
        <Menu>
          <Menu.Button>Trigger</Menu.Button>
          <Menu.Items>
            <Menu.Item as="a">alice</Menu.Item>
            <Menu.Item as="a" disabled>
              bob
            </Menu.Item>
            <Menu.Item as="a">charlie</Menu.Item>
          </Menu.Items>
        </Menu>
      )

      // Open menu
      await click(getMenuButton())
      assertMenu({ state: MenuState.Visible })

      let items = getMenuItems()

      // We should not be able to focus the first item
      await focus(items[1])
      assertNoActiveMenuItem()
    })
  )

  it(
    'should not be possible to activate a disabled item',
    suppressConsoleLogs(async () => {
      let clickHandler = jest.fn()

      render(
        <Menu>
          <Menu.Button>Trigger</Menu.Button>
          <Menu.Items>
            <Menu.Item as="a" onClick={clickHandler}>
              alice
            </Menu.Item>
            <Menu.Item as="a" onClick={clickHandler} disabled>
              bob
            </Menu.Item>
            <Menu.Item disabled>
              <button onClick={clickHandler}>charlie</button>
            </Menu.Item>
          </Menu.Items>
        </Menu>
      )

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
  )
})
