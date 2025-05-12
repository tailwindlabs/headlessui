'use client'

import { useFocusRing } from '@react-aria/focus'
import { useHover } from '@react-aria/interactions'
import React, {
  Fragment,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ElementType,
  type MutableRefObject,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  type Ref,
} from 'react'
import { flushSync } from 'react-dom'
import { useActivePress } from '../../hooks/use-active-press'
import { useByComparator, type ByComparator } from '../../hooks/use-by-comparator'
import { useControllable } from '../../hooks/use-controllable'
import { useDefaultValue } from '../../hooks/use-default-value'
import { useDidElementMove } from '../../hooks/use-did-element-move'
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
import { useResolveButtonType } from '../../hooks/use-resolve-button-type'
import { useScrollLock } from '../../hooks/use-scroll-lock'
import { useSyncRefs } from '../../hooks/use-sync-refs'
import { useTextValue } from '../../hooks/use-text-value'
import { useTrackedPointer } from '../../hooks/use-tracked-pointer'
import { transitionDataAttributes, useTransition } from '../../hooks/use-transition'
import { useDisabled } from '../../internal/disabled'
import {
  FloatingProvider,
  useFloatingPanel,
  useFloatingPanelProps,
  useFloatingReference,
  useFloatingReferenceProps,
  useResolvedAnchor,
  type AnchorPropsWithSelection,
} from '../../internal/floating'
import { FormFields } from '../../internal/form-fields'
import { useFrozenData } from '../../internal/frozen'
import { useProvidedId } from '../../internal/id'
import { OpenClosedProvider, State, useOpenClosed } from '../../internal/open-closed'
import { stackMachines } from '../../machines/stack-machine'
import { useSlice } from '../../react-glue'
import type { EnsureArray, Props } from '../../types'
import { isDisabledReactIssue7711 } from '../../utils/bugs'
import { Focus } from '../../utils/calculate-active-index'
import { disposables } from '../../utils/disposables'
import * as DOM from '../../utils/dom'
import {
  Focus as FocusManagementFocus,
  FocusableMode,
  focusFrom,
  isFocusableElement,
} from '../../utils/focus-management'
import { attemptSubmit } from '../../utils/form'
import { match } from '../../utils/match'
import { getOwnerDocument } from '../../utils/owner'
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
import { Portal } from '../portal/portal'
import { ActionTypes, ActivationTrigger, ListboxStates, ValueMode } from './listbox-machine'
import { ListboxContext, useListboxMachine, useListboxMachineContext } from './listbox-machine-glue'

type ListboxOptionDataRef<T> = MutableRefObject<{
  textValue?: string
  disabled: boolean
  value: T
  domRef: MutableRefObject<HTMLElement | null>
}>

let ListboxDataContext = createContext<{
  value: unknown
  disabled: boolean
  invalid: boolean
  mode: ValueMode
  orientation: 'horizontal' | 'vertical'
  onChange(value: unknown): void
  compare(a: unknown, z: unknown): boolean
  isSelected(value: unknown): boolean

  optionsPropsRef: MutableRefObject<{
    static: boolean
    hold: boolean
  }>

  listRef: MutableRefObject<Map<string, HTMLElement | null>>
} | null>(null)
ListboxDataContext.displayName = 'ListboxDataContext'

function useData(component: string) {
  let context = useContext(ListboxDataContext)
  if (context === null) {
    let err = new Error(`<${component} /> is missing a parent <Listbox /> component.`)
    if (Error.captureStackTrace) Error.captureStackTrace(err, useData)
    throw err
  }
  return context
}
type _Data = ReturnType<typeof useData>

// ---

let DEFAULT_LISTBOX_TAG = Fragment
type ListboxRenderPropArg<T> = {
  open: boolean
  disabled: boolean
  invalid: boolean
  value: T
}

export type ListboxProps<
  TTag extends ElementType = typeof DEFAULT_LISTBOX_TAG,
  TType = string,
  TActualType = TType,
> = Props<
  TTag,
  ListboxRenderPropArg<TType>,
  'value' | 'defaultValue' | 'onChange' | 'by' | 'disabled' | 'horizontal' | 'name' | 'multiple',
  {
    value?: TType
    defaultValue?: TType
    onChange?(value: TType): void
    by?: ByComparator<TActualType>
    disabled?: boolean
    invalid?: boolean
    horizontal?: boolean
    form?: string
    name?: string
    multiple?: boolean

    __demoMode?: boolean
  }
>

function ListboxFn<
  TTag extends ElementType = typeof DEFAULT_LISTBOX_TAG,
  TType = string,
  TActualType = TType extends (infer U)[] ? U : TType,
>(props: ListboxProps<TTag, TType, TActualType>, ref: Ref<HTMLElement>) {
  let id = useId()

  let providedDisabled = useDisabled()
  let {
    value: controlledValue,
    defaultValue: _defaultValue,
    form,
    name,
    onChange: controlledOnChange,
    by,
    invalid = false,
    disabled = providedDisabled || false,
    horizontal = false,
    multiple = false,
    __demoMode = false,
    ...theirProps
  } = props

  const orientation = horizontal ? 'horizontal' : 'vertical'
  let listboxRef = useSyncRefs(ref)

  let defaultValue = useDefaultValue(_defaultValue)
  let [value = multiple ? [] : undefined, theirOnChange] = useControllable<any>(
    controlledValue,
    controlledOnChange,
    defaultValue
  )

  let machine = useListboxMachine({ id, __demoMode })
  let optionsPropsRef = useRef<_Data['optionsPropsRef']['current']>({ static: false, hold: false })

  let listRef = useRef<_Data['listRef']['current']>(new Map())

  let compare = useByComparator(by)

  let isSelected: (value: TActualType) => boolean = useCallback(
    (compareValue) =>
      match(data.mode, {
        [ValueMode.Multi]: () => {
          return (value as EnsureArray<TType>).some((option) => compare(option, compareValue))
        },
        [ValueMode.Single]: () => {
          return compare(value as TActualType, compareValue)
        },
      }),
    [value]
  )

  let data = useMemo<_Data>(
    () => ({
      value,
      disabled,
      invalid,
      mode: multiple ? ValueMode.Multi : ValueMode.Single,
      orientation,
      onChange: theirOnChange,
      compare,
      isSelected,
      optionsPropsRef,
      listRef,
    }),
    [
      value,
      disabled,
      invalid,
      multiple,
      orientation,
      theirOnChange,
      compare,
      isSelected,
      optionsPropsRef,
      listRef,
    ]
  )

  useIsoMorphicEffect(() => {
    machine.state.dataRef.current = data
  }, [data])

  let listboxState = useSlice(machine, (state) => state.listboxState)

  let stackMachine = stackMachines.get(null)
  let isTopLayer = useSlice(
    stackMachine,
    useCallback((state) => stackMachine.selectors.isTop(state, id), [stackMachine, id])
  )

  let [buttonElement, optionsElement] = useSlice(machine, (state) => [
    state.buttonElement,
    state.optionsElement,
  ])

  // Handle outside click
  useOutsideClick(isTopLayer, [buttonElement, optionsElement], (event, target) => {
    machine.send({ type: ActionTypes.CloseListbox })

    if (!isFocusableElement(target, FocusableMode.Loose)) {
      event.preventDefault()
      buttonElement?.focus()
    }
  })

  let slot = useMemo(() => {
    return {
      open: listboxState === ListboxStates.Open,
      disabled,
      invalid,
      value,
    } satisfies ListboxRenderPropArg<TType>
  }, [listboxState, disabled, invalid, value])

  let [labelledby, LabelProvider] = useLabels({ inherit: true })

  let ourProps = { ref: listboxRef }

  let reset = useCallback(() => {
    if (defaultValue === undefined) return
    return theirOnChange?.(defaultValue)
  }, [theirOnChange, defaultValue])

  let render = useRender()

  return (
    <LabelProvider
      value={labelledby}
      props={{ htmlFor: buttonElement?.id }}
      slot={{ open: listboxState === ListboxStates.Open, disabled }}
    >
      <FloatingProvider>
        <ListboxContext.Provider value={machine}>
          <ListboxDataContext.Provider value={data}>
            <OpenClosedProvider
              value={match(listboxState, {
                [ListboxStates.Open]: State.Open,
                [ListboxStates.Closed]: State.Closed,
              })}
            >
              {name != null && value != null && (
                <FormFields
                  disabled={disabled}
                  data={{ [name]: value }}
                  form={form}
                  onReset={reset}
                />
              )}
              {render({
                ourProps,
                theirProps,
                slot,
                defaultTag: DEFAULT_LISTBOX_TAG,
                name: 'Listbox',
              })}
            </OpenClosedProvider>
          </ListboxDataContext.Provider>
        </ListboxContext.Provider>
      </FloatingProvider>
    </LabelProvider>
  )
}

// ---

let DEFAULT_BUTTON_TAG = 'button' as const
type ButtonRenderPropArg = {
  disabled: boolean
  invalid: boolean
  hover: boolean
  focus: boolean
  autofocus: boolean
  open: boolean
  active: boolean
  value: any
}
type ButtonPropsWeControl =
  | 'aria-controls'
  | 'aria-expanded'
  | 'aria-haspopup'
  | 'aria-labelledby'
  | 'disabled'

export type ListboxButtonProps<TTag extends ElementType = typeof DEFAULT_BUTTON_TAG> = Props<
  TTag,
  ButtonRenderPropArg,
  ButtonPropsWeControl,
  {
    autoFocus?: boolean
    disabled?: boolean
  }
>

function ButtonFn<TTag extends ElementType = typeof DEFAULT_BUTTON_TAG>(
  props: ListboxButtonProps<TTag>,
  ref: Ref<HTMLButtonElement>
) {
  let internalId = useId()
  let providedId = useProvidedId()
  let data = useData('Listbox.Button')
  let machine = useListboxMachineContext('Listbox.Button')
  let {
    id = providedId || `headlessui-listbox-button-${internalId}`,
    disabled = data.disabled || false,
    autoFocus = false,
    ...theirProps
  } = props
  let buttonRef = useSyncRefs(ref, useFloatingReference(), machine.actions.setButtonElement)
  let getFloatingReferenceProps = useFloatingReferenceProps()

  let [listboxState, buttonElement, optionsElement] = useSlice(machine, (state) => [
    state.listboxState,
    state.buttonElement,
    state.optionsElement,
  ])

  let enableQuickRelease = listboxState === ListboxStates.Open
  useQuickRelease(enableQuickRelease, {
    trigger: buttonElement,
    action: useCallback(
      (e) => {
        if (buttonElement?.contains(e.target)) {
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
      [buttonElement, optionsElement]
    ),
    close: machine.actions.closeListbox,
    select: machine.actions.selectActiveOption,
  })

  let handleKeyDown = useEvent((event: ReactKeyboardEvent<HTMLButtonElement>) => {
    switch (event.key) {
      // Ref: https://www.w3.org/WAI/ARIA/apg/patterns/menubutton/#keyboard-interaction-13

      case Keys.Enter:
        attemptSubmit(event.currentTarget)
        break

      case Keys.Space:
      case Keys.ArrowDown:
        event.preventDefault()
        machine.actions.openListbox({ focus: data.value ? Focus.Nothing : Focus.First })
        break

      case Keys.ArrowUp:
        event.preventDefault()
        machine.actions.openListbox({ focus: data.value ? Focus.Nothing : Focus.Last })
        break
    }
  })

  let handleKeyUp = useEvent((event: ReactKeyboardEvent<HTMLButtonElement>) => {
    switch (event.key) {
      case Keys.Space:
        // Required for firefox, event.preventDefault() in handleKeyDown for
        // the Space key doesn't cancel the handleKeyUp, which in turn
        // triggers a *click*.
        event.preventDefault()
        break
    }
  })

  let handlePointerDown = useEvent((event: ReactPointerEvent) => {
    if (event.button !== 0) return // Only handle left clicks
    if (isDisabledReactIssue7711(event.currentTarget)) return event.preventDefault()
    if (machine.state.listboxState === ListboxStates.Open) {
      flushSync(() => machine.actions.closeListbox())
      machine.state.buttonElement?.focus({ preventScroll: true })
    } else {
      event.preventDefault()
      machine.actions.openListbox({ focus: Focus.Nothing })
    }
  })

  // This is needed so that we can "cancel" the click event when we use the `Enter` key on a button.
  let handleKeyPress = useEvent((event: ReactKeyboardEvent<HTMLElement>) => event.preventDefault())

  let labelledBy = useLabelledBy([id])
  let describedBy = useDescribedBy()

  let { isFocusVisible: focus, focusProps } = useFocusRing({ autoFocus })
  let { isHovered: hover, hoverProps } = useHover({ isDisabled: disabled })
  let { pressed: active, pressProps } = useActivePress({ disabled })

  let slot = useMemo(() => {
    return {
      open: listboxState === ListboxStates.Open,
      active: active || listboxState === ListboxStates.Open,
      disabled,
      invalid: data.invalid,
      value: data.value,
      hover,
      focus,
      autofocus: autoFocus,
    } satisfies ButtonRenderPropArg
  }, [listboxState, data.value, disabled, hover, focus, active, data.invalid, autoFocus])

  let open = useSlice(machine, (state) => state.listboxState === ListboxStates.Open)
  let ourProps = mergeProps(
    getFloatingReferenceProps(),
    {
      ref: buttonRef,
      id,
      type: useResolveButtonType(props, buttonElement),
      'aria-haspopup': 'listbox',
      'aria-controls': optionsElement?.id,
      'aria-expanded': open,
      'aria-labelledby': labelledBy,
      'aria-describedby': describedBy,
      disabled: disabled || undefined,
      autoFocus,
      onKeyDown: handleKeyDown,
      onKeyUp: handleKeyUp,
      onKeyPress: handleKeyPress,
      onPointerDown: handlePointerDown,
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
    name: 'Listbox.Button',
  })
}

// ---

let SelectedOptionContext = createContext(false)

let DEFAULT_OPTIONS_TAG = 'div' as const
type OptionsRenderPropArg = {
  open: boolean
}
type OptionsPropsWeControl =
  | 'aria-activedescendant'
  | 'aria-labelledby'
  | 'aria-multiselectable'
  | 'aria-orientation'
  | 'role'
  | 'tabIndex'

let OptionsRenderFeatures = RenderFeatures.RenderStrategy | RenderFeatures.Static

export type ListboxOptionsProps<TTag extends ElementType = typeof DEFAULT_OPTIONS_TAG> = Props<
  TTag,
  OptionsRenderPropArg,
  OptionsPropsWeControl,
  {
    anchor?: AnchorPropsWithSelection
    portal?: boolean
    modal?: boolean
    transition?: boolean
  } & PropsForFeatures<typeof OptionsRenderFeatures>
>

function OptionsFn<TTag extends ElementType = typeof DEFAULT_OPTIONS_TAG>(
  props: ListboxOptionsProps<TTag>,
  ref: Ref<HTMLElement>
) {
  let internalId = useId()
  let {
    id = `headlessui-listbox-options-${internalId}`,
    anchor: rawAnchor,
    portal = false,
    modal = true,
    transition = false,
    ...theirProps
  } = props
  let anchor = useResolvedAnchor(rawAnchor)

  // To improve the correctness of transitions (timing related race conditions),
  // we track the element locally to this component, instead of relying on the
  // context value. This way, the component can re-render independently of the
  // parent component when the `useTransition(…)` hook performs a state change.
  let [localOptionsElement, setLocalOptionsElement] = useState<HTMLElement | null>(null)

  // Always enable `portal` functionality, when `anchor` is enabled
  if (anchor) {
    portal = true
  }

  let data = useData('Listbox.Options')
  let machine = useListboxMachineContext('Listbox.Options')

  let [listboxState, buttonElement, optionsElement, __demoMode] = useSlice(machine, (state) => [
    state.listboxState,
    state.buttonElement,
    state.optionsElement,
    state.__demoMode,
  ])

  let portalOwnerDocument = useOwnerDocument(buttonElement)
  let ownerDocument = useOwnerDocument(optionsElement)

  let usesOpenClosedState = useOpenClosed()
  let [visible, transitionData] = useTransition(
    transition,
    localOptionsElement,
    usesOpenClosedState !== null
      ? (usesOpenClosedState & State.Open) === State.Open
      : listboxState === ListboxStates.Open
  )

  // Ensure we close the listbox as soon as the button becomes hidden
  useOnDisappear(visible, buttonElement, machine.actions.closeListbox)

  // Enable scroll locking when the listbox is visible, and `modal` is enabled
  let scrollLockEnabled = __demoMode ? false : modal && listboxState === ListboxStates.Open
  useScrollLock(scrollLockEnabled, ownerDocument)

  // Mark other elements as inert when the listbox is visible, and `modal` is enabled
  let inertOthersEnabled = __demoMode ? false : modal && listboxState === ListboxStates.Open
  useInertOthers(inertOthersEnabled, {
    allowed: useCallback(() => [buttonElement, optionsElement], [buttonElement, optionsElement]),
  })

  // We keep track whether the button moved or not, we only check this when the menu state becomes
  // closed. If the button moved, then we want to cancel pending transitions to prevent that the
  // attached `MenuItems` is still transitioning while the button moved away.
  //
  // If we don't cancel these transitions then there will be a period where the `MenuItems` is
  // visible and moving around because it is trying to re-position itself based on the new position.
  //
  // This can be solved by only transitioning the `opacity` instead of everything, but if you _do_
  // want to transition the y-axis for example you will run into the same issue again.
  let didElementMoveEnabled = listboxState !== ListboxStates.Open
  let didButtonMove = useDidElementMove(didElementMoveEnabled, buttonElement)

  // Now that we know that the button did move or not, we can either disable the panel and all of
  // its transitions, or rely on the `visible` state to hide the panel whenever necessary.
  let panelEnabled = didButtonMove ? false : visible

  // We should freeze when the listbox is visible but "closed". This means that
  // a transition is currently happening and the component is still visible (for
  // the transition) but closed from a functionality perspective.
  let shouldFreeze = visible && listboxState === ListboxStates.Closed

  // Frozen state, the selected value will only update visually when the user re-opens the <Listbox />
  let frozenValue = useFrozenData(shouldFreeze, data.value)

  let isSelected = useEvent((compareValue: unknown) => data.compare(frozenValue, compareValue))

  let selectedOptionIndex = useSlice(machine, (state) => {
    if (anchor == null) return null
    if (!anchor?.to?.includes('selection')) return null

    // Only compute the selected option index when using `selection` in the
    // `anchor` prop.
    let idx = state.options.findIndex((option) => isSelected(option.dataRef.current.value))
    // Ensure that if no data is selected, we default to the first item.
    if (idx === -1) idx = 0

    return idx
  })

  let anchorOptions = (() => {
    if (anchor == null) return undefined
    if (selectedOptionIndex === null) return { ...anchor, inner: undefined }

    let elements = Array.from(data.listRef.current.values())

    return {
      ...anchor,
      inner: {
        listRef: { current: elements },
        index: selectedOptionIndex,
      },
    }
  })()

  let [floatingRef, style] = useFloatingPanel(anchorOptions)
  let getFloatingPanelProps = useFloatingPanelProps()
  let optionsRef = useSyncRefs(
    ref,
    anchor ? floatingRef : null,
    machine.actions.setOptionsElement,
    setLocalOptionsElement
  )

  let searchDisposables = useDisposables()

  useEffect(() => {
    let container = optionsElement
    if (!container) return
    if (listboxState !== ListboxStates.Open) return
    if (container === getOwnerDocument(container)?.activeElement) return

    container?.focus({ preventScroll: true })
  }, [listboxState, optionsElement])

  let handleKeyDown = useEvent((event: ReactKeyboardEvent<HTMLElement>) => {
    searchDisposables.dispose()

    switch (event.key) {
      // Ref: https://www.w3.org/WAI/ARIA/apg/patterns/menu/#keyboard-interaction-12

      // @ts-expect-error Fallthrough is expected here
      case Keys.Space:
        if (machine.state.searchQuery !== '') {
          event.preventDefault()
          event.stopPropagation()
          return machine.actions.search(event.key)
        }
      // When in type ahead mode, fallthrough
      case Keys.Enter:
        event.preventDefault()
        event.stopPropagation()

        if (machine.state.activeOptionIndex !== null) {
          let { dataRef } = machine.state.options[machine.state.activeOptionIndex]
          machine.actions.onChange(dataRef.current.value)
        }
        if (data.mode === ValueMode.Single) {
          flushSync(() => machine.actions.closeListbox())
          machine.state.buttonElement?.focus({ preventScroll: true })
        }
        break

      case match(data.orientation, {
        vertical: Keys.ArrowDown,
        horizontal: Keys.ArrowRight,
      }):
        event.preventDefault()
        event.stopPropagation()
        return machine.actions.goToOption({ focus: Focus.Next })

      case match(data.orientation, {
        vertical: Keys.ArrowUp,
        horizontal: Keys.ArrowLeft,
      }):
        event.preventDefault()
        event.stopPropagation()
        return machine.actions.goToOption({ focus: Focus.Previous })

      case Keys.Home:
      case Keys.PageUp:
        event.preventDefault()
        event.stopPropagation()
        return machine.actions.goToOption({ focus: Focus.First })

      case Keys.End:
      case Keys.PageDown:
        event.preventDefault()
        event.stopPropagation()
        return machine.actions.goToOption({ focus: Focus.Last })

      case Keys.Escape:
        event.preventDefault()
        event.stopPropagation()
        flushSync(() => machine.actions.closeListbox())
        machine.state.buttonElement?.focus({ preventScroll: true })
        return

      case Keys.Tab:
        event.preventDefault()
        event.stopPropagation()
        flushSync(() => machine.actions.closeListbox())
        focusFrom(
          machine.state.buttonElement!,
          event.shiftKey ? FocusManagementFocus.Previous : FocusManagementFocus.Next
        )
        break

      default:
        if (event.key.length === 1) {
          machine.actions.search(event.key)
          searchDisposables.setTimeout(() => machine.actions.clearSearch(), 350)
        }
        break
    }
  })

  let labelledby = useSlice(machine, (state) => state.buttonElement?.id)

  let slot = useMemo(() => {
    return {
      open: listboxState === ListboxStates.Open,
    } satisfies OptionsRenderPropArg
  }, [listboxState])

  let ourProps = mergeProps(anchor ? getFloatingPanelProps() : {}, {
    id,
    ref: optionsRef,
    'aria-activedescendant': useSlice(machine, machine.selectors.activeDescendantId),
    'aria-multiselectable': data.mode === ValueMode.Multi ? true : undefined,
    'aria-labelledby': labelledby,
    'aria-orientation': data.orientation,
    onKeyDown: handleKeyDown,
    role: 'listbox',
    // When the `Listbox` is closed, it should not be focusable. This allows us
    // to skip focusing the `ListboxOptions` when pressing the tab key on an
    // open `Listbox`, and go to the next focusable element.
    tabIndex: listboxState === ListboxStates.Open ? 0 : undefined,
    style: {
      ...theirProps.style,
      ...style,
      '--button-width': useElementSize(buttonElement, true).width,
    } as CSSProperties,
    ...transitionDataAttributes(transitionData),
  })

  let render = useRender()

  // We want to use the local `isSelected` with frozen values when we are in
  // single value mode.
  let newData = useMemo(
    () => (data.mode === ValueMode.Multi ? data : { ...data, isSelected }),
    [data, isSelected]
  )

  return (
    <Portal enabled={portal ? props.static || visible : false} ownerDocument={portalOwnerDocument}>
      <ListboxDataContext.Provider value={newData}>
        {render({
          ourProps,
          theirProps,
          slot,
          defaultTag: DEFAULT_OPTIONS_TAG,
          features: OptionsRenderFeatures,
          visible: panelEnabled,
          name: 'Listbox.Options',
        })}
      </ListboxDataContext.Provider>
    </Portal>
  )
}

// ---

let DEFAULT_OPTION_TAG = 'div' as const
type OptionRenderPropArg = {
  /** @deprecated use `focus` instead */
  active: boolean
  focus: boolean
  selected: boolean
  disabled: boolean

  selectedOption: boolean
}
type OptionPropsWeControl = 'aria-disabled' | 'aria-selected' | 'role' | 'tabIndex'

export type ListboxOptionProps<
  TTag extends ElementType = typeof DEFAULT_OPTION_TAG,
  TType = string,
> = Props<
  TTag,
  OptionRenderPropArg,
  OptionPropsWeControl,
  {
    disabled?: boolean
    value: TType
  }
>

function OptionFn<
  TTag extends ElementType = typeof DEFAULT_OPTION_TAG,
  // TODO: One day we will be able to infer this type from the generic in Listbox itself.
  // But today is not that day..
  TType = Parameters<typeof ListboxRoot>[0]['value'],
>(props: ListboxOptionProps<TTag, TType>, ref: Ref<HTMLElement>) {
  let internalId = useId()
  let {
    id = `headlessui-listbox-option-${internalId}`,
    disabled = false,
    value,
    ...theirProps
  } = props
  let usedInSelectedOption = useContext(SelectedOptionContext) === true
  let data = useData('Listbox.Option')
  let machine = useListboxMachineContext('Listbox.Option')

  let active = useSlice(machine, (state) => machine.selectors.isActive(state, id))

  let selected = data.isSelected(value)
  let internalOptionRef = useRef<HTMLElement | null>(null)
  let getTextValue = useTextValue(internalOptionRef)
  let bag = useLatestValue<ListboxOptionDataRef<TType>['current']>({
    disabled,
    value,
    domRef: internalOptionRef,
    get textValue() {
      return getTextValue()
    },
  })

  let optionRef = useSyncRefs(ref, internalOptionRef, (el) => {
    if (!el) {
      data.listRef.current.delete(id)
    } else {
      data.listRef.current.set(id, el)
    }
  })

  let shouldScrollIntoView = useSlice(machine, (state) =>
    machine.selectors.shouldScrollIntoView(state, id)
  )
  useIsoMorphicEffect(() => {
    if (!shouldScrollIntoView) return
    return disposables().requestAnimationFrame(() => {
      internalOptionRef.current?.scrollIntoView?.({ block: 'nearest' })
    })
  }, [shouldScrollIntoView, internalOptionRef])

  useIsoMorphicEffect(() => {
    if (usedInSelectedOption) return
    machine.actions.registerOption(id, bag)
    return () => machine.actions.unregisterOption(id)
  }, [bag, id, usedInSelectedOption])

  let handleClick = useEvent((event: { preventDefault: Function }) => {
    if (disabled) return event.preventDefault()
    machine.actions.onChange(value)
    if (data.mode === ValueMode.Single) {
      flushSync(() => machine.actions.closeListbox())
      machine.state.buttonElement?.focus({ preventScroll: true })
    }
  })

  let handleFocus = useEvent(() => {
    if (disabled) return machine.actions.goToOption({ focus: Focus.Nothing })
    machine.actions.goToOption({ focus: Focus.Specific, id })
  })

  let pointer = useTrackedPointer()

  let handleEnter = useEvent((evt) => {
    pointer.update(evt)
    if (disabled) return
    if (active) return
    machine.actions.goToOption({ focus: Focus.Specific, id }, ActivationTrigger.Pointer)
  })

  let handleMove = useEvent((evt) => {
    if (!pointer.wasMoved(evt)) return
    if (disabled) return
    if (active) return
    machine.actions.goToOption({ focus: Focus.Specific, id }, ActivationTrigger.Pointer)
  })

  let handleLeave = useEvent((evt) => {
    if (!pointer.wasMoved(evt)) return
    if (disabled) return
    if (!active) return
    machine.actions.goToOption({ focus: Focus.Nothing })
  })

  let slot = useMemo(() => {
    return {
      active,
      focus: active,
      selected,
      disabled,
      selectedOption: selected && usedInSelectedOption,
    } satisfies OptionRenderPropArg
  }, [active, selected, disabled, usedInSelectedOption])
  let ourProps = !usedInSelectedOption
    ? {
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
        onClick: handleClick,
        onFocus: handleFocus,
        onPointerEnter: handleEnter,
        onMouseEnter: handleEnter,
        onPointerMove: handleMove,
        onMouseMove: handleMove,
        onPointerLeave: handleLeave,
        onMouseLeave: handleLeave,
      }
    : {}

  let render = useRender()

  if (!selected && usedInSelectedOption) {
    return null
  }

  return render({
    ourProps,
    theirProps,
    slot,
    defaultTag: DEFAULT_OPTION_TAG,
    name: 'Listbox.Option',
  })
}

// ---

let DEFAULT_SELECTED_OPTION_TAG = Fragment
type SelectedOptionRenderPropArg = {}
type SelectedOptionPropsWeControl = never

export type ListboxSelectedOptionProps<
  TTag extends ElementType = typeof DEFAULT_SELECTED_OPTION_TAG,
> = Props<
  TTag,
  SelectedOptionRenderPropArg,
  SelectedOptionPropsWeControl,
  {
    options: React.ReactNode
    placeholder?: React.ReactNode
  }
>

function SelectedFn<TTag extends ElementType = typeof DEFAULT_SELECTED_OPTION_TAG>(
  props: ListboxSelectedOptionProps<TTag>,
  ref: Ref<HTMLElement>
) {
  let { options: children, placeholder, ...theirProps } = props

  let selectedRef = useSyncRefs(ref)
  let ourProps = { ref: selectedRef }
  let data = useData('ListboxSelectedOption')
  let slot = useMemo(() => ({}) satisfies SelectedOptionRenderPropArg, [])

  let shouldShowPlaceholder =
    data.value === undefined ||
    data.value === null ||
    (data.mode === ValueMode.Multi && Array.isArray(data.value) && data.value.length === 0)

  let render = useRender()

  return (
    <SelectedOptionContext.Provider value={true}>
      {render({
        ourProps,
        theirProps: {
          ...theirProps,
          children: <>{placeholder && shouldShowPlaceholder ? placeholder : children}</>,
        },
        slot,
        defaultTag: DEFAULT_SELECTED_OPTION_TAG,
        name: 'ListboxSelectedOption',
      })}
    </SelectedOptionContext.Provider>
  )
}

// ---

export interface _internal_ComponentListbox extends HasDisplayName {
  <
    TTag extends ElementType = typeof DEFAULT_LISTBOX_TAG,
    TType = string,
    TActualType = TType extends (infer U)[] ? U : TType,
  >(
    props: ListboxProps<TTag, TType, TActualType> & RefProp<typeof ListboxFn>
  ): React.JSX.Element
}

export interface _internal_ComponentListboxButton extends HasDisplayName {
  <TTag extends ElementType = typeof DEFAULT_BUTTON_TAG>(
    props: ListboxButtonProps<TTag> & RefProp<typeof ButtonFn>
  ): React.JSX.Element
}

export interface _internal_ComponentListboxLabel extends _internal_ComponentLabel {}

export interface _internal_ComponentListboxOptions extends HasDisplayName {
  <TTag extends ElementType = typeof DEFAULT_OPTIONS_TAG>(
    props: ListboxOptionsProps<TTag> & RefProp<typeof OptionsFn>
  ): React.JSX.Element
}

export interface _internal_ComponentListboxOption extends HasDisplayName {
  <
    TTag extends ElementType = typeof DEFAULT_OPTION_TAG,
    TType = Parameters<typeof ListboxRoot>[0]['value'],
  >(
    props: ListboxOptionProps<TTag, TType> & RefProp<typeof OptionFn>
  ): React.JSX.Element
}

export interface _internal_ComponentListboxSelectedOption extends HasDisplayName {
  <TTag extends ElementType = typeof DEFAULT_SELECTED_OPTION_TAG>(
    props: ListboxSelectedOptionProps<TTag> & RefProp<typeof SelectedFn>
  ): React.JSX.Element
}

let ListboxRoot = forwardRefWithAs(ListboxFn) as _internal_ComponentListbox
export let ListboxButton = forwardRefWithAs(ButtonFn) as _internal_ComponentListboxButton
/** @deprecated use `<Label>` instead of `<ListboxLabel>` */
export let ListboxLabel = Label as _internal_ComponentListboxLabel
export let ListboxOptions = forwardRefWithAs(OptionsFn) as _internal_ComponentListboxOptions
export let ListboxOption = forwardRefWithAs(OptionFn) as _internal_ComponentListboxOption
export let ListboxSelectedOption = forwardRefWithAs(
  SelectedFn
) as _internal_ComponentListboxSelectedOption

export let Listbox = Object.assign(ListboxRoot, {
  /** @deprecated use `<ListboxButton>` instead of `<Listbox.Button>` */
  Button: ListboxButton,
  /** @deprecated use `<Label>` instead of `<Listbox.Label>` */
  Label: ListboxLabel,
  /** @deprecated use `<ListboxOptions>` instead of `<Listbox.Options>` */
  Options: ListboxOptions,
  /** @deprecated use `<ListboxOption>` instead of `<Listbox.Option>` */
  Option: ListboxOption,
  /** @deprecated use `<ListboxSelectedOption>` instead of `<Listbox.SelectedOption>` */
  SelectedOption: ListboxSelectedOption,
})
