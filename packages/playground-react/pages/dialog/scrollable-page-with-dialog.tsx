import { Dialog, Transition } from '@headlessui/react'
import { Fragment, useState } from 'react'

export default function Home() {
  let [isOpen, setIsOpen] = useState(false)

  return (
    <>
      {Array(5)
        .fill(null)
        .map((_, i) => (
          <p key={i} className="m-4">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam numquam beatae,
            maiores sint est perferendis molestiae deleniti dolorem, illum vel, quam atque facilis!
            Necessitatibus nostrum recusandae nemo corrupti, odio eius?
          </p>
        ))}

      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        className="focus:shadow-outline-blue m-12 rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium leading-6 text-gray-700 shadow-sm transition duration-150 ease-in-out hover:text-gray-500 focus:border-blue-300 focus:outline-none sm:text-sm sm:leading-5"
      >
        Toggle!
      </button>

      {Array(20)
        .fill(null)
        .map((_, i) => (
          <p key={i} className="m-4">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam numquam beatae,
            maiores sint est perferendis molestiae deleniti dolorem, illum vel, quam atque facilis!
            Necessitatibus nostrum recusandae nemo corrupti, odio eius?
          </p>
        ))}

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
                        </div>
                        <input type="text" />
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                    <button
                      type="button"
                      onClick={() => setIsOpen(false)}
                      className="focus:shadow-outline-red inline-flex w-full justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm"
                    >
                      Deactivate
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsOpen(false)}
                      className="focus:shadow-outline-indigo mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:text-gray-500 focus:outline-none sm:mt-0 sm:w-auto sm:text-sm"
                    >
                      Cancel
                    </button>
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
