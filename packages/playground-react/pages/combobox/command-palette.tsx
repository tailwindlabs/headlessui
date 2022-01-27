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
      <div className="w-full max-w-lg mx-auto">
        <div className="space-y-1">
          <Combobox
            as="div"
            value={activePerson}
            onChange={person => setActivePerson(person)}
            className="bg-white w-full shadow-sm border border-black/5 bg-clip-padding rounded overflow-hidden"
          >
            {({ activeOption, open }) => {
              return (
                <div className="flex flex-col w-full">
                  <Combobox.Input
                    onChange={e => setQuery(e.target.value)}
                    className="border-none outline-none px-3 py-1 rounded-none w-full"
                    placeholder="Search users…"
                    displayValue={item => item?.name}
                  />
                  <div
                    className={classNames(
                      'flex border-t',
                      activePerson && !open ? 'border-transparent' : 'border-gray-200'
                    )}
                  >
                    <Combobox.Options className="flex-1 py-1 overflow-auto text-base leading-6 shadow-xs max-h-60 focus:outline-none sm:text-sm sm:leading-5">
                      {people.map(person => (
                        <Combobox.Option
                          key={person.id}
                          value={person}
                          className={({ active }) => {
                            return classNames(
                              'flex  relative py-2 pl-3 cursor-default select-none pr-9 focus:outline-none space-x-4',
                              active ? 'text-white bg-indigo-600' : 'text-gray-900'
                            )
                          }}
                        >
                          {({ active, selected }) => (
                            <>
                              <img
                                src={person.img}
                                className="w-6 h-6 overflow-hidden rounded-full"
                              />
                              <span
                                className={classNames(
                                  'block truncate',
                                  selected ? 'font-semibold' : 'font-normal'
                                )}
                              >
                                {person.name}
                              </span>
                              {active && (
                                <span
                                  className={classNames(
                                    'absolute inset-y-0 right-0 flex items-center pr-4',
                                    active ? 'text-white' : 'text-indigo-600'
                                  )}
                                >
                                  <svg className="w-5 h-5" viewBox="0 0 25 24" fill="none">
                                    <path
                                      d="M11.25 8.75L14.75 12L11.25 15.25"
                                      stroke="currentColor"
                                      strokeWidth="1.5"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    />
                                  </svg>
                                </span>
                              )}
                            </>
                          )}
                        </Combobox.Option>
                      ))}
                    </Combobox.Options>

                    {people.length === 0 ? (
                      <div className="text-center w-full py-4">No person selected</div>
                    ) : activeOption === null ? null : (
                      <div className="border-l">
                        <div className="flex flex-col">
                          <div className="p-8 text-center">
                            <img
                              src={activeOption.img}
                              className="w-16 h-16 rounded-full overflow-hidden inline-block mb-4"
                            />
                            <div className="text-gray-900 font-bold">{activeOption.name}</div>
                            <div className="text-gray-700">Obviously cool person</div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )
            }}
          </Combobox>
        </div>
      </div>
    </div>
  )
}
