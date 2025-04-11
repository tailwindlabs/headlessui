import { Label, Listbox, ListboxButton, ListboxOption, ListboxOptions } from '@headlessui/react'
import { useEffect, useState } from 'react'

let people = [
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
  let [active, setActivePerson] = useState(people[2])

  // Choose a random person on mount
  useEffect(() => {
    setActivePerson(people[Math.floor(Math.random() * people.length)])
  }, [])

  return (
    <div className="flex h-full w-screen justify-center bg-gray-50 p-12">
      <div className="mx-auto w-full max-w-xs">
        <div className="space-y-1">
          <Listbox value={active} onChange={setActivePerson}>
            <Label className="block text-sm font-medium leading-5 text-gray-700">Assigned to</Label>

            <div className="relative">
              <span className="shadow-xs inline-block w-full rounded-md">
                <ListboxButton className="relative w-full cursor-default rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 text-left transition duration-150 ease-in-out sm:text-sm sm:leading-5">
                  <span className="block truncate">{active}</span>
                  <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
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
                </ListboxButton>
              </span>

              <ListboxOptions
                anchor="bottom"
                transition
                className="focus:outline-hidden data-closed:scale-95 data-closed:opacity-0 w-[var(--button-width)] overflow-auto rounded-md border border-gray-300 bg-white py-1 text-base leading-6 shadow-lg transition duration-200 ease-out [--anchor-gap:--spacing(1)] [--anchor-max-height:--spacing(60)] sm:text-sm sm:leading-5"
              >
                {people.map((name) => (
                  <ListboxOption
                    key={name}
                    value={name}
                    className="focus:outline-hidden data-active:bg-indigo-600 data-active:text-white group relative cursor-default select-none py-2 pl-3 pr-9 text-gray-900"
                  >
                    <span className="group-data-selected:font-semibold block truncate font-normal">
                      {name}
                    </span>
                    <span className="group-data-active:text-white group-data-selected:flex absolute inset-y-0 right-0 hidden items-center pr-4 text-indigo-600">
                      <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </span>
                  </ListboxOption>
                ))}
              </ListboxOptions>
            </div>
          </Listbox>
        </div>
      </div>
    </div>
  )
}
