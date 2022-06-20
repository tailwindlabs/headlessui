import { h, cloneVNode, Slots, Fragment, VNode } from 'vue'
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
  ...main
}: {
  props: Record<string, any>
  slot: Record<string, any>
  attrs: Record<string, any>
  slots: Slots
  name: string
} & {
  features?: Features
  visible?: boolean
}) {
  // Visible always render
  if (visible) return _render(main)

  if (features & Features.Static) {
    // When the `static` prop is passed as `true`, then the user is in control, thus we don't care about anything else
    if (main.props.static) return _render(main)
  }

  if (features & Features.RenderStrategy) {
    let strategy = main.props.unmount ?? true ? RenderStrategy.Unmount : RenderStrategy.Hidden

    return match(strategy, {
      [RenderStrategy.Unmount]() {
        return null
      },
      [RenderStrategy.Hidden]() {
        return _render({
          ...main,
          props: { ...main.props, hidden: true, style: { display: 'none' } },
        })
      },
    })
  }

  // No features enabled, just render
  return _render(main)
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
  // if (slot) {
  //   let exposeState = false
  //   let states = []
  //   for (let [k, v] of Object.entries(slot)) {
  //     if (typeof v === 'boolean') {
  //       exposeState = true
  //     }
  //     if (v === true) {
  //       states.push(k)
  //     }
  //   }
  //
  //   if (exposeState) dataAttributes[`data-headlessui-state`] = states.join(' ')
  // }

  if (as === 'template') {
    children = flattenFragments(children as VNode[])

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

      return cloneVNode(
        firstChild,
        Object.assign({}, incomingProps as Record<string, any>, dataAttributes)
      )
    }

    if (Array.isArray(children) && children.length === 1) {
      return children[0]
    }

    return children
  }

  return h(as, Object.assign({}, incomingProps, dataAttributes), children)
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
  let clone = Object.assign({}, object)
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
