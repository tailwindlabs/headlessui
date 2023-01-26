import { useState } from 'react'
import { Dialog } from '@headlessui/react'

function MyDialog({ open, close }) {
  return (
    <Dialog open={open} onClose={close} className="relative z-50">
      {/* The backdrop, rendered as a fixed sibling to the panel container */}
      {/* <div className="fixed inset-0 bg-black/30" aria-hidden="true" /> */}
      <div className="fixed left-0 top-0 bottom-0 flex items-center justify-center bg-red-500 p-4">
        <Dialog.Panel className="mx-auto w-48 rounded bg-white p-4">
          <p className="my-2">Gray area should be scrollable</p>

          <p className="h-32 overflow-y-scroll border bg-gray-100">
            Are you sure you want to deactivate your account? All of your data will be permanently
            removed. This action cannot be undone.
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
    </Dialog>
  )
}

export default function App() {
  let [isOpen, setIsOpen] = useState(true)
  return (
    <div>
      <button onClick={() => setIsOpen((v) => !v)}>Toggle dialog</button>
      <MyDialog open={isOpen} close={() => setIsOpen(false)} />
      <div className="h-[50vh] bg-blue-500" />
      <button onClick={() => setIsOpen((v) => !v)}>Toggle dialog</button>
      <div className="h-[50vh] bg-green-500" />
      <button onClick={() => setIsOpen((v) => !v)}>Toggle dialog</button>
      <div className="h-[50vh] bg-yellow-500" />
      <button onClick={() => setIsOpen((v) => !v)}>Toggle dialog</button>
      <div className="h-[50vh] bg-cyan-500" />
      <a id="foo">Hello from Foo!</a>
      <div className="h-[50vh] bg-pink-500" />
      <button onClick={() => setIsOpen((v) => !v)}>Toggle dialog</button>
      <div className="h-[50vh] bg-emerald-500" />
      <button onClick={() => setIsOpen((v) => !v)}>Toggle dialog</button>
      <div className="h-[50vh] bg-orange-500" />
    </div>
  )
}
