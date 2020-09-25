import * as React from 'react'
import { Props } from '../types'

export function render<TTag extends React.ElementType, TBag>(
  props: Props<TTag, TBag>,
  bag: TBag,
  tag: React.ElementType
) {
  const { as: Component = tag, children, ...passThroughProps } = props

  const resolvedChildren = (typeof children === 'function' ? children(bag) : children) as
    | React.ReactElement
    | React.ReactElement[]

  if (Component === React.Fragment) {
    if (Object.keys(passThroughProps).length > 0) {
      if (Array.isArray(resolvedChildren) && resolvedChildren.length > 1) {
        const err = new Error('You should only render 1 child')
        if (Error.captureStackTrace) Error.captureStackTrace(err, render)
        throw err
      }

      if (!React.isValidElement(resolvedChildren)) {
        const err = new Error(
          `You should render an element as a child. Did you forget the as="..." prop?`
        )
        if (Error.captureStackTrace) Error.captureStackTrace(err, render)
        throw err
      }

      return React.cloneElement(
        resolvedChildren,

        // Filter out undefined values so that they don't override the existing values
        mergeEventFunctions(compact(passThroughProps), resolvedChildren.props, ['onClick'])
      )
    }
  }

  return React.createElement(Component, passThroughProps, resolvedChildren)
}

/**
 * We can use this function for the following useCase:
 *
 * <Menu.Item> <button onClick={console.log} /> </Menu.Item>
 *
 * Our `Menu.Item` will have an internal `onClick`, if you passthrough an `onClick` to the actual
 * `Menu.Item` component we will call it correctly. However, when we have an `onClick` on the actual
 * first child, that one should _also_ be called (but before this implementation, it was just
 * overriding the `onClick`). But it is only when we *render* that we have access to the existing
 * props of this component.
 *
 * It's a bit hacky, and not that clean, but it is something internal and we have tests to rely on
 * so that we can refactor this later (if needed).
 */
function mergeEventFunctions(
  passThroughProps: Record<string, any>,
  existingProps: Record<string, any>,
  functionsToMerge: string[]
) {
  let clone = Object.assign({}, passThroughProps)
  for (let func of functionsToMerge) {
    if (passThroughProps[func] !== undefined && existingProps[func] !== undefined) {
      Object.assign(clone, {
        [func](event: { defaultPrevented: boolean }) {
          // Props we control
          if (!event.defaultPrevented) passThroughProps[func](event)

          // Existing props on the component
          if (!event.defaultPrevented) existingProps[func](event)
        },
      })
    }
  }

  return clone
}

/**
 * This is a hack, but basically we want to keep the full 'API' of the component, but we do want to
 * wrap it in a forwardRef so that we _can_ passthrough the ref
 */
export function forwardRefWithAs<T>(component: T): T {
  return React.forwardRef((component as unknown) as any) as any
}

function compact<T extends Record<any, any>>(object: T) {
  let clone = Object.assign({}, object)
  for (let key in clone) {
    if (clone[key] === undefined) delete clone[key]
  }
  return clone
}
