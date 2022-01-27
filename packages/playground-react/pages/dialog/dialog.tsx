import React, { useState, Fragment } from 'react'
import { Dialog, Menu, Portal, Transition } from '@headlessui/react'
import { usePopper } from '../../utils/hooks/use-popper'
import { classNames } from '../../utils/class-names'

function resolveClass({ active, disabled }) {
  return classNames(
    'flex justify-between w-full px-4 py-2 text-sm leading-5 text-left',
    active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
    disabled && 'cursor-not-allowed opacity-50'
  )
}

function Nested({ onClose, level = 0 }) {
  let [showChild, setShowChild] = useState(false)

  return (
    <>
      <Dialog open={true} onClose={onClose} className="fixed z-10 inset-0">
        <Dialog.Overlay className="fixed inset-0 bg-gray-500 opacity-25" />
        <div
          className="z-10 fixed left-12 top-24 bg-white w-96 p-4"
          style={{
            transform: `translate(calc(50px * ${level}), calc(50px * ${level}))`,
          }}
        >
          <p>Level: {level}</p>
          <div className="space-x-4">
            <button className="bg-gray-200 px-2 py-1 rounded" onClick={() => setShowChild(true)}>
              Open (1)
            </button>
            <button className="bg-gray-200 px-2 py-1 rounded" onClick={() => setShowChild(true)}>
              Open (2)
            </button>
            <button className="bg-gray-200 px-2 py-1 rounded" onClick={() => setShowChild(true)}>
              Open (3)
            </button>
          </div>
        </div>
        {showChild && <Nested onClose={() => setShowChild(false)} level={level + 1} />}
      </Dialog>
    </>
  )
}

export default function Home() {
  let [isOpen, setIsOpen] = useState(false)
  let [nested, setNested] = useState(false)

  let [trigger, container] = usePopper({
    placement: 'bottom-end',
    strategy: 'fixed',
    modifiers: [{ name: 'offset', options: { offset: [0, 10] } }],
  })

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(v => !v)}
        className="m-12 px-4 py-2 text-base font-medium leading-6 text-gray-700 transition duration-150 ease-in-out bg-white border border-gray-300 rounded-md shadow-sm hover:text-gray-500 focus:outline-none focus:border-blue-300 focus:shadow-outline-blue sm:text-sm sm:leading-5"
      >
        Toggle!
      </button>

      <button onClick={() => setNested(true)}>Show nested</button>
      {nested && <Nested onClose={() => setNested(false)} />}

      <Transition show={isOpen} as={Fragment} afterLeave={() => console.log('done')}>
        <Dialog onClose={setIsOpen}>
          <div className="fixed z-10 inset-0 overflow-y-auto">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0"
                enterTo="opacity-75"
                leave="ease-in duration-200"
                leaveFrom="opacity-75"
                leaveTo="opacity-0"
                entered="opacity-75"
              >
                <Dialog.Overlay className="fixed inset-0 bg-gray-500 transition-opacity" />
              </Transition.Child>

              <Transition.Child
                enter="ease-out transform duration-300"
                enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                enterTo="opacity-100 translate-y-0 sm:scale-100"
                leave="ease-in transform duration-200"
                leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              >
                {/* This element is to trick the browser into centering the modal contents. */}
                <span
                  className="hidden sm:inline-block sm:align-middle sm:h-screen"
                  aria-hidden="true"
                >
                  &#8203;
                </span>
                <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                  <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                    <div className="sm:flex sm:items-start">
                      <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                        {/* Heroicon name: exclamation */}
                        <svg
                          className="h-6 w-6 text-red-600"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          aria-hidden="true"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                          />
                        </svg>
                      </div>
                      <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                        <Dialog.Title
                          as="h3"
                          className="text-lg leading-6 font-medium text-gray-900"
                        >
                          Deactivate account
                        </Dialog.Title>
                        <div className="mt-2">
                          <p className="text-sm text-gray-500">
                            Are you sure you want to deactivate your account? All of your data will
                            be permanently removed. This action cannot be undone.
                          </p>
                          <div className="relative inline-block text-left mt-10">
                            <Menu>
                              <span className="rounded-md shadow-sm">
                                <Menu.Button
                                  ref={trigger}
                                  className="inline-flex justify-center w-full px-4 py-2 text-sm font-medium leading-5 text-gray-700 transition duration-150 ease-in-out bg-white border border-gray-300 rounded-md hover:text-gray-500 focus:outline-none focus:border-blue-300 focus:shadow-outline-blue active:bg-gray-50 active:text-gray-800"
                                >
                                  <span>Choose a reason</span>
                                  <svg
                                    className="w-5 h-5 ml-2 -mr-1"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                  >
                                    <path
                                      fillRule="evenodd"
                                      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                      clipRule="evenodd"
                                    />
                                  </svg>
                                </Menu.Button>
                              </span>

                              <Transition
                                enter="transition duration-300 ease-out"
                                enterFrom="transform scale-95 opacity-0"
                                enterTo="transform scale-100 opacity-100"
                                leave="transition duration-75 ease-out"
                                leaveFrom="transform scale-100 opacity-100"
                                leaveTo="transform scale-95 opacity-0"
                              >
                                <Portal>
                                  <Menu.Items
                                    ref={container}
                                    className="z-20 w-56 mt-2 origin-top-right bg-white border border-gray-200 divide-y divide-gray-100 rounded-md shadow-lg outline-none"
                                  >
                                    <div className="px-4 py-3">
                                      <p className="text-sm leading-5">Signed in as</p>
                                      <p className="text-sm font-medium leading-5 text-gray-900 truncate">
                                        tom@example.com
                                      </p>
                                    </div>

                                    <div className="py-1">
                                      <Menu.Item
                                        as="a"
                                        href="#account-settings"
                                        className={resolveClass}
                                      >
                                        Account settings
                                      </Menu.Item>
                                      <Menu.Item as="a" href="#support" className={resolveClass}>
                                        Support
                                      </Menu.Item>
                                      <Menu.Item
                                        as="a"
                                        disabled
                                        href="#new-feature"
                                        className={resolveClass}
                                      >
                                        New feature (soon)
                                      </Menu.Item>
                                      <Menu.Item as="a" href="#license" className={resolveClass}>
                                        License
                                      </Menu.Item>
                                    </div>

                                    <div className="py-1">
                                      <Menu.Item as="a" href="#sign-out" className={resolveClass}>
                                        Sign out
                                      </Menu.Item>
                                    </div>
                                  </Menu.Items>
                                </Portal>
                              </Transition>
                            </Menu>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                    <button
                      type="button"
                      onClick={() => setIsOpen(false)}
                      className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:shadow-outline-red sm:ml-3 sm:w-auto sm:text-sm"
                    >
                      Deactivate
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsOpen(false)}
                      className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:text-gray-500 focus:outline-none focus:shadow-outline-indigo sm:mt-0 sm:w-auto sm:text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  )
}
