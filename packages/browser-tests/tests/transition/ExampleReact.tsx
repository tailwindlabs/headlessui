import { useState } from 'react'
import { Transition } from '@headlessui/react'

export default function Example({ enterDuration = 0, leaveDuration = 0, withChildren = false }) {
  let [show, setShow] = useState(false)

  return (
    <div>
      {/* Test Styles */}
      <style>{`
        .block {
          transition: transform;
          will-change: transform;
          position: absolute;
          inset: 0;
          background: tomato;
          height: 200px;
        }
        .enter { transition-duration: ${enterDuration}ms; }
        .leave { transition-duration: ${leaveDuration}ms; }
        .invisible { transform: translateY(-100%); }
        .visible { transform: translateY(0); }
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

      <div className="flex">
        <div className="grow">
          <div className="flex">
            <button className="bg-[orange] p-2">Toggle</button>
            <div className="relative grow">
              <div className="absolute inset-0 h-[200px] bg-[tomato] transition will-change-transform">
                menu
              </div>
            </div>
          </div>
          broken
        </div>
      </div>

      <Transition
        show={show}
        unmount={false}
        enter="enter"
        enterFrom="invisible"
        enterTo="visible"
        leave="leave"
        leaveFrom="visible"
        leaveTo="invisible"
        className="block"
        data-test-id="root"
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
