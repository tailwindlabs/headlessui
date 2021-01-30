import React, { useEffect, useRef, useState } from 'react'
import Head from 'next/head'
import { Transition } from '@headlessui/react'

import { classNames } from '../../../src/utils/class-names'
import { match } from '../../../src/utils/match'

export default function Shell() {
  return (
    <>
      <Head>
        <title>Transition Component - Full Page Transition</title>
      </Head>
      <div className="h-full p-12 bg-gray-50">
        <div className="flex flex-col flex-1 h-full overflow-hidden rounded-lg shadow-lg">
          <FullPageTransition />
        </div>
      </div>
    </>
  )
}

function usePrevious<T>(value: T) {
  let ref = useRef(value)
  useEffect(() => {
    ref.current = value
  }, [value])
  return ref.current
}

enum Direction {
  Forwards = ' -> ',
  Backwards = ' <- ',
}

let pages = ['Dashboard', 'Team', 'Projects', 'Calendar', 'Reports']
let colors = [
  'bg-gradient-to-r from-teal-400 to-blue-400',
  'bg-gradient-to-r from-blue-400 to-orange-400',
  'bg-gradient-to-r from-orange-400 to-purple-400',
  'bg-gradient-to-r from-purple-400 to-green-400',
  'bg-gradient-to-r from-green-400 to-teal-400',
]

function FullPageTransition() {
  let [activePage, setActivePage] = useState(0)
  let previousPage = usePrevious(activePage)

  let direction = activePage > previousPage ? Direction.Forwards : Direction.Backwards

  let transitions = match(direction, {
    [Direction.Forwards]: {
      enter: 'transition transform ease-in-out duration-500',
      enterFrom: 'translate-x-full',
      enterTo: 'translate-x-0',
      leave: 'transition transform ease-in-out duration-500',
      leaveFrom: 'translate-x-0',
      leaveTo: '-translate-x-full',
    },
    [Direction.Backwards]: {
      enter: 'transition transform ease-in-out duration-500',
      enterFrom: '-translate-x-full',
      enterTo: 'translate-x-0',
      leave: 'transition transform ease-in-out duration-500',
      leaveFrom: 'translate-x-0',
      leaveTo: 'translate-x-full',
    },
  })

  return (
    <div>
      <div className="pb-32 bg-gray-800">
        <nav className="bg-gray-800">
          <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
            <div className="border-b border-gray-700">
              <div className="flex items-center justify-between h-16 px-4 sm:px-0">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <img
                      className="w-8 h-8"
                      src="https://tailwindui.com/img/logos/workflow-mark-on-dark.svg"
                      alt="Workflow logo"
                    />
                  </div>
                  <div className="hidden md:block">
                    <div className="flex items-baseline ml-10 space-x-4">
                      {pages.map((page, i) => (
                        <button
                          key={page}
                          onClick={() => setActivePage(i)}
                          className={classNames(
                            'px-3 py-2 text-sm font-medium rounded-md focus:outline-none focus:text-white focus:bg-gray-700',
                            i === activePage
                              ? 'text-white bg-gray-900'
                              : 'text-gray-300 hover:text-white hover:bg-gray-700'
                          )}
                        >
                          {page}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="hidden md:block">
                  <div className="flex items-center ml-4 md:ml-6">
                    <button
                      className="p-1 text-gray-400 border-2 border-transparent rounded-full hover:text-white focus:outline-none focus:text-white focus:bg-gray-700"
                      aria-label="Notifications"
                    >
                      <svg
                        className="w-6 h-6"
                        stroke="currentColor"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                        />
                      </svg>
                    </button>

                    {/* Profile dropdown */}
                    <div className="relative ml-3">
                      <div>
                        <button
                          className="flex items-center max-w-xs text-sm text-white rounded-full focus:outline-none focus:shadow-solid"
                          id="user-menu"
                          aria-label="User menu"
                          aria-haspopup="true"
                        >
                          <img
                            className="w-8 h-8 rounded-full"
                            src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                            alt=""
                          />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </nav>
        <header className="py-10">
          <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
            <h1 className="relative inline-block text-3xl font-bold leading-9 text-white">
              {pages[activePage]}
            </h1>
          </div>
        </header>
      </div>

      <main className="-mt-32">
        <div className="px-4 pb-12 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="px-5 py-6 bg-white rounded-lg shadow sm:px-6">
            <div className="relative overflow-hidden rounded-lg h-96">
              {pages.map((page, i) => (
                <Transition
                  appear={false}
                  key={page}
                  show={activePage === i}
                  className={classNames(
                    'absolute inset-0 p-8 text-3xl rounded-lg text-white font-bold',
                    colors[i]
                  )}
                  {...transitions}
                >
                  {page} page content
                </Transition>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
