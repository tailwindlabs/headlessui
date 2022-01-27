import React, { useState } from 'react'
import { RadioGroup } from '@headlessui/react'
import { classNames } from '../../utils/class-names'

export default function Home() {
  let access = [
    {
      id: 'access-1',
      name: 'Public access',
      description: 'This project would be available to anyone who has the link',
    },
    {
      id: 'access-2',
      name: 'Private to Project Members',
      description: 'Only members of this project would be able to access',
    },
    {
      id: 'access-3',
      name: 'Private to you',
      description: 'You are the only one able to access this project',
    },
  ]
  let [active, setActive] = useState()

  return (
    <div className="p-12 max-w-xl">
      <a href="/">Link before</a>
      <RadioGroup value={active} onChange={setActive}>
        <fieldset className="space-y-4">
          <legend>
            <h2 className="text-xl">Privacy setting</h2>
          </legend>

          <div className="bg-white rounded-md -space-y-px">
            {access.map(({ id, name, description }, i) => {
              return (
                <RadioGroup.Option
                  key={id}
                  value={id}
                  className={({ active }) =>
                    classNames(
                      // Rounded corners
                      i === 0 && 'rounded-tl-md rounded-tr-md',
                      access.length - 1 === i && 'rounded-bl-md rounded-br-md',

                      // Shared
                      'relative border p-4 flex focus:outline-none',
                      active ? 'bg-indigo-50 border-indigo-200 z-10' : 'border-gray-200'
                    )
                  }
                >
                  {({ active, checked }) => (
                    <div className="flex justify-between items-center w-full">
                      <div className="ml-3 flex flex-col cursor-pointer">
                        <span
                          className={classNames(
                            'block text-sm leading-5 font-medium',
                            active ? 'text-indigo-900' : 'text-gray-900'
                          )}
                        >
                          {name}
                        </span>
                        <span
                          className={classNames(
                            'block text-sm leading-5',
                            active ? 'text-indigo-700' : 'text-gray-500'
                          )}
                        >
                          {description}
                        </span>
                      </div>
                      <div>
                        {checked && (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            className="h-5 w-5 text-indigo-500"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                        )}
                      </div>
                    </div>
                  )}
                </RadioGroup.Option>
              )
            })}
          </div>
        </fieldset>
      </RadioGroup>
      <a href="/">Link after</a>
    </div>
  )
}
