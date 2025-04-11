import { Combobox } from '@headlessui/react'
import { useState } from 'react'

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

let people = [
  { id: 1, name: 'Wade Cooper' },
  { id: 2, name: 'Arlene Mccoy' },
  { id: 3, name: 'Devon Webb' },
  { id: 4, name: 'Tom Cook' },
  { id: 5, name: 'Tanya Fox' },
  { id: 6, name: 'Hellen Schmidt' },
  { id: 7, name: 'Caroline Schultz' },
  { id: 8, name: 'Mason Heaney' },
  { id: 9, name: 'Claudie Smitham' },
  { id: 10, name: 'Emil Schaefer' },
]

export default function Home() {
  return (
    <div className="flex h-full w-screen justify-center space-x-4 bg-gray-50 p-12">
      <MultiPeopleList />
    </div>
  )
}

function MultiPeopleList() {
  let [query, setQuery] = useState('')
  let [activePersons, setActivePersons] = useState([people[2], people[3]])

  return (
    <div className="w-full max-w-4xl">
      <div className="space-y-1">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            console.log([...new FormData(e.currentTarget).entries()])
          }}
        >
          <Combobox
            value={activePersons}
            onChange={(people) => setActivePersons(people)}
            name="people"
            multiple
          >
            <Combobox.Label className="block text-sm font-medium leading-5 text-gray-700">
              Assigned to
            </Combobox.Label>

            <div className="relative">
              <span className="shadow-xs inline-block w-full rounded-md">
                <div className="focus-within:outline-hidden relative w-full cursor-default rounded-md border border-gray-300 bg-white py-2 pl-2 pr-10 text-left transition duration-150 ease-in-out focus-within:border-blue-700 focus-within:ring-1 focus-within:ring-blue-700 sm:text-sm sm:leading-5">
                  <span className="block flex flex-wrap gap-2">
                    {activePersons.map((person) => (
                      <span
                        key={person.id}
                        className="flex items-center gap-1 rounded-sm bg-blue-50 px-2 py-0.5"
                      >
                        <span>{person.name}</span>
                        <svg
                          className="h-4 w-4 cursor-pointer"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                          onClick={(e) => {
                            e.stopPropagation()
                            e.preventDefault()
                            setActivePersons((existing) => existing.filter((p) => p !== person))
                          }}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </span>
                    ))}
                    <Combobox.Input
                      onChange={(event) => setQuery(event.target.value)}
                      onFocus={() => query != '' && setQuery('')}
                      className="border-none p-0 focus:ring-0"
                      placeholder="Search..."
                    />
                  </span>
                  <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
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
                  </Combobox.Button>
                </div>
              </span>

              <div className="absolute mt-1 w-full rounded-md bg-white shadow-lg">
                <Combobox.Options className="shadow-2xs focus:outline-hidden max-h-60 overflow-auto rounded-md py-1 text-base leading-6 sm:text-sm sm:leading-5">
                  {people
                    .filter((person) => person.name.toLowerCase().includes(query.toLowerCase()))
                    .map((person) => (
                      <Combobox.Option
                        key={person.id}
                        value={person}
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
                              {person.name}
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
            </div>
          </Combobox>
          <button className="shadow-xs focus:outline-hidden mt-2 inline-flex items-center rounded-sm border border-gray-300 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
            Submit
          </button>
        </form>
      </div>
    </div>
  )
}
