import React, { useEffect, useState } from 'react'
import Head from 'next/head'
import { Transition } from '@headlessui/react'

export default function App() {
  let [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    function handleEscape(event) {
      if (!mobileOpen) return

      if (event.key === 'Escape') {
        setMobileOpen(false)
      }
    }

    document.addEventListener('keyup', handleEscape)
    return () => document.removeEventListener('keyup', handleEscape)
  }, [mobileOpen])

  return (
    <>
      <Head>
        <title>Transition Component - Layout with sidebar</title>
      </Head>

      <div className="flex h-screen overflow-hidden bg-cool-gray-100">
        {/* Off-canvas menu for mobile */}
        <Transition show={mobileOpen} unmount={false} className="fixed inset-0 z-40 flex">
          {/* Off-canvas menu overlay, show/hide based on off-canvas menu state. */}
          <Transition.Child
            unmount={false}
            enter="transition-opacity ease-linear duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity ease-linear duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            {() => (
              <div className="fixed inset-0">
                <div
                  onClick={() => setMobileOpen(false)}
                  className="absolute inset-0 opacity-75 bg-cool-gray-600"
                />
              </div>
            )}
          </Transition.Child>

          {/* Off-canvas menu, show/hide based on off-canvas menu state. */}
          <Transition.Child
            unmount={false}
            enter="transition ease-in-out duration-300 transform"
            enterFrom="-translate-x-full"
            enterTo="translate-x-0"
            leave="transition ease-in-out duration-300 transform"
            leaveFrom="translate-x-0"
            leaveTo="-translate-x-full"
            className="relative flex flex-col flex-1 w-full max-w-xs pt-5 pb-4 bg-teal-600"
          >
            <div className="absolute top-0 right-0 p-1 -mr-14">
              <Transition.Child
                unmount={false}
                className="flex items-center justify-center w-12 h-12 rounded-full focus:outline-none focus:bg-cool-gray-600"
                aria-label="Close sidebar"
                as="button"
                onClick={() => setMobileOpen(false)}
              >
                <svg
                  className="w-6 h-6 text-white"
                  stroke="currentColor"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </Transition.Child>
            </div>
            <div className="flex items-center flex-shrink-0 px-4">
              <img
                className="w-auto h-8"
                src="https://tailwindui.com/img/logos/easywire-logo-on-brand.svg"
                alt="Easywire logo"
              />
            </div>
          </Transition.Child>
          <div className="flex-shrink-0 w-14">
            {/* Dummy element to force sidebar to shrink to fit close icon */}
          </div>
        </Transition>

        {/* Static sidebar for desktop */}
        <div className="hidden lg:flex lg:flex-shrink-0">
          <div className="flex flex-col w-64">
            {/* Sidebar component, swap this element with another sidebar if you like */}
            <div className="flex flex-col flex-grow pt-5 pb-4 overflow-y-auto bg-teal-600">
              <div className="flex items-center flex-shrink-0 px-4">
                <img
                  className="w-auto h-8"
                  src="https://tailwindui.com/img/logos/easywire-logo-on-brand.svg"
                  alt="Easywire logo"
                />
              </div>
            </div>
          </div>
        </div>
        <div className="flex-1 overflow-auto focus:outline-none" tabIndex={0}>
          <div className="relative z-10 flex flex-shrink-0 h-16 bg-white border-b border-gray-200 lg:border-none">
            <button
              className="px-4 border-r border-cool-gray-200 text-cool-gray-400 focus:outline-none focus:bg-cool-gray-100 focus:text-cool-gray-600 lg:hidden"
              aria-label="Open sidebar"
              onClick={() => setMobileOpen(true)}
            >
              <svg
                className="w-6 h-6 transition duration-150 ease-in-out"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h8m-8 6h16"
                />
              </svg>
            </button>
            {/* Search bar */}
            <div className="flex justify-between flex-1 px-4 sm:px-6 lg:max-w-6xl lg:mx-auto lg:px-8">
              <div className="flex flex-1">
                <form className="flex w-full md:ml-0" action="#" method="GET">
                  <label htmlFor="search_field" className="sr-only">
                    Search
                  </label>
                  <div className="relative w-full text-cool-gray-400 focus-within:text-cool-gray-600">
                    <div className="absolute inset-y-0 left-0 flex items-center pointer-events-none">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          clipRule="evenodd"
                          d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                        />
                      </svg>
                    </div>
                    <input
                      id="search_field"
                      className="block w-full h-full py-2 pl-8 pr-3 rounded-md text-cool-gray-900 placeholder-cool-gray-500 focus:outline-none focus:placeholder-cool-gray-400 sm:text-sm"
                      placeholder="Search"
                      type="search"
                    />
                  </div>
                </form>
              </div>
            </div>
          </div>
          <main className="relative z-0 flex-1 p-8 overflow-y-auto">
            {/* Replace with your content */}
            <div className="border-4 border-gray-200 border-dashed rounded-lg h-96"></div>
            {/* /End replace */}
          </main>
        </div>
      </div>
    </>
  )
}
