import { Menu } from '@headlessui/react'

import { Button } from '../../components/button'
import { classNames } from '../../utils/class-names'

export default function Home() {
  return (
    <div className="flex h-full w-screen justify-center bg-gray-50 p-12">
      <div className="relative inline-block text-left">
        <Menu>
          <span className="rounded-md shadow-sm">
            <Menu.Button as={Button}>
              <span>Options</span>
              <svg
                className="-mr-1 ml-2 h-5 w-5 transition-transform duration-150"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </Menu.Button>
          </span>

          <Menu.Items className="absolute right-0 mt-2 w-56 origin-top-right divide-y divide-gray-100 rounded-md border border-gray-200 bg-white shadow-lg outline-none">
            <div className="px-4 py-3">
              <p className="text-sm leading-5">Signed in as</p>
              <p className="truncate text-sm font-medium leading-5 text-gray-900">
                tom@example.com
              </p>
            </div>

            <div className="py-1">
              <CustomMenuItem href="#account-settings">Account settings</CustomMenuItem>
              <CustomMenuItem href="#support">Support</CustomMenuItem>
              <CustomMenuItem disabled href="#new-feature">
                New feature (soon)
              </CustomMenuItem>
              <CustomMenuItem href="#license">License</CustomMenuItem>
            </div>
            <div className="py-1">
              <CustomMenuItem href="#sign-out">Sign out</CustomMenuItem>
            </div>
          </Menu.Items>
        </Menu>
      </div>
    </div>
  )
}

function CustomMenuItem(props) {
  return (
    <Menu.Item {...props}>
      {({ active, disabled }) => (
        <a
          href={props.href}
          className={classNames(
            'flex w-full justify-between px-4 py-2 text-left text-sm leading-5',
            active ? 'bg-indigo-500 text-white' : 'text-gray-700',
            disabled && 'cursor-not-allowed opacity-50'
          )}
        >
          <span className={classNames(active && 'font-bold')}>{props.children}</span>
          <kbd className={classNames('font-sans', active && 'text-indigo-50')}>⌘K</kbd>
        </a>
      )}
    </Menu.Item>
  )
}
