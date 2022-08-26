import { useState } from 'react'
import { Dialog } from '@headlessui/react'

function Modal(props) {
  return (
    <Dialog className="relative z-50" {...props}>
      <div className="fixed inset-0 bg-green-500 bg-opacity-90 backdrop-blur backdrop-filter" />
      <div className="fixed inset-0 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          <Dialog.Panel className="relative m-5 w-full max-w-3xl rounded-lg bg-white p-10 shadow">
            <button className="m-5 rounded-lg bg-blue-600 py-2 px-5 text-white">One</button>
            <button className="m-5 rounded-lg bg-blue-600 py-2 px-5 text-white">Two</button>
          </Dialog.Panel>
        </div>
      </div>
    </Dialog>
  )
}

export default function DialogFocusIssue() {
  let [isOpen, setIsOpen] = useState(false)

  return (
    <div className="p-10">
      <h1 className="py-2 text-3xl font-semibold">Headless UI Focus Jump</h1>
      <button
        className="my-5 rounded-lg bg-blue-600 py-2 px-5 text-white"
        onClick={() => setIsOpen(true)}
      >
        Open Dialog
      </button>
      <div className="bg-white p-20"></div>
      <div className="bg-gray-100 p-20"></div>
      <div className="bg-gray-200 p-20"></div>
      <div className="bg-gray-300 p-20"></div>
      <div className="bg-gray-400 p-20"></div>
      <div className="bg-gray-500 p-20"></div>
      <div className="bg-gray-600 p-20"></div>
      <div className="bg-gray-700 p-20"></div>
      <div className="bg-gray-800 p-20"></div>
      <div className="bg-gray-900 p-20"></div>
      <div className="bg-black p-20"></div>
      <Modal open={isOpen} onClose={() => setIsOpen(false)} />
    </div>
  )
}
