import * as React from 'react'
import * as ReactDOM from 'react-dom'
import Head from 'next/head'
import Link from 'next/link'
import { createPopper, Options } from '@popperjs/core'
import { Menu } from '@tailwindui/react'

import { classNames } from '../../src/utils/class-names'
import { PropsOf } from '../../src/types'

export default function Home() {
  return (
    <>
      <Head>
        <title>Menu with Popperjs - Playground</title>
      </Head>

      <div className="flex justify-center w-screen h-full p-12 bg-gray-50">
        <Dropdown />
      </div>
    </>
  )
}

/**
 * Example implementation to use Popper: https://popper.js.org/
 */
function usePopper(
  options?: Partial<Options>
): [React.RefCallback<Element | null>, React.RefCallback<HTMLElement | null>] {
  const reference = React.useRef<Element>(null)
  const popper = React.useRef<HTMLElement>(null)

  const cleanupCallback = React.useRef(() => {})

  const instantiatePopper = React.useCallback(() => {
    if (!reference.current) return
    if (!popper.current) return

    if (cleanupCallback.current) cleanupCallback.current()

    cleanupCallback.current = createPopper(reference.current, popper.current, options).destroy
  }, [reference, popper, cleanupCallback, options])

  return React.useMemo(
    () => [
      referenceDomNode => {
        reference.current = referenceDomNode
        instantiatePopper()
      },
      popperDomNode => {
        popper.current = popperDomNode
        instantiatePopper()
      },
    ],
    [reference, popper, instantiatePopper]
  )
}

function Portal(props: { children: React.ReactNode }) {
  const { children } = props
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => setMounted(true), [])

  if (!mounted) return null
  return ReactDOM.createPortal(children, document.body)
}

function Dropdown() {
  const [trigger, container] = usePopper({
    placement: 'bottom-end',
    strategy: 'fixed',
    modifiers: [{ name: 'offset', options: { offset: [0, 10] } }],
  })

  return (
    <div className="inline-block mt-64 text-left">
      <Menu>
        <span className="rounded-md shadow-sm">
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
            enter="transition-opacity ease-out duration-100"
            enterFrom="transform opacity-0 scale-95"
            enterTo="transform opacity-100 scale-100"
            leave="transition-opacity ease-in duration-75"
            leaveFrom="transform opacity-100 scale-100"
            leaveTo="transform opacity-0 scale-95"
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
        </Portal>
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

function SignOutButton(props) {
  return (
    <form
      method="POST"
      action="#"
      onSubmit={e => {
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

function Item(props: PropsOf<typeof Menu.Item>) {
  return (
    <Menu.Item
      as="a"
      className={({ active, disabled }) =>
        classNames(
          'block w-full text-left px-4 py-2 text-sm leading-5 text-gray-700',
          active && 'bg-gray-100 text-gray-900',
          disabled && 'cursor-not-allowed opacity-50'
        )
      }
      {...props}
    />
  )
}
