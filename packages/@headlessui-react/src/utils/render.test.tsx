import React, { ElementType, createRef, Ref, Fragment } from 'react'
import { render as testRender, prettyDOM, getByTestId } from '@testing-library/react'

import { suppressConsoleLogs } from '../test-utils/suppress-console-logs'
import { render, Features, PropsForFeatures } from './render'
import { Props } from '../types'

function contents() {
  return prettyDOM(getByTestId(document.body, 'wrapper'), undefined, {
    highlight: false,
  })
}

describe('Default functionality', () => {
  let bag = {}
  function Dummy<TTag extends ElementType = 'div'>(
    props: Props<TTag> & Partial<{ a: any; b: any; c: any }>
  ) {
    return <div data-testid="wrapper">{render(props, bag, 'div')}</div>
  }

  it('should be possible to render a dummy component', () => {
    testRender(<Dummy />)

    expect(contents()).toMatchInlineSnapshot(`
      "<div
        data-testid=\\"wrapper\\"
      >
        <div />
      </div>"
    `)
  })

  it('should be possible to render a dummy component with some children as a callback', () => {
    expect.assertions(2)

    testRender(
      <Dummy>
        {data => {
          expect(data).toBe(bag)

          return <span>Contents</span>
        }}
      </Dummy>
    )

    expect(contents()).toMatchInlineSnapshot(`
      "<div
        data-testid=\\"wrapper\\"
      >
        <div>
          <span>
            Contents
          </span>
        </div>
      </div>"
    `)
  })

  it('should be possible to add a ref with a different name', () => {
    let ref = createRef()

    function MyComponent<T extends ElementType = 'div'>({
      innerRef,
      ...props
    }: Props<T> & { innerRef: Ref<HTMLDivElement> }) {
      return <div ref={innerRef} {...props} />
    }

    function OtherDummy<TTag extends ElementType = 'div'>(props: Props<TTag>) {
      return <div data-testid="wrapper">{render({ ...props, ref }, bag, 'div')}</div>
    }

    testRender(
      <OtherDummy as={MyComponent} refName="potato">
        Contents
      </OtherDummy>
    )

    expect(contents()).toMatchInlineSnapshot(`
      "<div
        data-testid=\\"wrapper\\"
      >
        <div
          potato=\\"[object Object]\\"
        >
          Contents
        </div>
      </div>"
    `)
  })

  it('should be possible to passthrough props to a dummy component', () => {
    testRender(<Dummy a={1} b={2} c={3} />)

    expect(contents()).toMatchInlineSnapshot(`
      "<div
        data-testid=\\"wrapper\\"
      >
        <div
          a=\\"1\\"
          b=\\"2\\"
          c=\\"3\\"
        />
      </div>"
    `)
  })

  it('should be possible to change the underlying DOM node using the `as` prop', () => {
    testRender(<Dummy as="button" />)

    expect(contents()).toMatchInlineSnapshot(`
      "<div
        data-testid=\\"wrapper\\"
      >
        <button />
      </div>"
    `)
  })

  it('should be possible to change the underlying DOM node using the `as` prop and still have a function as children', () => {
    testRender(<Dummy as="button">{() => <span>Contents</span>}</Dummy>)

    expect(contents()).toMatchInlineSnapshot(`
      "<div
        data-testid=\\"wrapper\\"
      >
        <button>
          <span>
            Contents
          </span>
        </button>
      </div>"
    `)
  })

  it('should be possible to render the children only when the `as` prop is set to Fragment', () => {
    testRender(<Dummy as={Fragment}>Contents</Dummy>)

    expect(contents()).toMatchInlineSnapshot(`
      "<div
        data-testid=\\"wrapper\\"
      >
        Contents
      </div>"
    `)
  })

  it('should forward all the props to the first child when using an as={Fragment}', () => {
    testRender(
      <Dummy as={Fragment} a={1} b={1}>
        {() => <span>Contents</span>}
      </Dummy>
    )

    expect(contents()).toMatchInlineSnapshot(`
      "<div
        data-testid=\\"wrapper\\"
      >
        <span
          a=\\"1\\"
          b=\\"1\\"
        >
          Contents
        </span>
      </div>"
    `)
  })

  it(
    'should error when we are rendering a Fragment with multiple children',
    suppressConsoleLogs(() => {
      expect.assertions(1)

      return expect(() => {
        testRender(
          // @ts-expect-error className cannot be applied to a Fragment
          <Dummy as={Fragment} className="p-12">
            <span>Contents A</span>
            <span>Contents B</span>
          </Dummy>
        )
      }).toThrowErrorMatchingInlineSnapshot(`"You should only render 1 child"`)
    })
  )

  it("should not error when we are rendering a Fragment with multiple children when we don't passthrough additional props", () => {
    testRender(
      <Dummy as={Fragment}>
        <span>Contents A</span>
        <span>Contents B</span>
      </Dummy>
    )

    expect(contents()).toMatchInlineSnapshot(`
      "<div
        data-testid=\\"wrapper\\"
      >
        <span>
          Contents A
        </span>
        <span>
          Contents B
        </span>
      </div>"
    `)
  })

  it(
    'should error when we are applying props to a Fragment when we do not have a dedicated element',
    suppressConsoleLogs(() => {
      expect.assertions(1)

      return expect(() => {
        testRender(
          // @ts-expect-error className cannot be applied to a Fragment
          <Dummy as={Fragment} className="p-12">
            Contents
          </Dummy>
        )
      }).toThrowErrorMatchingInlineSnapshot(
        `"You should render an element as a child. Did you forget the as=\\"...\\" prop?"`
      )
    })
  )
})

// ---

function testStaticFeature(Dummy) {
  it('should be possible to render a `static` dummy component (show = true)', () => {
    testRender(
      <Dummy show={true} static>
        Contents
      </Dummy>
    )

    expect(contents()).toMatchInlineSnapshot(`
      "<div
        data-testid=\\"wrapper\\"
      >
        <div>
          Contents
        </div>
      </div>"
    `)
  })

  it('should be possible to render a `static` dummy component (show = false)', () => {
    testRender(
      <Dummy show={false} static>
        Contents
      </Dummy>
    )

    expect(contents()).toMatchInlineSnapshot(`
      "<div
        data-testid=\\"wrapper\\"
      >
        <div>
          Contents
        </div>
      </div>"
    `)
  })
}

// With the `static` keyword, the user is always in control. When we internally decide to show the
// component or hide it then it won't have any effect. This is useful for when you want to wrap your
// component in a Transition for example so that the Transition component can control the
// showing/hiding based on the `show` prop AND the state of the transition.
describe('Features.Static', () => {
  let bag = {}
  let EnabledFeatures = Features.Static
  function Dummy<TTag extends ElementType = 'div'>(
    props: Props<TTag> & { show: boolean } & PropsForFeatures<typeof EnabledFeatures>
  ) {
    let { show, ...rest } = props
    return <div data-testid="wrapper">{render(rest, bag, 'div', EnabledFeatures, show)}</div>
  }

  testStaticFeature(Dummy)
})

// ---

function testRenderStrategyFeature(Dummy) {
  describe('Unmount render strategy', () => {
    it('should be possible to render an `unmount` dummy component (show = true)', () => {
      testRender(
        <Dummy show={true} unmount>
          Contents
        </Dummy>
      )

      expect(contents()).toMatchInlineSnapshot(`
        "<div
          data-testid=\\"wrapper\\"
        >
          <div>
            Contents
          </div>
        </div>"
      `)
    })

    it('should be possible to render an `unmount` dummy component (show = false)', () => {
      testRender(
        <Dummy show={false} unmount>
          Contents
        </Dummy>
      )

      // No contents, because we unmounted!
      expect(contents()).toMatchInlineSnapshot(`
        "<div
          data-testid=\\"wrapper\\"
        />"
      `)
    })
  })

  describe('Hidden render strategy', () => {
    it('should be possible to render an `unmount={false}` dummy component (show = true)', () => {
      testRender(
        <Dummy show={true} unmount={false}>
          Contents
        </Dummy>
      )

      expect(contents()).toMatchInlineSnapshot(`
        "<div
          data-testid=\\"wrapper\\"
        >
          <div>
            Contents
          </div>
        </div>"
      `)
    })

    it('should be possible to render an `unmount={false}` dummy component (show = false)', () => {
      testRender(
        <Dummy show={false} unmount={false}>
          Contents
        </Dummy>
      )

      // We do have contents, but it is marked as hidden!
      expect(contents()).toMatchInlineSnapshot(`
        "<div
          data-testid=\\"wrapper\\"
        >
          <div
            hidden=\\"\\"
            style=\\"display: none;\\"
          >
            Contents
          </div>
        </div>"
      `)
    })
  })
}

describe('Features.RenderStrategy', () => {
  let bag = {}
  let EnabledFeatures = Features.RenderStrategy
  function Dummy<TTag extends ElementType = 'div'>(
    props: Props<TTag> & { show: boolean } & PropsForFeatures<typeof EnabledFeatures>
  ) {
    let { show, ...rest } = props
    return <div data-testid="wrapper">{render(rest, bag, 'div', EnabledFeatures, show)}</div>
  }

  testRenderStrategyFeature(Dummy)
})

// ---

// This should enable the `static` and `unmount` features. However they can't be used together!
describe('Features.Static | Features.RenderStrategy', () => {
  let bag = {}
  let EnabledFeatures = Features.Static | Features.RenderStrategy
  function Dummy<TTag extends ElementType = 'div'>(
    props: Props<TTag> & { show: boolean } & PropsForFeatures<typeof EnabledFeatures>
  ) {
    let { show, ...rest } = props
    return <div data-testid="wrapper">{render(rest, bag, 'div', EnabledFeatures, show)}</div>
  }

  // TODO: Can we "legit" test this? 🤔
  it('should result in a typescript error', () => {
    testRender(
      // @ts-expect-error static & unmount together are incompatible
      <Dummy show={false} static unmount>
        Contents
      </Dummy>
    )
  })

  // To avoid duplication, and to make sure that the features tested in isolation can also be
  // re-used when they are combined.
  testStaticFeature(Dummy)
  testRenderStrategyFeature(Dummy)
})
