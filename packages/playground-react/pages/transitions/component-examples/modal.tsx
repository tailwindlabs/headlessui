import React, { Fragment, useEffect, useRef, useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { CheckIcon } from '@heroicons/react/outline'

export default function Home() {
  let [open, setOpen] = useState(false)
  function toggle() {
    setOpen((v) => !v)
  }

  let [events, setEvents] = useState<string[]>([])
  let [tree, setTree] = useState<string>('')

  let raf = useRef(null)
  function addEvent(name: string, event: string) {
    if (raf.current) cancelAnimationFrame(raf.current)
    setEvents((existing) => [
      ...existing,
      `${new Date().toLocaleTimeString()} - [${name.padEnd(8, ' ')}] ${event}`,
    ])

    raf.current = requestAnimationFrame(() => {
      raf.current = requestAnimationFrame(() => {
        setEvents((existing) => [
          ...existing,
          '-'.repeat(Math.max(...existing.map((e) => e.length))),
        ])
      })
    })
  }

  // @ts-ignore
  const machines = typeof window !== 'undefined'
    ? window.useActiveMachines()
    : useRef([])

  useEffect(() => {
    requestAnimationFrame(function tick() {
      let tmp = ''

      for (const machine of machines.current ?? []) {
        tmp += `${machine.debugDescription()}\n`
      }

      setTree(tmp)
      requestAnimationFrame(tick)
    })
  }, [])

  return (
    <div>
      <div className="fixed top-16 bottom-4 right-4 z-30 overflow-auto rounded-lg bg-black/75 p-4 text-gray-300">
        <pre>{tree}</pre>
      </div>

      <div className="flex space-x-4 p-12">
        <div className="inline-block p-12">
          <span className="mt-3 flex w-full rounded-md shadow-sm sm:mt-0 sm:w-auto">
            <button
              onClick={toggle}
              type="button"
              className="focus:shadow-outline-blue inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium leading-6 text-gray-700 shadow-sm transition duration-150 ease-in-out hover:text-gray-500 focus:border-blue-300 focus:outline-none sm:text-sm sm:leading-5"
            >
              Show modal
            </button>
          </span>
        </div>

        <ul className="max-h-[90vh] overflow-auto bg-gray-200 p-4 text-gray-900">
          <h3 className="font-bold">Events:</h3>
          {events.map((event, i) => (
            <li key={i} className="whitespace-pre-wrap font-mono text-sm">
              {event}
            </li>
          ))}
        </ul>
      </div>
      <Transition
        data-debug="root"
        show={open}
        as={Fragment}
        beforeEnter={() => addEvent('Root', 'Before enter')}
        afterEnter={() => addEvent('Root', 'After enter')}
        beforeLeave={() => addEvent('Root', 'Before leave')}
        afterLeave={() => addEvent('Root', 'After leave')}
      >
        <Dialog as="div" className="relative z-10" onClose={setOpen}>
          <Transition.Child
            data-debug="backdrop"
            beforeEnter={() => addEvent('Backdrop', 'Before enter')}
            afterEnter={() => addEvent('Backdrop', 'After enter')}
            beforeLeave={() => addEvent('Backdrop', 'Before leave')}
            afterLeave={() => addEvent('Backdrop', 'After leave')}
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
          </Transition.Child>

          <div className="fixed inset-0 z-10 overflow-y-auto">
            <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
              <Transition.Child
                data-debug="panel"
                beforeEnter={() => addEvent('Panel', 'Before enter')}
                afterEnter={() => addEvent('Panel', 'After enter')}
                beforeLeave={() => addEvent('Panel', 'Before leave')}
                afterLeave={() => addEvent('Panel', 'After leave')}
                as={Fragment}
                enter="ease-out duration-1000"
                enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                enterTo="opacity-100 translate-y-0 sm:scale-100"
                leave="ease-in delay-1000 duration-1000"
                leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              >
                <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pt-5 pb-4 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-sm sm:p-6">
                  <div>
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                      <CheckIcon className="h-6 w-6 text-green-600" aria-hidden="true" />
                    </div>
                    <div className="mt-3 text-center sm:mt-5">
                      <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                        Payment successful
                      </Dialog.Title>
                      <div className="mt-2">
                        <Transition.Child
                          data-debug="child 1"
                          beforeEnter={() => addEvent('Child 1', 'Before enter')}
                          afterEnter={() => addEvent('Child 1', 'After enter')}
                          beforeLeave={() => addEvent('Child 1', 'Before leave')}
                          afterLeave={() => addEvent('Child 1', 'After leave')}
                          as={Fragment}
                          enter="ease-out delay-1000 duration-1000"
                          enterFrom="opacity-0"
                          enterTo="opacity-100"
                          leave="ease-in delay-1000 duration-1000"
                          leaveFrom="opacity-100"
                          leaveTo="opacity-0"
                        >
                          <p className="text-sm text-gray-500">
                            Lorem ipsum dolor sit amet consectetur adipisicing elit. Consequatur
                            amet labore.
                          </p>
                        </Transition.Child>
                        <Transition.Child
                          data-debug="child 2"
                          beforeEnter={() => addEvent('Child 2', 'Before enter')}
                          afterEnter={() => addEvent('Child 2', 'After enter')}
                          beforeLeave={() => addEvent('Child 2', 'Before leave')}
                          afterLeave={() => addEvent('Child 2', 'After leave')}
                          as={Fragment}
                          enter="ease-out duration-100"
                          enterFrom="opacity-0"
                          enterTo="opacity-100"
                          leave="ease-in duration-100"
                          leaveFrom="opacity-100"
                          leaveTo="opacity-0"
                        >
                          <p className="text-sm text-gray-500">
                            Lorem ipsum dolor sit amet consectetur adipisicing elit. Consequatur
                            amet labore.
                          </p>
                        </Transition.Child>
                      </div>
                    </div>
                  </div>
                  <div className="mt-5 sm:mt-6">
                    <button
                      type="button"
                      className="inline-flex w-full justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:text-sm"
                      onClick={() => setOpen(false)}
                    >
                      Go back to dashboard
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  )
}
