import React, { useState } from 'react'
import { Transition } from '@headlessui/react'

export default function Home() {
  let [isOpen, setIsOpen] = useState(true)

  return (
    <>
      <div className="flex h-full w-screen justify-center bg-gray-50 p-12">
        <div className="w-96 space-y-2">
          <span className="inline-flex rounded-md shadow-sm">
            <button
              type="button"
              onClick={() => setIsOpen((v) => !v)}
              className="focus:shadow-outline-blue inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium leading-4 text-gray-700 transition duration-150 ease-in-out hover:text-gray-500 focus:border-blue-300 focus:outline-none active:bg-gray-50 active:text-gray-800"
            >
              {isOpen ? 'Hide' : 'Show'}
            </button>
          </span>

          <div
            hidden
            data-preload
            className="transform transform transform transform rounded-md rounded-md bg-red-500 bg-blue-500 bg-red-500 bg-green-500 bg-green-500 bg-blue-500 bg-white p-4 p-4 opacity-0 opacity-100 opacity-100 opacity-0 shadow shadow transition-colors transition-colors transition-colors transition transition duration-[5s] duration-1000 duration-1000 duration-1000 duration-1000 ease-out ease-in ease-out ease-in"
          />

          <Transition
            show={isOpen}
            appear={false}
            beforeEnter={() => console.log('beforeEnter')}
            afterEnter={() => console.log('afterEnter')}
            beforeLeave={() => console.log('beforeLeave')}
            afterLeave={() => console.log('afterLeave')}
            enter="transition-colors ease-out duration-[5s]"
            enterFrom="transform bg-red-500"
            enterTo="transform bg-blue-500"
            leave="transition-colors ease-in duration-[5s]"
            leaveFrom="transform bg-blue-500"
            leaveTo="transform bg-red-500"
            entered="bg-blue-500"
            className="h-64 rounded-md p-4 shadow"
          >
            Contents to show and hide
          </Transition>
        </div>
      </div>
    </>
  )
}
