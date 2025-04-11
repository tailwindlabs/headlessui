import { Menu } from '@headlessui/react'
import { Button } from '../../components/button'
import { classNames } from '../../utils/class-names'

export default function Home() {
  return (
    <div className="flex h-full w-screen justify-center space-x-4 bg-gray-50 p-12">
      <Dropdown />

      <div>
        <div className="shadow-xs relative rounded-md">
          <input
            className="form-input block w-full sm:text-sm sm:leading-5"
            placeholder="you@example.com"
          />
        </div>
      </div>

      <Dropdown />
    </div>
  )
}

function Dropdown() {
  function resolveClass({ active, disabled }) {
    return classNames(
      'block w-full text-left px-4 py-2 text-sm leading-5 text-gray-700',
      active && 'bg-gray-100 text-gray-900',
      disabled && 'cursor-not-allowed opacity-50'
    )
  }

  return (
    <div className="relative inline-block text-left">
      <Menu>
        <span className="shadow-xs inline-flex rounded-md">
          <Menu.Button as={Button}>
            <span>Options</span>
            <svg className="-mr-1 ml-2 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </Menu.Button>
        </span>

        <Menu.Items className="outline-hidden absolute right-0 mt-2 w-56 origin-top-right divide-y divide-gray-100 rounded-md border border-gray-200 bg-white shadow-lg">
          <div className="px-4 py-3">
            <p className="text-sm leading-5">Signed in as</p>
            <p className="truncate text-sm font-medium leading-5 text-gray-900">tom@example.com</p>
          </div>

          <div className="py-1">
            <Menu.Item as="a" href="#account-settings" className={resolveClass}>
              Account settings
            </Menu.Item>
            <Menu.Item>
              {(data) => (
                <a href="#support" className={resolveClass(data)}>
                  Support
                </a>
              )}
            </Menu.Item>
            <Menu.Item as="a" disabled href="#new-feature" className={resolveClass}>
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
      </Menu>
    </div>
  )
}
