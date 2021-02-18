import React, { forwardRef } from 'react'
import { Popover, Portal } from '@headlessui/react'
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
          <Button>Normal</Button>
          <Popover.Panel className="absolute flex flex-col w-64 bg-gray-100 border-2 border-blue-900">
            {links.map((link, i) => (
              <Link key={link} hidden={i === 2}>
                Normal - {link}
              </Link>
            ))}
          </Popover.Panel>
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
