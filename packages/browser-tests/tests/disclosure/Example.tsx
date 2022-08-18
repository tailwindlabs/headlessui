import { Disclosure } from '@headlessui/react'

export default function Example() {
  return (
    <div>
      <Disclosure>
        <Disclosure.Button>Trigger</Disclosure.Button>
        <Disclosure.Panel>Contents</Disclosure.Panel>
      </Disclosure>
    </div>
  )
}
