import {
  Fragment,
  cloneElement,
  createElement,
  forwardRef,
  isValidElement,
  useCallback,
  useRef,
  type ElementType,
  type MutableRefObject,
  type ReactElement,
  type Ref,
} from 'react'
import type { Expand, Props, XOR, __ } from '../types'
import { classNames } from './class-names'
import { match } from './match'

export enum RenderFeatures {
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

type PropsForFeature<
  TPassedInFeatures extends RenderFeatures,
  TForFeature extends RenderFeatures,
  TProps,
> = {
  [P in TPassedInFeatures]: P extends TForFeature ? TProps : __
}[TPassedInFeatures]

export type PropsForFeatures<T extends RenderFeatures> = XOR<
  PropsForFeature<T, RenderFeatures.Static, { static?: boolean }>,
  PropsForFeature<T, RenderFeatures.RenderStrategy, { unmount?: boolean }>
>

export function render<TFeature extends RenderFeatures, TTag extends ElementType, TSlot>({
  ourProps,
  theirProps,
  slot,
  defaultTag,
  features,
  visible = true,
  name,
  mergeRefs,
}: {
  ourProps: Expand<Props<TTag, TSlot, any> & PropsForFeatures<TFeature>> & {
    ref?: Ref<HTMLElement | ElementType>
  }
  theirProps: Expand<Props<TTag, TSlot, any>>
  slot?: TSlot
  defaultTag: ElementType
  features?: TFeature
  visible?: boolean
  name: string
  mergeRefs?: ReturnType<typeof useMergeRefsFn>
}) {
  mergeRefs = mergeRefs ?? defaultMergeRefs

  let props = mergePropsAdvanced(theirProps, ourProps)

  // Visible always render
  if (visible) return _render(props, slot, defaultTag, name, mergeRefs)

  let featureFlags = features ?? RenderFeatures.None

  if (featureFlags & RenderFeatures.Static) {
    let { static: isStatic = false, ...rest } = props as PropsForFeatures<RenderFeatures.Static>

    // When the `static` prop is passed as `true`, then the user is in control, thus we don't care about anything else
    if (isStatic) return _render(rest, slot, defaultTag, name, mergeRefs)
  }

  if (featureFlags & RenderFeatures.RenderStrategy) {
    let { unmount = true, ...rest } = props as PropsForFeatures<RenderFeatures.RenderStrategy>
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
          name,
          mergeRefs!
        )
      },
    })
  }

  // No features enabled, just render
  return _render(props, slot, defaultTag, name, mergeRefs)
}

function _render<TTag extends ElementType, TSlot>(
  props: Props<TTag, TSlot> & { ref?: unknown },
  slot: TSlot = {} as TSlot,
  tag: ElementType,
  name: string,
  mergeRefs: ReturnType<typeof useMergeRefsFn>
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
  if ('className' in rest && rest.className && typeof rest.className === 'function') {
    rest.className = rest.className(slot)
  }

  // Drop `aria-labelledby` if it only references the current element. If the `aria-labelledby`
  // references itself but also another element then we can keep it.
  if (rest['aria-labelledby'] && rest['aria-labelledby'] === rest.id) {
    rest['aria-labelledby'] = undefined
  }

  let dataAttributes: Record<string, string> = {}
  if (slot) {
    let exposeState = false
    let states = []
    for (let [k, v] of Object.entries(slot)) {
      if (typeof v === 'boolean') {
        exposeState = true
      }

      if (v === true) {
        states.push(k.replace(/([A-Z])/g, (m) => `-${m.toLowerCase()}`))
      }
    }

    if (exposeState) {
      dataAttributes['data-headlessui-state'] = states.join(' ')
      for (let state of states) {
        dataAttributes[`data-${state}`] = ''
      }
    }
  }

  if (Component === Fragment) {
    if (Object.keys(compact(rest)).length > 0 || Object.keys(compact(dataAttributes)).length > 0) {
      if (
        !isValidElement(resolvedChildren) ||
        (Array.isArray(resolvedChildren) && resolvedChildren.length > 1)
      ) {
        if (Object.keys(compact(rest)).length > 0) {
          throw new Error(
            [
              'Passing props on "Fragment"!',
              '',
              `The current component <${name} /> is rendering a "Fragment".`,
              `However we need to passthrough the following props:`,
              Object.keys(compact(rest))
                .concat(Object.keys(compact(dataAttributes)))
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
      } else {
        // Merge class name prop in SSR
        // @ts-ignore We know that the props may not have className. It'll be undefined then which is fine.
        let childProps = resolvedChildren.props as { className: string | (() => string) } | null

        let childPropsClassName = childProps?.className
        let newClassName =
          typeof childPropsClassName === 'function'
            ? (...args: any[]) =>
                classNames(
                  (childPropsClassName as Function)(...args),
                  (rest as { className?: string }).className
                )
            : classNames(childPropsClassName, (rest as { className?: string }).className)

        let classNameProps = newClassName ? { className: newClassName } : {}

        return cloneElement(
          resolvedChildren,
          Object.assign(
            {},
            // Filter out undefined values so that they don't override the existing values
            mergePropsAdvanced(resolvedChildren.props as any, compact(omit(rest, ['ref']))),
            dataAttributes,
            refRelatedProps,
            { ref: mergeRefs((resolvedChildren as any).ref, refRelatedProps.ref) },
            classNameProps
          )
        )
      }
    }
  }

  return createElement(
    Component,
    Object.assign(
      {},
      omit(rest, ['ref']),
      Component !== Fragment && refRelatedProps,
      Component !== Fragment && dataAttributes
    ),
    resolvedChildren
  )
}

/**
 * This is a singleton hook. **You can ONLY call the returned
 * function *once* to produce expected results.** If you need
 * to call `mergeRefs()` multiple times you need to create a
 * separate function for each invocation. This happens as we
 * store the list of `refs` to update and always return the
 * same function that refers to that list of refs.
 *
 * You shouldn't normally read refs during render but this
 * should actually be okay because React itself is calling
 * the `function` that updates these refs and can only do
 * so once the ref that contains the list is updated.
 */
export function useMergeRefsFn() {
  type MaybeRef<T> = MutableRefObject<T> | ((value: T) => void) | null | undefined
  let currentRefs = useRef<MaybeRef<any>[]>([])
  let mergedRef = useCallback((value: any) => {
    for (let ref of currentRefs.current) {
      if (ref == null) continue
      if (typeof ref === 'function') ref(value)
      else ref.current = value
    }
  }, [])

  return (...refs: any[]) => {
    if (refs.every((ref) => ref == null)) {
      return undefined
    }

    currentRefs.current = refs
    return mergedRef
  }
}

// This does not produce a stable function to use as a ref
// But we only use it in the case of as={Fragment}
// And it should really only re-render if setting the ref causes the parent to re-render unconditionally
// which then causes the child to re-render resulting in a render loop
// TODO: Add tests for this somehow
function defaultMergeRefs(...refs: any[]) {
  return refs.every((ref) => ref == null)
    ? undefined
    : (value: any) => {
        for (let ref of refs) {
          if (ref == null) continue
          if (typeof ref === 'function') ref(value)
          else ref.current = value
        }
      }
}

// A more complex example fo the `mergeProps` function, this one also cancels subsequent event
// listeners if the event has already been `preventDefault`ed.
function mergePropsAdvanced(...listOfProps: Props<any, any>[]) {
  if (listOfProps.length === 0) return {}
  if (listOfProps.length === 1) return listOfProps[0]

  let target: Props<any, any> = {}

  let eventHandlers: Record<
    string,
    ((event: { defaultPrevented: boolean }, ...args: any[]) => void | undefined)[]
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

  // Ensure event listeners are not called if `disabled` or `aria-disabled` is true
  if (target.disabled || target['aria-disabled']) {
    for (let eventName in eventHandlers) {
      // Prevent default events for `onClick`, `onMouseDown`, `onKeyDown`, etc.
      if (/^(on(?:Click|Pointer|Mouse|Key)(?:Down|Up|Press)?)$/.test(eventName)) {
        eventHandlers[eventName] = [(e: any) => e?.preventDefault?.()]
      }
    }
  }

  // Merge event handlers
  for (let eventName in eventHandlers) {
    Object.assign(target, {
      [eventName](event: { nativeEvent?: Event; defaultPrevented: boolean }, ...args: any[]) {
        let handlers = eventHandlers[eventName]

        for (let handler of handlers) {
          if (
            (event instanceof Event || event?.nativeEvent instanceof Event) &&
            event.defaultPrevented
          ) {
            return
          }

          handler(event, ...args)
        }
      },
    })
  }

  return target
}

export type HasDisplayName = {
  displayName: string
}

export type RefProp<T extends Function> = T extends (props: any, ref: Ref<infer RefType>) => any
  ? { ref?: Ref<RefType> }
  : never

// TODO: add proper return type, but this is not exposed as public API so it's fine for now
export function mergeProps<T extends Props<any, any>[]>(...listOfProps: T) {
  if (listOfProps.length === 0) return {}
  if (listOfProps.length === 1) return listOfProps[0]

  let target: Props<any, any> = {}

  let eventHandlers: Record<string, ((...args: any[]) => void | undefined)[]> = {}

  for (let props of listOfProps) {
    for (let prop in props) {
      // Merge event listeners
      if (prop.startsWith('on') && typeof props[prop] === 'function') {
        eventHandlers[prop] ??= []
        eventHandlers[prop].push(props[prop])
      } else {
        // Override incoming prop
        target[prop] = props[prop]
      }
    }
  }

  // Merge event handlers
  for (let eventName in eventHandlers) {
    Object.assign(target, {
      [eventName](...args: any[]) {
        let handlers = eventHandlers[eventName]

        for (let handler of handlers) {
          handler?.(...args)
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
  let clone = Object.assign({}, object) as T
  for (let key of keysToOmit) {
    if (key in clone) delete clone[key]
  }
  return clone
}
