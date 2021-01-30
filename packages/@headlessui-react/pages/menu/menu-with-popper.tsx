import React, { ReactNode, useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Menu } from '@headlessui/react'

import { usePopper } from '../../playground-utils/hooks/use-popper'

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

export default function Home() {
  let [trigger, container] = usePopper({
    placement: 'bottom-end',
    strategy: 'fixed',
    modifiers: [{ name: 'offset', options: { offset: [0, 10] } }],
  })

  function resolveClass({ active, disabled }) {
    return classNames(
      'block w-full text-left px-4 py-2 text-sm leading-5 text-gray-700',
      active && 'bg-gray-100 text-gray-900',
      disabled && 'cursor-not-allowed opacity-50'
    )
  }

  return (
    <div className="flex justify-center w-screen h-full p-12 bg-gray-50">
      <div className="inline-block mt-64 text-left">
        <Menu>
          <span className="inline-flex rounded-md shadow-sm">
            <Menu.Button
              ref={trigger}
              className="inline-flex justify-center w-full px-4 py-2 text-sm font-medium leading-5 text-gray-700 transition duration-150 ease-in-out bg-white border border-gray-300 rounded-md hover:text-gray-500 focus:outline-none focus:border-blue-300 focus:shadow-outline-blue active:bg-gray-50 active:text-gray-800"
            >
              <span>Options</span>
              <svg className="w-5 h-5 ml-2 -mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </Menu.Button>
          </span>

          <Portal>
            <Menu.Items
              className="w-56 bg-white border border-gray-200 divide-y divide-gray-100 rounded-md shadow-lg outline-none"
              ref={container}
            >
              <div className="px-4 py-3">
                <p className="text-sm leading-5">Signed in as</p>
                <p className="text-sm font-medium leading-5 text-gray-900 truncate">
                  tom@example.com
                </p>
              </div>

              <div className="py-1">
                <Menu.Item as="a" href="#account-settings" className={resolveClass}>
                  Account settings
                </Menu.Item>
                <Menu.Item>
                  {data => (
                    <a href="#support" className={resolveClass(data)}>
                      Support
                    </a>
                  )}
                </Menu.Item>
                <Menu.Item as="a" disabled href="#new-feature" className={resolveClass}>
                  New feature (soon)
                </Menu.Item>
                <Menu.Item as="a" href="#license" className={resolveClass}>
                  License
                </Menu.Item>
              </div>

              <div className="py-1">
                <Menu.Item as="a" href="#sign-out" className={resolveClass}>
                  Sign out
                </Menu.Item>
              </div>
            </Menu.Items>
          </Portal>
        </Menu>
      </div>
    </div>
  )
}

function Portal(props: { children: ReactNode }) {
  let { children } = props
  let [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  if (!mounted) return null
  return createPortal(children, document.body)
}
