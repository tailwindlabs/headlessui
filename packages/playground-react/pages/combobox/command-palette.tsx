import React, { useState, useEffect } from 'react'
import { Combobox } from '@headlessui/react'

import { classNames } from '../../utils/class-names'

let everybody = [
  { id: 1, img: 'https://github.com/adamwathan.png', name: 'Adam Wathan' },
  { id: 2, img: 'https://github.com/sschoger.png', name: 'Steve Schoger' },
  { id: 3, img: 'https://github.com/bradlc.png', name: 'Brad Cornes' },
  { id: 4, img: 'https://github.com/simonswiss.png', name: 'Simon Vrachliotis' },
  { id: 5, img: 'https://github.com/robinmalfait.png', name: 'Robin Malfait' },
  {
    id: 6,
    img: 'https://pbs.twimg.com/profile_images/1478879681491394569/eV2PyCnm_400x400.jpg',
    name: 'James McDonald',
  },
  { id: 7, img: 'https://github.com/reinink.png', name: 'Jonathan Reinink' },
  { id: 8, img: 'https://github.com/thecrypticace.png', name: 'Jordan Pittman' },
]

export default function Home() {
  let [query, setQuery] = useState('')
  let [activePerson, setActivePerson] = useState(everybody[2])

  // Choose a random person on mount
  useEffect(() => {
    setActivePerson(everybody[Math.floor(Math.random() * everybody.length)])
  }, [])

  let people =
    query === ''
      ? everybody
      : everybody.filter(person => person.name.toLowerCase().includes(query.toLowerCase()))

  return (
    <div className="flex justify-center w-screen h-full p-12 bg-gray-50">
      <div className="w-full max-w-xs mx-auto">
        <div className="space-y-1">
          <Combobox
            value={activePerson}
            property="name"
            onChange={setActivePerson}
            onSearch={setQuery}
          >
            <div className="relative">
              <span className="relative inline-flex flex-row rounded-md overflow-hidden shadow-sm border">
                <Combobox.Input className="outline-none px-3 py-1" />
              </span>

              <div className="absolute w-full mt-1 bg-white rounded-md shadow-lg">
                <Combobox.Options className="py-1 overflow-auto text-base leading-6 rounded-md shadow-xs max-h-60 focus:outline-none sm:text-sm sm:leading-5">
                  {people.map(person => (
                    <Combobox.Option
                      key={person.id}
                      value={person}
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
                            {person.name}
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
                    </Combobox.Option>
                  ))}
                </Combobox.Options>
              </div>
            </div>
          </Combobox>
        </div>
      </div>
    </div>
  )
}
