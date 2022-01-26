import React, { useState, useEffect } from 'react'
import { Combobox } from '@headlessui/react'

import { classNames } from '../../utils/class-names'

export default function Home() {
  let [activeValue, setActiveValue] = useState(undefined)

  return (
    <div className="flex justify-center w-screen h-full p-12 bg-gray-50">
      <div className="w-full max-w-xs mx-auto">
        <div className="text-xs py-8 font-mono">Selected value: {activeValue}</div>
        <div className="space-y-1">
          <Combobox value={activeValue} onChange={setActiveValue}>
            <div className="relative">
              <span className="relative inline-flex flex-row rounded-md overflow-hidden shadow-sm border">
                <Combobox.Input className="border-none outline-none px-3 py-1" />
                <Combobox.Button className="focus:outline-none px-1 bg-gray-100 cursor-default border-l text-indigo-600">
                  <span className="flex items-center px-2 pointer-events-none">
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
                </Combobox.Button>
              </span>

              <div className="absolute w-full mt-1 bg-white rounded-md shadow-lg">
                <Combobox.Options className="py-1 overflow-auto text-base leading-6 rounded-md shadow-xs max-h-60 focus:outline-none sm:text-sm sm:leading-5">
                  <Combobox.Option
                    value={'robin'}
                    className={({ active }) => {
                      return classNames(
                        'relative py-2 pl-3 cursor-default select-none pr-9 focus:outline-none',
                        active ? 'text-white bg-indigo-600' : 'text-gray-900'
                      )
                    }}
                  >
                    Robin M
                  </Combobox.Option>
                  <Combobox.Option
                    value={'johnathan'}
                    className={({ active }) => {
                      return classNames(
                        'relative py-2 pl-3 cursor-default select-none pr-9 focus:outline-none',
                        active ? 'text-white bg-indigo-600' : 'text-gray-900'
                      )
                    }}
                  >
                    Jonathan R
                  </Combobox.Option>
                  <Combobox.Option
                    value={'jordan'}
                    className={({ active }) => {
                      return classNames(
                        'relative py-2 pl-3 cursor-default select-none pr-9 focus:outline-none',
                        active ? 'text-white bg-indigo-600' : 'text-gray-900'
                      )
                    }}
                  >
                    Jordan P
                  </Combobox.Option>
                </Combobox.Options>
              </div>
            </div>
          </Combobox>
        </div>
      </div>
    </div>
  )
}
