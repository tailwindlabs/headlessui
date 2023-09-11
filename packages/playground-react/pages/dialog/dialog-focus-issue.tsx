import { Dialog } from '@headlessui/react'
import { useState } from 'react'
import { Button } from '../../components/button'

function Modal(props) {
  return (
    <Dialog className="relative z-50" {...props}>
      <div className="fixed inset-0 bg-green-500 bg-opacity-90 backdrop-blur backdrop-filter" />
      <div className="fixed inset-0 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          <Dialog.Panel className="relative m-5 flex w-full max-w-3xl gap-4 rounded-lg bg-white p-10 shadow">
            <Button>One</Button>
            <Button>Two</Button>
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
      <Button onClick={() => setIsOpen(true)}>Open Dialog</Button>
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
