import React from 'react'
import { Menu } from '@headlessui/react'

import { PropsOf } from '../../src/types'

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

export default function Home() {
  return (
    <div className="flex justify-center w-screen h-full p-12 bg-gray-50">
      <div className="relative inline-block text-left">
        <Menu>
          <span className="rounded-md shadow-sm">
            <Menu.Button className="inline-flex justify-center w-full px-4 py-2 text-sm font-medium leading-5 text-gray-700 transition duration-150 ease-in-out bg-white border border-gray-300 rounded-md hover:text-gray-500 focus:outline-none focus:border-blue-300 focus:shadow-outline-blue active:bg-gray-50 active:text-gray-800">
              <span>Options</span>
              <svg
                className="w-5 h-5 ml-2 -mr-1 transition-transform duration-150"
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

          <Menu.Items className="absolute right-0 w-56 mt-2 origin-top-right bg-white border border-gray-200 divide-y divide-gray-100 rounded-md shadow-lg outline-none">
            <div className="px-4 py-3">
              <p className="text-sm leading-5">Signed in as</p>
              <p className="text-sm font-medium leading-5 text-gray-900 truncate">
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

function CustomMenuItem(props: PropsOf<typeof Menu.Item>) {
  return (
    <Menu.Item {...props}>
      {({ active, disabled }) => (
        <a
          href={props.href}
          className={classNames(
            'flex justify-between w-full text-left px-4 py-2 text-sm leading-5',
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
