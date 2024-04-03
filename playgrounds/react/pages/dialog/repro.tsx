import { Transition } from '@headlessui/react'
import { useEffect, useState } from 'react'

let enterDuration = 50
let leaveDuration = 75

export default function Example() {
  let [show, setShow] = useState(false)
  let [start, setStart] = useState(Date.now())

  useEffect(() => setStart(Date.now()), [])

  return (
    <>
      <style>{`
              .enter-1 { transition-duration: ${enterDuration * 1}ms; }
              .enter-2 { transition-duration: ${enterDuration * 2}ms; }
              .enter-from { opacity: 0%; }
              .enter-to { opacity: 100%; }

              .leave-1 { transition-duration: ${leaveDuration * 1}ms; }
              .leave-2 { transition-duration: ${leaveDuration * 2}ms; }
              .leave-from { opacity: 100%; }
              .leave-to { opacity: 0%; }
            `}</style>
      <Transition.Root
        show={show}
        as="div"
        beforeEnter={() => console.log('beforeEnter', Date.now() - start)}
        afterEnter={() => console.log('afterEnter', Date.now() - start)}
        beforeLeave={() => console.log('beforeLeave', Date.now() - start)}
        afterLeave={() => console.log('afterLeave', Date.now() - start)}
        enter="enter-2"
        enterFrom="enter-from"
        enterTo="enter-to"
        leave="leave-2"
        leaveFrom="leave-from"
        leaveTo="leave-to"
      >
        <Transition.Child
          enter="enter-1"
          enterFrom="enter-from"
          enterTo="enter-to"
          leave="leave-1"
          leaveFrom="leave-from"
          leaveTo="leave-to"
        />
        <Transition.Child
          enter="enter-1"
          enterFrom="enter-from"
          enterTo="enter-to"
          leave="leave-1"
          leaveFrom="leave-from"
          leaveTo="leave-to"
        >
          <button data-testid="hide" onClick={() => setShow(false)}>
            Hide
          </button>
        </Transition.Child>
      </Transition.Root>
      <button data-testid="show" onClick={() => setShow(true)}>
        Show
      </button>
    </>
  )
}
