import { useState } from 'react'
import { Transition } from '@headlessui/react'

export default function Example({ enterDuration = 0, leaveDuration = 0, withChildren = false }) {
  let [show, setShow] = useState(false)

  return (
    <div>
      {/* Test Styles */}
      <style>{`
        .enter { transition-duration: ${enterDuration}ms; }
        .leave { transition-duration: ${leaveDuration}ms; }
        .invisible { opacity: 0%; }
        .visible { opacity: 100%; }
    `}</style>

      {/* Test Controls */}
      <button id="show" onClick={() => setShow(true)}>
        Show
      </button>
      <button id="hide" onClick={() => setShow(false)}>
        Hide
      </button>
      <button id="toggle" onClick={() => setShow((v) => !v)}>
        Toggle
      </button>

      <Transition
        show={show}
        unmount={false}
        enter="enter"
        enterFrom="invisible"
        enterTo="visible"
        leave="leave"
        leaveFrom="visible"
        leaveTo="invisible"
        data-test-id="root"
        beforeEnter={() => console.log('root beforeEnter')}
        afterEnter={() => console.log('root afterEnter')}
        beforeLeave={() => console.log('root beforeLeave')}
        afterLeave={() => console.log('root afterLeave')}
      >
        <div>
          <span>Hello 0</span>

          {withChildren && (
            <>
              <Transition.Child
                enter="enter"
                enterFrom="invisible"
                enterTo="visible"
                leave="leave"
                leaveFrom="visible"
                leaveTo="invisible"
                data-test-id="child-1"
                beforeEnter={() => console.log('child-1 beforeEnter')}
                afterEnter={() => console.log('child-1 afterEnter')}
                beforeLeave={() => console.log('child-1 beforeLeave')}
                afterLeave={() => console.log('child-1 afterLeave')}
              >
                <span>Hello 1</span>
              </Transition.Child>

              <Transition.Child
                enter="enter"
                enterFrom="invisible"
                enterTo="visible"
                leave="leave"
                leaveFrom="visible"
                leaveTo="invisible"
                data-test-id="child-2"
                beforeEnter={() => console.log('child-2 beforeEnter')}
                afterEnter={() => console.log('child-2 afterEnter')}
                beforeLeave={() => console.log('child-2 beforeLeave')}
                afterLeave={() => console.log('child-2 afterLeave')}
              >
                <span>Hello 2</span>
              </Transition.Child>
            </>
          )}
        </div>
      </Transition>
    </div>
  )
}
