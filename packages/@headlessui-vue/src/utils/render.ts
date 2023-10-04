import { cloneVNode, Fragment, h, type Slots, type VNode } from 'vue'
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

export function render({
  visible = true,
  features = Features.None,
  ourProps,
  theirProps,
  ...main
}: {
  ourProps: Record<string, any>
  theirProps: Record<string, any>
  slot: Record<string, any>
  attrs: Record<string, any>
  slots: Slots
  name: string
} & {
  features?: Features
  visible?: boolean
}) {
  let props = mergeProps(theirProps, ourProps)
  let mainWithProps = Object.assign(main, { props })

  // Visible always render
  if (visible) return _render(mainWithProps)

  if (features & Features.Static) {
    // When the `static` prop is passed as `true`, then the user is in control, thus we don't care about anything else
    if (props.static) return _render(mainWithProps)
  }

  if (features & Features.RenderStrategy) {
    let strategy = props.unmount ?? true ? RenderStrategy.Unmount : RenderStrategy.Hidden

    return match(strategy, {
      [RenderStrategy.Unmount]() {
        return null
      },
      [RenderStrategy.Hidden]() {
        return _render({
          ...main,
          props: { ...props, hidden: true, style: { display: 'none' } },
        })
      },
    })
  }

  // No features enabled, just render
  return _render(mainWithProps)
}

function _render({
  props,
  attrs,
  slots,
  slot,
  name,
}: {
  props: Record<string, any>
  slot: Record<string, any>
  attrs: Record<string, any>
  slots: Slots
  name: string
}) {
  let { as, ...incomingProps } = omit(props, ['unmount', 'static'])

  let children = slots.default?.(slot)

  let dataAttributes: Record<string, string> = {}
  if (slot) {
    let exposeState = false
    let states = []
    for (let [k, v] of Object.entries(slot)) {
      if (typeof v === 'boolean') {
        exposeState = true
      }
      if (v === true) {
        states.push(k)
      }
    }

    if (exposeState) dataAttributes[`data-headlessui-state`] = states.join(' ')
  }

  if (as === 'template') {
    children = flattenFragments(children ?? [])

    if (Object.keys(incomingProps).length > 0 || Object.keys(attrs).length > 0) {
      let [firstChild, ...other] = children ?? []

      if (!isValidElement(firstChild) || other.length > 0) {
        throw new Error(
          [
            'Passing props on "template"!',
            '',
            `The current component <${name} /> is rendering a "template".`,
            `However we need to passthrough the following props:`,
            Object.keys(incomingProps)
              .concat(Object.keys(attrs))
              .map((name) => name.trim())
              .filter((current, idx, all) => all.indexOf(current) === idx)
              .sort((a, z) => a.localeCompare(z))
              .map((line) => `  - ${line}`)
              .join('\n'),
            '',
            'You can apply a few solutions:',
            [
              'Add an `as="..."` prop, to ensure that we render an actual element instead of a "template".',
              'Render a single element as the child so that we can forward the props onto that element.',
            ]
              .map((line) => `  - ${line}`)
              .join('\n'),
          ].join('\n')
        )
      }

      let mergedProps = mergeProps(firstChild.props ?? {}, incomingProps, dataAttributes)
      let cloned = cloneVNode(firstChild, mergedProps, true)
      // Explicitly override props starting with `on`. This is for event handlers, but there are
      // scenario's where we set them to `undefined` explicitly (when `aria-disabled="true"` is
      // happening instead of `disabled`). But cloneVNode doesn't like overriding `onXXX` props so
      // we have to do it manually.
      for (let prop in mergedProps) {
        if (prop.startsWith('on')) {
          cloned.props ||= {}
          cloned.props[prop] = mergedProps[prop]
        }
      }
      return cloned
    }

    if (Array.isArray(children) && children.length === 1) {
      // TODO: Do we need to cloneVNode + dataAttributes here?
      return children[0]
    }

    return children
  }

  return h(as, Object.assign({}, incomingProps, dataAttributes), {
    default: () => children,
  })
}

/**
 * When passed a structure like this:
 * <Example><span>something</span></Example>
 *
 * And Example is defined as:
 * <SomeComponent><slot /></SomeComponent>
 *
 * We need to turn the fragment that <slot> represents into the slot.
 * Luckily by this point it's already rendered into an array of VNodes
 * for us so we can just flatten it directly.
 *
 * We have to do this recursively because there could be multiple
 * levels of Component nesting all with <slot> elements interspersed
 *
 * @param children
 * @returns
 */
function flattenFragments(children: VNode[]): VNode[] {
  return children.flatMap((child) => {
    if (child.type === Fragment) {
      return flattenFragments(child.children as VNode[])
    }

    return [child]
  })
}

function mergeProps(...listOfProps: Record<any, any>[]) {
  if (listOfProps.length === 0) return {}
  if (listOfProps.length === 1) return listOfProps[0]

  let target: Record<any, any> = {}

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
      [eventName](event: { defaultPrevented: boolean }, ...args: any[]) {
        let handlers = eventHandlers[eventName]

        for (let handler of handlers) {
          if (event instanceof Event && event.defaultPrevented) {
            return
          }

          handler(event, ...args)
        }
      },
    })
  }

  return target
}

export function compact<T extends Record<any, any>>(object: T) {
  let clone = Object.assign({}, object)
  for (let key in clone) {
    if (clone[key] === undefined) delete clone[key]
  }
  return clone
}

export function omit<T extends Record<any, any>, Keys extends keyof T>(
  object: T,
  keysToOmit: readonly Keys[] = []
) {
  let clone = Object.assign({}, object) as T
  for (let key of keysToOmit) {
    if (key in clone) delete clone[key]
  }
  return clone as Omit<T, Keys>
}

function isValidElement(input: any): boolean {
  if (input == null) return false // No children
  if (typeof input.type === 'string') return true // 'div', 'span', ...
  if (typeof input.type === 'object') return true // Other components
  if (typeof input.type === 'function') return true // Built-ins like Transition
  return false // Comments, strings, ...
}
