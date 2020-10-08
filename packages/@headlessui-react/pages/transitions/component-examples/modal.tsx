import React, { useRef, useState } from 'react'
import { Transition } from '@headlessui/react'

export default function Home() {
  const [isOpen, setIsOpen] = useState(false)
  function toggle() {
    setIsOpen(v => !v)
  }

  const [email, setEmail] = useState('')
  const [events, setEvents] = useState([])
  const inputRef = useRef(null)

  function addEvent(name) {
    setEvents(existing => [...existing, `${new Date().toJSON()} - ${name}`])
  }

  return (
    <div>
      <div className="flex p-12 space-x-4">
        <div className="inline-block p-12">
          <span className="flex w-full mt-3 rounded-md shadow-sm sm:mt-0 sm:w-auto">
            <button
              onClick={toggle}
              type="button"
              className="inline-flex justify-center w-full px-4 py-2 text-base font-medium leading-6 text-gray-700 transition duration-150 ease-in-out bg-white border border-gray-300 rounded-md shadow-sm hover:text-gray-500 focus:outline-none focus:border-blue-300 focus:shadow-outline-blue sm:text-sm sm:leading-5"
            >
              Show modal
            </button>
          </span>
        </div>

        <ul className="p-4 text-gray-900 bg-gray-200">
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
          addEvent('Before enter')
        }}
        afterEnter={() => {
          inputRef.current.focus()
          addEvent('After enter')
        }}
        beforeLeave={() => {
          addEvent('Before leave (before confirm)')
          window.confirm('Are you sure?')
          addEvent('Before leave (after confirm)')
        }}
        afterLeave={() => {
          addEvent('After leave (before alert)')
          window.alert('Consider it done!')
          addEvent('After leave (after alert)')
          setEmail('')
        }}
      >
        <div className="flex items-end justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
          <Transition.Child
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 transition-opacity">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
          </Transition.Child>
          {/* This element is to trick the browser into centering the modal contents. */}
          <span className="hidden sm:inline-block sm:align-middle sm:h-screen"></span>&#8203;
          <Transition.Child
            className="inline-block overflow-hidden text-left align-bottom transition-all transform bg-white rounded-lg shadow-xl sm:my-8 sm:align-middle sm:max-w-lg sm:w-full"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-headline"
            enter="ease-out duration-300"
            enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            enterTo="opacity-100 translate-y-0 sm:scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 translate-y-0 sm:scale-100"
            leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
          >
            <div className="px-4 pt-5 pb-4 bg-white sm:p-6 sm:pb-4">
              <div className="sm:flex sm:items-start">
                <div className="flex items-center justify-center flex-shrink-0 w-12 h-12 mx-auto bg-red-100 rounded-full sm:mx-0 sm:h-10 sm:w-10">
                  {/* Heroicon name: exclamation */}
                  <svg
                    className="w-6 h-6 text-red-600"
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
                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
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
                          onChange={event => setEmail(event.target.value)}
                          id="email"
                          className="block w-full px-3 form-input sm:text-sm sm:leading-5"
                          placeholder="name@example.com"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="px-4 py-3 bg-gray-50 sm:px-6 sm:flex sm:flex-row-reverse">
              <span className="flex w-full rounded-md shadow-sm sm:ml-3 sm:w-auto">
                <button
                  type="button"
                  className="inline-flex justify-center w-full px-4 py-2 text-base font-medium leading-6 text-white transition duration-150 ease-in-out bg-red-600 border border-transparent rounded-md shadow-sm hover:bg-red-500 focus:outline-none focus:border-red-700 focus:shadow-outline-red sm:text-sm sm:leading-5"
                >
                  Deactivate
                </button>
              </span>
              <span className="flex w-full mt-3 rounded-md shadow-sm sm:mt-0 sm:w-auto">
                <button
                  onClick={toggle}
                  type="button"
                  className="inline-flex justify-center w-full px-4 py-2 text-base font-medium leading-6 text-gray-700 transition duration-150 ease-in-out bg-white border border-gray-300 rounded-md shadow-sm hover:text-gray-500 focus:outline-none focus:border-blue-300 focus:shadow-outline-blue sm:text-sm sm:leading-5"
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
