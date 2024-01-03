// @ts-nocheck
import { Combobox } from '@headlessui/react'
import { useMemo, useState } from 'react'

import { Button } from '../../components/button'
import { timezones as _allTimezones } from '../../data'
import { classNames } from '../../utils/class-names'

export default function Home() {
  let [count, setCount] = useState(1_000)

  let list = useMemo(() => {
    console.time('Generating list')
    let result = []

    while (result.length < count) {
      let batch = Math.floor(result.length / _allTimezones.length) + 1
      result.push(`${_allTimezones[result.length % _allTimezones.length]} #${batch}`)
    }
    console.timeEnd('Generating list')

    return result
  }, [count])

  return (
    <div className="flex flex-col p-12">
      <label className="mx-auto flex w-24 items-center gap-2">
        <span>Items:</span>
        <select
          defaultValue={count}
          className="mx-auto"
          onChange={(e) => {
            setCount(Number(e.target.value))
          }}
        >
          <option value={100}>100</option>
          <option value={1_000}>1000</option>
          <option value={10_000}>10k</option>
          <option value={100_000}>100k</option>
        </select>
      </label>

      <div className="flex">
        <Example data={list} virtual={true} initial="Europe/Brussels #1" />
        <Example data={list} virtual={false} initial="Europe/Brussels #1" />
      </div>
    </div>
  )
}

let nf = new Intl.NumberFormat('en-US')
function Example({ virtual = true, data, initial }: { virtual?: boolean; data; initial: string }) {
  let [query, setQuery] = useState('')
  let [activeTimezone, setActiveTimezone] = useState(initial)

  let timezones =
    query === ''
      ? data
      : data.filter((timezone) => timezone.toLowerCase().includes(query.toLowerCase()))

  return (
    <div className="flex h-full w-screen justify-center bg-gray-50 p-12">
      <div className="mx-auto w-full max-w-xs">
        <div className="py-8 font-mono text-xs">Selected timezone: {activeTimezone}</div>
        <div className="space-y-1">
          <Combobox
            virtual={virtual ? { options: timezones } : undefined}
            value={activeTimezone}
            nullable
            onChange={(value) => {
              setActiveTimezone(value)
              setQuery('')
            }}
            as="div"
          >
            <Combobox.Label className="block text-sm font-medium leading-5 text-gray-700">
              Timezone{' '}
              {virtual
                ? `(virtual — ${nf.format(timezones.length)} items)`
                : `(${nf.format(timezones.length)} items)`}
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
                {virtual ? (
                  <Combobox.Options className="shadow-xs max-h-60 overflow-auto rounded-md py-1 text-base leading-6 focus:outline-none sm:text-sm sm:leading-5">
                    {({ option }) => {
                      return (
                        <Combobox.Option
                          value={option}
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
                                {option as any}
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
                    }}
                  </Combobox.Options>
                ) : (
                  <Combobox.Options className="shadow-xs max-h-60 overflow-auto rounded-md py-1 text-base leading-6 focus:outline-none sm:text-sm sm:leading-5">
                    {timezones.map((timezone, idx) => {
                      return (
                        <Combobox.Option
                          key={timezone}
                          order={virtual ? idx : undefined}
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
                )}
              </div>
            </div>
          </Combobox>
        </div>
      </div>
    </div>
  )
}
