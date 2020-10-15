import { h, cloneVNode, Slots } from 'vue'
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

enum RenderStrategy {
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
    const strategy = main.props.unmount ?? true ? RenderStrategy.Unmount : RenderStrategy.Hidden

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
}: {
  props: Record<string, any>
  slot: Record<string, any>
  attrs: Record<string, any>
  slots: Slots
}) {
  const { as, ...passThroughProps } = omit(props, ['unmount', 'static'])

  const children = slots.default?.(slot)

  if (as === 'template') {
    if (Object.keys(passThroughProps).length > 0 || 'class' in attrs) {
      const [firstChild, ...other] = children ?? []

      if (other.length > 0)
        throw new Error('You should only render 1 child or use the `as="..."` prop')

      return cloneVNode(firstChild, passThroughProps as Record<string, any>)
    }

    return children
  }

  return h(as, passThroughProps, children)
}

function omit<T extends Record<any, any>>(object: T, keysToOmit: string[] = []) {
  let clone = Object.assign({}, object)
  for (let key of keysToOmit) {
    if (key in clone) delete clone[key]
  }
  return clone
}
