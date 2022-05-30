import { Disclosure } from '@headlessui/react'

export default function Example({ buttonDisabled = false, buttonInside = false }) {
  return (
    <div>
      <Disclosure>
        <Disclosure.Button disabled={buttonDisabled}>Trigger</Disclosure.Button>
        <Disclosure.Panel>
          {buttonInside ? <Disclosure.Button>Close</Disclosure.Button> : 'Contents'}
        </Disclosure.Panel>
      </Disclosure>
    </div>
  )
}
