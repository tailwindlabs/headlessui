import * as React from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { Menu } from '@headlessui/react'

import { classNames } from '../../src/utils/class-names'
import { PropsOf } from '../../src/types'

export default function Home() {
  return (
    <>
      <Head>
        <title>Menu with pure Tailwind- Playground</title>
      </Head>

      <div className="flex justify-center w-screen h-full p-12 bg-gray-50">
        <Dropdown />
      </div>
    </>
  )
}

function Dropdown() {
  return (
    <div className="relative inline-block text-left">
      <Menu>
        <span className="rounded-md shadow-sm">
          <Menu.Button className="inline-flex justify-center w-full px-4 py-2 text-sm font-medium leading-5 text-gray-700 transition duration-150 ease-in-out bg-white border border-gray-300 rounded-md hover:text-gray-500 focus:outline-none focus:border-blue-300 focus:shadow-outline-blue active:bg-gray-50 active:text-gray-800">
            {({ open }) => (
              <button>
                <span>Options</span>
                <svg
                  className={classNames(
                    'w-5 h-5 ml-2 -mr-1 transition-transform duration-150',
                    !open && 'transform -rotate-90'
                  )}
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            )}
          </Menu.Button>
        </span>

        <Menu.Items
          enter="transition ease-out duration-100"
          enterFrom="transform opacity-0 scale-95"
          enterTo="transform opacity-100 scale-100"
          leave="transition ease-in duration-75"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-95"
          className="absolute right-0 w-56 mt-2 origin-top-right bg-white border border-gray-200 divide-y divide-gray-100 rounded-md shadow-lg outline-none"
        >
          <div className="px-4 py-3">
            <p className="text-sm leading-5">Signed in as</p>
            <p className="text-sm font-medium leading-5 text-gray-900 truncate">tom@example.com</p>
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
            <SignOutButton />
          </div>
        </Menu.Items>
      </Menu>
    </div>
  )
}

function NextLink(props: PropsOf<'a'>) {
  const { href, children, ...rest } = props
  return (
    <Link href={href}>
      <a {...rest}>{children}</a>
    </Link>
  )
}

function SignOutButton() {
  return (
    <Menu.Item>
      {props => {
        const { active, disabled } = props
        return (
          <form
            method="POST"
            action="#"
            onSubmit={e => {
              e.preventDefault()
              alert('SIGNED OUT')
            }}
          >
            <button
              type="submit"
              className={classNames(
                'w-full',
                'flex justify-between w-full text-left px-4 py-2 text-sm leading-5',
                active ? 'bg-indigo-500 text-white' : 'text-gray-700',
                disabled && 'cursor-not-allowed opacity-50'
              )}
            >
              <span className={classNames(active && 'font-bold')}>Sign out</span>
              <kbd className={classNames('font-sans', active && 'text-indigo-50')}>⌘K</kbd>
            </button>
          </form>
        )
      }}
    </Menu.Item>
  )
}

function Item({ children, href, ...props }: PropsOf<typeof Menu.Item>) {
  return (
    <Menu.Item
      className={({ active, disabled }) => {
        return classNames(
          'flex justify-between w-full text-left px-4 py-2 text-sm leading-5',
          active ? 'bg-indigo-500 text-white' : 'text-gray-700',
          disabled && 'cursor-not-allowed opacity-50'
        )
      }}
      {...props}
    >
      {({ active }) => (
        <a href={href}>
          <span className={classNames(active && 'font-bold')}>{children}</span>
          <kbd className={classNames('font-sans', active && 'text-indigo-50')}>⌘K</kbd>
        </a>
      )}
    </Menu.Item>
  )
}
