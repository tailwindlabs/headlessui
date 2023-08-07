import { Transition } from '@headlessui/react'
import { Fragment, useState } from 'react'
import { Button } from '../../components/button'

export default function AppearExample() {
  let [show, setShow] = useState(true)
  let [lazy, setLazy] = useState(false)

  return (
    <div className="space-y-4 p-8">
      <div className="flex items-center gap-3">
        <Button onClick={() => setShow((v) => !v)}>Toggle show</Button>
        <Button onClick={() => setLazy((v) => !v)}>Toggle lazy</Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="rounded-md bg-white p-4 shadow ring-1 ring-black/5">
          <span className="mb-2">Initial render</span>
          <div className="grid max-w-6xl grid-cols-4 gap-4">
            <Transition
              show={show}
              appear={true}
              unmount={true}
              enter="duration-1000 transition"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="duration-1000 transition"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
              className="aspect-square flex-1 rounded-md bg-blue-200 p-4"
            >
              Appear: true, unmount: true
            </Transition>

            <Transition
              as={Fragment}
              show={show}
              appear={true}
              unmount={true}
              enter="duration-1000 transition"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="duration-1000 transition"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <div className="aspect-square flex-1 rounded-md bg-blue-200 p-4">
                Appear: true, as={`Fragment`}, unmount: true
              </div>
            </Transition>

            <Transition
              show={show}
              appear={false}
              unmount={true}
              enter="duration-1000 transition"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="duration-1000 transition"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
              className="aspect-square flex-1 rounded-md bg-blue-200 p-4"
            >
              Appear: false, unmount: true
            </Transition>

            <Transition
              as={Fragment}
              show={show}
              appear={false}
              unmount={true}
              enter="duration-1000 transition"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="duration-1000 transition"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <div className="aspect-square flex-1 rounded-md bg-blue-200 p-4">
                Appear: false, as={`Fragment`}, unmount: true
              </div>
            </Transition>

            <Transition
              show={show}
              appear={true}
              unmount={false}
              enter="duration-1000 transition"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="duration-1000 transition"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
              className="aspect-square flex-1 rounded-md bg-blue-200 p-4"
            >
              Appear: true, unmount: false
            </Transition>

            <Transition
              as={Fragment}
              show={show}
              appear={true}
              unmount={false}
              enter="duration-1000 transition"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="duration-1000 transition"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <div className="aspect-square flex-1 rounded-md bg-blue-200 p-4">
                Appear: true, as={`Fragment`}, unmount: false
              </div>
            </Transition>

            <Transition
              show={show}
              appear={false}
              unmount={false}
              enter="duration-1000 transition"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="duration-1000 transition"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
              className="aspect-square flex-1 rounded-md bg-blue-200 p-4"
            >
              Appear: false, unmount: false
            </Transition>

            <Transition
              as={Fragment}
              show={show}
              appear={false}
              unmount={false}
              enter="duration-1000 transition"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="duration-1000 transition"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <div className="aspect-square flex-1 rounded-md bg-blue-200 p-4">
                Appear: false, as={`Fragment`}, unmount: false
              </div>
            </Transition>
          </div>
        </div>

        {lazy && (
          <div className="rounded-md bg-white p-4 shadow ring-1 ring-black/5">
            <span className="mb-2">Not on the initial render</span>
            <div className="grid max-w-6xl grid-cols-4 gap-4">
              <Transition
                show={show}
                appear={true}
                unmount={true}
                enter="duration-1000 transition"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="duration-1000 transition"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
                className="aspect-square flex-1 rounded-md bg-blue-200 p-4"
              >
                Appear: true, unmount: true
              </Transition>

              <Transition
                as={Fragment}
                show={show}
                appear={true}
                unmount={true}
                enter="duration-1000 transition"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="duration-1000 transition"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <div className="aspect-square flex-1 rounded-md bg-blue-200 p-4">
                  Appear: true, as={`Fragment`}, unmount: true
                </div>
              </Transition>

              <Transition
                show={show}
                appear={false}
                unmount={true}
                enter="duration-1000 transition"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="duration-1000 transition"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
                className="aspect-square flex-1 rounded-md bg-blue-200 p-4"
              >
                Appear: false, unmount: true
              </Transition>

              <Transition
                as={Fragment}
                show={show}
                appear={false}
                unmount={true}
                enter="duration-1000 transition"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="duration-1000 transition"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <div className="aspect-square flex-1 rounded-md bg-blue-200 p-4">
                  Appear: false, as={`Fragment`}, unmount: true
                </div>
              </Transition>

              <Transition
                show={show}
                appear={true}
                unmount={false}
                enter="duration-1000 transition"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="duration-1000 transition"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
                className="aspect-square flex-1 rounded-md bg-blue-200 p-4"
              >
                Appear: true, unmount: false
              </Transition>

              <Transition
                as={Fragment}
                show={show}
                appear={true}
                unmount={false}
                enter="duration-1000 transition"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="duration-1000 transition"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <div className="aspect-square flex-1 rounded-md bg-blue-200 p-4">
                  Appear: true, as={`Fragment`}, unmount: false
                </div>
              </Transition>

              <Transition
                show={show}
                appear={false}
                unmount={false}
                enter="duration-1000 transition"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="duration-1000 transition"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
                className="aspect-square flex-1 rounded-md bg-blue-200 p-4"
              >
                Appear: false, unmount: false
              </Transition>

              <Transition
                as={Fragment}
                show={show}
                appear={false}
                unmount={false}
                enter="duration-1000 transition"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="duration-1000 transition"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <div className="aspect-square flex-1 rounded-md bg-blue-200 p-4">
                  Appear: false, as={`Fragment`}, unmount: false
                </div>
              </Transition>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
