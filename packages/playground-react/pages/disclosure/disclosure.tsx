import React from 'react'
import { Disclosure, Transition } from '@headlessui/react'

export default function Home() {
  return (
    <div className="flex h-full w-screen justify-center bg-gray-50 p-12">
      <div className="mx-auto w-full max-w-xs">
        <Disclosure>
          <Disclosure.Button>Trigger</Disclosure.Button>

          <Transition
            enter="transition duration-1000 ease-out"
            enterFrom="transform scale-95 opacity-0"
            enterTo="transform scale-100 opacity-100"
            leave="transition duration-1000 ease-out"
            leaveFrom="transform scale-100 opacity-100"
            leaveTo="transform scale-95 opacity-0"
          >
            <Disclosure.Panel className="mt-4 bg-white p-4">Content</Disclosure.Panel>
          </Transition>
        </Disclosure>
      </div>
    </div>
  )
}
