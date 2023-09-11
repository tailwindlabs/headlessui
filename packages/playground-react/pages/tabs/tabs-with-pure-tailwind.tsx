import { Switch, Tab } from '@headlessui/react'
import { useState } from 'react'

import { classNames } from '../../utils/class-names'

export default function Home() {
  let tabs = [
    { name: 'My Account', content: 'Tab content for my account' },
    { name: 'Company', content: 'Tab content for company', disabled: true },
    { name: 'Team Members', content: 'Tab content for team members' },
    { name: 'Billing', content: 'Tab content for billing' },
  ]

  let [manual, setManual] = useState(false)

  return (
    <div className="flex h-full w-screen flex-col items-start space-y-12 bg-gray-50 p-12">
      <Switch.Group as="div" className="flex items-center space-x-4">
        <Switch.Label>Manual keyboard activation</Switch.Label>

        <Switch
          as="button"
          checked={manual}
          onChange={setManual}
          className={({ checked }) =>
            classNames(
              'focus:shadow-outline relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none',
              checked ? 'bg-indigo-600' : 'bg-gray-200'
            )
          }
        >
          {({ checked }) => (
            <span
              className={classNames(
                'inline-block h-5 w-5 transform rounded-full bg-white transition duration-200 ease-in-out',
                checked ? 'translate-x-5' : 'translate-x-0'
              )}
            />
          )}
        </Switch>
      </Switch.Group>

      <Tab.Group
        className="flex w-full max-w-3xl flex-col"
        as="div"
        manual={manual}
        defaultIndex={2}
      >
        <Tab.List className="relative z-0 flex divide-x divide-gray-200 rounded-lg shadow">
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
                  'group relative min-w-0 flex-1 overflow-hidden bg-white px-4 py-4 text-center text-sm font-medium hover:bg-gray-50 focus:z-10'
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
          {tabs.map((tab) => (
            <Tab.Panel className="rounded-lg bg-white p-4 shadow" key={tab.name}>
              {tab.content}
            </Tab.Panel>
          ))}
        </Tab.Panels>
      </Tab.Group>
    </div>
  )
}
