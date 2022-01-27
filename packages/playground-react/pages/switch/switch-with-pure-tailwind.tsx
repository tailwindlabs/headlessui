import React, { useState } from 'react'
import { Switch } from '@headlessui/react'

import { classNames } from '../../utils/class-names'

export default function Home() {
  let [state, setState] = useState(false)

  return (
    <div className="flex items-start justify-center w-screen h-full p-12 bg-gray-50">
      <Switch.Group as="div" className="flex items-center space-x-4">
        <Switch.Label>Enable notifications</Switch.Label>

        <Switch
          as="button"
          checked={state}
          onChange={setState}
          className={({ checked }) =>
            classNames(
              'relative inline-flex flex-shrink-0 h-6 border-2 border-transparent rounded-full cursor-pointer w-11 focus:outline-none focus:shadow-outline transition-colors ease-in-out duration-200',
              checked ? 'bg-indigo-600' : 'bg-gray-200'
            )
          }
        >
          {({ checked }) => (
            <>
              <span
                className={classNames(
                  'inline-block w-5 h-5 bg-white rounded-full transform transition ease-in-out duration-200',
                  checked ? 'translate-x-5' : 'translate-x-0'
                )}
              />
            </>
          )}
        </Switch>
      </Switch.Group>
    </div>
  )
}
