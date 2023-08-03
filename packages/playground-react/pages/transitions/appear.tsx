import { Transition } from '@headlessui/react'
import { useState } from 'react'
import { Button } from '../../components/button'

export default function AppearExample() {
  let [show, setShow] = useState(true)
  let [appear, setAppear] = useState(true)

  return (
    <div className="space-y-4 p-8">
      <div className="flex items-center gap-3">
        <Button onClick={() => setShow((v) => !v)}>Toggle show</Button>
        <Button onClick={() => setAppear((v) => !v)}>Toggle appear</Button>
      </div>

      <Transition
        show={show}
        appear={appear}
        enter="duration-1000 transition"
        enterFrom="opacity-0"
        enterTo="opacity-100"
        leave="duration-1000 transition"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
        className="h-96 w-96 rounded-md bg-blue-200 p-4"
      >
        Hello World
      </Transition>

      <div>
        <pre>{JSON.stringify({ show, appear }, null, 2)}</pre>
      </div>
    </div>
  )
}
