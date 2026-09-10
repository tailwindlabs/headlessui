import { render, waitFor } from '@testing-library/react'
import React, { act, useState } from 'react'
import { transitionDataAttributes, useTransition } from './use-transition'

class TestCSSTransition {
  playState: AnimationPlayState = 'running'
  finished: Promise<Animation>

  private resolve!: (animation: Animation) => void
  private reject!: (reason: Error) => void

  constructor() {
    this.finished = new Promise<Animation>((resolve, reject) => {
      this.resolve = resolve
      this.reject = reject
    })
  }

  finish() {
    this.playState = 'finished'
    this.resolve(this as unknown as Animation)
  }

  cancel() {
    this.playState = 'idle'
    this.reject(new DOMException('The transition was cancelled', 'AbortError'))
  }
}

it('waits for a replacement transition when an enter transition is interrupted', async () => {
  let end = jest.fn()
  let originalCSSTransition = Object.getOwnPropertyDescriptor(globalThis, 'CSSTransition')
  Object.defineProperty(globalThis, 'CSSTransition', {
    configurable: true,
    writable: true,
    value: TestCSSTransition,
  })

  let enter = new TestCSSTransition()
  let leave = new TestCSSTransition()
  let animations: Animation[] = [enter as unknown as Animation]
  let getAnimations = jest
    .spyOn(Element.prototype, 'getAnimations')
    .mockImplementation(() => animations)

  function Example({ show }: { show: boolean }) {
    let [element, setElement] = useState<HTMLElement | null>(null)
    let [visible, transitionData] = useTransition(true, element, show, { end })

    return visible ? (
      <div ref={setElement} data-testid="content" {...transitionDataAttributes(transitionData)} />
    ) : null
  }

  try {
    let { queryByTestId, rerender } = render(<Example show={true} />)

    await waitFor(() => expect(getAnimations).toHaveBeenCalledTimes(1))

    rerender(<Example show={false} />)
    await waitFor(() => expect(getAnimations).toHaveBeenCalledTimes(2))

    // The browser cancels the captured enter transition and replaces it with
    // the transition back to the closed state.
    animations = [leave as unknown as Animation]
    await act(async () => enter.cancel())

    await waitFor(() => expect(getAnimations).toHaveBeenCalledTimes(3))
    expect(queryByTestId('content')).toHaveAttribute('data-enter')
    expect(queryByTestId('content')).toHaveAttribute('data-closed')
    expect(end).not.toHaveBeenCalled()

    await act(async () => leave.finish())

    await waitFor(() => expect(queryByTestId('content')).toBeNull())
    expect(end).toHaveBeenCalledTimes(1)
    expect(end).toHaveBeenCalledWith(false)
  } finally {
    getAnimations.mockRestore()
    if (originalCSSTransition) {
      Object.defineProperty(globalThis, 'CSSTransition', originalCSSTransition)
    } else {
      Reflect.deleteProperty(globalThis, 'CSSTransition')
    }
  }
})
