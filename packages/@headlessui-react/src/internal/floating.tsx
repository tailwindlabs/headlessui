import {
  autoUpdate,
  flip as flipMiddleware,
  inner as innerMiddleware,
  offset as offsetMiddleware,
  shift as shiftMiddleware,
  size as sizeMiddleware,
  useFloating,
  useInnerOffset,
  useInteractions,
  type InnerProps,
  type UseFloatingReturn,
} from '@floating-ui/react'
import * as React from 'react'
import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react'
import { useDisposables } from '../hooks/use-disposables'
import { useEvent } from '../hooks/use-event'
import { useIsoMorphicEffect } from '../hooks/use-iso-morphic-effect'

type Align = 'start' | 'end'
type Placement = 'top' | 'right' | 'bottom' | 'left'

type BaseAnchorProps = {
  /**
   * The `gap` is the space between the trigger and the panel.
   */
  gap: number | string // For `var()` support

  /**
   * The `offset` is the amount the panel should be nudged from its original position.
   */
  offset: number | string // For `var()` support

  /**
   * The `padding` is the minimum space between the panel and the viewport.
   */
  padding: number | string // For `var()` support
}

export type AnchorProps = Partial<
  BaseAnchorProps & {
    /**
     * The `to` value defines which side of the trigger the panel should be placed on and its
     * alignment.
     */
    to: `${Placement}` | `${Placement} ${Align}`
  }
>

export type AnchorPropsWithSelection = Partial<
  BaseAnchorProps & {
    /**
     * The `to` value defines which side of the trigger the panel should be placed on and its
     * alignment.
     */
    to: `${Placement | 'selection'}` | `${Placement | 'selection'} ${Align}`
  }
>

export type InternalFloatingPanelProps = Partial<{
  inner: {
    listRef: InnerProps['listRef']
    index: InnerProps['index']
  }
}>

let FloatingContext = createContext<{
  styles?: UseFloatingReturn<any>['floatingStyles']
  setReference: UseFloatingReturn<any>['refs']['setReference']
  setFloating: UseFloatingReturn<any>['refs']['setFloating']
  getReferenceProps: ReturnType<typeof useInteractions>['getReferenceProps']
  getFloatingProps: ReturnType<typeof useInteractions>['getFloatingProps']
  slot: Partial<{
    anchor: `${Placement | 'selection'}` | `${Placement | 'selection'} ${Align}`
  }>
}>({
  styles: undefined,
  setReference: () => {},
  setFloating: () => {},
  getReferenceProps: () => ({}),
  getFloatingProps: () => ({}),
  slot: {},
})
FloatingContext.displayName = 'FloatingContext'
let PlacementContext = createContext<((value: AnchorPropsWithSelection | null) => void) | null>(
  null
)
PlacementContext.displayName = 'PlacementContext'

export function useFloatingReference() {
  return useContext(FloatingContext).setReference
}

export function useFloatingReferenceProps() {
  return useContext(FloatingContext).getReferenceProps
}

export function useFloatingPanelProps() {
  let { getFloatingProps, slot } = useContext(FloatingContext)
  return useCallback(
    (...args: Parameters<typeof getFloatingProps>) => {
      return Object.assign({}, getFloatingProps(...args), {
        'data-anchor': slot.anchor,
      })
    },
    [getFloatingProps, slot]
  )
}

export function useFloatingPanel(
  placement?: AnchorPropsWithSelection & InternalFloatingPanelProps
) {
  let updatePlacementConfig = useContext(PlacementContext)
  let stablePlacement = useMemo(
    () => placement,
    [
      JSON.stringify(
        placement,
        typeof HTMLElement !== 'undefined'
          ? (_, v) => {
              if (v instanceof HTMLElement) {
                return v.outerHTML
              }
              return v
            }
          : undefined
      ),
    ]
  )
  useIsoMorphicEffect(() => {
    updatePlacementConfig?.(stablePlacement ?? null)
  }, [updatePlacementConfig, stablePlacement])

  let context = useContext(FloatingContext)

  return useMemo(
    () => [context.setFloating, context.styles] as const,
    [context.setFloating, context.styles]
  )
}

// TODO: Make this a config part of the `config`. Just need to decide on a name.
let MINIMUM_ITEMS_VISIBLE = 4

export function FloatingProvider({
  children,
  enabled = true,
}: {
  children: React.ReactNode
  enabled?: boolean
}) {
  let [config, setConfig] = useState<
    (AnchorPropsWithSelection & InternalFloatingPanelProps) | null
  >(null)
  let [innerOffset, setInnerOffset] = useState(0)
  let overflowRef = useRef(null)

  let [floatingEl, setFloatingElement] = useState<HTMLElement | null>(null)
  useFixScrollingPixel(floatingEl)

  let isEnabled = enabled && config !== null && floatingEl !== null

  let {
    to: placement = 'bottom',
    gap = 0,
    offset = 0,
    padding = 0,
    inner,
  } = useResolvedConfig(config, floatingEl)
  let [to, align = 'center'] = placement.split(' ') as [Placement | 'selection', Align | 'center']

  // Reset
  useIsoMorphicEffect(() => {
    if (!isEnabled) return
    setInnerOffset(0)
  }, [isEnabled])

  let { refs, floatingStyles, context } = useFloating({
    open: isEnabled,

    placement:
      to === 'selection'
        ? align === 'center'
          ? 'bottom'
          : `bottom-${align}`
        : align === 'center'
          ? `${to}`
          : `${to}-${align}`,

    // This component will be used in combination with a `Portal`, which means the floating
    // element will be rendered outside of the current DOM tree.
    strategy: 'fixed',

    // We use the panel in a `Dialog` which is making the page inert, therefore no re-positioning is
    // needed when scrolling changes.
    transform: false,

    middleware: [
      // - The `mainAxis` is set to `gap` which defines the gap between the panel and the
      //   trigger/reference.
      // - The `crossAxis` is set to `offset` which nudges the panel from its original position.
      //
      // When we are showing the panel on top of the selected item, we don't want a gap between the
      // reference and the panel, therefore setting the `mainAxis` to `0`.
      offsetMiddleware({
        mainAxis: to === 'selection' ? 0 : gap,
        crossAxis: offset,
      }),

      // When the panel overflows the viewport, we will try to nudge the panel to the other side to
      // ensure it's not clipped. We use the `padding` to define the  minimum space between the
      // panel and the viewport.
      shiftMiddleware({ padding }),

      // The `flip` middleware will swap the `placement` of the panel if there is not enough room.
      // This is not compatible with the `inner` middleware (which is only enabled when `to` is set
      // to "selection").
      to !== 'selection' && flipMiddleware(),

      // The `inner` middleware will ensure the panel is always fully visible on screen and
      // positioned on top of the reference and moved to the currently selected item.
      to === 'selection' && inner
        ? innerMiddleware({
            ...inner,
            padding, // For overflow detection
            overflowRef,
            offset: innerOffset,
            minItemsVisible: MINIMUM_ITEMS_VISIBLE,
            referenceOverflowThreshold: padding,
            onFallbackChange(fallback) {
              if (!fallback) return
              let parent = context.elements.floating
              if (!parent) return
              let scrollPaddingBottom =
                parseFloat(getComputedStyle(parent!).scrollPaddingBottom) || 0

              // We want at least X visible items, but if there are less than X items in the list,
              // we want to show as many as possible.
              let missing = Math.min(MINIMUM_ITEMS_VISIBLE, parent.childElementCount)

              let elementHeight = 0
              let elementAmountVisible = 0

              for (let child of context.elements.floating?.childNodes ?? []) {
                if (child instanceof HTMLElement) {
                  let childTop = child.offsetTop
                  // It can be that the child is fully visible, but we also want to keep the scroll
                  // padding into account to ensure the UI looks good. Therefore we fake that the
                  // bottom of the child is actually `scrollPaddingBottom` amount of pixels lower.
                  let childBottom = childTop + child.clientHeight + scrollPaddingBottom

                  let parentTop = parent.scrollTop
                  let parentBottom = parentTop + parent.clientHeight

                  // Figure out if the child is fully visible in the scroll parent.
                  if (childTop >= parentTop && childBottom <= parentBottom) {
                    missing--
                  } else {
                    // Not fully visible, so we will use this child to calculate the height of
                    // each item. We will also use this to calculate how much of the item is
                    // already visible.
                    elementAmountVisible = Math.max(
                      0,
                      Math.min(childBottom, parentBottom) - Math.max(childTop, parentTop)
                    )
                    elementHeight = child.clientHeight
                    break
                  }
                }
              }

              // There are fewer visible items than we want, so we will try to nudge the offset
              // to show more items.
              if (missing >= 1) {
                setInnerOffset((existingOffset) => {
                  let newInnerOffset =
                    elementHeight * missing - // `missing` amount of `elementHeight`
                    elementAmountVisible + // The amount of the last item that is visible
                    scrollPaddingBottom // The scroll padding to ensure the UI looks good

                  // Nudged enough already, no need to continue
                  if (existingOffset >= newInnerOffset) {
                    return existingOffset
                  }

                  return newInnerOffset
                })
              }
            },
          })
        : null,

      // The `size` middleware will ensure the panel is never bigger than the viewport minus the
      // provided `padding` that we want.
      sizeMiddleware({
        apply({ availableWidth, availableHeight, elements }) {
          Object.assign(elements.floating.style, {
            maxWidth: `${availableWidth - padding}px`,
            maxHeight: `${availableHeight - padding}px`,
          })
        },
      }),
    ].filter(Boolean),
    whileElementsMounted: autoUpdate,
  })

  // Calculate placement information to expose as data attributes
  let [exposedTo = to, exposedAlign = align] = context.placement.split('-')
  // If userland code is using custom styles specifically for `bottom`, but they chose `selection`,
  // then we want to make sure to map it to selection again otherwise styles could be wrong.
  if (to === 'selection') exposedTo = 'selection'

  let data = useMemo(
    () => ({
      anchor: [exposedTo, exposedAlign].filter(Boolean).join(' ') as React.ContextType<
        typeof FloatingContext
      >['slot']['anchor'],
    }),
    [exposedTo, exposedAlign]
  )

  let innerOffsetConfig = useInnerOffset(context, {
    overflowRef,
    onChange: setInnerOffset,
  })
  let { getReferenceProps, getFloatingProps } = useInteractions([innerOffsetConfig])

  let setFloatingRef = useEvent((el: HTMLElement | null) => {
    setFloatingElement(el)
    refs.setFloating(el)
  })

  return (
    <PlacementContext.Provider value={setConfig}>
      <FloatingContext.Provider
        value={{
          setFloating: setFloatingRef,
          setReference: refs.setReference,
          styles: !isEnabled ? {} : floatingStyles,
          getReferenceProps,
          getFloatingProps,
          slot: data,
        }}
      >
        {children}
      </FloatingContext.Provider>
    </PlacementContext.Provider>
  )
}

function useFixScrollingPixel(element: HTMLElement | null) {
  useIsoMorphicEffect(() => {
    if (!element) return

    let observer = new MutationObserver(() => {
      let maxHeight = element.style.maxHeight
      if (parseFloat(maxHeight) !== parseInt(maxHeight)) {
        element.style.maxHeight = `${Math.ceil(parseFloat(maxHeight))}px`
      }
    })

    observer.observe(element, {
      attributes: true,
      attributeFilter: ['style'],
    })

    return () => {
      observer.disconnect()
    }
  }, [element])
}

function useResolvedConfig(
  config: (AnchorPropsWithSelection & InternalFloatingPanelProps) | null,
  element?: HTMLElement | null
) {
  let gap = useResolvePxValue(config?.gap, element)
  let offset = useResolvePxValue(config?.offset, element)
  let padding = useResolvePxValue(config?.padding, element)

  return { ...config, gap, offset, padding }
}

function useResolvePxValue(
  input?: string | number,
  element?: HTMLElement | null,
  defaultValue: number | undefined = undefined
) {
  let d = useDisposables()
  let computeValue = useEvent((value?: string | number, element?: HTMLElement | null) => {
    // Nullish
    if (value == null) return [defaultValue, null] as const

    // Number as-is
    if (typeof value === 'number') return [value, null] as const

    // String values, the interesting part
    if (typeof value === 'string') {
      if (!element) return [defaultValue, null] as const

      let result = resolveCSSVariablePxValue(value, element)

      return [
        result,
        (setValue: (value?: number) => void) => {
          let variables = resolveVariables(value)

          // TODO: Improve this part and make it work
          //
          // Observe variables themselves. Currently the browser doesn't support this, but the
          // variables we are interested in resolve to a pixel value. Which means that we can use
          // this variable in the `margin` of an element. Then we can observe the `margin` of the
          // element and we will be notified when the variable changes.
          //
          // if (typeof ResizeObserver !== 'undefined') {
          //   let tmpEl = document.createElement('div')
          //   element.appendChild(tmpEl)
          //
          //   // Didn't use `fontSize` because a `fontSize` can't be negative.
          //   tmpEl.style.setProperty('margin-top', '0px', 'important')
          //
          //   // Set the new value, if this is invalid the previous value will be used.
          //   tmpEl.style.setProperty('margin-top', value, 'important')
          //
          //   let observer = new ResizeObserver(() => {
          //     let newResult = resolveCSSVariableValue(value, element)
          //
          //     if (result !== newResult) {
          //       setValue(newResult)
          //       result = newResult
          //     }
          //   })
          //   observer.observe(tmpEl)
          //   d.add(() => observer.disconnect())
          //   return d.dispose
          // }

          // Works as a fallback, but not very performant because we are polling the value.
          {
            let history = variables.map((variable) =>
              window.getComputedStyle(element!).getPropertyValue(variable)
            )

            d.requestAnimationFrame(function check() {
              d.nextFrame(check)

              // Fast path, detect if the value of the CSS Variable has changed before completely
              // computing the new value. Once we use `resolveCSSVariablePxValue` we will have to
              // compute the actual px value by injecting a temporary element into the DOM.
              //
              // This is a lot of work, so we want to avoid it if possible.
              let changed = false
              for (let [idx, variable] of variables.entries()) {
                let value = window.getComputedStyle(element!).getPropertyValue(variable)
                if (history[idx] !== value) {
                  history[idx] = value
                  changed = true
                  break
                }
              }

              // Nothing changed, no need to perform the expensive computation.
              if (!changed) return

              let newResult = resolveCSSVariablePxValue(value, element)

              if (result !== newResult) {
                setValue(newResult)
                result = newResult
              }
            })
          }

          return d.dispose
        },
      ] as const
    }

    return [defaultValue, null] as const
  })

  // Calculate the value immediately when the input or element changes. Later we can setup a watcher
  // to track the value changes over time.
  let immediateValue = useMemo(() => computeValue(input, element)[0], [input, element])
  let [value = immediateValue, setValue] = useState<number | undefined>()

  useIsoMorphicEffect(() => {
    let [value, watcher] = computeValue(input, element)
    setValue(value)

    if (!watcher) return
    return watcher(setValue)
  }, [input, element])

  return value
}

function resolveVariables(value: string): string[] {
  let matches = /var\((.*)\)/.exec(value)
  if (matches) {
    let idx = matches[1].indexOf(',')
    if (idx === -1) {
      return [matches[1]]
    }

    let variable = matches[1].slice(0, idx).trim()
    let fallback = matches[1].slice(idx + 1).trim()

    if (fallback) {
      return [variable, ...resolveVariables(fallback)]
    }

    return [variable]
  }

  return []
}

function resolveCSSVariablePxValue(input: string, element: HTMLElement) {
  // Resolve the value: Instead of trying to compute the value ourselves by converting rem /
  // vwh / ... values to pixels or by parsing out the fallback values and evaluating it
  // (because it can contain calc expressions or other variables).
  //
  // We will let the browser compute all of it by creating a temporary element and setting
  // the value as a CSS variable. Then we can read the computed value from the browser.
  //
  //
  // BUG REPORT ABOUT INCORRECT VALUES, look here:
  // ---------------------------------------------
  //
  // Currently this technically contains a bug because we are rendering a new element inside of the
  // current element. Which means that if the passed in element has CSS that looks like:
  //
  // ```css
  // .the-element {
  //   --the-variable: 1rem
  // }
  //
  // .the-element > * {
  //   --the-variable: 2rem
  // }
  // ```
  //
  // Then this will result to resolved value of `2rem`, instead of `1rem`
  let tmpEl = document.createElement('div')
  element.appendChild(tmpEl)

  // Set the value to `0px` otherwise if an invalid value is provided later the browser will read
  // out the default value.
  //
  // Didn't use `fontSize` because a `fontSize` can't be negative.
  tmpEl.style.setProperty('margin-top', '0px', 'important')

  // Set the new value, if this is invalid the previous value will be used.
  tmpEl.style.setProperty('margin-top', input, 'important')

  // Reading the `margin-top` will already be in pixels (e.g.: 123px).
  let pxValue = parseFloat(window.getComputedStyle(tmpEl).marginTop) || 0
  element.removeChild(tmpEl)

  return pxValue
}
