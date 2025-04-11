import { Transition } from '@headlessui/react'
import Head from 'next/head'
import { useState } from 'react'

export default function Home() {
  return (
    <>
      <Head>
        <title>Transition Component - Playground</title>
      </Head>

      <div className="flex h-full w-screen justify-center bg-gray-50 p-12">
        <Dropdown />
      </div>
    </>
  )
}

function Dropdown() {
  let [isOpen, setIsOpen] = useState(false)

  return (
    <div className="relative inline-block text-left">
      <div>
        <span className="shadow-xs rounded-md">
          <button
            type="button"
            className="focus:shadow-outline-blue focus:outline-hidden inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium leading-5 text-gray-700 transition duration-150 ease-in-out hover:text-gray-500 focus:border-blue-300 active:bg-gray-50 active:text-gray-800"
            id="options-menu"
            aria-haspopup="true"
            aria-expanded={isOpen}
            onClick={() => setIsOpen((v) => !v)}
          >
            Options
            <svg className="-mr-1 ml-2 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </span>
      </div>

      <Transition
        as="div"
        show={isOpen}
        enter="transition ease-out duration-75"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-150"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
        className="absolute right-0 mt-2 w-56 origin-top-right rounded-md shadow-lg"
      >
        <div className="shadow-2xs rounded-md bg-white">
          <div
            className="py-1"
            role="menu"
            aria-orientation="vertical"
            aria-labelledby="options-menu"
          >
            <a
              href="/"
              className="focus:outline-hidden block px-4 py-2 text-sm leading-5 text-gray-700 hover:bg-gray-100 hover:text-gray-900 focus:bg-gray-100 focus:text-gray-900"
              role="menuitem"
            >
              Account settings
            </a>
            <a
              href="/"
              className="focus:outline-hidden block px-4 py-2 text-sm leading-5 text-gray-700 hover:bg-gray-100 hover:text-gray-900 focus:bg-gray-100 focus:text-gray-900"
              role="menuitem"
            >
              Support
            </a>
            <a
              href="/"
              className="focus:outline-hidden block px-4 py-2 text-sm leading-5 text-gray-700 hover:bg-gray-100 hover:text-gray-900 focus:bg-gray-100 focus:text-gray-900"
              role="menuitem"
            >
              License
            </a>
            <form method="POST" action="#">
              <button
                type="submit"
                className="focus:outline-hidden block w-full px-4 py-2 text-left text-sm leading-5 text-gray-700 hover:bg-gray-100 hover:text-gray-900 focus:bg-gray-100 focus:text-gray-900"
                role="menuitem"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>
      </Transition>
    </div>
  )
}
