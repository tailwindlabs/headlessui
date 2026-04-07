import { Combobox } from '@headlessui/react'
import { useEffect, useState } from 'react'

import { Button } from '../../components/button'
import { countries as allCountries } from '../../data'
import { classNames } from '../../utils/class-names'

function useDebounce<T>(value: T, delay: number) {
  let [debouncedValue, setDebouncedValue] = useState(value)
  useEffect(() => {
    let timer = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])
  return debouncedValue
}
export default function Home() {
  let [query, setQuery] = useState('')
  let [activeCountry, setActiveCountry] = useState(allCountries[2])

  // Mimic delayed response from an API
  let actualQuery = useDebounce(query, 0 /* Change to higher value like 100 for testing purposes */)

  // Choose a random person on mount
  useEffect(() => {
    setActiveCountry(allCountries[Math.floor(Math.random() * allCountries.length)])
  }, [])

  let countries =
    actualQuery === ''
      ? allCountries
      : allCountries.filter((person) => person.toLowerCase().includes(actualQuery.toLowerCase()))

  return (
    <div className="flex h-full w-screen justify-center bg-gray-50 p-12">
      <div className="mx-auto w-full max-w-xs">
        <div className="py-8 font-mono text-xs">Selected country: {activeCountry}</div>
        <div className="space-y-1">
          <Combobox
            value={activeCountry}
            onChange={(value) => {
              setActiveCountry(value)
              setQuery('')
            }}
            as="div"
          >
            <Combobox.Label className="block text-sm font-medium leading-5 text-gray-700">
              Country
            </Combobox.Label>

            <div className="relative">
              <span className="shadow-xs relative inline-flex flex-row overflow-hidden rounded-md border">
                <Combobox.Input
                  onChange={(e) => setQuery(e.target.value)}
                  className="outline-hidden border-none px-3 py-1"
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

              <Combobox.Options
                transition
                anchor="bottom start"
                className="focus:outline-hidden data-closed:opacity-0 w-[calc(var(--input-width)+var(--button-width))] overflow-auto rounded-md bg-white py-1 text-base leading-6 shadow-lg transition duration-300 [--anchor-gap:--spacing(1)] [--anchor-max-height:--spacing(60)] sm:text-sm sm:leading-5"
              >
                {countries.map((country) => (
                  <Combobox.Option
                    key={country}
                    value={country}
                    className={({ active }) => {
                      return classNames(
                        'focus:outline-hidden relative cursor-default select-none py-2 pl-3 pr-9',
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
                          {country}
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
                ))}
              </Combobox.Options>
            </div>
          </Combobox>
        </div>
      </div>
    </div>
  )
}
