import { Popover, Transition } from '@headlessui/react'
import React, { forwardRef } from 'react'
import { ExampleMenu } from '../menu/menu'

let Button = forwardRef(
  (props: React.ComponentProps<'button'>, ref: React.MutableRefObject<HTMLButtonElement>) => {
    return (
      <Popover.Button
        className="focus:outline-hidden border-2 border-transparent bg-gray-300 px-3 py-2 text-left focus:border-blue-900"
        {...props}
        ref={ref}
      />
    )
  }
)

export default function Home() {
  let items = ['First', 'Second', 'Third', 'Fourth']

  return (
    <div className="flex items-center justify-center space-x-12 p-12">
      <button>Previous</button>

      <Popover.Group as="nav" aria-label="Mythical University" className="flex space-x-3">
        <Popover as="div" className="relative">
          <Transition
            enter="transition ease-out duration-300 transform"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition ease-in duration-300 transform"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Popover.Overlay className="fixed inset-0 z-20 bg-gray-500/75"></Popover.Overlay>
          </Transition>

          <Popover.Button className="focus:outline-hidden relative z-30 border-2 border-transparent bg-gray-300 px-3 py-2 focus:border-blue-900">
            Normal
          </Popover.Button>
          <Popover.Panel className="absolute z-30 flex w-64 flex-col border-2 border-blue-900 bg-gray-100">
            {items.map((item, i) => (
              <Button key={item} hidden={i === 2}>
                Normal - {item}
              </Button>
            ))}
            <div className="p-2">
              <ExampleMenu />
            </div>
          </Popover.Panel>
        </Popover>

        <Popover as="div" className="relative">
          <Button>Focus</Button>
          <Popover.Panel
            focus
            className="absolute flex w-64 flex-col border-2 border-blue-900 bg-gray-100"
          >
            {items.map((item) => (
              <Button key={item}>Focus - {item}</Button>
            ))}
          </Popover.Panel>
        </Popover>

        <Popover as="div" className="relative">
          <Button>Portal</Button>
          <Popover.Panel
            anchor="bottom start"
            className="flex w-64 flex-col border-2 border-blue-900 bg-gray-100 [--anchor-gap:--spacing(1)]"
          >
            {items.map((item) => (
              <Button key={item}>Portal - {item}</Button>
            ))}
            <div className="p-2">
              <ExampleMenu />
            </div>
          </Popover.Panel>
        </Popover>

        <Popover as="div" className="relative">
          <Button>Focus in Portal</Button>
          <Popover.Panel
            focus
            anchor="bottom start"
            className="flex w-64 flex-col border-2 border-blue-900 bg-gray-100 [--anchor-gap:--spacing(1)]"
          >
            {items.map((item) => (
              <Button key={item}>Focus in Portal - {item}</Button>
            ))}
          </Popover.Panel>
        </Popover>
      </Popover.Group>

      <button>Next</button>
    </div>
  )
}
