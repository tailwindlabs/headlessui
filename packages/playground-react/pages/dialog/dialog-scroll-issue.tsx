import { Dialog, Transition } from '@headlessui/react'
import { Fragment, useState } from 'react'

function MyDialog({ open, close }) {
  return (
    <>
      <Transition show={open} as={Fragment}>
        <Dialog onClose={close} className="relative z-50">
          <Transition.Child
            as={Fragment}
            enter="transition duration-500 ease-out"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition duration-500 ease-out"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed bottom-0 left-0 top-0 flex items-center justify-center bg-red-500 p-4">
              <Dialog.Panel className="mx-auto w-48 rounded bg-white p-4">
                <p className="my-2">Gray area should be scrollable</p>

                <p className="h-32 overflow-y-scroll border bg-gray-100">
                  Are you sure you want to deactivate your account? All of your data will be
                  permanently removed. This action cannot be undone.
                </p>

                <p>Colored area on the right should not be scrollable</p>

                <a
                  href="#foo"
                  onClick={() => {
                    setTimeout(() => {
                      close()
                    }, 2000)
                  }}
                >
                  Click me to close dialog and scroll to Foo
                </a>
              </Dialog.Panel>
            </div>
          </Transition.Child>
        </Dialog>
      </Transition>
    </>
  )
}

export default function App() {
  let [isOpen, setIsOpen] = useState(false)

  return (
    <div>
      <button onClick={() => setIsOpen((v) => !v)}>Toggle dialog</button>
      <MyDialog open={isOpen} close={() => setIsOpen(false)} />
      <div className="h-[50vh]" />
      <button onClick={() => setIsOpen((v) => !v)}>Toggle dialog</button>
      <div className="h-[50vh]" />
      <button onClick={() => setIsOpen((v) => !v)}>Toggle dialog</button>
      <div className="h-[50vh]" />
      <button onClick={() => setIsOpen((v) => !v)}>Toggle dialog</button>
      <div className="h-[50vh]" />
      <a id="foo" className="block w-full bg-pink-500 p-12">
        Hello from Foo!
      </a>
      <div className="h-[50vh]" />
      <button onClick={() => setIsOpen((v) => !v)}>Toggle dialog</button>
      <div className="h-[50vh]" />
      <button onClick={() => setIsOpen((v) => !v)}>Toggle dialog</button>
      <div className="h-[50vh]" />
      <button onClick={() => setIsOpen((v) => !v)}>Toggle dialog</button>
      <div className="h-[50vh]" />
    </div>
  )
}
