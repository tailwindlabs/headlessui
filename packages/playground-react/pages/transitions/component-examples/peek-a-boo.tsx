import { Transition } from '@headlessui/react'
import { useState } from 'react'

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
