import React from 'react'
import { render } from '@testing-library/react'
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

import { Menu } from './menu'
import { PropsOf } from '../../types'

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
      expect(() => render(React.createElement(Component))).toThrowError(
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
        state: MenuState.Closed,
        attributes: { id: 'headlessui-menu-button-1' },
      })
      assertMenu({ state: MenuState.Closed })
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
          state: MenuState.Closed,
          attributes: { id: 'headlessui-menu-button-1' },
          textContent: JSON.stringify({ open: false, focused: false }),
        })
        assertMenu({ state: MenuState.Closed })

        await click(getMenuButton())

        assertMenuButton({
          state: MenuState.Open,
          attributes: { id: 'headlessui-menu-button-1' },
          textContent: JSON.stringify({ open: true, focused: false }),
        })
        assertMenu({ state: MenuState.Open })
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
          state: MenuState.Closed,
          attributes: { id: 'headlessui-menu-button-1' },
          textContent: JSON.stringify({ open: false, focused: false }),
        })
        assertMenu({ state: MenuState.Closed })

        await click(getMenuButton())

        assertMenuButton({
          state: MenuState.Open,
          attributes: { id: 'headlessui-menu-button-1' },
          textContent: JSON.stringify({ open: true, focused: false }),
        })
        assertMenu({ state: MenuState.Open })
      })
    )
  })

  describe('Menu.Items', () => {
    it(
      'should be possible to render Menu.Items using a render prop',
      suppressConsoleLogs(async () => {
        render(
          <Menu>
            <Menu.Button>Trigger</Menu.Button>
            <Menu.Items>
              {data => (
                <>
                  <Menu.Item as="a">{JSON.stringify(data)}</Menu.Item>
                </>
              )}
            </Menu.Items>
          </Menu>
        )

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
        assertMenu({
          state: MenuState.Open,
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
          state: MenuState.Closed,
          attributes: { id: 'headlessui-menu-button-1' },
        })
        assertMenu({ state: MenuState.Closed })

        await click(getMenuButton())

        assertMenuButton({
          state: MenuState.Open,
          attributes: { id: 'headlessui-menu-button-1' },
        })
        assertMenu({
          state: MenuState.Open,
          textContent: JSON.stringify({ active: false, disabled: false }),
        })
      })
    )
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
            <Menu.Item as="a" className={bag => JSON.stringify(bag)}>
              Item A
            </Menu.Item>
            <Menu.Item as="a" disabled className={bag => JSON.stringify(bag)}>
              Item B
            </Menu.Item>
            <Menu.Item as="a" className="no-special-treatment">
              Item C
            </Menu.Item>
          </Menu.Items>
        </Menu>
      )

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
        state: MenuState.Closed,
        attributes: { id: 'headlessui-menu-button-1' },
      })
      assertMenu({ state: MenuState.Closed })

      // Open menu
      await click(getMenuButton())

      // Verify items are buttons now
      const items = getMenuItems()
      items.forEach(item => assertMenuItem(item, { tag: 'button' }))
    })
  )
})

menu.run({
  [menu.scenarios.Default]({
    button,
    items,
  }: {
    button: PropsOf<typeof Menu.Button>
    items: PropsOf<typeof Menu.Item>[]
  }) {
    return render(
      <Menu>
        <Menu.Button {...button} />
        <Menu.Items>
          {items.map((item, i) => (
            <Menu.Item key={i} {...item} />
          ))}
        </Menu.Items>
      </Menu>
    )
  },
  [menu.scenarios.LastItemButton]({
    button,
    items,
    lastItem,
  }: {
    button: PropsOf<typeof Menu.Button>
    items: PropsOf<typeof Menu.Item>[]
    lastItem: {
      props: PropsOf<typeof Menu.Item>
    } & PropsOf<'button'>
  }) {
    const { props: lastItemProps, ...lastItemButtonProps } = lastItem
    return render(
      <Menu>
        <Menu.Button {...button} />
        <Menu.Items>
          {items.map((item, i) => (
            <Menu.Item key={i} {...item} />
          ))}
          <Menu.Item {...lastItemProps}>
            <button {...lastItemButtonProps} />
          </Menu.Item>
        </Menu.Items>
      </Menu>
    )
  },
  [menu.scenarios.MultipleMenus](
    menus: {
      button: PropsOf<typeof Menu.Button>
      items: PropsOf<typeof Menu.Item>[]
    }[]
  ) {
    return render(
      <div>
        {menus.map(({ button, items }, i) => (
          <Menu key={i}>
            <Menu.Button {...button} />
            <Menu.Items>
              {items.map((item, i) => (
                <Menu.Item key={i} {...item} />
              ))}
            </Menu.Items>
          </Menu>
        ))}
      </div>
    )
  },
})
