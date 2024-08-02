import { useMemo } from 'react'

export function useResolveButtonType<TTag>(
  props: { type?: string; as?: TTag },
  element: HTMLElement | null
) {
  return useMemo(() => {
    // A type was provided
    if (props.type) return props.type

    // Resolve the type based on the `as` prop
    let tag = props.as ?? 'button'
    if (typeof tag === 'string' && tag.toLowerCase() === 'button') return 'button'

    // Resolve the type based on the HTML element
    if (element?.tagName === 'BUTTON' && !element.hasAttribute('type')) return 'button'

    // Could not resolve the type
    return undefined
  }, [props.type, props.as, element])
}
