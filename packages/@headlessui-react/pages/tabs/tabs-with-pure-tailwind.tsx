import React, { useState } from 'react'
import { Tab, Switch } from '@headlessui/react'

import { classNames } from '../../src/utils/class-names'

export default function Home() {
  let tabs = [
    { name: 'My Account', content: 'Tab content for my account' },
    { name: 'Company', content: 'Tab content for company', disabled: true },
    { name: 'Team Members', content: 'Tab content for team members' },
    { name: 'Billing', content: 'Tab content for billing' },
  ]

  let [manual, setManual] = useState(false)

  return (
    <div className="flex flex-col items-start w-screen h-full p-12 bg-gray-50 space-y-12">
      <Switch.Group as="div" className="flex items-center space-x-4">
        <Switch.Label>Manual keyboard activation</Switch.Label>

        <Switch
          as="button"
          checked={manual}
          onChange={setManual}
          className={({ checked }) =>
            classNames(
              'relative inline-flex flex-shrink-0 h-6 border-2 border-transparent rounded-full cursor-pointer w-11 focus:outline-none focus:shadow-outline transition-colors ease-in-out duration-200',
              checked ? 'bg-indigo-600' : 'bg-gray-200'
            )
          }
        >
          {({ checked }) => (
            <span
              className={classNames(
                'inline-block w-5 h-5 bg-white rounded-full transform transition ease-in-out duration-200',
                checked ? 'translate-x-5' : 'translate-x-0'
              )}
            />
          )}
        </Switch>
      </Switch.Group>

      <Tab.Group className="flex flex-col max-w-3xl w-full" as="div" manual={manual}>
        <Tab.List className="relative z-0 rounded-lg shadow flex divide-x divide-gray-200">
          {tabs.map((tab, tabIdx) => (
            <Tab
              key={tab.name}
              disabled={tab.disabled}
              className={({ selected }) =>
                classNames(
                  selected ? 'text-gray-900' : 'text-gray-500 hover:text-gray-700',
                  tabIdx === 0 ? 'rounded-l-lg' : '',
                  tabIdx === tabs.length - 1 ? 'rounded-r-lg' : '',
                  tab.disabled && 'opacity-50',
                  'group relative min-w-0 flex-1 overflow-hidden bg-white py-4 px-4 text-sm font-medium text-center hover:bg-gray-50 focus:z-10'
                )
              }
            >
              {({ selected }) => (
                <>
                  <span>{tab.name}</span>
                  {tab.disabled && <small className="inline-block px-4 text-xs">(disabled)</small>}
                  <span
                    aria-hidden="true"
                    className={classNames(
                      selected ? 'bg-indigo-500' : 'bg-transparent',
                      'absolute inset-x-0 bottom-0 h-0.5'
                    )}
                  />
                </>
              )}
            </Tab>
          ))}
        </Tab.List>

        <Tab.Panels className="mt-4">
          {tabs.map(tab => (
            <Tab.Panel className="bg-white rounded-lg p-4 shadow" key={tab.name}>
              {tab.content}
            </Tab.Panel>
          ))}
        </Tab.Panels>
      </Tab.Group>
    </div>
  )
}
