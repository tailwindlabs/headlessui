import { Dialog, Tab } from '@headlessui/react'
import { useState } from 'react'
import { Button } from '../../components/button'

export default function App() {
  let [open, setOpen] = useState(false)

  return (
    <div className="p-12">
      <Button onClick={() => setOpen(true)}>Open dialog</Button>
      <Dialog open={open} onClose={setOpen} className="fixed inset-0 grid place-content-center">
        <div className="fixed inset-0 bg-gray-500/70" />
        <Dialog.Panel className="inline-block transform overflow-hidden rounded-lg bg-white text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:align-middle">
          <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
            <Tab.Group>
              <Tab.List className="flex gap-4 py-4">
                <Tab as={Button}>Tab 1</Tab>
                <Tab as={Button}>Tab 2</Tab>
                <Tab as={Button}>Tab 3</Tab>
              </Tab.List>
              <Tab.Panels>
                <Tab.Panel className="px-3 py-2">Panel 1</Tab.Panel>
                <Tab.Panel className="px-3 py-2">Panel 2</Tab.Panel>
                <Tab.Panel className="px-3 py-2">Panel 3</Tab.Panel>
              </Tab.Panels>
            </Tab.Group>
          </div>
        </Dialog.Panel>
      </Dialog>
    </div>
  )
}
