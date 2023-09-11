import { Transition } from '@headlessui/react'
import { ReactNode, useState } from 'react'

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
              className="duration-150-out focus:shadow-outline-blue inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium leading-4 text-gray-700 transition hover:text-gray-500 focus:border-blue-300 focus:outline-none active:bg-gray-50 active:text-gray-800"
            >
              {isOpen ? 'Hide' : 'Show'}
            </button>
          </span>

          <Transition show={isOpen} unmount={false}>
            <Box>
              <Box>
                <Box>
                  <Box />
                </Box>
                <Box>
                  <Box>
                    <Box>
                      <Box />
                    </Box>
                  </Box>
                </Box>
              </Box>
            </Box>
          </Transition>
        </div>
      </div>
    </>
  )
}

function Box({ children }: { children?: ReactNode }) {
  return (
    <Transition.Child
      unmount={false}
      enter="transition translate duration-300"
      enterFrom="transform -translate-x-full"
      enterTo="transform translate-x-0"
      leave="transition translate duration-300"
      leaveFrom="transform translate-x-0"
      leaveTo="transform translate-x-full"
    >
      <div className="space-y-2 rounded-md bg-white p-4 text-sm font-semibold uppercase tracking-wide text-gray-700 shadow">
        <span>This is a box</span>
        {children}
      </div>
    </Transition.Child>
  )
}
