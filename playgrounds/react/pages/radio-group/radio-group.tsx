import { RadioGroup } from '@headlessui/react'
import { useState } from 'react'
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
    <div className="max-w-xl p-12">
      <a href="/">Link before</a>
      <RadioGroup value={active} onChange={setActive}>
        <fieldset className="space-y-4">
          <legend>
            <h2 className="text-xl">Privacy setting</h2>
          </legend>

          <div className="-space-y-px rounded-md bg-white">
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
                      'relative flex border p-4 focus:outline-none',
                      active ? 'z-10 border-indigo-200 bg-indigo-50' : 'border-gray-200'
                    )
                  }
                >
                  {({ active, checked }) => (
                    <div className="flex w-full items-center justify-between">
                      <div className="ml-3 flex cursor-pointer flex-col">
                        <span
                          className={classNames(
                            'block text-sm font-medium leading-5',
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
