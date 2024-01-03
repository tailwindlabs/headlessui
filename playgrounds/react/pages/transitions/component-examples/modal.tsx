import { Transition } from '@headlessui/react'
import { useRef, useState } from 'react'

export default function Home() {
  let [isOpen, setIsOpen] = useState(false)
  function toggle() {
    setIsOpen((v) => !v)
  }

  let [email, setEmail] = useState('')
  let [events, setEvents] = useState([])
  let inputRef = useRef(null)

  function addEvent(name) {
    setEvents((existing) => [...existing, `${new Date().toJSON()} - ${name}`])
  }

  return (
    <div>
      <div className="flex space-x-4 p-12">
        <div className="inline-block p-12">
          <span className="mt-3 flex w-full rounded-md shadow-sm sm:mt-0 sm:w-auto">
            <button
              onClick={toggle}
              type="button"
              className="focus:shadow-outline-blue inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium leading-6 text-gray-700 shadow-sm transition duration-150 ease-in-out hover:text-gray-500 focus:border-blue-300 focus:outline-none sm:text-sm sm:leading-5"
            >
              Show modal
            </button>
          </span>
        </div>

        <ul className="bg-gray-200 p-4 text-gray-900">
          <h3 className="font-bold">Events:</h3>
          {events.map((event, i) => (
            <li key={i} className="font-mono text-sm">
              {event}
            </li>
          ))}
        </ul>
      </div>

      <Transition
        show={isOpen}
        className="fixed inset-0 z-10 overflow-y-auto"
        beforeEnter={() => {
          addEvent('[Root] Before enter')
        }}
        afterEnter={() => {
          inputRef.current?.focus()
          addEvent('[Root] After enter')
        }}
        beforeLeave={() => {
          addEvent('[Root] Before leave')
        }}
        afterLeave={() => {
          addEvent('[Root] After leave')
          setEmail('')
        }}
      >
        <div className="flex min-h-screen items-end justify-center px-4 pb-20 pt-4 text-center sm:block sm:p-0">
          <Transition.Child
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
            beforeEnter={() => addEvent('[Overlay] Before enter')}
            afterEnter={() => addEvent('[Overlay] After enter')}
            beforeLeave={() => addEvent('[Overlay] Before leave')}
            afterLeave={() => addEvent('[Overlay] After leave')}
          >
            <div className="fixed inset-0 transition-opacity">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
          </Transition.Child>
          {/* This element is to trick the browser into centering the modal contents. */}
          <span className="hidden sm:inline-block sm:h-screen sm:align-middle"></span>&#8203;
          <Transition.Child
            className="inline-block transform overflow-hidden rounded-lg bg-white text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:align-middle"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-headline"
            enter="ease-out duration-300"
            enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            enterTo="opacity-100 translate-y-0 sm:scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 translate-y-0 sm:scale-100"
            leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            beforeEnter={() => addEvent('[Panel] Before enter')}
            afterEnter={() => addEvent('[Panel] After enter')}
            beforeLeave={() => addEvent('[Panel] Before leave')}
            afterLeave={() => addEvent('[Panel] After leave')}
          >
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
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                </div>
                <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                  <h3 className="text-lg font-medium leading-6 text-gray-900" id="modal-headline">
                    Deactivate account
                  </h3>
                  <div className="mt-2">
                    <p className="text-sm leading-5 text-gray-500">
                      Are you sure you want to deactivate your account? All of your data will be
                      permanently removed. This action cannot be undone.
                    </p>
                  </div>
                  <div className="mt-2">
                    <div>
                      <label
                        htmlFor="email"
                        className="block text-sm font-medium leading-5 text-gray-700"
                      >
                        Email address
                      </label>
                      <div className="relative mt-1 rounded-md shadow-sm">
                        <input
                          ref={inputRef}
                          value={email}
                          onChange={(event) => setEmail(event.target.value)}
                          type="email"
                          id="email"
                          className="form-input block w-full px-3 sm:text-sm sm:leading-5"
                          placeholder="name@example.com"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
              <span className="flex w-full rounded-md shadow-sm sm:ml-3 sm:w-auto">
                <button
                  type="button"
                  className="focus:shadow-outline-red inline-flex w-full justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-base font-medium leading-6 text-white shadow-sm transition duration-150 ease-in-out hover:bg-red-500 focus:border-red-700 focus:outline-none sm:text-sm sm:leading-5"
                >
                  Deactivate
                </button>
              </span>
              <span className="mt-3 flex w-full rounded-md shadow-sm sm:mt-0 sm:w-auto">
                <button
                  onClick={toggle}
                  type="button"
                  className="focus:shadow-outline-blue inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium leading-6 text-gray-700 shadow-sm transition duration-150 ease-in-out hover:text-gray-500 focus:border-blue-300 focus:outline-none sm:text-sm sm:leading-5"
                >
                  Cancel
                </button>
              </span>
            </div>
          </Transition.Child>
        </div>
      </Transition>
    </div>
  )
}
