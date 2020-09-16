import { h, cloneVNode, Slots } from 'vue'

export function render({
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
  const { as, ...passThroughProps } = props

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
