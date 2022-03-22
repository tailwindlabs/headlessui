import {
  Fragment,
  cloneElement,
  createElement,
  forwardRef,
  isValidElement,

  // Types
  ElementType,
  ReactElement,
} from 'react'
import { Props, XOR, __, Expand } from '../types'
import { match } from './match'

export enum Features {
  /** No features at all */
  None = 0,

  /**
   * When used, this will allow us to use one of the render strategies.
   *
   * **The render strategies are:**
   *    - **Unmount**   _(Will unmount the component.)_
   *    - **Hidden**    _(Will hide the component using the [hidden] attribute.)_
   */
  RenderStrategy = 1,

  /**
   * When used, this will allow the user of our component to be in control. This can be used when
   * you want to transition based on some state.
   */
  Static = 2,
}

export enum RenderStrategy {
  Unmount,
  Hidden,
}

type PropsForFeature<TPassedInFeatures extends Features, TForFeature extends Features, TProps> = {
  [P in TPassedInFeatures]: P extends TForFeature ? TProps : __
}[TPassedInFeatures]

export type PropsForFeatures<T extends Features> = XOR<
  PropsForFeature<T, Features.Static, { static?: boolean }>,
  PropsForFeature<T, Features.RenderStrategy, { unmount?: boolean }>
>

export function render<TFeature extends Features, TTag extends ElementType, TSlot>({
  ourProps,
  theirProps,
  slot,
  defaultTag,
  features,
  visible = true,
  name,
}: {
  ourProps: Expand<Props<TTag, TSlot, any> & PropsForFeatures<TFeature>>
  theirProps: Expand<Props<TTag, TSlot, any>>
  slot?: TSlot
  defaultTag: ElementType
  features?: TFeature
  visible?: boolean
  name: string
}) {
  let props = mergeProps(theirProps, ourProps)

  // Visible always render
  if (visible) return _render(props, slot, defaultTag, name)

  let featureFlags = features ?? Features.None

  if (featureFlags & Features.Static) {
    let { static: isStatic = false, ...rest } = props as PropsForFeatures<Features.Static>

    // When the `static` prop is passed as `true`, then the user is in control, thus we don't care about anything else
    if (isStatic) return _render(rest, slot, defaultTag, name)
  }

  if (featureFlags & Features.RenderStrategy) {
    let { unmount = true, ...rest } = props as PropsForFeatures<Features.RenderStrategy>
    let strategy = unmount ? RenderStrategy.Unmount : RenderStrategy.Hidden

    return match(strategy, {
      [RenderStrategy.Unmount]() {
        return null
      },
      [RenderStrategy.Hidden]() {
        return _render(
          { ...rest, ...{ hidden: true, style: { display: 'none' } } },
          slot,
          defaultTag,
          name
        )
      },
    })
  }

  // No features enabled, just render
  return _render(props, slot, defaultTag, name)
}

function _render<TTag extends ElementType, TSlot>(
  props: Props<TTag, TSlot> & { ref?: unknown },
  slot: TSlot = {} as TSlot,
  tag: ElementType,
  name: string
) {
  let {
    as: Component = tag,
    children,
    refName = 'ref',
    ...rest
  } = omit(props, ['unmount', 'static'])

  // This allows us to use `<HeadlessUIComponent as={MyComponent} refName="innerRef" />`
  let refRelatedProps = props.ref !== undefined ? { [refName]: props.ref } : {}

  let resolvedChildren = (typeof children === 'function' ? children(slot) : children) as
    | ReactElement
    | ReactElement[]

  // Allow for className to be a function with the slot as the contents
  if (rest.className && typeof rest.className === 'function') {
    ;(rest as any).className = rest.className(slot)
  }

  if (Component === Fragment) {
    if (Object.keys(compact(rest)).length > 0) {
      if (
        !isValidElement(resolvedChildren) ||
        (Array.isArray(resolvedChildren) && resolvedChildren.length > 1)
      ) {
        throw new Error(
          [
            'Passing props on "Fragment"!',
            '',
            `The current component <${name} /> is rendering a "Fragment".`,
            `However we need to passthrough the following props:`,
            Object.keys(rest)
              .map((line) => `  - ${line}`)
              .join('\n'),
            '',
            'You can apply a few solutions:',
            [
              'Add an `as="..."` prop, to ensure that we render an actual element instead of a "Fragment".',
              'Render a single element as the child so that we can forward the props onto that element.',
            ]
              .map((line) => `  - ${line}`)
              .join('\n'),
          ].join('\n')
        )
      }

      return cloneElement(
        resolvedChildren,
        Object.assign(
          {},
          // Filter out undefined values so that they don't override the existing values
          mergeProps(resolvedChildren.props, compact(omit(rest, ['ref']))),
          refRelatedProps
        )
      )
    }
  }

  return createElement(
    Component,
    Object.assign({}, omit(rest, ['ref']), Component !== Fragment && refRelatedProps),
    resolvedChildren
  )
}

function mergeProps(...listOfProps: Props<any, any>[]) {
  if (listOfProps.length === 0) return {}
  if (listOfProps.length === 1) return listOfProps[0]

  let target: Props<any, any> = {}

  let eventHandlers: Record<
    string,
    ((event: { defaultPrevented: boolean }) => void | undefined)[]
  > = {}

  for (let props of listOfProps) {
    for (let prop in props) {
      // Collect event handlers
      if (prop.startsWith('on') && typeof props[prop] === 'function') {
        eventHandlers[prop] ??= []
        eventHandlers[prop].push(props[prop])
      } else {
        // Override incoming prop
        target[prop] = props[prop]
      }
    }
  }

  // Do not attach any event handlers when there is a `disabled` or `aria-disabled` prop set.
  if (target.disabled || target['aria-disabled']) {
    return Object.assign(
      target,
      // Set all event listeners that we collected to `undefined`. This is
      // important because of the `cloneElement` from above, which merges the
      // existing and new props, they don't just override therefore we have to
      // explicitly nullify them.
      Object.fromEntries(Object.keys(eventHandlers).map((eventName) => [eventName, undefined]))
    )
  }

  // Merge event handlers
  for (let eventName in eventHandlers) {
    Object.assign(target, {
      [eventName](event: { defaultPrevented: boolean }) {
        let handlers = eventHandlers[eventName]

        for (let handler of handlers) {
          if (event.defaultPrevented) return

          handler(event)
        }
      },
    })
  }

  return target
}

/**
 * This is a hack, but basically we want to keep the full 'API' of the component, but we do want to
 * wrap it in a forwardRef so that we _can_ passthrough the ref
 */
export function forwardRefWithAs<T extends { name: string; displayName?: string }>(
  component: T
): T & { displayName: string } {
  return Object.assign(forwardRef(component as unknown as any) as any, {
    displayName: component.displayName ?? component.name,
  })
}

export function compact<T extends Record<any, any>>(object: T) {
  let clone = Object.assign({}, object)
  for (let key in clone) {
    if (clone[key] === undefined) delete clone[key]
  }
  return clone
}

function omit<T extends Record<any, any>>(object: T, keysToOmit: string[] = []) {
  let clone = Object.assign({}, object)
  for (let key of keysToOmit) {
    if (key in clone) delete clone[key]
  }
  return clone
}
