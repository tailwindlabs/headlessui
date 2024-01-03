import { Popover, Portal, Transition } from '@headlessui/react'
import React, { Fragment, forwardRef } from 'react'
import { usePopper } from '../../utils/hooks/use-popper'

let Button = forwardRef(
  (props: React.ComponentProps<'button'>, ref: React.MutableRefObject<HTMLButtonElement>) => {
    return (
      <Popover.Button
        className="border-2 border-transparent bg-gray-300 px-3 py-2 text-left focus:border-blue-900 focus:outline-none"
        {...props}
        ref={ref}
      />
    )
  }
)

export default function Home() {
  let options = {
    placement: 'bottom-start' as const,
    strategy: 'fixed' as const,
    modifiers: [],
  }

  let [reference1, popper1] = usePopper(options)
  let [reference2, popper2] = usePopper(options)

  let items = ['First', 'Second', 'Third', 'Fourth']

  return (
    <div className="flex items-center justify-center space-x-12 p-12">
      <button>Previous</button>

      <Popover.Group as="nav" aria-label="Mythical University" className="flex space-x-3">
        <Popover as="div" className="relative">
          <Transition
            as={Fragment}
            enter="transition ease-out duration-300 transform"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition ease-in duration-300 transform"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Popover.Overlay className="fixed inset-0 z-20 bg-gray-500 bg-opacity-75"></Popover.Overlay>
          </Transition>

          <Popover.Button className="relative z-30 border-2 border-transparent bg-gray-300 px-3 py-2 focus:border-blue-900 focus:outline-none">
            Normal
          </Popover.Button>
          <Popover.Panel className="absolute z-30 flex w-64 flex-col border-2 border-blue-900 bg-gray-100">
            {items.map((item, i) => (
              <Button key={item} hidden={i === 2}>
                Normal - {item}
              </Button>
            ))}
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
          <Button ref={reference1}>Portal</Button>
          <Portal>
            <Popover.Panel
              ref={popper1}
              className="flex w-64 flex-col border-2 border-blue-900 bg-gray-100"
            >
              {items.map((item) => (
                <Button key={item}>Portal - {item}</Button>
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
              className="flex w-64 flex-col border-2 border-blue-900 bg-gray-100"
            >
              {items.map((item) => (
                <Button key={item}>Focus in Portal - {item}</Button>
              ))}
            </Popover.Panel>
          </Portal>
        </Popover>
      </Popover.Group>

      <button>Next</button>
    </div>
  )
}
