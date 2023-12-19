import { getByTestId, prettyDOM, render as testRender } from '@testing-library/react'
import React, { Fragment, createRef, type ElementType, type Ref } from 'react'
import { suppressConsoleLogs } from '../test-utils/suppress-console-logs'
import type { Expand, Props } from '../types'
import { RenderFeatures, render, type PropsForFeatures } from './render'

function contents(id = 'wrapper') {
  return prettyDOM(getByTestId(document.body, id), undefined, {
    highlight: false,
  })
}

describe('Default functionality', () => {
  let slot = {}
  function Dummy<TTag extends ElementType = 'div'>(
    props: Props<TTag> & Partial<{ a: any; b: any; c: any }>
  ) {
    return (
      <div data-testid="wrapper">
        {render({
          ourProps: {},
          theirProps: props,
          slot,
          defaultTag: 'div',
          name: 'Dummy',
        })}
      </div>
    )
  }

  function DummyWithClassName<TTag extends ElementType = 'div'>(
    props: Props<TTag> & Partial<{ className: string | (() => string) }>
  ) {
    return (
      <div data-testid="wrapper-with-class">
        {render({
          ourProps: {},
          theirProps: props,
          slot,
          defaultTag: 'div',
          name: 'Dummy',
        })}
      </div>
    )
  }

  it('should be possible to render a dummy component', () => {
    testRender(<Dummy />)

    expect(contents()).toMatchSnapshot()
  })

  it('should be possible to merge classes when rendering', () => {
    testRender(
      <DummyWithClassName as={Fragment} className="test-outer">
        <div className="test-inner"></div>
      </DummyWithClassName>
    )

    expect(contents('wrapper-with-class')).toMatchSnapshot()
  })

  it('should be possible to merge class fns when rendering', () => {
    testRender(
      <DummyWithClassName as={Fragment} className="test-outer">
        <Dummy className={() => 'test-inner'}></Dummy>
      </DummyWithClassName>
    )

    expect(contents('wrapper-with-class')).toMatchSnapshot()
  })

  it('should be possible to render a dummy component with some children as a callback', () => {
    expect.assertions(2)

    testRender(
      <Dummy>
        {(data) => {
          expect(data).toBe(slot)

          return <span>Contents</span>
        }}
      </Dummy>
    )

    expect(contents()).toMatchSnapshot()
  })

  it('should be possible to add a ref with a different name', () => {
    let ref = createRef<HTMLDivElement>()

    function MyComponent<T extends ElementType = 'div'>({
      innerRef,
      ...props
    }: Props<T, {}, never, { innerRef?: Ref<HTMLDivElement> }>) {
      return <div ref={innerRef} {...props} />
    }

    function OtherDummy<TTag extends ElementType = 'div'>(props: Props<TTag>) {
      return (
        <div data-testid="wrapper">
          {render({
            ourProps: { ref },
            theirProps: props,
            slot,
            defaultTag: 'div',
            name: 'OtherDummy',
          })}
        </div>
      )
    }

    testRender(
      <OtherDummy as={MyComponent} refName="potato">
        Contents
      </OtherDummy>
    )

    expect(contents()).toMatchSnapshot()
  })

  it('should be possible to passthrough props to a dummy component', () => {
    testRender(<Dummy a={1} b={2} c={3} />)

    expect(contents()).toMatchSnapshot()
  })

  it('should be possible to change the underlying DOM node using the `as` prop', () => {
    testRender(<Dummy as="button" />)

    expect(contents()).toMatchSnapshot()
  })

  it('should be possible to change the underlying DOM node using the `as` prop and still have a function as children', () => {
    testRender(<Dummy as="button">{() => <span>Contents</span>}</Dummy>)

    expect(contents()).toMatchSnapshot()
  })

  it('should be possible to render the children only when the `as` prop is set to Fragment', () => {
    testRender(<Dummy as={Fragment}>Contents</Dummy>)

    expect(contents()).toMatchSnapshot()
  })

  it('should forward all the props to the first child when using an as={Fragment}', () => {
    testRender(
      <Dummy as={Fragment} a={1} b={1}>
        {() => <span>Contents</span>}
      </Dummy>
    )

    expect(contents()).toMatchSnapshot()
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
      }).toThrow(
        new Error(
          [
            'Passing props on "Fragment"!',
            '',
            'The current component <Dummy /> is rendering a "Fragment".',
            'However we need to passthrough the following props:',
            '  - className',
            '',
            'You can apply a few solutions:',
            '  - Add an `as="..."` prop, to ensure that we render an actual element instead of a "Fragment".',
            '  - Render a single element as the child so that we can forward the props onto that element.',
          ].join('\n')
        )
      )
    })
  )

  it("should not error when we are rendering a Fragment with multiple children when we don't passthrough additional props", () => {
    testRender(
      <Dummy as={Fragment}>
        <span>Contents A</span>
        <span>Contents B</span>
      </Dummy>
    )

    expect(contents()).toMatchSnapshot()
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
      }).toThrow(
        new Error(
          [
            'Passing props on "Fragment"!',
            '',
            'The current component <Dummy /> is rendering a "Fragment".',
            'However we need to passthrough the following props:',
            '  - className',
            '',
            'You can apply a few solutions:',
            '  - Add an `as="..."` prop, to ensure that we render an actual element instead of a "Fragment".',
            '  - Render a single element as the child so that we can forward the props onto that element.',
          ].join('\n')
        )
      )
    })
  )
})

// ---

function testStaticFeature(Dummy: (props: any) => JSX.Element) {
  it('should be possible to render a `static` dummy component (show = true)', () => {
    testRender(
      <Dummy show={true} static>
        Contents
      </Dummy>
    )

    expect(contents()).toMatchSnapshot()
  })

  it('should be possible to render a `static` dummy component (show = false)', () => {
    testRender(
      <Dummy show={false} static>
        Contents
      </Dummy>
    )

    expect(contents()).toMatchSnapshot()
  })
}

// With the `static` keyword, the user is always in control. When we internally decide to show the
// component or hide it then it won't have any effect. This is useful for when you want to wrap your
// component in a Transition for example so that the Transition component can control the
// showing/hiding based on the `show` prop AND the state of the transition.
describe('Features.Static', () => {
  let slot = {}
  let EnabledFeatures = RenderFeatures.Static
  function Dummy<TTag extends ElementType = 'div'>(
    props: Expand<Props<TTag> & PropsForFeatures<typeof EnabledFeatures>> & { show: boolean }
  ) {
    let { show, ...rest } = props
    return (
      <div data-testid="wrapper">
        {render({
          ourProps: {},
          theirProps: rest,
          slot,
          defaultTag: 'div',
          features: EnabledFeatures,
          visible: show,
          name: 'Dummy',
        })}
      </div>
    )
  }

  testStaticFeature(Dummy)
})

// ---

function testRenderStrategyFeature(Dummy: (props: any) => JSX.Element) {
  describe('Unmount render strategy', () => {
    it('should be possible to render an `unmount` dummy component (show = true)', () => {
      testRender(
        <Dummy show={true} unmount>
          Contents
        </Dummy>
      )

      expect(contents()).toMatchSnapshot()
    })

    it('should be possible to render an `unmount` dummy component (show = false)', () => {
      testRender(
        <Dummy show={false} unmount>
          Contents
        </Dummy>
      )

      // No contents, because we unmounted!
      expect(contents()).toMatchSnapshot()
    })
  })

  describe('Hidden render strategy', () => {
    it('should be possible to render an `unmount={false}` dummy component (show = true)', () => {
      testRender(
        <Dummy show={true} unmount={false}>
          Contents
        </Dummy>
      )

      expect(contents()).toMatchSnapshot()
    })

    it('should be possible to render an `unmount={false}` dummy component (show = false)', () => {
      testRender(
        <Dummy show={false} unmount={false}>
          Contents
        </Dummy>
      )

      // We do have contents, but it is marked as hidden!
      expect(contents()).toMatchSnapshot()
    })
  })
}

describe('Features.RenderStrategy', () => {
  let slot = {}
  let EnabledFeatures = RenderFeatures.RenderStrategy
  function Dummy<TTag extends ElementType = 'div'>(
    props: Expand<Props<TTag> & PropsForFeatures<typeof EnabledFeatures>> & { show: boolean }
  ) {
    let { show, ...rest } = props
    return (
      <div data-testid="wrapper">
        {render({
          ourProps: {},
          theirProps: rest,
          slot,
          defaultTag: 'div',
          features: EnabledFeatures,
          visible: show,
          name: 'Dummy',
        })}
      </div>
    )
  }

  testRenderStrategyFeature(Dummy)
})

// ---

// This should enable the `static` and `unmount` features. However they can't be used together!
describe('Features.Static | Features.RenderStrategy', () => {
  let slot = {}
  let EnabledFeatures = RenderFeatures.Static | RenderFeatures.RenderStrategy
  function Dummy<TTag extends ElementType = 'div'>(
    props: Expand<Props<TTag> & PropsForFeatures<typeof EnabledFeatures>> & { show: boolean }
  ) {
    let { show, ...rest } = props
    return (
      <div data-testid="wrapper">
        {render({
          ourProps: {},
          theirProps: rest,
          slot,
          defaultTag: 'div',
          features: EnabledFeatures,
          visible: show,
          name: 'Dummy',
        })}
      </div>
    )
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
