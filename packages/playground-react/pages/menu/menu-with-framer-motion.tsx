import { Menu, MenuItemProps } from '@headlessui/react'
import { AnimatePresence, motion } from 'framer-motion'
import Link from 'next/link'
import React, { forwardRef } from 'react'

import { Button } from '../../components/button'
import { classNames } from '../../utils/class-names'

export default function Home() {
  return (
    <div className="flex h-full w-screen justify-center bg-gray-50 p-12">
      <div className="relative inline-block text-left">
        <Menu>
          {({ open }) => (
            <>
              <span className="rounded-md shadow-sm">
                <Menu.Button as={Button}>
                  <span>Options</span>
                  <svg className="-mr-1 ml-2 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
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

let NextLink = forwardRef<HTMLAnchorElement>((props: React.ComponentProps<'a'>, ref) => {
  let { href, children, ...rest } = props
  return (
    <Link href={href}>
      <a ref={ref} {...rest}>
        {children}
      </a>
    </Link>
  )
})

let SignOutButton = forwardRef<HTMLButtonElement>((props, ref) => {
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
      <button ref={ref} type="submit" {...props}>
        Sign out
      </button>
    </form>
  )
})

let Item = forwardRef<HTMLAnchorElement, MenuItemProps<any>>((props, ref) => {
  return (
    <Menu.Item
      ref={ref}
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
})
