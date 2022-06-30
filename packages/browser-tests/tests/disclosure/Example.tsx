import { Disclosure } from '@headlessui/react'

export default function Example({ buttonDisabled = false }) {
  return (
    <div>
      <Disclosure>
        <Disclosure.Button disabled={buttonDisabled}>Trigger</Disclosure.Button>
        <Disclosure.Panel>Contents</Disclosure.Panel>
      </Disclosure>
    </div>
  )
}
