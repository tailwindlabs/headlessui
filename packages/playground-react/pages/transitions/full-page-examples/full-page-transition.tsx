import { Transition } from '@headlessui/react'
import Head from 'next/head'
import { useEffect, useRef, useState } from 'react'

import { classNames } from '../../../utils/class-names'
import { match } from '../../../utils/match'

export default function Shell() {
  return (
    <>
      <Head>
        <title>Transition Component - Full Page Transition</title>
      </Head>
      <div className="h-full bg-gray-50 p-12">
        <div className="flex h-full flex-1 flex-col overflow-hidden rounded-lg shadow-lg">
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
      <div className="bg-gray-800 pb-32">
        <nav className="bg-gray-800">
          <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
            <div className="border-b border-gray-700">
              <div className="flex h-16 items-center justify-between px-4 sm:px-0">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <img
                      className="h-8 w-8"
                      src="https://tailwindui.com/img/logos/workflow-mark-on-dark.svg"
                      alt="Workflow logo"
                    />
                  </div>
                  <div className="hidden md:block">
                    <div className="ml-10 flex items-baseline space-x-4">
                      {pages.map((page, i) => (
                        <button
                          key={page}
                          onClick={() => setActivePage(i)}
                          className={classNames(
                            'rounded-md px-3 py-2 text-sm font-medium focus:bg-gray-700 focus:text-white focus:outline-none',
                            i === activePage
                              ? 'bg-gray-900 text-white'
                              : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                          )}
                        >
                          {page}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="hidden md:block">
                  <div className="ml-4 flex items-center md:ml-6">
                    <button
                      className="rounded-full border-2 border-transparent p-1 text-gray-400 hover:text-white focus:bg-gray-700 focus:text-white focus:outline-none"
                      aria-label="Notifications"
                    >
                      <svg
                        className="h-6 w-6"
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
                          className="focus:shadow-solid flex max-w-xs items-center rounded-full text-sm text-white focus:outline-none"
                          id="user-menu"
                          aria-label="User menu"
                          aria-haspopup="true"
                        >
                          <img
                            className="h-8 w-8 rounded-full"
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
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h1 className="relative inline-block text-3xl font-bold leading-9 text-white">
              {pages[activePage]}
            </h1>
          </div>
        </header>
      </div>

      <main className="-mt-32">
        <div className="mx-auto max-w-7xl px-4 pb-12 sm:px-6 lg:px-8">
          <div className="rounded-lg bg-white px-5 py-6 shadow sm:px-6">
            <div className="relative h-96 overflow-hidden rounded-lg">
              {pages.map((page, i) => (
                <Transition
                  appear={false}
                  key={page}
                  show={activePage === i}
                  className={classNames(
                    'absolute inset-0 rounded-lg p-8 text-3xl font-bold text-white',
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
