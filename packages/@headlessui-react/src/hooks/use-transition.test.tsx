import { act, fireEvent, render } from '@testing-library/react'
import React, { useState } from 'react'
import { Transition } from '../components/transition/transition'

function wait(ms: number) {
  return act(() => new Promise<void>((resolve) => setTimeout(resolve, ms)))
}

// `jsdom` doesn't run CSS transitions, so we control what `getAnimations()`
// returns ourselves.
class FakeCSSTransition {
  playState: AnimationPlayState = 'running'
  finished: Promise<this>
  finish!: () => void

  constructor() {
    this.finished = new Promise((resolve) => {
      this.finish = () => {
        this.playState = 'finished'
        resolve(this)
      }
    })
  }
}

let originalCSSTransition = (globalThis as any).CSSTransition
let animations: FakeCSSTransition[] = []

beforeEach(() => {
  animations = []
  ;(globalThis as any).CSSTransition = FakeCSSTransition
  jest
    .spyOn(Element.prototype, 'getAnimations')
    .mockImplementation(() => animations as unknown as Animation[])
})

afterEach(() => {
  jest.restoreAllMocks()
  ;(globalThis as any).CSSTransition = originalCSSTransition
})

it('should unmount when the reversed transition starts after the old transitions were captured', async () => {
  function Example() {
    let [show, setShow] = useState(false)

    return (
      <>
        <button onClick={() => setShow((v) => !v)}>toggle</button>
        <Transition show={show}>
          <div data-testid="panel" className="transition-opacity data-[closed]:opacity-0" />
        </Transition>
      </>
    )
  }

  let { getByText, queryByTestId } = render(<Example />)

  // Open the panel, the enter transition starts running.
  let enter = new FakeCSSTransition()
  animations = [enter]
  fireEvent.click(getByText('toggle'))
  await wait(100)
  expect(queryByTestId('panel')).not.toBeNull()

  // Close the panel while the enter transition is still running. The
  // transition is reversed, but at the time we capture the running transitions
  // the reversed one has not started yet (e.g. React hasn't committed the
  // change because the main thread is busy), so we only see the old one.
  fireEvent.click(getByText('toggle'))
  await wait(100)

  // Now the reversed transition starts, which cancels the old enter transition.
  let reversed = new FakeCSSTransition()
  animations = [reversed]
  enter.finish()
  await wait(50)

  // The reversed transition is still running, so the panel is still visible.
  expect(queryByTestId('panel')).not.toBeNull()

  // Once the reversed transition finishes, the panel should be unmounted.
  reversed.finish()
  animations = []
  await wait(100)

  expect(queryByTestId('panel')).toBeNull()
})
