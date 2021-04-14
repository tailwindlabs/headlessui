import React, { forwardRef, Fragment } from 'react'
import { Popover, Portal, Transition } from '@headlessui/react'
import { usePopper } from '../../playground-utils/hooks/use-popper'
import { PropsOf as Props } from '../../src/types'

let Button = forwardRef((props: Props<'button'>, ref) => {
  return (
    <Popover.Button
      ref={ref}
      className="px-3 py-2 bg-gray-300 border-2 border-transparent focus:outline-none focus:border-blue-900"
      {...props}
    />
  )
})

function Link(props: Props<'a'>) {
  return (
    <a
      href="/"
      className="px-3 py-2 border-2 border-transparent hover:bg-gray-200 focus:bg-gray-200 focus:outline-none focus:border-blue-900"
      {...props}
    >
      {props.children}
    </a>
  )
}

export default function Home() {
  let options = {
    placement: 'bottom-start',
    strategy: 'fixed',
    modifiers: [],
  }

  let [reference1, popper1] = usePopper(options)
  let [reference2, popper2] = usePopper(options)

  let links = ['First', 'Second', 'Third', 'Fourth']

  return (
    <div className="flex justify-center items-center space-x-12 p-12">
      <button>Previous</button>

      <Popover.Group as="nav" ar-label="Mythical University" className="flex space-x-3">
        <Popover as="div" className="relative">
          {({ open }) => (
            <>
              <Transition
                as={Fragment}
                show={open}
                enter="transition ease-out duration-300 transform"
                enterFrom="opacity-0"
                enterTo="opacity-100"
                leave="transition ease-in duration-300 transform"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <Popover.Overlay
                  static
                  className="bg-opacity-75 bg-gray-500 fixed inset-0 z-20"
                ></Popover.Overlay>
              </Transition>

              <Popover.Button className="px-3 py-2 bg-gray-300 border-2 border-transparent focus:outline-none focus:border-blue-900 relative z-30">
                Normal
              </Popover.Button>
              <Popover.Panel className="absolute flex flex-col w-64 bg-gray-100 border-2 border-blue-900 z-30">
                {links.map((link, i) => (
                  <Link key={link} hidden={i === 2}>
                    Normal - {link}
                  </Link>
                ))}
              </Popover.Panel>
            </>
          )}
        </Popover>

        <Popover as="div" className="relative">
          <Button>Focus</Button>
          <Popover.Panel
            focus
            className="absolute flex flex-col w-64 bg-gray-100 border-2 border-blue-900"
          >
            {links.map((link, i) => (
              <Link key={link}>Focus - {link}</Link>
            ))}
          </Popover.Panel>
        </Popover>

        <Popover as="div" className="relative">
          <Button ref={reference1}>Portal</Button>
          <Portal>
            <Popover.Panel
              ref={popper1}
              className="flex flex-col w-64 bg-gray-100 border-2 border-blue-900"
            >
              {links.map(link => (
                <Link key={link}>Portal - {link}</Link>
              ))}
            </Popover.Panel>
          </Portal>
        </Popover>

        <Popover as="div" className="relative">
          <Button ref={reference2}>Focus in Portal</Button>
          <Portal>
            <Popover.Panel
              ref={popper2}
              focus
              className="flex flex-col w-64 bg-gray-100 border-2 border-blue-900"
            >
              {links.map(link => (
                <Link key={link}>Focus in Portal - {link}</Link>
              ))}
            </Popover.Panel>
          </Portal>
        </Popover>
      </Popover.Group>

      <button>Next</button>
    </div>
  )
}
