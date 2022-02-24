import React from 'react'
import Link from 'next/link'
import { Menu } from '@headlessui/react'
import { AnimatePresence, motion } from 'framer-motion'

import { classNames } from '../../utils/class-names'

export default function Home() {
  return (
    <div className="flex h-full w-screen justify-center bg-gray-50 p-12">
      <div className="relative inline-block text-left">
        <Menu>
          {({ open }) => (
            <>
              <span className="rounded-md shadow-sm">
                <Menu.Button className="focus:shadow-outline-blue inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium leading-5 text-gray-700 transition duration-150 ease-in-out hover:text-gray-500 focus:border-blue-300 focus:outline-none active:bg-gray-50 active:text-gray-800">
                  <span>Options</span>
                  <svg className="ml-2 -mr-1 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </Menu.Button>
              </span>

              <AnimatePresence>
                {open && (
                  <Menu.Items
                    static
                    as={motion.div}
                    initial={{ opacity: 0, y: 0 }}
                    animate={{ opacity: 1, y: '0.5rem' }}
                    exit={{ opacity: 0, y: 0 }}
                    className="absolute right-0 w-56 divide-y divide-gray-100 rounded-md border border-gray-200 bg-white opacity-0 shadow-lg outline-none"
                  >
                    <div className="px-4 py-3">
                      <p className="text-sm leading-5">Signed in as</p>
                      <p className="truncate text-sm font-medium leading-5 text-gray-900">
                        tom@example.com
                      </p>
                    </div>

                    <div className="py-1">
                      <Item href="#account-settings">Account settings</Item>
                      <Item as={NextLink} href="#support">
                        Support
                      </Item>
                      <Item href="#new-feature" disabled>
                        New feature (soon)
                      </Item>
                      <Item href="#license">License</Item>
                    </div>

                    <div className="py-1">
                      <Item as={SignOutButton} />
                    </div>
                  </Menu.Items>
                )}
              </AnimatePresence>
            </>
          )}
        </Menu>
      </div>
    </div>
  )
}

function NextLink(props: React.ComponentProps<'a'>) {
  let { href, children, ...rest } = props
  return (
    <Link href={href}>
      <a {...rest}>{children}</a>
    </Link>
  )
}

function SignOutButton(props) {
  return (
    <form
      method="POST"
      action="#"
      onSubmit={(e) => {
        e.preventDefault()
        alert('SIGNED OUT')
      }}
      className="w-full"
    >
      <button type="submit" {...props}>
        Sign out
      </button>
    </form>
  )
}

function Item(props) {
  return (
    <Menu.Item
      as="a"
      className={({ active, disabled }) =>
        classNames(
          'block w-full px-4 py-2 text-left text-sm leading-5 text-gray-700',
          active && 'bg-gray-100 text-gray-900',
          disabled && 'cursor-not-allowed opacity-50'
        )
      }
      {...props}
    />
  )
}
