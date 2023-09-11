import { Combobox } from '@headlessui/react'
import { Fragment, useEffect, useState } from 'react'

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

  function setPerson(person) {
    setActivePerson(person)
    setQuery(person.name ?? '')
  }

  // Choose a random person on mount
  useEffect(() => {
    setPerson(everybody[Math.floor(Math.random() * everybody.length)])
  }, [])

  let people =
    query === ''
      ? everybody
      : everybody.filter((person) => person.name.toLowerCase().includes(query.toLowerCase()))

  let groups = people.reduce((groups, person) => {
    let lastNameLetter = person.name.split(' ')[1][0]

    groups.set(lastNameLetter, [...(groups.get(lastNameLetter) || []), person])

    return groups
  }, new Map())

  return (
    <div className="flex h-full w-screen justify-center bg-gray-50 p-12">
      <div className="mx-auto w-full max-w-lg">
        <div className="space-y-1">
          <Combobox
            as="div"
            value={activePerson}
            onChange={(person) => setPerson(person)}
            className="w-full overflow-hidden rounded border border-black/5 bg-white bg-clip-padding shadow-sm"
          >
            {({ activeOption }) => {
              return (
                <div className="flex w-full flex-col">
                  <Combobox.Input
                    onChange={(e) => setQuery(e.target.value)}
                    className="w-full rounded-none border-none bg-none px-3 py-1 outline-none"
                    placeholder="Search users…"
                    displayValue={(item: typeof activeOption) => item?.name}
                  />
                  <div className="flex">
                    <Combobox.Options className="shadow-xs max-h-60 flex-1 overflow-auto text-base leading-6 focus:outline-none sm:text-sm sm:leading-5">
                      {Array.from(groups.entries())
                        .sort(([letterA], [letterZ]) => letterA.localeCompare(letterZ))
                        .map(([letter, people]) => (
                          <Fragment key={letter}>
                            <div className="bg-gray-100 px-4 py-2">{letter}</div>
                            {people.map((person) => (
                              <Combobox.Option
                                key={person.id}
                                value={person}
                                className={({ active }) => {
                                  return classNames(
                                    'relative  flex cursor-default select-none space-x-4 py-2 pl-3 pr-9 focus:outline-none',
                                    active ? 'bg-indigo-600 text-white' : 'text-gray-900'
                                  )
                                }}
                              >
                                {({ active, selected }) => (
                                  <>
                                    <img
                                      src={person.img}
                                      className="h-6 w-6 overflow-hidden rounded-full"
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
                                        <svg className="h-5 w-5" viewBox="0 0 25 24" fill="none">
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
                          </Fragment>
                        ))}
                    </Combobox.Options>

                    {people.length === 0 ? (
                      <div className="w-full py-4 text-center">No person selected</div>
                    ) : activeOption === null ? null : (
                      <div className="border-l">
                        <div className="flex flex-col">
                          <div className="p-8 text-center">
                            <img
                              src={activeOption.img}
                              className="mb-4 inline-block h-16 w-16 overflow-hidden rounded-full"
                            />
                            <div className="font-bold text-gray-900">{activeOption.name}</div>
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
