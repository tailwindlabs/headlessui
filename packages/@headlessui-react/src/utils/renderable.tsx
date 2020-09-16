import * as React from 'react'
import { AsRenderProp, AsShortcut } from '../types'

// function Item<TTag extends React.ElementType = 'div'>(props: Renderable<TTag, {
//   props:
// }>) {
//   return render<typeof props>(props, { extra: 'info' })
// }

// Use case 1: A default item
// <Item />

// Use case 2: An item with a render prop
// <Item>{(args) => {}}</Item>    // Args should be typed

// Use case 3: An item with an `as` prop
// <Item as="a" href="/"></div>   // Becauase of the `as` prop set to "a" we should get code completion for an `href`.

export function isRenderProp<TBag>(props: any): props is Required<AsRenderProp<TBag>> {
  return typeof props.children === 'function'
}

function isAsShortcut<TTag, TOmitableProps extends keyof any = any>(
  _props: any
): _props is AsShortcut<TTag, TOmitableProps> {
  return true
}

export function render<T extends React.ElementType, TBag>(
  props: AsShortcut<T> | AsRenderProp<TBag>,
  bag: TBag,
  tag: React.ElementType
) {
  if (isRenderProp(props)) {
    const { children, ...rest } = props
    const returnValue = props.children(bag)

    return React.cloneElement(
      returnValue,

      // Filter out undefined values so that they don't override the existing values
      compact(omit(rest, ['as']))
    )
  }

  if (isAsShortcut(props)) {
    const { as: Component = tag, ...rest } = props as AsShortcut<T> & {
      children: React.ReactElement
    }

    if (Component === React.Fragment) {
      const { children, ...passThroughProps } = rest

      if (Object.keys(passThroughProps).length > 0) {
        if (Array.isArray(children) && children.length > 1) {
          const err = new Error('You should only render 1 child')
          if (Error.captureStackTrace) Error.captureStackTrace(err, render)
          throw err
        }

        if (!React.isValidElement(children)) {
          const err = new Error(
            `You should render an element as a child. Did you forget the as="..." prop?`
          )
          if (Error.captureStackTrace) Error.captureStackTrace(err, render)
          throw err
        }

        return React.cloneElement(
          children,

          // Filter out undefined values so that they don't override the existing values
          compact(omit(passThroughProps, ['as']))
        )
      }
    }

    return <Component {...rest} />
  }

  return null
}

/**
 * This is a hack, but basically we want to keep the full 'API' of the component, but we do want to
 * wrap it in a forwardRef so that we _can_ passthrough the ref
 */
export function forwardRefWithAs<T>(component: T): T {
  return React.forwardRef((component as unknown) as any) as any
}

function omit<T extends Record<any, any>>(object: T, skip: string[]) {
  let clone = Object.assign({}, object)
  for (let key of skip) delete clone[key]
  return clone
}

function compact<T extends Record<any, any>>(object: T) {
  let clone = Object.assign({}, object)
  for (let key in clone) {
    if (clone[key] === undefined) delete clone[key]
  }
  return clone
}
