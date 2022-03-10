import { useState } from 'react'
import { Dialog, Tab } from '@headlessui/react'

export default function App() {
  let [open, setOpen] = useState(false)

  return (
    <>
      <button onClick={() => setOpen(true)}>Open dialog</button>
      <Dialog open={open} onClose={setOpen} className="fixed inset-0 grid place-content-center">
        <Dialog.Overlay className="fixed inset-0 bg-gray-500/70" />
        <div className="inline-block transform overflow-hidden rounded-lg bg-white text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:align-middle">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <Tab.Group>
              <Tab.List>
                <Tab className="px-3 py-2">Tab 1</Tab>
                <Tab className="px-3 py-2">Tab 2</Tab>
                <Tab className="px-3 py-2">Tab 3</Tab>
              </Tab.List>
              <Tab.Panels>
                <Tab.Panel className="px-3 py-2">Panel 1</Tab.Panel>
                <Tab.Panel className="px-3 py-2">Panel 2</Tab.Panel>
                <Tab.Panel className="px-3 py-2">Panel 3</Tab.Panel>
              </Tab.Panels>
            </Tab.Group>
          </div>
        </div>
      </Dialog>
    </>
  )
}
