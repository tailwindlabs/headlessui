// @ts-nocheck
import { Combobox } from '@headlessui/react'
import { useRef, useState } from 'react'
import { classNames } from '../../utils/class-names'

import { Button } from '../../components/button'

type Option = {
  name: string
  disabled: boolean
  empty?: boolean
}

export default function Home() {
  let [list, setList] = useState<Option[]>(() => [
    { name: 'Alice', disabled: false },
    { name: 'Bob', disabled: false },
    { name: 'Charlie', disabled: false },
    { name: 'David', disabled: false },
    { name: 'Eve', disabled: false },
    { name: 'Fred', disabled: false },
    { name: 'George', disabled: false },
    { name: 'Helen', disabled: false },
    { name: 'Iris', disabled: false },
    { name: 'John', disabled: false },
    { name: 'Kate', disabled: false },
    { name: 'Linda', disabled: false },
    { name: 'Michael', disabled: false },
    { name: 'Nancy', disabled: false },
    { name: 'Oscar', disabled: true },
    { name: 'Peter', disabled: false },
    { name: 'Quentin', disabled: false },
    { name: 'Robert', disabled: false },
    { name: 'Sarah', disabled: false },
    { name: 'Thomas', disabled: false },
    { name: 'Ursula', disabled: false },
    { name: 'Victor', disabled: false },
    { name: 'Wendy', disabled: false },
    { name: 'Xavier', disabled: false },
    { name: 'Yvonne', disabled: false },
    { name: 'Zachary', disabled: false },
  ])

  let emptyOption = useRef({ name: 'No results', disabled: true, empty: true })

  let [query, setQuery] = useState('')
  let [selectedPerson, setSelectedPerson] = useState<Option | null>(list[0])
  let optionsRef = useRef<HTMLUListElement | null>(null)

  let filtered =
    query === ''
      ? list
      : list.filter((item) => item.name.toLowerCase().includes(query.toLowerCase()))

  return (
    <div className="mx-auto max-w-fit">
      <div className="py-8 font-mono text-xs">Selected person: {selectedPerson?.name ?? 'N/A'}</div>
      <Combobox
        virtual={{
          options: filtered.length > 0 ? filtered : [emptyOption.current],
          disabled: (option) => option.disabled || option.empty,
        }}
        value={selectedPerson}
        nullable
        onChange={(value) => {
          setSelectedPerson(value)
          setQuery('')
        }}
        as="div"
        // Don't do this lol — it's not supported
        // It's just so we can tab to the "Add" button for the demo
        // The combobox doesn't actually support this behavior
        onKeyDownCapture={(event: KeyboardEvent) => {
          let addButton = document.querySelector('#add_person') as HTMLElement | null
          if (event.key === 'Tab' && addButton && filtered.length === 0) {
            event.preventDefault()
            setTimeout(() => addButton.focus(), 0)
          }
        }}
      >
        <Combobox.Label className="block text-sm font-medium leading-5 text-gray-700">
          Person
        </Combobox.Label>

        <div className="relative">
          <span className="relative inline-flex flex-row overflow-hidden rounded-md border shadow-sm">
            <Combobox.Input
              onChange={(e) => setQuery(e.target.value)}
              displayValue={(option: Option | null) => option?.name ?? ''}
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
            <Combobox.Options
              // This is a hack to make keep the options list around when it's empty
              // It comes with some caveats:
              // like the option callback being called with a null option (which is probably a bug)
              static={filtered.length === 0}
              ref={optionsRef}
              className={classNames(
                'shadow-xs max-h-60 rounded-md py-1 text-base leading-6 focus:outline-none sm:text-sm sm:leading-5',
                filtered.length === 0 ? 'overflow-hidden' : 'overflow-auto'
              )}
            >
              {
                // @ts-expect-error TODO: Properly handle this
                ({ option }: { option: Option }) => {
                  if (!option || option.empty) {
                    return (
                      <Combobox.Option
                        // TODO: `disabled` being required is a bug
                        disabled
                        // Note: Do NOT use `null` for the `value`
                        value={option ?? emptyOption.current}
                        className="relative w-full cursor-default select-none px-3 py-2 text-center focus:outline-none"
                      >
                        <div className="relative grid h-full grid-cols-1 grid-rows-1">
                          <div className="absolute inset-0">
                            <svg
                              fill="none"
                              viewBox="0 0 24 24"
                              strokeWidth={0.5}
                              stroke="currentColor"
                              className="-translate-y-1/4 text-gray-500/5"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z"
                              />
                            </svg>
                          </div>
                          <div className="z-20 col-span-full col-start-1 row-span-full row-start-1 flex flex-col items-center justify-center p-8">
                            <h3 className="mx-2 mb-4 text-xl font-semibold text-gray-400">
                              No people found
                            </h3>
                            <button
                              id="add_person"
                              type="button"
                              className="rounded bg-blue-500 px-4 py-2 font-semibold text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                              onClick={() => {
                                let person = { name: query, disabled: false }
                                setList((list) => [...list, person])
                                setSelectedPerson(person)
                              }}
                            >
                              Add "{query}"
                            </button>
                          </div>
                        </div>
                      </Combobox.Option>
                    )
                  }

                  return (
                    <Combobox.Option
                      // TODO: `disabled` being required is a bug
                      disabled={option.disabled}
                      value={option}
                      className={({ active }) => {
                        return classNames(
                          'relative w-full cursor-default select-none py-2 pl-3 pr-9 focus:outline-none',
                          active ? 'bg-indigo-600 text-white' : 'text-gray-900'
                        )
                      }}
                    >
                      <span className="block truncate">{option.name}</span>
                    </Combobox.Option>
                  )
                }
              }
            </Combobox.Options>
          </div>
        </div>
      </Combobox>
    </div>
  )
}
