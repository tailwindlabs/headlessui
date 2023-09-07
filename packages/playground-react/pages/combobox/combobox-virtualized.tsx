import React, { useState, useEffect } from 'react'
import { Combobox } from '@headlessui/react'

import { classNames } from '../../utils/class-names'
import { Button } from '../../components/button'
import { timezones as allTimezones } from '../../data'

function useDebounce<T>(value: T, delay: number) {
  let [debouncedValue, setDebouncedValue] = useState(value)
  useEffect(() => {
    let timer = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])
  return debouncedValue
}
export default function Home() {
  return (
    <div className="flex">
      <Example virtual={true} />
      <Example virtual={false} />
    </div>
  )
}

function Example({ virtual = true }: { virtual?: boolean }) {
  let [query, setQuery] = useState('')
  let [activeTimezone, setActiveTimezone] = useState(allTimezones[2])

  // Mimic delayed response from an API
  let actualQuery = useDebounce(query, 0 /* Change to higher value like 100 for testing purposes */)

  // Choose a random person on mount
  useEffect(() => {
    setActiveTimezone(allTimezones[Math.floor(Math.random() * allTimezones.length)])
  }, [])

  let timezones =
    actualQuery === ''
      ? allTimezones
      : allTimezones.filter((timezone) =>
          timezone.toLowerCase().includes(actualQuery.toLowerCase())
        )

  return (
    <div className="flex h-full w-screen justify-center bg-gray-50 p-12">
      <div className="mx-auto w-full max-w-xs">
        <div className="py-8 font-mono text-xs">Selected timezone: {activeTimezone}</div>
        <div className="space-y-1">
          <Combobox
            virtual={virtual}
            value={activeTimezone}
            onChange={(value) => {
              setActiveTimezone(value)
              setQuery('')
            }}
            as="div"
          >
            <Combobox.Label className="block text-sm font-medium leading-5 text-gray-700">
              Timezone {virtual ? `(virtual)` : ''}
            </Combobox.Label>

            <div className="relative">
              <span className="relative inline-flex flex-row overflow-hidden rounded-md border shadow-sm">
                <Combobox.Input
                  onChange={(e) => setQuery(e.target.value)}
                  className="border-none px-3 py-1 outline-none"
                />
                <Combobox.Button as={Button}>
                  <span className="pointer-events-none flex items-center px-2">
                    <svg
                      className="h-5 w-5 text-gray-400"
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
                </Combobox.Button>
              </span>

              <div className="absolute mt-1 w-full rounded-md bg-white shadow-lg">
                <Combobox.Options className="shadow-xs max-h-60 overflow-auto rounded-md py-1 text-base leading-6 focus:outline-none sm:text-sm sm:leading-5">
                  {timezones.map((timezone, idx) => {
                    return (
                      <Combobox.Option
                        key={timezone}
                        order={idx}
                        value={timezone}
                        className={({ active }) => {
                          return classNames(
                            'relative w-full cursor-default select-none py-2 pl-3 pr-9 focus:outline-none',
                            active ? 'bg-indigo-600 text-white' : 'text-gray-900'
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
                              {timezone}
                            </span>
                            {selected && (
                              <span
                                className={classNames(
                                  'absolute inset-y-0 right-0 flex items-center pr-4',
                                  active ? 'text-white' : 'text-indigo-600'
                                )}
                              >
                                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
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
                      </Combobox.Option>
                    )
                  })}
                </Combobox.Options>
              </div>
            </div>
          </Combobox>
        </div>
      </div>
    </div>
  )
}
