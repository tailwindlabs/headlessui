import { Dialog, Menu, Portal, Transition } from '@headlessui/react'
import { Fragment, useState } from 'react'
import Flatpickr from 'react-flatpickr'
import { Button } from '../../components/button'
import { classNames } from '../../utils/class-names'
import { usePopper } from '../../utils/hooks/use-popper'

import 'flatpickr/dist/themes/light.css'

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
      <Dialog open={true} onClose={onClose} className="fixed inset-0 z-10">
        <Dialog.Overlay className="fixed inset-0 bg-gray-500 opacity-25" />
        <div
          className="fixed left-12 top-24 z-10 w-96 bg-white p-4"
          style={{
            transform: `translate(calc(50px * ${level}), calc(50px * ${level}))`,
          }}
        >
          <p>Level: {level}</p>
          <div className="flex gap-4">
            <Button onClick={() => setShowChild(true)}>Open (1)</Button>
            <Button onClick={() => setShowChild(true)}>Open (2)</Button>
            <Button onClick={() => setShowChild(true)}>Open (3)</Button>
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

  let [date, setDate] = useState(new Date())

  return (
    <>
      <div className="flex gap-4 p-12">
        <Button onClick={() => setIsOpen((v) => !v)}>Toggle!</Button>
        <Button onClick={() => setNested(true)}>Show nested</Button>
      </div>
      {nested && <Nested onClose={() => setNested(false)} />}

      <Transition
        data-debug="Dialog"
        show={isOpen}
        as={Fragment}
        beforeEnter={() => console.log('[Transition] Before enter')}
        afterEnter={() => console.log('[Transition] After enter')}
        beforeLeave={() => console.log('[Transition] Before leave')}
        afterLeave={() => console.log('[Transition] After leave')}
      >
        <Dialog
          onClose={() => {
            console.log('close')
            setIsOpen(false)
          }}
        >
          <div className="fixed inset-0 z-10 overflow-y-auto">
            <div className="flex min-h-screen items-end justify-center px-4 pb-20 pt-4 text-center sm:block sm:p-0">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0"
                enterTo="opacity-75"
                leave="ease-in duration-200"
                leaveFrom="opacity-75"
                leaveTo="opacity-0"
                entered="opacity-75"
                beforeEnter={() => console.log('[Transition.Child] [Overlay] Before enter')}
                afterEnter={() => console.log('[Transition.Child] [Overlay] After enter')}
                beforeLeave={() => console.log('[Transition.Child] [Overlay] Before leave')}
                afterLeave={() => console.log('[Transition.Child] [Overlay] After leave')}
              >
                <div className="fixed inset-0 bg-gray-500 transition-opacity" />
              </Transition.Child>

              <Transition.Child
                enter="ease-out transform duration-300"
                enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                enterTo="opacity-100 translate-y-0 sm:scale-100"
                leave="ease-in transform duration-200"
                leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                beforeEnter={() => console.log('[Transition.Child] [Panel] Before enter')}
                afterEnter={() => console.log('[Transition.Child] [Panel] After enter')}
                beforeLeave={() => console.log('[Transition.Child] [Panel] Before leave')}
                afterLeave={() => console.log('[Transition.Child] [Panel] After leave')}
              >
                {/* This element is to trick the browser into centering the modal contents. */}
                <span
                  className="hidden sm:inline-block sm:h-screen sm:align-middle"
                  aria-hidden="true"
                >
                  &#8203;
                </span>
                <Dialog.Panel className="inline-block transform overflow-hidden rounded-lg bg-white text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:align-middle">
                  <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                    <div className="sm:flex sm:items-start">
                      <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
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
                      <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                        <Dialog.Title
                          as="h3"
                          className="text-lg font-medium leading-6 text-gray-900"
                        >
                          Deactivate account
                        </Dialog.Title>
                        <div className="mt-2">
                          <p className="text-sm text-gray-500">
                            Are you sure you want to deactivate your account? All of your data will
                            be permanently removed. This action cannot be undone.
                          </p>
                          <div className="relative mt-10 inline-flex gap-4 text-left">
                            <Menu>
                              <Menu.Button as={Button} ref={trigger}>
                                <span>Choose a reason</span>
                                <svg
                                  className="-mr-1 ml-2 h-5 w-5"
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
                                    className="z-20 mt-2 w-56 origin-top-right divide-y divide-gray-100 rounded-md border border-gray-200 bg-white shadow-lg outline-none"
                                  >
                                    <div className="px-4 py-3">
                                      <p className="text-sm leading-5">Signed in as</p>
                                      <p className="truncate text-sm font-medium leading-5 text-gray-900">
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
                          <Flatpickr value={date} onChange={([date]) => setDate(date)} />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex bg-gray-50 px-4 py-3 sm:flex-row-reverse sm:gap-2">
                    <Button onClick={() => setIsOpen(false)}>Deactivate</Button>
                    <Button onClick={() => setIsOpen(false)}>Cancel</Button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  )
}
