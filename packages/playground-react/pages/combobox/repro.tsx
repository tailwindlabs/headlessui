import React, { useState, useEffect } from 'react'
import { Combobox } from '@headlessui/react'

export default function App() {
  return <Example />
}

const people = [
  { id: 1, name: 'Durward Reynolds' },
  { id: 2, name: 'Kenton Towne' },
  { id: 3, name: 'Therese Wunsch' },
  { id: 4, name: 'Benedict Kessler' },
  { id: 5, name: 'Katelyn Rohan' },
]

function Example() {
  const [selectedPerson, setSelectedPerson] = useState(people[0])
  const [query, setQuery] = useState('')

  const filteredPeople =
    query === ''
      ? people
      : people.filter((person) => {
          return person.name.toLowerCase().includes(query.toLowerCase())
        })

  return (
    <div>
      <Combobox value={selectedPerson} onChange={setSelectedPerson} nullable>
        {({ open }) => {
          if (!open) {
            return (
              <div>
                <Combobox.Input
                  key="a"
                  onChange={(event) => setQuery(event.target.value)}
                  displayValue={(person) => (person?.name ?? '') + ' closed'}
                  onBlur={() => console.log('blur while closed')}
                />
                <Combobox.Button>Open</Combobox.Button>
              </div>
            )
          }

          return (
            <div>
              <Combobox.Input
                key="a"
                onChange={(event) => setQuery(event.target.value)}
                displayValue={(person) => (person?.name ?? '') + ' open'}
                onBlur={() => console.log('blur while open')}
              />
              <Combobox.Button>Close</Combobox.Button>
              <Combobox.Options static>
                {filteredPeople.map((person) => (
                  <Combobox.Option key={person.id} value={person}>
                    {({ active, selected }) => (
                      <span>
                        {selected && '#'}
                        {active && '>'}
                        {person.name}
                      </span>
                    )}
                  </Combobox.Option>
                ))}
              </Combobox.Options>
            </div>
          )
        }}
      </Combobox>
    </div>
  )
}
