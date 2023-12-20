import { act as _act, fireEvent, render } from '@testing-library/react'
import React, { Fragment, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { getByText } from '../../test-utils/accessibility-assertions'
import { executeTimeline } from '../../test-utils/execute-timeline'
import { click } from '../../test-utils/interactions'
import { createSnapshot } from '../../test-utils/snapshot'
import { suppressConsoleLogs } from '../../test-utils/suppress-console-logs'
import { Transition } from './transition'

let act = _act as unknown as <T>(fn: () => T) => PromiseLike<T>

function nextFrame() {
  return new Promise<void>((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        resolve()
      })
    })
  })
}

it('should not steal the ref from the child', async () => {
  let fn = jest.fn()
  render(
    <Transition show={true} as={Fragment}>
      <div ref={fn}>...</div>
    </Transition>
  )

  await nextFrame()

  expect(fn).toHaveBeenCalled()
})

it('should render without crashing', () => {
  render(
    <Transition show={true}>
      <div className="hello">Children</div>
    </Transition>
  )
})

it('should be possible to render a Transition without children', () => {
  render(<Transition show={true} className="transition" />)
  expect(document.getElementsByClassName('transition')).not.toBeNull()
})

it(
  'should yell at us when we forget the required show prop',
  suppressConsoleLogs(() => {
    expect.assertions(1)

    expect(() => {
      render(
        <Transition>
          <div className="hello">Children</div>
        </Transition>
      )
    }).toThrowErrorMatchingSnapshot()
  })
)

describe('Setup API', () => {
  describe('shallow', () => {
    it('should render a div and its children by default', () => {
      let { container } = render(<Transition show={true}>Children</Transition>)

      expect(container.firstChild).toMatchSnapshot()
    })

    it('should passthrough all the props (that we do not use internally)', () => {
      let { container } = render(
        <Transition show={true} id="root" className="text-blue-400">
          Children
        </Transition>
      )

      expect(container.firstChild).toMatchSnapshot()
    })

    it('should render another component if the `as` prop is used and its children by default', () => {
      let { container } = render(
        <Transition show={true} as="a">
          Children
        </Transition>
      )

      expect(container.firstChild).toMatchSnapshot()
    })

    it('should passthrough all the props (that we do not use internally) even when using an `as` prop', () => {
      let { container } = render(
        <Transition show={true} as="a" href="/" className="text-blue-400">
          Children
        </Transition>
      )

      expect(container.firstChild).toMatchSnapshot()
    })

    it('should render nothing when the show prop is false', () => {
      let { container } = render(<Transition show={false}>Children</Transition>)

      expect(container.firstChild).toMatchSnapshot()
    })

    it('should be possible to change the underlying DOM tag', () => {
      let { container } = render(
        <Transition show={true} as="span">
          Children
        </Transition>
      )

      expect(container.firstChild).toMatchSnapshot()
    })

    it('should be possible to use a render prop', () => {
      let { container } = render(
        <Transition show={true} as={Fragment}>
          {() => <span>Children</span>}
        </Transition>
      )

      expect(container.firstChild).toMatchSnapshot()
    })

    it(
      'should yell at us when we forget to forward the ref when using a render prop',
      suppressConsoleLogs(() => {
        expect.assertions(1)

        function Dummy(props: any) {
          return <span {...props}>Children</span>
        }

        expect(() => {
          render(
            <Transition show={true} as={Fragment}>
              {() => <Dummy />}
            </Transition>
          )
        }).toThrowErrorMatchingSnapshot()
      })
    )
  })

  describe('nested', () => {
    it(
      'should yell at us when we forget to wrap the `<Transition.Child />` in a parent <Transition /> component',
      suppressConsoleLogs(() => {
        expect.assertions(1)

        expect(() => {
          render(
            <div className="My Page">
              <Transition.Child>Oops</Transition.Child>
            </div>
          )
        }).toThrowErrorMatchingSnapshot()
      })
    )

    it('should be possible to render a Transition.Child without children', () => {
      render(
        <Transition show={true}>
          <Transition.Child className="transition" />
        </Transition>
      )
      expect(document.getElementsByClassName('transition')).not.toBeNull()
    })

    it('should be possible to use a Transition.Root and a Transition.Child', () => {
      render(
        <Transition.Root show={true}>
          <Transition.Child className="transition" />
        </Transition.Root>
      )
      expect(document.getElementsByClassName('transition')).not.toBeNull()
    })

    it('should be possible to nest transition components', () => {
      let { container } = render(
        <div className="My Page">
          <Transition show={true}>
            <Transition.Child>Sidebar</Transition.Child>
            <Transition.Child>Content</Transition.Child>
          </Transition>
        </div>
      )

      expect(container.firstChild).toMatchSnapshot()
    })

    it('should be possible to change the underlying DOM tag of the Transition.Child components', () => {
      let { container } = render(
        <div className="My Page">
          <Transition show={true}>
            <Transition.Child as="aside">Sidebar</Transition.Child>
            <Transition.Child as="section">Content</Transition.Child>
          </Transition>
        </div>
      )

      expect(container.firstChild).toMatchSnapshot()
    })

    it('should be possible to change the underlying DOM tag of the Transition component and Transition.Child components', () => {
      let { container } = render(
        <div className="My Page">
          <Transition show={true} as="article">
            <Transition.Child as="aside">Sidebar</Transition.Child>
            <Transition.Child as="section">Content</Transition.Child>
          </Transition>
        </div>
      )

      expect(container.firstChild).toMatchSnapshot()
    })

    it('should be possible to use render props on the Transition.Child components', () => {
      let { container } = render(
        <div className="My Page">
          <Transition show={true}>
            <Transition.Child as={Fragment}>{() => <aside>Sidebar</aside>}</Transition.Child>
            <Transition.Child as={Fragment}>{() => <section>Content</section>}</Transition.Child>
          </Transition>
        </div>
      )

      expect(container.firstChild).toMatchSnapshot()
    })

    it('should be possible to use render props on the Transition and Transition.Child components', () => {
      let { container } = render(
        <div className="My Page">
          <Transition show={true} as={Fragment}>
            {() => (
              <article>
                <Transition.Child as={Fragment}>{() => <aside>Sidebar</aside>}</Transition.Child>
                <Transition.Child as={Fragment}>
                  {() => <section>Content</section>}
                </Transition.Child>
              </article>
            )}
          </Transition>
        </div>
      )

      expect(container.firstChild).toMatchSnapshot()
    })

    it(
      'should yell at us when we forgot to forward the ref on one of the Transition.Child components',
      suppressConsoleLogs(() => {
        expect.assertions(1)

        function Dummy(props: any) {
          return <div {...props} />
        }

        expect(() => {
          render(
            <div className="My Page">
              <Transition show={true}>
                <Transition.Child as={Fragment}>{() => <Dummy>Sidebar</Dummy>}</Transition.Child>
                <Transition.Child as={Fragment}>{() => <Dummy>Content</Dummy>}</Transition.Child>
              </Transition>
            </div>
          )
        }).toThrowErrorMatchingSnapshot()
      })
    )

    it(
      'should yell at us when we forgot to forward a ref on the Transition component',
      suppressConsoleLogs(() => {
        expect.assertions(1)

        function Dummy(props: any) {
          return <div {...props} />
        }

        expect(() => {
          render(
            <div className="My Page">
              <Transition show={true} as={Fragment}>
                {() => (
                  <Dummy>
                    <Transition.Child>{() => <aside>Sidebar</aside>}</Transition.Child>
                    <Transition.Child>{() => <section>Content</section>}</Transition.Child>
                  </Dummy>
                )}
              </Transition>
            </div>
          )
        }).toThrowErrorMatchingSnapshot()
      })
    )
  })

  describe('transition classes', () => {
    it('should support new lines in class lists', async () => {
      function Example() {
        let [show, setShow] = useState(true)

        return (
          <div>
            <button onClick={() => setShow((v) => !v)}>toggle</button>

            <Transition show={show} as="div" className={`foo1\nfoo2`} enter="enter" leave="leave">
              Children
            </Transition>
          </div>
        )
      }

      let { container } = await act(() => render(<Example />))

      expect(container.firstChild).toMatchInlineSnapshot(`
        <div>
          <button>
            toggle
          </button>
          <div
            class="foo1
        foo2"
          >
            Children
          </div>
        </div>
      `)

      await click(getByText('toggle'))

      // TODO: This is not quite right
      // The `foo1\nfoo2` should be gone
      // I think this is a qurk of JSDOM
      expect(container.firstChild).toMatchInlineSnapshot(`
        <div>
          <button>
            toggle
          </button>
          <div
            class="foo1
        foo2 foo1 foo2 leave"
          >
            Children
          </div>
        </div>
      `)
    })

    it('should be possible to passthrough the transition classes', () => {
      let { container } = render(
        <Transition
          show={true}
          enter="enter"
          enterFrom="enter-from"
          enterTo="enter-to"
          leave="leave"
          leaveFrom="leave-from"
          leaveTo="leave-to"
        >
          Children
        </Transition>
      )

      expect(container.firstChild).toMatchSnapshot()
    })

    it('should be possible to passthrough the transition classes and immediately apply the enter transitions when appear is set to true', async () => {
      let container = createSnapshot()

      function Example() {
        let ref = container.use()

        return (
          <Transition
            ref={ref}
            show={true}
            appear={true}
            enter="enter"
            enterFrom="enter-from"
            enterTo="enter-to"
            leave="leave"
            leaveFrom="leave-from"
            leaveTo="leave-to"
          >
            Children
          </Transition>
        )
      }

      await act(() => render(<Example />))

      expect(container).toBeDefined()

      expect(container.firstChild).toMatchSnapshot()
    })
  })
})

describe('Transitions', () => {
  describe('shallow transitions', () => {
    xit('should transition in completely (duration defined in milliseconds)', async () => {
      let enterDuration = 50

      function Example() {
        let [show, setShow] = useState(false)

        return (
          <>
            <style>{`.enter { transition-duration: ${enterDuration}ms; } .from { opacity: 0%; } .to { opacity: 100%; }`}</style>

            <Transition show={show} enter="enter" enterFrom="from" enterTo="to">
              <span>Hello!</span>
            </Transition>

            <button data-testid="toggle" onClick={() => setShow((v) => !v)}>
              Toggle
            </button>
          </>
        )
      }

      let timeline = await executeTimeline(<Example />, [
        // Toggle to show
        ({ getByTestId }) => {
          fireEvent.click(getByTestId('toggle'))
          return executeTimeline.fullTransition(enterDuration)
        },
      ])

      expect(timeline).toMatchSnapshot()
    })

    xit('should transition in completely (duration defined in seconds)', async () => {
      let enterDuration = 100

      function Example() {
        let [show, setShow] = useState(false)

        return (
          <>
            <style>{`.enter { transition-duration: ${
              enterDuration / 1000
            }s; } .from { opacity: 0%; } .to { opacity: 100%; }`}</style>

            <Transition show={show} enter="enter" enterFrom="from" enterTo="to">
              <span>Hello!</span>
            </Transition>

            <button data-testid="toggle" onClick={() => setShow((v) => !v)}>
              Toggle
            </button>
          </>
        )
      }

      let timeline = await executeTimeline(<Example />, [
        // Toggle to show
        ({ getByTestId }) => {
          fireEvent.click(getByTestId('toggle'))
          return executeTimeline.fullTransition(enterDuration)
        },
      ])

      expect(timeline).toMatchSnapshot()
    })

    xit('should transition in completely (duration defined in seconds) in (render strategy = hidden)', async () => {
      let enterDuration = 100

      function Example() {
        let [show, setShow] = useState(false)

        return (
          <>
            <style>{`.enter { transition-duration: ${
              enterDuration / 1000
            }s; } .from { opacity: 0%; } .to { opacity: 100%; }`}</style>

            <Transition show={show} unmount={false} enter="enter" enterFrom="from" enterTo="to">
              <span>Hello!</span>
            </Transition>

            <button data-testid="toggle" onClick={() => setShow((v) => !v)}>
              Toggle
            </button>
          </>
        )
      }

      let timeline = await executeTimeline(<Example />, [
        // Toggle to show
        ({ getByTestId }) => {
          fireEvent.click(getByTestId('toggle'))
          return executeTimeline.fullTransition(enterDuration)
        },
      ])

      expect(timeline).toMatchSnapshot()
    })

    xit('should transition in completely', async () => {
      let enterDuration = 100

      function Example() {
        let [show, setShow] = useState(false)

        return (
          <>
            <style>{`.enter { transition-duration: ${enterDuration}ms; } .from { opacity: 0%; } .to { opacity: 100%; }`}</style>

            <Transition show={show} enter="enter" enterFrom="from" enterTo="to">
              <span>Hello!</span>
            </Transition>

            <button data-testid="toggle" onClick={() => setShow((v) => !v)}>
              Toggle
            </button>
          </>
        )
      }

      let timeline = await executeTimeline(<Example />, [
        // Toggle to show
        ({ getByTestId }) => {
          fireEvent.click(getByTestId('toggle'))
          return executeTimeline.fullTransition(enterDuration)
        },
      ])

      expect(timeline).toMatchSnapshot()
    })

    xit(
      'should transition out completely',
      suppressConsoleLogs(async () => {
        let leaveDuration = 100

        function Example() {
          let [show, setShow] = useState(true)

          return (
            <>
              <style>{`.leave { transition-duration: ${leaveDuration}ms; } .from { opacity: 100%; } .to { opacity: 0%; }`}</style>

              <Transition show={show} leave="leave" leaveFrom="from" leaveTo="to">
                <span>Hello!</span>
              </Transition>

              <button data-testid="toggle" onClick={() => setShow((v) => !v)}>
                Toggle
              </button>
            </>
          )
        }

        let timeline = await executeTimeline(<Example />, [
          // Toggle to hide
          ({ getByTestId }) => {
            fireEvent.click(getByTestId('toggle'))
            return executeTimeline.fullTransition(leaveDuration)
          },
        ])

        expect(timeline).toMatchSnapshot()
      })
    )

    xit(
      'should transition out completely (render strategy = hidden)',
      suppressConsoleLogs(async () => {
        let leaveDuration = 50

        function Example() {
          let [show, setShow] = useState(true)

          return (
            <>
              <style>{`.leave { transition-duration: ${leaveDuration}ms; } .from { opacity: 0%; } .to { opacity: 100%; }`}</style>

              <Transition show={show} unmount={false} leave="leave" leaveFrom="from" leaveTo="to">
                <span>Hello!</span>
              </Transition>

              <button data-testid="toggle" onClick={() => setShow((v) => !v)}>
                Toggle
              </button>
            </>
          )
        }

        let timeline = await executeTimeline(<Example />, [
          // Toggle to hide
          ({ getByTestId }) => {
            fireEvent.click(getByTestId('toggle'))
            return executeTimeline.fullTransition(leaveDuration)
          },
        ])

        expect(timeline).toMatchSnapshot()
      })
    )

    xit(
      'should transition in and out completely',
      suppressConsoleLogs(async () => {
        let enterDuration = 100
        let leaveDuration = 250

        function Example() {
          let [show, setShow] = useState(false)

          return (
            <>
              <style>{`.enter { transition-duration: ${enterDuration}ms; } .enter-from { opacity: 0%; } .enter-to { opacity: 100%; }`}</style>
              <style>{`.leave { transition-duration: ${leaveDuration}ms; } .leave-from { opacity: 100%; } .leave-to { opacity: 0%; }`}</style>

              <Transition
                show={show}
                enter="enter"
                enterFrom="enter-from"
                enterTo="enter-to"
                leave="leave"
                leaveFrom="leave-from"
                leaveTo="leave-to"
              >
                <span>Hello!</span>
              </Transition>

              <button data-testid="toggle" onClick={() => setShow((v) => !v)}>
                Toggle
              </button>
            </>
          )
        }

        let timeline = await executeTimeline(<Example />, [
          // Toggle to show
          ({ getByTestId }) => {
            fireEvent.click(getByTestId('toggle'))
            return executeTimeline.fullTransition(enterDuration)
          },

          // Toggle to hide
          ({ getByTestId }) => {
            fireEvent.click(getByTestId('toggle'))
            return executeTimeline.fullTransition(leaveDuration)
          },
        ])

        expect(timeline).toMatchSnapshot()
      })
    )

    xit(
      'should transition in and out completely (render strategy = hidden)',
      suppressConsoleLogs(async () => {
        let enterDuration = 50
        let leaveDuration = 75

        function Example() {
          let [show, setShow] = useState(false)

          return (
            <>
              <style>{`.enter { transition-duration: ${enterDuration}ms; } .enter-from { opacity: 0%; } .enter-to { opacity: 100%; }`}</style>
              <style>{`.leave { transition-duration: ${leaveDuration}ms; } .leave-from { opacity: 100%; } .leave-to { opacity: 0%; }`}</style>

              <Transition
                show={show}
                unmount={false}
                enter="enter"
                enterFrom="enter-from"
                enterTo="enter-to"
                leave="leave"
                leaveFrom="leave-from"
                leaveTo="leave-to"
              >
                <span>Hello!</span>
              </Transition>

              <button data-testid="toggle" onClick={() => setShow((v) => !v)}>
                Toggle
              </button>
            </>
          )
        }

        let timeline = await executeTimeline(<Example />, [
          // Toggle to show
          ({ getByTestId }) => {
            fireEvent.click(getByTestId('toggle'))
            return executeTimeline.fullTransition(enterDuration)
          },

          // Toggle to hide
          ({ getByTestId }) => {
            fireEvent.click(getByTestId('toggle'))
            return executeTimeline.fullTransition(leaveDuration)
          },

          // Toggle to show
          ({ getByTestId }) => {
            fireEvent.click(getByTestId('toggle'))
            return executeTimeline.fullTransition(leaveDuration)
          },
        ])

        expect(timeline).toMatchSnapshot()
      })
    )
  })

  describe('nested transitions', () => {
    xit(
      'should not unmount the whole tree when some children are still transitioning',
      suppressConsoleLogs(async () => {
        let slowLeaveDuration = 500
        let fastLeaveDuration = 150

        function Example() {
          let [show, setShow] = useState(true)

          return (
            <>
              <style>{`.leave-slow { transition-duration: ${slowLeaveDuration}ms; } .leave-from { opacity: 100%; } .leave-to { opacity: 0%; }`}</style>
              <style>{`.leave-fast { transition-duration: ${fastLeaveDuration}ms; }`}</style>

              <Transition show={show}>
                <Transition.Child leave="leave-fast" leaveFrom="leave-from" leaveTo="leave-to">
                  I am fast
                </Transition.Child>
                <Transition.Child leave="leave-slow" leaveFrom="leave-from" leaveTo="leave-to">
                  I am slow
                </Transition.Child>
              </Transition>

              <button data-testid="toggle" onClick={() => setShow((v) => !v)}>
                Toggle
              </button>
            </>
          )
        }

        let timeline = await executeTimeline(<Example />, [
          // Toggle to hide
          ({ getByTestId }) => {
            fireEvent.click(getByTestId('toggle'))
            return [
              null, // Initial render
              null, // Setup leave classes
              fastLeaveDuration, // Done with fast leave
              slowLeaveDuration - fastLeaveDuration, // Done with slow leave (which starts at the same time, but it is compaired with previous render snapshot so we have to subtract those)
            ]
          },
        ])

        expect(timeline).toMatchSnapshot()
      })
    )

    xit(
      'should not unmount the whole tree when some children are still transitioning',
      suppressConsoleLogs(async () => {
        let slowLeaveDuration = 150
        let fastLeaveDuration = 50

        function Example() {
          let [show, setShow] = useState(true)

          return (
            <>
              <style>{`.leave-slow { transition-duration: ${slowLeaveDuration}ms; } .leave-from { opacity: 100%; } .leave-to { opacity: 0%; }`}</style>
              <style>{`.leave-fast { transition-duration: ${fastLeaveDuration}ms; }`}</style>

              <Transition show={show}>
                <Transition.Child leave="leave-fast" leaveFrom="leave-from" leaveTo="leave-to">
                  <span>I am fast</span>
                  <Transition show={show} leave="leave-slow">
                    I am my own root component and I don't talk to the parent
                  </Transition>
                </Transition.Child>
                <Transition.Child leave="leave-slow" leaveFrom="leave-from" leaveTo="leave-to">
                  I am slow
                </Transition.Child>
              </Transition>

              <button data-testid="toggle" onClick={() => setShow((v) => !v)}>
                Toggle
              </button>
            </>
          )
        }

        let timeline = await executeTimeline(<Example />, [
          // Toggle to hide
          ({ getByTestId }) => {
            fireEvent.click(getByTestId('toggle'))
            return [
              null, // Initial render
              null, // Setup leave classes
              fastLeaveDuration, // Done with fast leave
              slowLeaveDuration - fastLeaveDuration, // Done with slow leave (which starts at the same time, but it is compaired with previous render snapshot so we have to subtract those)
            ]
          },
        ])

        expect(timeline).toMatchSnapshot()
      })
    )
  })
})

describe('Events', () => {
  xit(
    'should fire events for all the stages',
    suppressConsoleLogs(async () => {
      let eventHandler = jest.fn()
      let enterDuration = 50
      let leaveDuration = 75

      function Example() {
        let [show, setShow] = useState(false)
        let start = useRef(Date.now())

        useLayoutEffect(() => {
          start.current = Date.now()
        }, [])

        return (
          <>
            <style>{`.enter { transition-duration: ${enterDuration}ms; } .enter-from { opacity: 0%; } .enter-to { opacity: 100%; }`}</style>
            <style>{`.leave { transition-duration: ${leaveDuration}ms; } .leave-from { opacity: 100%; } .leave-to { opacity: 0%; }`}</style>

            <Transition
              show={show}
              // Events
              beforeEnter={() => eventHandler('beforeEnter', Date.now() - start.current)}
              afterEnter={() => eventHandler('afterEnter', Date.now() - start.current)}
              beforeLeave={() => eventHandler('beforeLeave', Date.now() - start.current)}
              afterLeave={() => eventHandler('afterLeave', Date.now() - start.current)}
              // Class names
              enter="enter"
              enterFrom="enter-from"
              enterTo="enter-to"
              leave="leave"
              leaveFrom="leave-from"
              leaveTo="leave-to"
            >
              <span>Hello!</span>
            </Transition>

            <button data-testid="toggle" onClick={() => setShow((v) => !v)}>
              Toggle
            </button>
          </>
        )
      }

      let timeline = await executeTimeline(<Example />, [
        // Toggle to show
        ({ getByTestId }) => {
          fireEvent.click(getByTestId('toggle'))
          return executeTimeline.fullTransition(enterDuration)
        },
        // Toggle to hide
        ({ getByTestId }) => {
          fireEvent.click(getByTestId('toggle'))
          return executeTimeline.fullTransition(leaveDuration)
        },
      ])

      expect(timeline).toMatchSnapshot()

      expect(eventHandler).toHaveBeenCalledTimes(4)
      expect(eventHandler.mock.calls.map(([name]) => name)).toEqual([
        // Order is important here
        'beforeEnter',
        'afterEnter',
        'beforeLeave',
        'afterLeave',
      ])

      let enterHookDiff = eventHandler.mock.calls[1][1] - eventHandler.mock.calls[0][1]
      expect(enterHookDiff).toBeGreaterThanOrEqual(enterDuration)
      expect(enterHookDiff).toBeLessThanOrEqual(enterDuration * 3)

      let leaveHookDiff = eventHandler.mock.calls[3][1] - eventHandler.mock.calls[2][1]
      expect(leaveHookDiff).toBeGreaterThanOrEqual(leaveDuration)
      expect(leaveHookDiff).toBeLessThanOrEqual(leaveDuration * 3)
    })
  )

  it(
    'should fire events in the correct order',
    suppressConsoleLogs(async () => {
      let eventHandler = jest.fn()
      let enterDuration = 50
      let leaveDuration = 75

      function Example() {
        let [show, setShow] = useState(false)
        let start = useRef(Date.now())

        useLayoutEffect(() => {
          start.current = Date.now()
        }, [])

        function mark(input: string) {
          eventHandler(input)
        }

        function getProps(name: string) {
          return {
            // Events
            beforeEnter: () => mark(`${name}: beforeEnter`),
            afterEnter: () => mark(`${name}: afterEnter`),
            beforeLeave: () => mark(`${name}: beforeLeave`),
            afterLeave: () => mark(`${name}: afterLeave`),

            // Class names
            enter: `${name} enter`,
            enterFrom: 'enter-from',
            enterTo: 'enter-to',
            leave: `${name} leave`,
            leaveFrom: 'leave-from',
            leaveTo: 'leave-to',
          }
        }

        return (
          <>
            <style>{`.enter-from { opacity: 0%; } .enter-to { opacity: 100%; }`}</style>
            <style>{`.leave-from { opacity: 100%; } .leave-to { opacity: 0%; }`}</style>

            <style>{`.root.enter { transition-duration: ${enterDuration}ms; }`}</style>
            <style>{`.root.leave { transition-duration: ${leaveDuration}ms; }`}</style>

            <style>{`.child-1.enter { transition-duration: ${enterDuration * 1.5}ms; }`}</style>
            <style>{`.child-1.leave { transition-duration: ${leaveDuration * 1.5}ms; }`}</style>

            <style>{`.child-2.enter { transition-duration: ${enterDuration * 2}ms; }`}</style>
            <style>{`.child-2.leave { transition-duration: ${leaveDuration * 2}ms; }`}</style>

            <style>{`.child-2-1.enter { transition-duration: ${enterDuration * 3}ms; }`}</style>
            <style>{`.child-2-1.leave { transition-duration: ${leaveDuration * 3}ms; }`}</style>

            <style>{`.child-2-2.enter { transition-duration: ${enterDuration * 2.5}ms; }`}</style>
            <style>{`.child-2-2.leave { transition-duration: ${leaveDuration * 2.5}ms; }`}</style>

            <Transition show={show} {...getProps('root')}>
              <Transition.Child {...getProps('child-1')}>Child 1.</Transition.Child>
              <Transition.Child {...getProps('child-2')}>
                Child 2.
                <Transition.Child {...getProps('child-2-1')}>Child 2.1.</Transition.Child>
                <Transition.Child {...getProps('child-2-2')}>Child 2.2.</Transition.Child>
              </Transition.Child>
            </Transition>

            <button
              data-testid="toggle"
              onClick={() => {
                eventHandler(`action(${show ? 'HIDE' : 'SHOW'})`)
                setShow((v) => !v)
              }}
            >
              Toggle
            </button>
          </>
        )
      }

      await executeTimeline(<Example />, [
        // Toggle to show
        ({ getByTestId }) => {
          fireEvent.click(getByTestId('toggle'))
          return executeTimeline.fullTransition(enterDuration * 3)
        },
        // Toggle to hide
        ({ getByTestId }) => {
          fireEvent.click(getByTestId('toggle'))
          return executeTimeline.fullTransition(leaveDuration * 3)
        },
        // Toggle to show (again)
        ({ getByTestId }) => {
          fireEvent.click(getByTestId('toggle'))
          return executeTimeline.fullTransition(enterDuration * 3)
        },
        // Toggle to hide (again)
        ({ getByTestId }) => {
          fireEvent.click(getByTestId('toggle'))
          return executeTimeline.fullTransition(leaveDuration * 3)
        },
      ])

      expect(eventHandler.mock.calls.flat()).toEqual([
        'action(SHOW)',

        'root: beforeEnter',
        'child-1: beforeEnter',
        'child-2: beforeEnter',
        'child-2-1: beforeEnter',
        'child-2-2: beforeEnter',

        'child-1: afterEnter',
        'child-2-2: afterEnter',
        'child-2-1: afterEnter',
        'child-2: afterEnter',
        'root: afterEnter',

        'action(HIDE)',

        'child-1: beforeLeave',
        'child-2-1: beforeLeave',
        'child-2-2: beforeLeave',
        'child-2: beforeLeave',
        'root: beforeLeave',

        'child-1: afterLeave',
        'child-2-2: afterLeave',
        'child-2-1: afterLeave',
        'child-2: afterLeave',
        'root: afterLeave',

        'action(SHOW)',

        'root: beforeEnter',
        'child-1: beforeEnter',
        'child-2: beforeEnter',
        'child-2-1: beforeEnter',
        'child-2-2: beforeEnter',

        'child-1: afterEnter',
        'child-2-2: afterEnter',
        'child-2-1: afterEnter',
        'child-2: afterEnter',
        'root: afterEnter',

        'action(HIDE)',

        'child-1: beforeLeave',
        'child-2-1: beforeLeave',
        'child-2-2: beforeLeave',
        'child-2: beforeLeave',
        'root: beforeLeave',

        'child-1: afterLeave',
        'child-2-2: afterLeave',
        'child-2-1: afterLeave',
        'child-2: afterLeave',
        'root: afterLeave',
      ])
    })
  )

  it(
    'should fire only one event for a given component change',
    suppressConsoleLogs(async () => {
      let eventHandler = jest.fn()
      let enterDuration = 50
      let leaveDuration = 75

      function Example() {
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
              beforeEnter={() => eventHandler('beforeEnter', Date.now() - start)}
              afterEnter={() => eventHandler('afterEnter', Date.now() - start)}
              beforeLeave={() => eventHandler('beforeLeave', Date.now() - start)}
              afterLeave={() => eventHandler('afterLeave', Date.now() - start)}
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

      render(<Example />)

      fireEvent.click(document.querySelector('[data-testid=show]')!)

      await new Promise((resolve) => setTimeout(resolve, 1000))

      fireEvent.click(document.querySelector('[data-testid=hide]')!)

      await new Promise((resolve) => setTimeout(resolve, 1000))

      expect(eventHandler).toHaveBeenCalledTimes(4)
      expect(eventHandler.mock.calls.map(([name]) => name)).toEqual([
        // Order is important here
        'beforeEnter',
        'afterEnter',
        'beforeLeave',
        'afterLeave',
      ])
    })
  )
})
