'use client'

import { useFocusRing } from '@react-aria/focus'
import { useHover } from '@react-aria/interactions'
import { Virtualizer, useVirtualizer } from '@tanstack/react-virtual'
import React, {
  Fragment,
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ElementType,
  type MutableRefObject,
  type FocusEvent as ReactFocusEvent,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
  type Ref,
} from 'react'
import { flushSync } from 'react-dom'
import { useActivePress } from '../../hooks/use-active-press'
import { useByComparator, type ByComparator } from '../../hooks/use-by-comparator'
import { useControllable } from '../../hooks/use-controllable'
import { useDefaultValue } from '../../hooks/use-default-value'
import { useDisposables } from '../../hooks/use-disposables'
import { useElementSize } from '../../hooks/use-element-size'
import { useEvent } from '../../hooks/use-event'
import { useId } from '../../hooks/use-id'
import { useInertOthers } from '../../hooks/use-inert-others'
import { useIsoMorphicEffect } from '../../hooks/use-iso-morphic-effect'
import { useLatestValue } from '../../hooks/use-latest-value'
import { useOnDisappear } from '../../hooks/use-on-disappear'
import { useOutsideClick } from '../../hooks/use-outside-click'
import { useOwnerDocument } from '../../hooks/use-owner'
import { Action as QuickReleaseAction, useQuickRelease } from '../../hooks/use-quick-release'
import { useRefocusableInput } from '../../hooks/use-refocusable-input'
import { useResolveButtonType } from '../../hooks/use-resolve-button-type'
import { useScrollLock } from '../../hooks/use-scroll-lock'
import { useSyncRefs } from '../../hooks/use-sync-refs'
import { useTrackedPointer } from '../../hooks/use-tracked-pointer'
import { transitionDataAttributes, useTransition } from '../../hooks/use-transition'
import { useTreeWalker } from '../../hooks/use-tree-walker'
import { useWatch } from '../../hooks/use-watch'
import { useDisabled } from '../../internal/disabled'
import {
  FloatingProvider,
  useFloatingPanel,
  useFloatingPanelProps,
  useFloatingReference,
  useResolvedAnchor,
  type AnchorProps,
} from '../../internal/floating'
import { FormFields } from '../../internal/form-fields'
import { Frozen, useFrozenData } from '../../internal/frozen'
import { useProvidedId } from '../../internal/id'
import { OpenClosedProvider, State, useOpenClosed } from '../../internal/open-closed'
import { stackMachines } from '../../machines/stack-machine'
import { useSlice } from '../../react-glue'
import type { EnsureArray, Props } from '../../types'
import { history } from '../../utils/active-element-history'
import { isDisabledReactIssue7711 } from '../../utils/bugs'
import { Focus } from '../../utils/calculate-active-index'
import { disposables } from '../../utils/disposables'
import * as DOM from '../../utils/dom'
import { match } from '../../utils/match'
import { isMobile } from '../../utils/platform'
import {
  RenderFeatures,
  forwardRefWithAs,
  mergeProps,
  useRender,
  type HasDisplayName,
  type PropsForFeatures,
  type RefProp,
} from '../../utils/render'
import { useDescribedBy } from '../description/description'
import { Keys } from '../keyboard'
import { Label, useLabelledBy, useLabels, type _internal_ComponentLabel } from '../label/label'
import { MouseButton } from '../mouse'
import { Portal } from '../portal/portal'
import {
  ActionTypes,
  ActivationTrigger,
  ComboboxState,
  ValueMode,
  type ComboboxOptionDataRef,
} from './combobox-machine'
import {
  ComboboxContext,
  useComboboxMachine,
  useComboboxMachineContext,
} from './combobox-machine-glue'

let ComboboxDataContext = createContext<{
  value: unknown
  defaultValue: unknown
  disabled: boolean
  invalid: boolean
  mode: ValueMode
  immediate: boolean

  virtual: { options: unknown[]; disabled: (value: unknown) => boolean } | null
  calculateIndex(value: unknown): number
  compare(a: unknown, z: unknown): boolean
  isSelected(value: unknown): boolean
  onChange(value: unknown): void

  __demoMode: boolean

  optionsPropsRef: MutableRefObject<{
    static: boolean
    hold: boolean
  }>
} | null>(null)
ComboboxDataContext.displayName = 'ComboboxDataContext'

function useData(component: string) {
  let context = useContext(ComboboxDataContext)
  if (context === null) {
    let err = new Error(`<${component} /> is missing a parent <Combobox /> component.`)
    if (Error.captureStackTrace) Error.captureStackTrace(err, useData)
    throw err
  }
  return context
}
type _Data = ReturnType<typeof useData>

let VirtualContext = createContext<Virtualizer<any, any> | null>(null)

function VirtualProvider(props: {
  slot: OptionsRenderPropArg
  children: (data: { option: unknown; open: boolean }) => React.ReactElement
}) {
  let machine = useComboboxMachineContext('VirtualProvider')
  let data = useData('VirtualProvider')
  let { options } = data.virtual!

  let optionsElement = useSlice(machine, (state) => state.optionsElement)

  let [paddingStart, paddingEnd] = useMemo(() => {
    let el = optionsElement
    if (!el) return [0, 0]

    let styles = window.getComputedStyle(el)

    return [
      parseFloat(styles.paddingBlockStart || styles.paddingTop),
      parseFloat(styles.paddingBlockEnd || styles.paddingBottom),
    ]
  }, [optionsElement])

  let virtualizer = useVirtualizer({
    enabled: options.length !== 0,
    scrollPaddingStart: paddingStart,
    scrollPaddingEnd: paddingEnd,
    count: options.length,
    estimateSize() {
      return 40
    },
    getScrollElement() {
      return machine.state.optionsElement
    },
    overscan: 12,
  })

  let [baseKey, setBaseKey] = useState(0)
  useIsoMorphicEffect(() => {
    setBaseKey((v) => v + 1)
  }, [options])

  let items = virtualizer.getVirtualItems()

  let isPointerActivationTrigger = useSlice(machine, (state) => {
    return state.activationTrigger === ActivationTrigger.Pointer
  })
  let activeOptionIndex = useSlice(machine, machine.selectors.activeOptionIndex)

  if (items.length === 0) {
    return null
  }

  return (
    <VirtualContext.Provider value={virtualizer}>
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: `${virtualizer.getTotalSize()}px`,
        }}
        ref={(el) => {
          if (!el) return

          // Do not scroll when the mouse/pointer is being used
          if (isPointerActivationTrigger) return

          // Scroll to the active index
          if (activeOptionIndex !== null && options.length > activeOptionIndex) {
            virtualizer.scrollToIndex(activeOptionIndex)
          }
        }}
      >
        {items.map((item) => {
          return (
            <Fragment key={item.key}>
              {React.cloneElement(
                props.children?.({
                  ...props.slot,
                  option: options[item.index],
                }),
                {
                  key: `${baseKey}-${item.key}`,
                  'data-index': item.index,
                  'aria-setsize': options.length,
                  'aria-posinset': item.index + 1,
                  style: {
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    transform: `translateY(${item.start}px)`,
                    overflowAnchor: 'none',
                  },
                }
              )}
            </Fragment>
          )
        })}
      </div>
    </VirtualContext.Provider>
  )
}

// ---

let DEFAULT_COMBOBOX_TAG = Fragment
type ComboboxRenderPropArg<TValue, TActive = TValue> = {
  open: boolean
  disabled: boolean
  invalid: boolean
  activeIndex: number | null
  activeOption: TActive | null
  value: TValue
}

export type ComboboxProps<
  TValue,
  TMultiple extends boolean | undefined,
  TTag extends ElementType = typeof DEFAULT_COMBOBOX_TAG,
> = Props<
  TTag,
  ComboboxRenderPropArg<NoInfer<TValue>>,
  'value' | 'defaultValue' | 'multiple' | 'onChange' | 'by',
  {
    value?: TMultiple extends true ? EnsureArray<TValue> : TValue
    defaultValue?: TMultiple extends true ? EnsureArray<NoInfer<TValue>> : NoInfer<TValue>

    onChange?(
      value: TMultiple extends true ? EnsureArray<NoInfer<TValue>> : NoInfer<TValue> | null
    ): void
    by?: ByComparator<
      TMultiple extends true ? EnsureArray<NoInfer<TValue>>[number] : NoInfer<TValue>
    >

    /** @deprecated The `<Combobox />` is now nullable default */
    nullable?: boolean

    multiple?: TMultiple
    disabled?: boolean
    invalid?: boolean
    form?: string
    name?: string
    immediate?: boolean
    virtual?: {
      options: TMultiple extends true ? EnsureArray<NoInfer<TValue>> : NoInfer<TValue>[]
      disabled?: (
        value: TMultiple extends true ? EnsureArray<NoInfer<TValue>>[number] : NoInfer<TValue>
      ) => boolean
    } | null

    onClose?(): void

    __demoMode?: boolean
  }
>

function ComboboxFn<TValue, TTag extends ElementType = typeof DEFAULT_COMBOBOX_TAG>(
  props: ComboboxProps<TValue, boolean | undefined, TTag>,
  ref: Ref<HTMLElement>
) {
  let id = useId()

  let providedDisabled = useDisabled()
  let {
    value: controlledValue,
    defaultValue: _defaultValue,
    onChange: controlledOnChange,
    form,
    name,
    by,
    invalid = false,
    disabled = providedDisabled || false,
    onClose: theirOnClose,
    __demoMode = false,
    multiple = false,
    immediate = false,
    virtual = null,
    // Deprecated, but let's pluck it from the props such that it doesn't end up
    // on the `Fragment`
    nullable: _nullable,
    ...theirProps
  } = props
  let defaultValue = useDefaultValue(_defaultValue)
  let [value = multiple ? [] : undefined, theirOnChange] = useControllable<any>(
    controlledValue,
    controlledOnChange,
    defaultValue
  )

  let machine = useComboboxMachine({ id, virtual, __demoMode })

  let optionsPropsRef = useRef<_Data['optionsPropsRef']['current']>({ static: false, hold: false })

  type TActualValue = true extends typeof multiple ? EnsureArray<TValue>[number] : TValue
  let compare = useByComparator<TActualValue>(by)

  let calculateIndex = useEvent((value: TValue) => {
    if (virtual) {
      if (by === null) {
        return virtual.options.indexOf(value)
      } else {
        return virtual.options.findIndex((other) => compare(other, value))
      }
    } else {
      return machine.state.options.findIndex((other) => compare(other.dataRef.current.value, value))
    }
  })

  let isSelected: (value: TValue) => boolean = useCallback(
    (other) => {
      return match(data.mode, {
        [ValueMode.Multi]: () => {
          return (value as EnsureArray<TValue>).some((option) => compare(option, other))
        },
        [ValueMode.Single]: () => compare(value as TValue, other),
      })
    },
    [value]
  )

  let virtualSlice = useSlice(machine, (state) => state.virtual)
  let onClose = useEvent(() => theirOnClose?.())
  let data = useMemo<_Data>(
    () => ({
      __demoMode,
      immediate,
      optionsPropsRef,
      value,
      defaultValue,
      disabled,
      invalid,
      mode: multiple ? ValueMode.Multi : ValueMode.Single,
      virtual: virtual ? virtualSlice : null,
      onChange: theirOnChange,
      isSelected,
      calculateIndex,
      compare,
      onClose,
    }),
    [
      value,
      defaultValue,
      disabled,
      invalid,
      multiple,
      theirOnChange,
      isSelected,
      __demoMode,
      machine,
      virtual,
      virtualSlice,
      onClose,
    ]
  )

  useIsoMorphicEffect(() => {
    if (!virtual) return
    machine.send({
      type: ActionTypes.UpdateVirtualConfiguration,
      options: virtual.options,
      disabled: virtual.disabled ?? null,
    })
  }, [virtual, virtual?.options, virtual?.disabled])

  useIsoMorphicEffect(() => {
    machine.state.dataRef.current = data
  }, [data])

  let [comboboxState, buttonElement, inputElement, optionsElement] = useSlice(machine, (state) => [
    state.comboboxState,
    state.buttonElement,
    state.inputElement,
    state.optionsElement,
  ])

  let stackMachine = stackMachines.get(null)
  let isTopLayer = useSlice(
    stackMachine,
    useCallback((state) => stackMachine.selectors.isTop(state, id), [stackMachine, id])
  )

  // Handle outside click
  useOutsideClick(isTopLayer, [buttonElement, inputElement, optionsElement], () =>
    machine.actions.closeCombobox()
  )

  let activeOptionIndex = useSlice(machine, machine.selectors.activeOptionIndex)
  let activeOption = useSlice(machine, machine.selectors.activeOption)

  let slot = useMemo(() => {
    return {
      open: comboboxState === ComboboxState.Open,
      disabled,
      invalid,
      activeIndex: activeOptionIndex,
      activeOption,
      value,
    } satisfies ComboboxRenderPropArg<unknown>
  }, [data, disabled, value, invalid, activeOption, comboboxState])

  let [labelledby, LabelProvider] = useLabels()

  let ourProps = ref === null ? {} : { ref }

  let reset = useCallback(() => {
    if (defaultValue === undefined) return
    return theirOnChange?.(defaultValue)
  }, [theirOnChange, defaultValue])

  let render = useRender()

  return (
    <LabelProvider
      value={labelledby}
      props={{
        htmlFor: inputElement?.id,
      }}
      slot={{
        open: comboboxState === ComboboxState.Open,
        disabled,
      }}
    >
      <FloatingProvider>
        <ComboboxDataContext.Provider value={data}>
          <ComboboxContext.Provider value={machine}>
            <OpenClosedProvider
              value={match(comboboxState, {
                [ComboboxState.Open]: State.Open,
                [ComboboxState.Closed]: State.Closed,
              })}
            >
              {name != null && (
                <FormFields
                  disabled={disabled}
                  data={value != null ? { [name]: value } : {}}
                  form={form}
                  onReset={reset}
                />
              )}
              {render({
                ourProps,
                theirProps,
                slot,
                defaultTag: DEFAULT_COMBOBOX_TAG,
                name: 'Combobox',
              })}
            </OpenClosedProvider>
          </ComboboxContext.Provider>
        </ComboboxDataContext.Provider>
      </FloatingProvider>
    </LabelProvider>
  )
}

// ---

let DEFAULT_INPUT_TAG = 'input' as const
type InputRenderPropArg = {
  open: boolean
  disabled: boolean
  invalid: boolean
  hover: boolean
  focus: boolean
  autofocus: boolean
}
type InputPropsWeControl =
  | 'aria-activedescendant'
  | 'aria-autocomplete'
  | 'aria-controls'
  | 'aria-expanded'
  | 'aria-labelledby'
  | 'disabled'
  | 'role'

export type ComboboxInputProps<
  TTag extends ElementType = typeof DEFAULT_INPUT_TAG,
  TType = string,
> = Props<
  TTag,
  InputRenderPropArg,
  InputPropsWeControl,
  {
    defaultValue?: TType
    disabled?: boolean
    displayValue?(item: TType): string
    onChange?(event: React.ChangeEvent<HTMLInputElement>): void
    autoFocus?: boolean
  }
>

function InputFn<
  TTag extends ElementType = typeof DEFAULT_INPUT_TAG,
  // TODO: One day we will be able to infer this type from the generic in Combobox itself.
  // But today is not that day..
  TType = Parameters<typeof ComboboxRoot>[0]['value'],
>(props: ComboboxInputProps<TTag, TType>, ref: Ref<HTMLInputElement>) {
  let machine = useComboboxMachineContext('Combobox.Input')
  let data = useData('Combobox.Input')

  let internalId = useId()
  let providedId = useProvidedId()
  let {
    id = providedId || `headlessui-combobox-input-${internalId}`,
    onChange,
    displayValue,
    disabled = data.disabled || false,
    autoFocus = false,
    // @ts-ignore: We know this MAY NOT exist for a given tag but we only care when it _does_ exist.
    type = 'text',
    ...theirProps
  } = props

  let [inputElement] = useSlice(machine, (state) => [state.inputElement])

  let internalInputRef = useRef<HTMLInputElement | null>(null)
  let inputRef = useSyncRefs(
    internalInputRef,
    ref,
    useFloatingReference(),
    machine.actions.setInputElement
  )
  let ownerDocument = useOwnerDocument(inputElement)

  let [comboboxState, isTyping] = useSlice(machine, (state) => [
    state.comboboxState,
    state.isTyping,
  ])

  let d = useDisposables()

  let clear = useEvent(() => {
    machine.actions.onChange(null)
    if (machine.state.optionsElement) {
      machine.state.optionsElement.scrollTop = 0
    }
    machine.actions.goToOption({ focus: Focus.Nothing })
  })

  // When a `displayValue` prop is given, we should use it to transform the current selected
  // option(s) so that the format can be chosen by developers implementing this. This is useful if
  // your data is an object and you just want to pick a certain property or want to create a dynamic
  // value like `firstName + ' ' + lastName`.
  //
  // Note: This can also be used with multiple selected options, but this is a very simple transform
  // which should always result in a string (since we are filling in the value of the text input),
  // you don't have to use this at all, a more common UI is a "tag" based UI, which you can render
  // yourself using the selected option(s).
  let currentDisplayValue = useMemo(() => {
    if (typeof displayValue === 'function' && data.value !== undefined) {
      return displayValue(data.value as TType) ?? ''
    } else if (typeof data.value === 'string') {
      return data.value
    } else {
      return ''
    }
  }, [data.value, displayValue])

  // Syncing the input value has some rules attached to it to guarantee a smooth and expected user
  // experience:
  //
  // - When a user is not typing in the input field, it is safe to update the input value based on
  //   the selected option(s). See `currentDisplayValue` computation from above.
  // - The value can be updated when:
  //   - The `value` is set from outside of the component
  //   - The `value` is set when the user uses their keyboard (confirm via enter or space)
  //   - The `value` is set when the user clicks on a value to select it
  // - The value will be reset to the current selected option(s), when:
  //   - The user is _not_ typing (otherwise you will loose your current state / query)
  //   - The user cancels the current changes:
  //     - By pressing `escape`
  //     - By clicking `outside` of the Combobox
  useWatch(
    ([currentDisplayValue, state], [oldCurrentDisplayValue, oldState]) => {
      // When the user is typing, we want to not touch the `input` at all. Especially when they are
      // using an IME, we don't want to mess with the input at all.
      if (machine.state.isTyping) return

      let input = internalInputRef.current
      if (!input) return

      if (oldState === ComboboxState.Open && state === ComboboxState.Closed) {
        input.value = currentDisplayValue
      } else if (currentDisplayValue !== oldCurrentDisplayValue) {
        input.value = currentDisplayValue
      }

      // Once we synced the input value, we want to make sure the cursor is at the end of the input
      // field. This makes it easier to continue typing and append to the query. We will bail out if
      // the user is currently typing, because we don't want to mess with the cursor position while
      // typing.
      requestAnimationFrame(() => {
        if (machine.state.isTyping) return
        if (!input) return

        // Bail when the input is not the currently focused element. When it is not the focused
        // element, and we call the `setSelectionRange`, then it will become the focused
        // element which may be unwanted.
        if (ownerDocument?.activeElement !== input) return

        let { selectionStart, selectionEnd } = input

        // A custom selection is used, no need to move the caret
        if (Math.abs((selectionEnd ?? 0) - (selectionStart ?? 0)) !== 0) return

        // A custom caret position is used, no need to move the caret
        if (selectionStart !== 0) return

        // Move the caret to the end
        input.setSelectionRange(input.value.length, input.value.length)
      })
    },
    [currentDisplayValue, comboboxState, ownerDocument, isTyping]
  )

  // Trick VoiceOver in behaving a little bit better. Manually "resetting" the input makes VoiceOver
  // a bit more happy and doesn't require some changes manually first before announcing items
  // correctly. This is a bit of a hacks, but it is a workaround for a VoiceOver bug.
  //
  // TODO: VoiceOver is still relatively buggy if you start VoiceOver while the Combobox is already
  // in an open state.
  useWatch(
    ([newState], [oldState]) => {
      if (newState === ComboboxState.Open && oldState === ComboboxState.Closed) {
        // When the user is typing, we want to not touch the `input` at all. Especially when they are
        // using an IME, we don't want to mess with the input at all.
        if (machine.state.isTyping) return

        let input = internalInputRef.current
        if (!input) return

        // Capture current state
        let currentValue = input.value
        let { selectionStart, selectionEnd, selectionDirection } = input

        // Trick VoiceOver into announcing the value
        input.value = ''

        // Rollback to original state
        input.value = currentValue
        if (selectionDirection !== null) {
          input.setSelectionRange(selectionStart, selectionEnd, selectionDirection)
        } else {
          input.setSelectionRange(selectionStart, selectionEnd)
        }
      }
    },
    [comboboxState]
  )

  let isComposing = useRef(false)
  let handleCompositionStart = useEvent(() => {
    isComposing.current = true
  })
  let handleCompositionEnd = useEvent(() => {
    d.nextFrame(() => {
      isComposing.current = false
    })
  })

  let handleKeyDown = useEvent((event: ReactKeyboardEvent<HTMLInputElement>) => {
    machine.actions.setIsTyping(true)

    switch (event.key) {
      // Ref: https://www.w3.org/WAI/ARIA/apg/patterns/menu/#keyboard-interaction-12

      case Keys.Enter:
        if (machine.state.comboboxState !== ComboboxState.Open) return

        // When the user is still in the middle of composing by using an IME, then we don't want to
        // submit this value and close the Combobox yet. Instead, we will fallback to the default
        // behavior which is to "end" the composition.
        if (isComposing.current) return

        event.preventDefault()
        event.stopPropagation()

        if (machine.selectors.activeOptionIndex(machine.state) === null) {
          machine.actions.closeCombobox()
          return
        }

        machine.actions.selectActiveOption()
        if (data.mode === ValueMode.Single) {
          machine.actions.closeCombobox()
        }
        break

      case Keys.ArrowDown:
        event.preventDefault()
        event.stopPropagation()

        return match(machine.state.comboboxState, {
          [ComboboxState.Open]: () => machine.actions.goToOption({ focus: Focus.Next }),
          [ComboboxState.Closed]: () => machine.actions.openCombobox(),
        })

      case Keys.ArrowUp:
        event.preventDefault()
        event.stopPropagation()
        return match(machine.state.comboboxState, {
          [ComboboxState.Open]: () => machine.actions.goToOption({ focus: Focus.Previous }),
          [ComboboxState.Closed]: () => {
            flushSync(() => machine.actions.openCombobox())
            if (!data.value) machine.actions.goToOption({ focus: Focus.Last })
          },
        })

      case Keys.Home:
        if (event.shiftKey) {
          break
        }

        event.preventDefault()
        event.stopPropagation()
        return machine.actions.goToOption({ focus: Focus.First })

      case Keys.PageUp:
        event.preventDefault()
        event.stopPropagation()
        return machine.actions.goToOption({ focus: Focus.First })

      case Keys.End:
        if (event.shiftKey) {
          break
        }

        event.preventDefault()
        event.stopPropagation()
        return machine.actions.goToOption({ focus: Focus.Last })

      case Keys.PageDown:
        event.preventDefault()
        event.stopPropagation()
        return machine.actions.goToOption({ focus: Focus.Last })

      case Keys.Escape:
        if (machine.state.comboboxState !== ComboboxState.Open) return
        event.preventDefault()
        if (machine.state.optionsElement && !data.optionsPropsRef.current.static) {
          event.stopPropagation()
        }

        if (data.mode === ValueMode.Single) {
          // We want to clear the value when the user presses escape if and only if the current
          // value is not set (aka, they didn't select anything yet, or they cleared the input which
          // caused the value to be set to `null`). If the current value is set, then we want to
          // fallback to that value when we press escape (this part is handled in the watcher that
          // syncs the value with the input field again).
          if (data.value === null) {
            clear()
          }
        }

        return machine.actions.closeCombobox()

      case Keys.Tab:
        if (machine.state.comboboxState !== ComboboxState.Open) return
        if (
          data.mode === ValueMode.Single &&
          machine.state.activationTrigger !== ActivationTrigger.Focus
        ) {
          machine.actions.selectActiveOption()
        }
        machine.actions.closeCombobox()
        break
    }
  })

  let handleChange = useEvent((event: React.ChangeEvent<HTMLInputElement>) => {
    // Always call the onChange listener even if the user is still typing using an IME (Input Method
    // Editor).
    //
    // The main issue is Android, where typing always uses the IME APIs. Just waiting until the
    // compositionend event is fired to trigger an onChange is not enough, because then filtering
    // options while typing won't work at all because we are still in "composing" mode.
    onChange?.(event)

    // When the value becomes empty in a single value mode then we want to clear
    // the option entirely.
    //
    // This is can happen when you press backspace, but also when you select all the text and press
    // ctrl/cmd+x.
    if (data.mode === ValueMode.Single && event.target.value === '') {
      clear()
    }

    // Open the combobox to show the results based on what the user has typed
    machine.actions.openCombobox()
  })

  let handleBlur = useEvent((event: ReactFocusEvent) => {
    let relatedTarget =
      (event.relatedTarget as HTMLElement) ?? history.find((x) => x !== event.currentTarget)

    // Focus is moved into the list, we don't want to close yet.
    if (machine.state.optionsElement?.contains(relatedTarget)) return

    // Focus is moved to the button, we don't want to close yet.
    if (machine.state.buttonElement?.contains(relatedTarget)) return

    // Focus is moved, but the combobox is not open. This can mean two things:
    //
    // 1. The combobox was never opened, so we don't have to do anything.
    // 2. The combobox was closed and focus was moved already. At that point we
    //    don't need to try and select the active option.
    if (machine.state.comboboxState !== ComboboxState.Open) return

    event.preventDefault()

    // We want to clear the value when the user presses escape or clicks outside
    // the combobox if and only if the current value is not set (aka, they
    // didn't select anything yet, or they cleared the input which caused the
    // value to be set to `null`). If the current value is set, then we want to
    // fallback to that value when we press escape (this part is handled in the
    // watcher that syncs the value with the input field again).
    if (data.mode === ValueMode.Single && data.value === null) {
      clear()
    }

    return machine.actions.closeCombobox()
  })

  let handleFocus = useEvent((event: ReactFocusEvent) => {
    let relatedTarget =
      (event.relatedTarget as HTMLElement) ?? history.find((x) => x !== event.currentTarget)
    if (machine.state.buttonElement?.contains(relatedTarget)) return
    if (machine.state.optionsElement?.contains(relatedTarget)) return
    if (data.disabled) return

    if (!data.immediate) return
    if (machine.state.comboboxState === ComboboxState.Open) return

    // In a scenario where you have this setup:
    //
    // ```ts
    // {condition && (
    //   <Combobox immediate>
    //     <ComboboxInput autoFocus />
    //   </Combobox>
    // )}
    // ```
    //
    // Then we will trigger the `openCombobox` in a `flushSync`, but we are
    // already in the middle of rendering. This will result in the following
    // warning:
    //
    // ```
    // Warning: flushSync was called from inside a lifecycle method. React
    // cannot flush when React is already rendering. Consider moving this call
    // to a scheduler task or micro task.
    // ```
    //
    // Which is why we wrap this in a `microTask` to make sure we are not in the
    // middle of rendering.
    d.microTask(() => {
      flushSync(() => machine.actions.openCombobox())

      // We need to make sure that tabbing through a form doesn't result in
      // incorrectly setting the value of the combobox. We will set the
      // activation trigger to `Focus`, and we will ignore selecting the active
      // option when the user tabs away.
      machine.actions.setActivationTrigger(ActivationTrigger.Focus)
    })
  })

  let labelledBy = useLabelledBy()
  let describedBy = useDescribedBy()

  let { isFocused: focus, focusProps } = useFocusRing({ autoFocus })
  let { isHovered: hover, hoverProps } = useHover({ isDisabled: disabled })

  let optionsElement = useSlice(machine, (state) => state.optionsElement)

  let slot = useMemo(() => {
    return {
      open: comboboxState === ComboboxState.Open,
      disabled,
      invalid: data.invalid,
      hover,
      focus,
      autofocus: autoFocus,
    } satisfies InputRenderPropArg
  }, [data, hover, focus, autoFocus, disabled, data.invalid])

  let ourProps = mergeProps(
    {
      ref: inputRef,
      id,
      role: 'combobox',
      type,
      'aria-controls': optionsElement?.id,
      'aria-expanded': comboboxState === ComboboxState.Open,
      'aria-activedescendant': useSlice(machine, machine.selectors.activeDescendantId),
      'aria-labelledby': labelledBy,
      'aria-describedby': describedBy,
      'aria-autocomplete': 'list',
      defaultValue:
        props.defaultValue ??
        (data.defaultValue !== undefined ? displayValue?.(data.defaultValue as TType) : null) ??
        data.defaultValue,
      disabled: disabled || undefined,
      autoFocus,
      onCompositionStart: handleCompositionStart,
      onCompositionEnd: handleCompositionEnd,
      onKeyDown: handleKeyDown,
      onChange: handleChange,
      onFocus: handleFocus,
      onBlur: handleBlur,
    },
    focusProps,
    hoverProps
  )

  let render = useRender()

  return render({
    ourProps,
    theirProps,
    slot,
    defaultTag: DEFAULT_INPUT_TAG,
    name: 'Combobox.Input',
  })
}

// ---

let DEFAULT_BUTTON_TAG = 'button' as const
type ButtonRenderPropArg = {
  open: boolean
  active: boolean
  disabled: boolean
  invalid: boolean
  value: any
  focus: boolean
  hover: boolean
}
type ButtonPropsWeControl =
  | 'aria-controls'
  | 'aria-expanded'
  | 'aria-haspopup'
  | 'aria-labelledby'
  | 'disabled'
  | 'tabIndex'

export type ComboboxButtonProps<TTag extends ElementType = typeof DEFAULT_BUTTON_TAG> = Props<
  TTag,
  ButtonRenderPropArg,
  ButtonPropsWeControl,
  {
    autoFocus?: boolean
    disabled?: boolean
  }
>

function ButtonFn<TTag extends ElementType = typeof DEFAULT_BUTTON_TAG>(
  props: ComboboxButtonProps<TTag>,
  ref: Ref<HTMLButtonElement>
) {
  let machine = useComboboxMachineContext('Combobox.Button')
  let data = useData('Combobox.Button')
  let [localButtonElement, setLocalButtonElement] = useState<HTMLButtonElement | null>(null)
  let buttonRef = useSyncRefs(ref, setLocalButtonElement, machine.actions.setButtonElement)

  let internalId = useId()
  let {
    id = `headlessui-combobox-button-${internalId}`,
    disabled = data.disabled || false,
    autoFocus = false,
    ...theirProps
  } = props

  let [comboboxState, inputElement, optionsElement] = useSlice(machine, (state) => [
    state.comboboxState,
    state.inputElement,
    state.optionsElement,
  ])
  let refocusInput = useRefocusableInput(inputElement)

  let enableQuickRelease = comboboxState === ComboboxState.Open
  useQuickRelease(enableQuickRelease, {
    trigger: localButtonElement,
    action: useCallback(
      (e) => {
        if (localButtonElement?.contains(e.target)) {
          return QuickReleaseAction.Ignore
        }

        if (inputElement?.contains(e.target)) {
          return QuickReleaseAction.Ignore
        }

        let option = e.target.closest('[role="option"]:not([data-disabled])')
        if (DOM.isHTMLElement(option)) {
          return QuickReleaseAction.Select(option)
        }

        if (optionsElement?.contains(e.target)) {
          return QuickReleaseAction.Ignore
        }

        return QuickReleaseAction.Close
      },
      [localButtonElement, inputElement, optionsElement]
    ),
    close: machine.actions.closeCombobox,
    select: machine.actions.selectActiveOption,
  })

  let handleKeyDown = useEvent((event: ReactKeyboardEvent<HTMLElement>) => {
    switch (event.key) {
      // Ref: https://www.w3.org/WAI/ARIA/apg/patterns/menu/#keyboard-interaction-12

      case Keys.Space:
      case Keys.Enter:
        event.preventDefault()
        event.stopPropagation()
        if (machine.state.comboboxState === ComboboxState.Closed) {
          flushSync(() => machine.actions.openCombobox())
        }
        refocusInput()
        return

      case Keys.ArrowDown:
        event.preventDefault()
        event.stopPropagation()
        if (machine.state.comboboxState === ComboboxState.Closed) {
          flushSync(() => machine.actions.openCombobox())
          if (!machine.state.dataRef.current.value)
            machine.actions.goToOption({ focus: Focus.First })
        }
        refocusInput()
        return

      case Keys.ArrowUp:
        event.preventDefault()
        event.stopPropagation()
        if (machine.state.comboboxState === ComboboxState.Closed) {
          flushSync(() => machine.actions.openCombobox())
          if (!machine.state.dataRef.current.value) {
            machine.actions.goToOption({ focus: Focus.Last })
          }
        }
        refocusInput()
        return

      case Keys.Escape:
        if (machine.state.comboboxState !== ComboboxState.Open) return
        event.preventDefault()
        if (machine.state.optionsElement && !data.optionsPropsRef.current.static) {
          event.stopPropagation()
        }
        flushSync(() => machine.actions.closeCombobox())
        refocusInput()
        return

      default:
        return
    }
  })

  let handlePointerDown = useEvent((event: ReactPointerEvent<HTMLButtonElement>) => {
    // We use the `pointerdown` event here since it fires before the focus
    // event, allowing us to cancel the event before focus is moved from the
    // `ComboboxInput` to the `ComboboxButton`. This keeps the input focused,
    // preserving the cursor position and any text selection.
    event.preventDefault()

    if (isDisabledReactIssue7711(event.currentTarget)) return

    // Since we're using the `mousedown` event instead of a `click` event here
    // to preserve the focus of the `ComboboxInput`, we need to also check
    // that the `left` mouse button was clicked.
    if (event.button === MouseButton.Left) {
      if (machine.state.comboboxState === ComboboxState.Open) {
        machine.actions.closeCombobox()
      } else {
        machine.actions.openCombobox()
      }
    }

    // Ensure we focus the input
    refocusInput()
  })

  let labelledBy = useLabelledBy([id])

  let { isFocusVisible: focus, focusProps } = useFocusRing({ autoFocus })
  let { isHovered: hover, hoverProps } = useHover({ isDisabled: disabled })
  let { pressed: active, pressProps } = useActivePress({ disabled })

  let slot = useMemo(() => {
    return {
      open: comboboxState === ComboboxState.Open,
      active: active || comboboxState === ComboboxState.Open,
      disabled,
      invalid: data.invalid,
      value: data.value,
      hover,
      focus,
    } satisfies ButtonRenderPropArg
  }, [data, hover, focus, active, disabled, comboboxState])
  let ourProps = mergeProps(
    {
      ref: buttonRef,
      id,
      type: useResolveButtonType(props, localButtonElement),
      tabIndex: -1,
      'aria-haspopup': 'listbox',
      'aria-controls': optionsElement?.id,
      'aria-expanded': comboboxState === ComboboxState.Open,
      'aria-labelledby': labelledBy,
      disabled: disabled || undefined,
      autoFocus,
      onPointerDown: handlePointerDown,
      onKeyDown: handleKeyDown,
    },
    focusProps,
    hoverProps,
    pressProps
  )

  let render = useRender()

  return render({
    ourProps,
    theirProps,
    slot,
    defaultTag: DEFAULT_BUTTON_TAG,
    name: 'Combobox.Button',
  })
}

// ---

let DEFAULT_OPTIONS_TAG = 'div' as const
type OptionsRenderPropArg = {
  open: boolean
  option: any
}
type OptionsPropsWeControl = 'aria-labelledby' | 'aria-multiselectable' | 'role' | 'tabIndex'

let OptionsRenderFeatures = RenderFeatures.RenderStrategy | RenderFeatures.Static

export type ComboboxOptionsProps<TTag extends ElementType = typeof DEFAULT_OPTIONS_TAG> = Props<
  TTag,
  OptionsRenderPropArg,
  OptionsPropsWeControl,
  PropsForFeatures<typeof OptionsRenderFeatures> & {
    hold?: boolean
    anchor?: AnchorProps
    portal?: boolean
    modal?: boolean
    transition?: boolean
  }
>

function OptionsFn<TTag extends ElementType = typeof DEFAULT_OPTIONS_TAG>(
  props: ComboboxOptionsProps<TTag>,
  ref: Ref<HTMLElement>
) {
  let internalId = useId()
  let {
    id = `headlessui-combobox-options-${internalId}`,
    hold = false,
    anchor: rawAnchor,
    portal = false,
    modal = true,
    transition = false,
    ...theirProps
  } = props
  let machine = useComboboxMachineContext('Combobox.Options')
  let data = useData('Combobox.Options')
  let anchor = useResolvedAnchor(rawAnchor)

  // Always enable `portal` functionality, when `anchor` is enabled
  if (anchor) {
    portal = true
  }

  let [floatingRef, style] = useFloatingPanel(anchor)

  // To improve the correctness of transitions (timing related race conditions),
  // we track the element locally to this component, instead of relying on the
  // context value. This way, the component can re-render independently of the
  // parent component when the `useTransition(…)` hook performs a state change.
  let [localOptionsElement, setLocalOptionsElement] = useState<HTMLElement | null>(null)

  let getFloatingPanelProps = useFloatingPanelProps()
  let optionsRef = useSyncRefs(
    ref,
    anchor ? floatingRef : null,
    machine.actions.setOptionsElement,
    setLocalOptionsElement
  )
  let [comboboxState, inputElement, buttonElement, optionsElement, activationTrigger] = useSlice(
    machine,
    (state) => [
      state.comboboxState,
      state.inputElement,
      state.buttonElement,
      state.optionsElement,
      state.activationTrigger,
    ]
  )
  let portalOwnerDocument = useOwnerDocument(inputElement || buttonElement)
  let ownerDocument = useOwnerDocument(optionsElement)

  let usesOpenClosedState = useOpenClosed()
  let [visible, transitionData] = useTransition(
    transition,
    localOptionsElement,
    usesOpenClosedState !== null
      ? (usesOpenClosedState & State.Open) === State.Open
      : comboboxState === ComboboxState.Open
  )

  // Ensure we close the combobox as soon as the input becomes hidden
  useOnDisappear(visible, inputElement, machine.actions.closeCombobox)

  // Enable scroll locking when the combobox is visible, and `modal` is enabled
  let scrollLockEnabled = data.__demoMode ? false : modal && comboboxState === ComboboxState.Open
  useScrollLock(scrollLockEnabled, ownerDocument)

  // Mark other elements as inert when the combobox is visible, and `modal` is enabled
  let inertOthersEnabled = data.__demoMode ? false : modal && comboboxState === ComboboxState.Open
  useInertOthers(inertOthersEnabled, {
    allowed: useCallback(
      () => [inputElement, buttonElement, optionsElement],
      [inputElement, buttonElement, optionsElement]
    ),
  })

  useIsoMorphicEffect(() => {
    data.optionsPropsRef.current.static = props.static ?? false
  }, [data.optionsPropsRef, props.static])
  useIsoMorphicEffect(() => {
    data.optionsPropsRef.current.hold = hold
  }, [data.optionsPropsRef, hold])

  useTreeWalker(comboboxState === ComboboxState.Open, {
    container: optionsElement,
    accept(node) {
      if (node.getAttribute('role') === 'option') return NodeFilter.FILTER_REJECT
      if (node.hasAttribute('role')) return NodeFilter.FILTER_SKIP
      return NodeFilter.FILTER_ACCEPT
    },
    walk(node) {
      node.setAttribute('role', 'none')
    },
  })

  let labelledBy = useLabelledBy([buttonElement?.id])

  let slot = useMemo(() => {
    return {
      open: comboboxState === ComboboxState.Open,
      option: undefined,
    } satisfies OptionsRenderPropArg
  }, [comboboxState])

  // When the user scrolls **using the mouse** (so scroll event isn't appropriate)
  // we want to make sure that the current activation trigger is set to pointer.
  let handleWheel = useEvent(() => {
    machine.actions.setActivationTrigger(ActivationTrigger.Pointer)
  })

  let handleMouseDown = useEvent((event: ReactMouseEvent) => {
    // When clicking inside of the scrollbar, a `click` event will be triggered
    // on the focusable element _below_ the scrollbar. If you use a `<Combobox>`
    // inside of a `<Dialog>`, clicking the scrollbar of the `<ComboboxOptions>`
    // will move focus to the `<Dialog>` which blurs the `<ComboboxInput>` and
    // closes the `<Combobox>`.
    //
    // Preventing the default behavior in the `mousedown` event (which happens
    // before `click`) will prevent this issue because the `click` never fires.
    event.preventDefault()

    // When the user clicks in the `<Options/>`, we want to make sure that we
    // set the activation trigger to `pointer` to prevent auto scrolling to the
    // active option while the user is scrolling.
    machine.actions.setActivationTrigger(ActivationTrigger.Pointer)
  })

  let ourProps = mergeProps(anchor ? getFloatingPanelProps() : {}, {
    'aria-labelledby': labelledBy,
    role: 'listbox',
    'aria-multiselectable': data.mode === ValueMode.Multi ? true : undefined,
    id,
    ref: optionsRef,
    style: {
      ...theirProps.style,
      ...style,
      '--input-width': useElementSize(inputElement, true).width,
      '--button-width': useElementSize(buttonElement, true).width,
    } as CSSProperties,
    onWheel: activationTrigger === ActivationTrigger.Pointer ? undefined : handleWheel,
    onMouseDown: handleMouseDown,
    ...transitionDataAttributes(transitionData),
  })

  // We should freeze when the combobox is visible but "closed". This means that
  // a transition is currently happening and the component is still visible (for
  // the transition) but closed from a functionality perspective.
  let shouldFreeze = visible && comboboxState === ComboboxState.Closed

  let options = useFrozenData(shouldFreeze, data.virtual?.options)

  // Frozen state, the selected value will only update visually when the user re-opens the <Combobox />
  let frozenValue = useFrozenData(shouldFreeze, data.value)

  let isSelected = useEvent((compareValue) => data.compare(frozenValue, compareValue))

  // Map the children in a scrollable container when virtualization is enabled
  let newDataContextValue = useMemo(() => {
    if (!data.virtual) return data
    if (options === undefined) throw new Error('Missing `options` in virtual mode')

    return options !== data.virtual.options
      ? { ...data, virtual: { ...data.virtual, options } }
      : data
  }, [data, options, data.virtual?.options])

  if (data.virtual) {
    Object.assign(theirProps, {
      children: (
        <ComboboxDataContext.Provider value={newDataContextValue}>
          {/* @ts-expect-error The `children` prop now is a callback function that receives `{option}` */}
          <VirtualProvider slot={slot}>{theirProps.children}</VirtualProvider>
        </ComboboxDataContext.Provider>
      ),
    })
  }

  let render = useRender()

  let newData = useMemo(() => {
    return data.mode === ValueMode.Multi ? data : { ...data, isSelected }
  }, [data, isSelected])

  return (
    <Portal enabled={portal ? props.static || visible : false} ownerDocument={portalOwnerDocument}>
      <ComboboxDataContext.Provider value={newData}>
        {render({
          ourProps,
          theirProps: {
            ...theirProps,
            children: (
              <Frozen freeze={shouldFreeze}>
                {typeof theirProps.children === 'function'
                  ? theirProps.children?.(slot)
                  : theirProps.children}
              </Frozen>
            ),
          },
          slot,
          defaultTag: DEFAULT_OPTIONS_TAG,
          features: OptionsRenderFeatures,
          visible,
          name: 'Combobox.Options',
        })}
      </ComboboxDataContext.Provider>
    </Portal>
  )
}

// ---

let DEFAULT_OPTION_TAG = 'div' as const
type OptionRenderPropArg = {
  focus: boolean
  /** @deprecated use `focus` instead */
  active: boolean
  selected: boolean
  disabled: boolean
}
type OptionPropsWeControl = 'role' | 'tabIndex' | 'aria-disabled' | 'aria-selected'

export type ComboboxOptionProps<
  TTag extends ElementType = typeof DEFAULT_OPTION_TAG,
  TType = string,
> = Props<
  TTag,
  OptionRenderPropArg,
  OptionPropsWeControl,
  {
    disabled?: boolean
    value: TType
    order?: number
  }
>

function OptionFn<
  TTag extends ElementType = typeof DEFAULT_OPTION_TAG,
  // TODO: One day we will be able to infer this type from the generic in Combobox itself.
  // But today is not that day..
  TType = Parameters<typeof ComboboxRoot>[0]['value'],
>(props: ComboboxOptionProps<TTag, TType>, ref: Ref<HTMLElement>) {
  let data = useData('Combobox.Option')
  let machine = useComboboxMachineContext('Combobox.Option')

  let internalId = useId()
  let {
    id = `headlessui-combobox-option-${internalId}`,
    value,
    disabled = data.virtual?.disabled?.(value) ?? false,
    order = null,
    ...theirProps
  } = props

  let [inputElement] = useSlice(machine, (state) => [state.inputElement])

  let refocusInput = useRefocusableInput(inputElement)

  let active = useSlice(
    machine,
    useCallback((state) => machine.selectors.isActive(state, value, id), [value, id])
  )
  let selected = data.isSelected(value)
  let internalOptionRef = useRef<HTMLElement | null>(null)

  let bag = useLatestValue<ComboboxOptionDataRef<TType>['current']>({
    disabled,
    value,
    domRef: internalOptionRef,
    order,
  })

  let virtualizer = useContext(VirtualContext)
  let optionRef = useSyncRefs(
    ref,
    internalOptionRef,
    virtualizer ? virtualizer.measureElement : null
  )

  let select = useEvent(() => {
    machine.actions.setIsTyping(false)
    machine.actions.onChange(value)
  })
  useIsoMorphicEffect(() => machine.actions.registerOption(id, bag), [bag, id])

  let shouldScrollIntoView = useSlice(
    machine,
    useCallback((state) => machine.selectors.shouldScrollIntoView(state, value, id), [value, id])
  )

  useIsoMorphicEffect(() => {
    if (!shouldScrollIntoView) return
    return disposables().requestAnimationFrame(() => {
      internalOptionRef.current?.scrollIntoView?.({ block: 'nearest' })
    })
  }, [shouldScrollIntoView, internalOptionRef])

  let handleMouseDown = useEvent((event: ReactMouseEvent<HTMLButtonElement>) => {
    // We use the `mousedown` event here since it fires before the focus event,
    // allowing us to cancel the event before focus is moved from the
    // `ComboboxInput` to the `ComboboxOption`. This keeps the input focused,
    // preserving the cursor position and any text selection.
    event.preventDefault()

    // Since we're using the `mousedown` event instead of a `click` event here
    // to preserve the focus of the `ComboboxInput`, we need to also check
    // that the `left` mouse button was clicked.
    if (event.button !== MouseButton.Left) {
      return
    }

    if (disabled) return
    select()

    // We want to make sure that we don't accidentally trigger the virtual keyboard.
    //
    // This would happen if the input is focused, the options are open, you select an option (which
    // would blur the input, and focus the option (button), then we re-focus the input).
    //
    // This would be annoying on mobile (or on devices with a virtual keyboard). Right now we are
    // assuming that the virtual keyboard would open on mobile devices (iOS / Android). This
    // assumption is not perfect, but will work in the majority of the cases.
    //
    // Ideally we can have a better check where we can explicitly check for the virtual keyboard.
    // But right now this is still an experimental feature:
    // https://developer.mozilla.org/en-US/docs/Web/API/Navigator/virtualKeyboard
    if (!isMobile()) {
      requestAnimationFrame(() => refocusInput())
    }

    if (data.mode === ValueMode.Single) {
      machine.actions.closeCombobox()
    }
  })

  let handleFocus = useEvent(() => {
    if (disabled) {
      return machine.actions.goToOption({ focus: Focus.Nothing })
    }
    let idx = data.calculateIndex(value)
    machine.actions.goToOption({ focus: Focus.Specific, idx })
  })

  let pointer = useTrackedPointer()

  let handleEnter = useEvent((evt) => pointer.update(evt))

  let handleMove = useEvent((evt) => {
    if (!pointer.wasMoved(evt)) return
    if (disabled) return
    if (active) return
    let idx = data.calculateIndex(value)
    machine.actions.goToOption({ focus: Focus.Specific, idx }, ActivationTrigger.Pointer)
  })

  let handleLeave = useEvent((evt) => {
    if (!pointer.wasMoved(evt)) return
    if (disabled) return
    if (!active) return
    if (data.optionsPropsRef.current.hold) return
    machine.actions.goToOption({ focus: Focus.Nothing })
  })

  let slot = useMemo(() => {
    return {
      active,
      focus: active,
      selected,
      disabled,
    } satisfies OptionRenderPropArg
  }, [active, selected, disabled])

  let ourProps = {
    id,
    ref: optionRef,
    role: 'option',
    tabIndex: disabled === true ? undefined : -1,
    'aria-disabled': disabled === true ? true : undefined,
    // According to the WAI-ARIA best practices, we should use aria-checked for
    // multi-select,but Voice-Over disagrees. So we use aria-checked instead for
    // both single and multi-select.
    'aria-selected': selected,
    disabled: undefined, // Never forward the `disabled` prop
    onMouseDown: handleMouseDown,
    onFocus: handleFocus,
    onPointerEnter: handleEnter,
    onMouseEnter: handleEnter,
    onPointerMove: handleMove,
    onMouseMove: handleMove,
    onPointerLeave: handleLeave,
    onMouseLeave: handleLeave,
  }

  let render = useRender()

  return render({
    ourProps,
    theirProps,
    slot,
    defaultTag: DEFAULT_OPTION_TAG,
    name: 'Combobox.Option',
  })
}

// ---

export interface _internal_ComponentCombobox extends HasDisplayName {
  <
    TValue,
    TMultiple extends boolean | undefined = false,
    TTag extends ElementType = typeof DEFAULT_COMBOBOX_TAG,
  >(
    props: ComboboxProps<TValue, TMultiple, TTag> & RefProp<typeof ComboboxFn>
  ): React.JSX.Element
}

export interface _internal_ComponentComboboxButton extends HasDisplayName {
  <TTag extends ElementType = typeof DEFAULT_BUTTON_TAG>(
    props: ComboboxButtonProps<TTag> & RefProp<typeof ButtonFn>
  ): React.JSX.Element
}

export interface _internal_ComponentComboboxInput extends HasDisplayName {
  <TType, TTag extends ElementType = typeof DEFAULT_INPUT_TAG>(
    props: ComboboxInputProps<TTag, TType> & RefProp<typeof InputFn>
  ): React.JSX.Element
}

export interface _internal_ComponentComboboxLabel extends _internal_ComponentLabel {}

export interface _internal_ComponentComboboxOptions extends HasDisplayName {
  <TTag extends ElementType = typeof DEFAULT_OPTIONS_TAG>(
    props: ComboboxOptionsProps<TTag> & RefProp<typeof OptionsFn>
  ): React.JSX.Element
}

export interface _internal_ComponentComboboxOption extends HasDisplayName {
  <
    TTag extends ElementType = typeof DEFAULT_OPTION_TAG,
    TType = Parameters<typeof ComboboxRoot>[0]['value'],
  >(
    props: ComboboxOptionProps<TTag, TType> & RefProp<typeof OptionFn>
  ): React.JSX.Element
}

let ComboboxRoot = forwardRefWithAs(ComboboxFn) as _internal_ComponentCombobox
export let ComboboxButton = forwardRefWithAs(ButtonFn) as _internal_ComponentComboboxButton
export let ComboboxInput = forwardRefWithAs(InputFn) as _internal_ComponentComboboxInput
/** @deprecated use `<Label>` instead of `<ComboboxLabel>` */
export let ComboboxLabel = Label as _internal_ComponentComboboxLabel
export let ComboboxOptions = forwardRefWithAs(OptionsFn) as _internal_ComponentComboboxOptions
export let ComboboxOption = forwardRefWithAs(OptionFn) as _internal_ComponentComboboxOption

export let Combobox = Object.assign(ComboboxRoot, {
  /** @deprecated use `<ComboboxInput>` instead of `<Combobox.Input>` */
  Input: ComboboxInput,
  /** @deprecated use `<ComboboxButton>` instead of `<Combobox.Button>` */
  Button: ComboboxButton,
  /** @deprecated use `<Label>` instead of `<Combobox.Label>` */
  Label: ComboboxLabel,
  /** @deprecated use `<ComboboxOptions>` instead of `<Combobox.Options>` */
  Options: ComboboxOptions,
  /** @deprecated use `<ComboboxOption>` instead of `<Combobox.Option>` */
  Option: ComboboxOption,
})
