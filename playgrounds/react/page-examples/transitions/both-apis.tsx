import { Transition } from '@headlessui/react'
import clsx from 'clsx'
import { useState } from 'react'

export default function Example() {
  const [open, setOpen] = useState(false)
  return (
    <div className="grid min-h-full place-content-center">
      <div className="flex flex-col">
        <button onClick={() => setOpen((open) => !open)}>Toggle transition</button>
        <div className="flex h-20 w-80">
          <Before open={open} />
          <After open={open} />
        </div>
      </div>
    </div>
  )
}

function Before({ open }: { open: boolean }) {
  return (
    <Transition
      show={open}
      enter="transition ease-in-out duration-300"
      enterFrom="opacity-0 -translate-x-full"
      enterTo="opacity-100 translate-x-0"
      leave="transition ease-in-out duration-300"
      leaveFrom="opacity-100 translate-x-0"
      leaveTo="opacity-0 translate-x-full"
    >
      <div className="h-20 w-48 border bg-blue-500 p-2 text-white">Using specific props</div>
    </Transition>
  )
}

function After({ open }: { open: boolean }) {
  return (
    <Transition show={open}>
      <div
        className={clsx([
          // Defaults
          'h-20 w-48 border bg-blue-500 p-2 text-white transition ease-in-out',
          // Closed
          'data-closed:opacity-0',
          // Entering
          'data-enter:duration-300 data-enter:data-closed:-translate-x-full',
          // Leaving
          'data-leave:duration-300 data-leave:data-closed:translate-x-full',
        ])}
      >
        Using data attributes
      </div>
    </Transition>
  )
}
