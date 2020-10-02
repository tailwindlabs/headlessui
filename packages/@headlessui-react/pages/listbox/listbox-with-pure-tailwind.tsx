import * as React from 'react'
import { Listbox } from '@headlessui/react'

import { classNames } from '../../src/utils/class-names'

const people = [
  'Wade Cooper',
  'Arlene Mccoy',
  'Devon Webb',
  'Tom Cook',
  'Tanya Fox',
  'Hellen Schmidt',
  'Caroline Schultz',
  'Mason Heaney',
  'Claudie Smitham',
  'Emil Schaefer',
]

export default function Home() {
  const [active, setActivePerson] = React.useState(people[2])

  // Choose a random person on mount
  React.useEffect(() => {
    setActivePerson(people[Math.floor(Math.random() * people.length)])
  }, [])

  return (
    <div className="flex justify-center w-screen h-full p-12 bg-gray-50">
      <div className="w-full max-w-xs mx-auto">
        <div className="space-y-1">
          <Listbox
            value={active}
            onChange={value => {
              console.log('value:', value)
              setActivePerson(value)
            }}
          >
            <Listbox.Label className="block text-sm font-medium leading-5 text-gray-700">
              Assigned to
            </Listbox.Label>

            <div className="relative">
              <span className="inline-block w-full rounded-md shadow-sm">
                <Listbox.Button className="relative w-full py-2 pl-3 pr-10 text-left transition duration-150 ease-in-out bg-white border border-gray-300 rounded-md cursor-default focus:outline-none focus:shadow-outline-blue focus:border-blue-300 sm:text-sm sm:leading-5">
                  <span className="block truncate">{active}</span>
                  <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                    <svg
                      className="w-5 h-5 text-gray-400"
                      viewBox="0 0 20 20"
                      fill="none"
                      stroke="currentColor"
                    >
                      <path
                        d="M7 7l3-3 3 3m0 6l-3 3-3-3"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                </Listbox.Button>
              </span>

              <div className="absolute w-full mt-1 bg-white rounded-md shadow-lg">
                <Listbox.Options className="py-1 overflow-auto text-base leading-6 rounded-md shadow-xs max-h-60 focus:outline-none sm:text-sm sm:leading-5">
                  {people.map(name => (
                    <Listbox.Option
                      key={name}
                      value={name}
                      className={({ active }) => {
                        return classNames(
                          'relative py-2 pl-3 cursor-default select-none pr-9 focus:outline-none',
                          active ? 'text-white bg-indigo-600' : 'text-gray-900'
                        )
                      }}
                    >
                      {({ active, selected }) => (
                        <>
                          <span
                            className={classNames(
                              'block truncate',
                              selected ? 'font-semibold' : 'font-normal'
                            )}
                          >
                            {name}
                          </span>
                          {selected && (
                            <span
                              className={classNames(
                                'absolute inset-y-0 right-0 flex items-center pr-4',
                                active ? 'text-white' : 'text-indigo-600'
                              )}
                            >
                              <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                                <path
                                  fillRule="evenodd"
                                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </span>
                          )}
                        </>
                      )}
                    </Listbox.Option>
                  ))}
                </Listbox.Options>
              </div>
            </div>
          </Listbox>
        </div>
      </div>
    </div>
  )
}
