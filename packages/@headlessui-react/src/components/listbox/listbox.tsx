'use client'

import { useFocusRing } from '@react-aria/focus'
import { useHover } from '@react-aria/interactions'
import React, {
  Fragment,
  createContext,
  createRef,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  type CSSProperties,
  type ElementType,
  type MutableRefObject,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
  type Ref,
} from 'react'
import { useActivePress } from '../../hooks/use-active-press'
import { useByComparator, type ByComparator } from '../../hooks/use-by-comparator'
import { useComputed } from '../../hooks/use-computed'
import { useControllable } from '../../hooks/use-controllable'
import { useDidElementMove } from '../../hooks/use-did-element-move'
import { useDisposables } from '../../hooks/use-disposables'
import { useElementSize } from '../../hooks/use-element-size'
import { useEvent } from '../../hooks/use-event'
import { useId } from '../../hooks/use-id'
import { useIsoMorphicEffect } from '../../hooks/use-iso-morphic-effect'
import { useLatestValue } from '../../hooks/use-latest-value'
import { useOutsideClick } from '../../hooks/use-outside-click'
import { useResolveButtonType } from '../../hooks/use-resolve-button-type'
import { useSyncRefs } from '../../hooks/use-sync-refs'
import { useTextValue } from '../../hooks/use-text-value'
import { useTrackedPointer } from '../../hooks/use-tracked-pointer'
import { useDisabled } from '../../internal/disabled'
import {
  FloatingProvider,
  useFloatingPanel,
  useFloatingPanelProps,
  useFloatingReference,
  useFloatingReferenceProps,
  type AnchorPropsWithSelection,
} from '../../internal/floating'
import { FormFields } from '../../internal/form-fields'
import { useProvidedId } from '../../internal/id'
import { Modal, type ModalProps } from '../../internal/modal'
import { OpenClosedProvider, State, useOpenClosed } from '../../internal/open-closed'
import type { EnsureArray, Props } from '../../types'
import { isDisabledReactIssue7711 } from '../../utils/bugs'
import { Focus, calculateActiveIndex } from '../../utils/calculate-active-index'
import { disposables } from '../../utils/disposables'
import { FocusableMode, isFocusableElement, sortByDomNode } from '../../utils/focus-management'
import { match } from '../../utils/match'
import { getOwnerDocument } from '../../utils/owner'
import {
  RenderFeatures,
  forwardRefWithAs,
  mergeProps,
  render,
  type HasDisplayName,
  type PropsForFeatures,
  type RefProp,
} from '../../utils/render'
import { useDescribedBy } from '../description/description'
import { Keys } from '../keyboard'
import { Label, useLabelledBy, useLabels, type _internal_ComponentLabel } from '../label/label'
import { Portal } from '../portal/portal'

enum ListboxStates {
  Open,
  Closed,
}

enum ValueMode {
  Single,
  Multi,
}

enum ActivationTrigger {
  Pointer,
  Other,
}

type ListboxOptionDataRef<T> = MutableRefObject<{
  textValue?: string
  disabled: boolean
  value: T
  domRef: MutableRefObject<HTMLElement | null>
}>

interface StateDefinition<T> {
  dataRef: MutableRefObject<_Data>

  listboxState: ListboxStates

  options: { id: string; dataRef: ListboxOptionDataRef<T> }[]
  searchQuery: string
  activeOptionIndex: number | null
  activationTrigger: ActivationTrigger
}

enum ActionTypes {
  OpenListbox,
  CloseListbox,

  GoToOption,
  Search,
  ClearSearch,

  RegisterOption,
  UnregisterOption,
}

function adjustOrderedState<T>(
  state: StateDefinition<T>,
  adjustment: (options: StateDefinition<T>['options']) => StateDefinition<T>['options'] = (i) => i
) {
  let currentActiveOption =
    state.activeOptionIndex !== null ? state.options[state.activeOptionIndex] : null

  let sortedOptions = sortByDomNode(
    adjustment(state.options.slice()),
    (option) => option.dataRef.current.domRef.current
  )

  // If we inserted an option before the current active option then the active option index
  // would be wrong. To fix this, we will re-lookup the correct index.
  let adjustedActiveOptionIndex = currentActiveOption
    ? sortedOptions.indexOf(currentActiveOption)
    : null

  // Reset to `null` in case the currentActiveOption was removed.
  if (adjustedActiveOptionIndex === -1) {
    adjustedActiveOptionIndex = null
  }

  return {
    options: sortedOptions,
    activeOptionIndex: adjustedActiveOptionIndex,
  }
}

type Actions<T> =
  | { type: ActionTypes.CloseListbox }
  | { type: ActionTypes.OpenListbox }
  | { type: ActionTypes.GoToOption; focus: Focus.Specific; id: string; trigger?: ActivationTrigger }
  | {
      type: ActionTypes.GoToOption
      focus: Exclude<Focus, Focus.Specific>
      trigger?: ActivationTrigger
    }
  | { type: ActionTypes.Search; value: string }
  | { type: ActionTypes.ClearSearch }
  | { type: ActionTypes.RegisterOption; id: string; dataRef: ListboxOptionDataRef<T> }
  | { type: ActionTypes.UnregisterOption; id: string }

let reducers: {
  [P in ActionTypes]: <T>(
    state: StateDefinition<T>,
    action: Extract<Actions<T>, { type: P }>
  ) => StateDefinition<T>
} = {
  [ActionTypes.CloseListbox](state) {
    if (state.dataRef.current.disabled) return state
    if (state.listboxState === ListboxStates.Closed) return state
    return { ...state, activeOptionIndex: null, listboxState: ListboxStates.Closed }
  },
  [ActionTypes.OpenListbox](state) {
    if (state.dataRef.current.disabled) return state
    if (state.listboxState === ListboxStates.Open) return state

    // Check if we have a selected value that we can make active
    let activeOptionIndex = state.activeOptionIndex
    let { isSelected } = state.dataRef.current
    let optionIdx = state.options.findIndex((option) => isSelected(option.dataRef.current.value))

    if (optionIdx !== -1) {
      activeOptionIndex = optionIdx
    }

    return { ...state, listboxState: ListboxStates.Open, activeOptionIndex }
  },
  [ActionTypes.GoToOption](state, action) {
    if (state.dataRef.current.disabled) return state
    if (state.listboxState === ListboxStates.Closed) return state

    let base = {
      ...state,
      searchQuery: '',
      activationTrigger: action.trigger ?? ActivationTrigger.Other,
    }

    // Optimization:
    //
    // There is no need to sort the DOM nodes if we know that we don't want to focus anything
    if (action.focus === Focus.Nothing) {
      return {
        ...base,
        activeOptionIndex: null,
      }
    }

    // Optimization:
    //
    // There is no need to sort the DOM nodes if we know exactly where to go
    if (action.focus === Focus.Specific) {
      return {
        ...base,
        activeOptionIndex: state.options.findIndex((o) => o.id === action.id),
      }
    }

    // Optimization:
    //
    // If the current DOM node and the previous DOM node are next to eachother, or if the previous
    // DOM node is already the first DOM node, then we don't have to sort all the DOM nodes.
    else if (action.focus === Focus.Previous) {
      let activeOptionIdx = state.activeOptionIndex
      if (activeOptionIdx !== null) {
        let currentDom = state.options[activeOptionIdx].dataRef.current.domRef
        let previousOptionIndex = calculateActiveIndex(action, {
          resolveItems: () => state.options,
          resolveActiveIndex: () => state.activeOptionIndex,
          resolveId: (option) => option.id,
          resolveDisabled: (option) => option.dataRef.current.disabled,
        })
        if (previousOptionIndex !== null) {
          let previousDom = state.options[previousOptionIndex].dataRef.current.domRef
          if (
            // Next to eachother
            currentDom.current?.previousElementSibling === previousDom.current ||
            // Or already the first element
            previousDom.current?.previousElementSibling === null
          ) {
            return {
              ...base,
              activeOptionIndex: previousOptionIndex,
            }
          }
        }
      }
    }

    // Optimization:
    //
    // If the current DOM node and the next DOM node are next to eachother, or if the next DOM node
    // is already the last DOM node, then we don't have to sort all the DOM nodes.
    else if (action.focus === Focus.Next) {
      let activeOptionIdx = state.activeOptionIndex
      if (activeOptionIdx !== null) {
        let currentDom = state.options[activeOptionIdx].dataRef.current.domRef
        let nextOptionIndex = calculateActiveIndex(action, {
          resolveItems: () => state.options,
          resolveActiveIndex: () => state.activeOptionIndex,
          resolveId: (option) => option.id,
          resolveDisabled: (option) => option.dataRef.current.disabled,
        })
        if (nextOptionIndex !== null) {
          let nextDom = state.options[nextOptionIndex].dataRef.current.domRef
          if (
            // Next to eachother
            currentDom.current?.nextElementSibling === nextDom.current ||
            // Or already the last element
            nextDom.current?.nextElementSibling === null
          ) {
            return {
              ...base,
              activeOptionIndex: nextOptionIndex,
            }
          }
        }
      }
    }

    // Slow path:
    //
    // Ensure all the options are correctly sorted according to DOM position
    let adjustedState = adjustOrderedState(state)
    let activeOptionIndex = calculateActiveIndex(action, {
      resolveItems: () => adjustedState.options,
      resolveActiveIndex: () => adjustedState.activeOptionIndex,
      resolveId: (option) => option.id,
      resolveDisabled: (option) => option.dataRef.current.disabled,
    })

    return {
      ...base,
      ...adjustedState,
      activeOptionIndex,
    }
  },
  [ActionTypes.Search]: (state, action) => {
    if (state.dataRef.current.disabled) return state
    if (state.listboxState === ListboxStates.Closed) return state

    let wasAlreadySearching = state.searchQuery !== ''
    let offset = wasAlreadySearching ? 0 : 1

    let searchQuery = state.searchQuery + action.value.toLowerCase()

    let reOrderedOptions =
      state.activeOptionIndex !== null
        ? state.options
            .slice(state.activeOptionIndex + offset)
            .concat(state.options.slice(0, state.activeOptionIndex + offset))
        : state.options

    let matchingOption = reOrderedOptions.find(
      (option) =>
        !option.dataRef.current.disabled &&
        option.dataRef.current.textValue?.startsWith(searchQuery)
    )

    let matchIdx = matchingOption ? state.options.indexOf(matchingOption) : -1

    if (matchIdx === -1 || matchIdx === state.activeOptionIndex) return { ...state, searchQuery }
    return {
      ...state,
      searchQuery,
      activeOptionIndex: matchIdx,
      activationTrigger: ActivationTrigger.Other,
    }
  },
  [ActionTypes.ClearSearch](state) {
    if (state.dataRef.current.disabled) return state
    if (state.listboxState === ListboxStates.Closed) return state
    if (state.searchQuery === '') return state
    return { ...state, searchQuery: '' }
  },
  [ActionTypes.RegisterOption]: (state, action) => {
    let option = { id: action.id, dataRef: action.dataRef }
    let adjustedState = adjustOrderedState(state, (options) => [...options, option])

    // Check if we need to make the newly registered option active.
    if (state.activeOptionIndex === null) {
      if (state.dataRef.current.isSelected(action.dataRef.current.value)) {
        adjustedState.activeOptionIndex = adjustedState.options.indexOf(option)
      }
    }

    return { ...state, ...adjustedState }
  },
  [ActionTypes.UnregisterOption]: (state, action) => {
    let adjustedState = adjustOrderedState(state, (options) => {
      let idx = options.findIndex((a) => a.id === action.id)
      if (idx !== -1) options.splice(idx, 1)
      return options
    })

    return {
      ...state,
      ...adjustedState,
      activationTrigger: ActivationTrigger.Other,
    }
  },
}

let ListboxActionsContext = createContext<{
  openListbox(): void
  closeListbox(): void
  registerOption(id: string, dataRef: ListboxOptionDataRef<unknown>): () => void
  goToOption(focus: Focus.Specific, id: string, trigger?: ActivationTrigger): void
  goToOption(focus: Focus, id?: string, trigger?: ActivationTrigger): void
  selectOption(id: string): void
  selectActiveOption(): void
  onChange(value: unknown): void
  search(query: string): void
  clearSearch(): void
} | null>(null)
ListboxActionsContext.displayName = 'ListboxActionsContext'

function useActions(component: string) {
  let context = useContext(ListboxActionsContext)
  if (context === null) {
    let err = new Error(`<${component} /> is missing a parent <Listbox /> component.`)
    if (Error.captureStackTrace) Error.captureStackTrace(err, useActions)
    throw err
  }
  return context
}
type _Actions = ReturnType<typeof useActions>

let ListboxDataContext = createContext<
  | ({
      value: unknown
      disabled: boolean
      invalid: boolean
      mode: ValueMode
      orientation: 'horizontal' | 'vertical'
      activeOptionIndex: number | null
      compare(a: unknown, z: unknown): boolean
      isSelected(value: unknown): boolean

      optionsPropsRef: MutableRefObject<{
        static: boolean
        hold: boolean
      }>

      listRef: MutableRefObject<Map<string, HTMLElement | null>>

      buttonRef: MutableRefObject<HTMLButtonElement | null>
      optionsRef: MutableRefObject<HTMLUListElement | null>
    } & Omit<StateDefinition<unknown>, 'dataRef'>)
  | null
>(null)
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

function stateReducer<T>(state: StateDefinition<T>, action: Actions<T>) {
  return match(action.type, reducers, state, action)
}

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
  }
>

function ListboxFn<
  TTag extends ElementType = typeof DEFAULT_LISTBOX_TAG,
  TType = string,
  TActualType = TType extends (infer U)[] ? U : TType,
>(props: ListboxProps<TTag, TType, TActualType>, ref: Ref<HTMLElement>) {
  let providedDisabled = useDisabled()
  let {
    value: controlledValue,
    defaultValue,
    form,
    name,
    onChange: controlledOnChange,
    by,
    invalid = false,
    disabled = providedDisabled || false,
    horizontal = false,
    multiple = false,
    ...theirProps
  } = props
  const orientation = horizontal ? 'horizontal' : 'vertical'
  let listboxRef = useSyncRefs(ref)

  let [value = multiple ? [] : undefined, theirOnChange] = useControllable<any>(
    controlledValue,
    controlledOnChange,
    defaultValue
  )

  let [state, dispatch] = useReducer(stateReducer, {
    dataRef: createRef(),
    listboxState: ListboxStates.Closed,
    options: [],
    searchQuery: '',
    activeOptionIndex: null,
    activationTrigger: ActivationTrigger.Other,
    optionsVisible: false,
  } as StateDefinition<TType>)

  let optionsPropsRef = useRef<_Data['optionsPropsRef']['current']>({ static: false, hold: false })

  let buttonRef = useRef<_Data['buttonRef']['current']>(null)
  let optionsRef = useRef<_Data['optionsRef']['current']>(null)
  let listRef = useRef<_Data['listRef']['current']>(new Map())

  let compare = useByComparator(by)

  let isSelected: (value: TActualType) => boolean = useCallback(
    (compareValue) =>
      match(data.mode, {
        [ValueMode.Multi]: () => {
          return (value as unknown as EnsureArray<TType>).some((option) =>
            compare(option, compareValue)
          )
        },
        [ValueMode.Single]: () => {
          return compare(value as TActualType, compareValue)
        },
      }),
    [value]
  )

  let data = useMemo<_Data>(
    () => ({
      ...state,
      value,
      disabled,
      invalid,
      mode: multiple ? ValueMode.Multi : ValueMode.Single,
      orientation,
      compare,
      isSelected,
      optionsPropsRef,
      buttonRef,
      optionsRef,
      listRef,
    }),
    [value, disabled, invalid, multiple, state, listRef]
  )

  useIsoMorphicEffect(() => {
    state.dataRef.current = data
  }, [data])

  // Handle outside click
  useOutsideClick(
    [data.buttonRef, data.optionsRef],
    (event, target) => {
      dispatch({ type: ActionTypes.CloseListbox })

      if (!isFocusableElement(target, FocusableMode.Loose)) {
        event.preventDefault()
        data.buttonRef.current?.focus()
      }
    },
    data.listboxState === ListboxStates.Open
  )

  let slot = useMemo(
    () =>
      ({
        open: data.listboxState === ListboxStates.Open,
        disabled,
        invalid,
        value,
      }) satisfies ListboxRenderPropArg<TType>,
    [data, disabled, value, invalid]
  )

  let selectOption = useEvent((id: string) => {
    let option = data.options.find((item) => item.id === id)
    if (!option) return

    onChange(option.dataRef.current.value)
  })

  let selectActiveOption = useEvent(() => {
    if (data.activeOptionIndex !== null) {
      let { dataRef, id } = data.options[data.activeOptionIndex]
      onChange(dataRef.current.value)

      // It could happen that the `activeOptionIndex` stored in state is actually null,
      // but we are getting the fallback active option back instead.
      dispatch({ type: ActionTypes.GoToOption, focus: Focus.Specific, id })
    }
  })

  let openListbox = useEvent(() => dispatch({ type: ActionTypes.OpenListbox }))
  let closeListbox = useEvent(() => dispatch({ type: ActionTypes.CloseListbox }))

  let d = useDisposables()
  let goToOption = useEvent((focus, id, trigger) => {
    d.dispose()
    d.microTask(() => {
      if (focus === Focus.Specific) {
        return dispatch({ type: ActionTypes.GoToOption, focus: Focus.Specific, id: id!, trigger })
      }

      return dispatch({ type: ActionTypes.GoToOption, focus, trigger })
    })
  })

  let registerOption = useEvent((id, dataRef) => {
    dispatch({ type: ActionTypes.RegisterOption, id, dataRef })
    return () => dispatch({ type: ActionTypes.UnregisterOption, id })
  })

  let onChange = useEvent((value: unknown) => {
    return match(data.mode, {
      [ValueMode.Single]() {
        return theirOnChange?.(value as TType)
      },
      [ValueMode.Multi]() {
        let copy = (data.value as TActualType[]).slice()

        let idx = copy.findIndex((item) => compare(item, value as TActualType))
        if (idx === -1) {
          copy.push(value as TActualType)
        } else {
          copy.splice(idx, 1)
        }

        return theirOnChange?.(copy as unknown as TType[])
      },
    })
  })

  let search = useEvent((value: string) => dispatch({ type: ActionTypes.Search, value }))
  let clearSearch = useEvent(() => dispatch({ type: ActionTypes.ClearSearch }))

  let actions = useMemo<_Actions>(
    () => ({
      onChange,
      registerOption,
      goToOption,
      closeListbox,
      openListbox,
      selectActiveOption,
      selectOption,
      search,
      clearSearch,
    }),
    []
  )

  let [labelledby, LabelProvider] = useLabels({ inherit: true })

  let ourProps = { ref: listboxRef }

  let reset = useCallback(() => {
    return theirOnChange?.(defaultValue)
  }, [theirOnChange /* Explicitly ignoring `defaultValue` */])

  return (
    <LabelProvider
      value={labelledby}
      props={{
        htmlFor: data.buttonRef.current?.id,
      }}
      slot={{
        open: data.listboxState === ListboxStates.Open,
        disabled,
      }}
    >
      <FloatingProvider>
        <ListboxActionsContext.Provider value={actions}>
          <ListboxDataContext.Provider value={data}>
            <OpenClosedProvider
              value={match(data.listboxState, {
                [ListboxStates.Open]: State.Open,
                [ListboxStates.Closed]: State.Closed,
              })}
            >
              {name != null && value != null && (
                <FormFields data={{ [name]: value }} form={form} onReset={reset} />
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
        </ListboxActionsContext.Provider>
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
  }
>

function ButtonFn<TTag extends ElementType = typeof DEFAULT_BUTTON_TAG>(
  props: ListboxButtonProps<TTag>,
  ref: Ref<HTMLButtonElement>
) {
  let internalId = useId()
  let providedId = useProvidedId()
  let { id = providedId || `headlessui-listbox-button-${internalId}`, ...theirProps } = props
  let data = useData('Listbox.Button')
  let actions = useActions('Listbox.Button')
  let buttonRef = useSyncRefs(data.buttonRef, ref, useFloatingReference())
  let getFloatingReferenceProps = useFloatingReferenceProps()

  let d = useDisposables()

  let handleKeyDown = useEvent((event: ReactKeyboardEvent<HTMLButtonElement>) => {
    switch (event.key) {
      // Ref: https://www.w3.org/WAI/ARIA/apg/patterns/menubutton/#keyboard-interaction-13

      case Keys.Space:
      case Keys.Enter:
      case Keys.ArrowDown:
        event.preventDefault()
        actions.openListbox()
        d.nextFrame(() => {
          if (!data.value) actions.goToOption(Focus.First)
        })
        break

      case Keys.ArrowUp:
        event.preventDefault()
        actions.openListbox()
        d.nextFrame(() => {
          if (!data.value) actions.goToOption(Focus.Last)
        })
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

  let handleClick = useEvent((event: ReactMouseEvent) => {
    if (isDisabledReactIssue7711(event.currentTarget)) return event.preventDefault()
    if (data.listboxState === ListboxStates.Open) {
      actions.closeListbox()
      d.nextFrame(() => data.buttonRef.current?.focus({ preventScroll: true }))
    } else {
      event.preventDefault()
      actions.openListbox()
    }
  })

  let labelledBy = useLabelledBy([id])
  let describedBy = useDescribedBy()

  let { isFocusVisible: focus, focusProps } = useFocusRing({ autoFocus: props.autoFocus ?? false })
  let { isHovered: hover, hoverProps } = useHover({ isDisabled: data.disabled ?? false })
  let { pressed: active, pressProps } = useActivePress({ disabled: data.disabled ?? false })

  let slot = useMemo(
    () =>
      ({
        open: data.listboxState === ListboxStates.Open,
        active: active || data.listboxState === ListboxStates.Open,
        disabled: data.disabled,
        invalid: data.invalid,
        value: data.value,
        hover,
        focus,
        autofocus: props.autoFocus ?? false,
      }) satisfies ButtonRenderPropArg,
    [
      data.listboxState,
      data.disabled,
      data.value,
      hover,
      focus,
      active,
      data.invalid,
      props.autoFocus,
    ]
  )

  let ourProps = mergeProps(
    getFloatingReferenceProps(),
    {
      ref: buttonRef,
      id,
      type: useResolveButtonType(props, data.buttonRef),
      'aria-haspopup': 'listbox',
      'aria-controls': data.optionsRef.current?.id,
      'aria-expanded': data.listboxState === ListboxStates.Open,
      'aria-labelledby': labelledBy,
      'aria-describedby': describedBy,
      disabled: data.disabled,
      onKeyDown: handleKeyDown,
      onKeyUp: handleKeyUp,
      onClick: handleClick,
    },
    focusProps,
    hoverProps,
    pressProps
  )

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

let DEFAULT_OPTIONS_TAG = 'ul' as const
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
    modal?: boolean
  } & PropsForFeatures<typeof OptionsRenderFeatures>
>

function OptionsFn<TTag extends ElementType = typeof DEFAULT_OPTIONS_TAG>(
  props: ListboxOptionsProps<TTag>,
  ref: Ref<HTMLElement>
) {
  let internalId = useId()
  let { id = `headlessui-listbox-options-${internalId}`, anchor, modal, ...theirProps } = props

  // Always use `modal` when `anchor` is passed in
  if (anchor != null && modal == null) {
    modal = true
  } else if (modal == null) {
    modal = false
  }

  let data = useData('Listbox.Options')
  let actions = useActions('Listbox.Options')

  let usesOpenClosedState = useOpenClosed()
  let visible = (() => {
    if (usesOpenClosedState !== null) {
      return (usesOpenClosedState & State.Open) === State.Open
    }

    return data.listboxState === ListboxStates.Open
  })()

  let initialOption = useRef<number | null>(null)

  useEffect(() => {
    if (!anchor?.to?.includes('selection')) return

    if (!visible) {
      initialOption.current = null
      return
    }

    let elements = Array.from(data.listRef.current.values())
    // TODO: Do not rely on DOM elements here
    initialOption.current = elements.findIndex((el) => el?.dataset.selected === '')
    // Default to first option if nothing is selected
    if (initialOption.current === -1) {
      initialOption.current = elements.findIndex((el) => el?.dataset.disabled === undefined)
      actions.goToOption(Focus.First)
    }
  }, [visible, data.listRef])

  // We keep track whether the button moved or not, we only check this when the menu state becomes
  // closed. If the button moved, then we want to cancel pending transitions to prevent that the
  // attached `MenuItems` is still transitioning while the button moved away.
  //
  // If we don't cancel these transitions then there will be a period where the `MenuItems` is
  // visible and moving around because it is trying to re-position itself based on the new position.
  //
  // This can be solved by only transitioning the `opacity` instead of everything, but if you _do_
  // want to transition the y-axis for example you will run into the same issue again.
  let didButtonMove = useDidElementMove(data.buttonRef, data.listboxState !== ListboxStates.Open)

  // Now that we know that the button did move or not, we can either disable the panel and all of
  // its transitions, or rely on the `visible` state to hide the panel whenever necessary.
  let panelEnabled = didButtonMove ? false : visible

  let anchorOptions = (() => {
    if (anchor == null) return undefined
    if (data.listRef.current.size <= 0) return { ...anchor, inner: undefined }

    let elements = Array.from(data.listRef.current.values())

    return {
      ...anchor,
      inner: {
        listRef: { current: elements },
        index: initialOption.current!,
      },
    }
  })()

  let [floatingRef, style] = useFloatingPanel(anchorOptions)
  let getFloatingPanelProps = useFloatingPanelProps()
  let optionsRef = useSyncRefs(data.optionsRef, ref, anchor ? floatingRef : null)

  let d = useDisposables()
  let searchDisposables = useDisposables()

  useEffect(() => {
    let container = data.optionsRef.current
    if (!container) return
    if (data.listboxState !== ListboxStates.Open) return
    if (container === getOwnerDocument(container)?.activeElement) return

    container?.focus({ preventScroll: true })
  }, [data.listboxState, data.optionsRef])

  let handleKeyDown = useEvent((event: ReactKeyboardEvent<HTMLUListElement>) => {
    searchDisposables.dispose()

    switch (event.key) {
      // Ref: https://www.w3.org/WAI/ARIA/apg/patterns/menu/#keyboard-interaction-12

      // @ts-expect-error Fallthrough is expected here
      case Keys.Space:
        if (data.searchQuery !== '') {
          event.preventDefault()
          event.stopPropagation()
          return actions.search(event.key)
        }
      // When in type ahead mode, fallthrough
      case Keys.Enter:
        event.preventDefault()
        event.stopPropagation()

        if (data.activeOptionIndex !== null) {
          let { dataRef } = data.options[data.activeOptionIndex]
          actions.onChange(dataRef.current.value)
        }
        if (data.mode === ValueMode.Single) {
          actions.closeListbox()
          disposables().nextFrame(() => data.buttonRef.current?.focus({ preventScroll: true }))
        }
        break

      case match(data.orientation, { vertical: Keys.ArrowDown, horizontal: Keys.ArrowRight }):
        event.preventDefault()
        event.stopPropagation()
        return actions.goToOption(Focus.Next)

      case match(data.orientation, { vertical: Keys.ArrowUp, horizontal: Keys.ArrowLeft }):
        event.preventDefault()
        event.stopPropagation()
        return actions.goToOption(Focus.Previous)

      case Keys.Home:
      case Keys.PageUp:
        event.preventDefault()
        event.stopPropagation()
        return actions.goToOption(Focus.First)

      case Keys.End:
      case Keys.PageDown:
        event.preventDefault()
        event.stopPropagation()
        return actions.goToOption(Focus.Last)

      case Keys.Escape:
        event.preventDefault()
        event.stopPropagation()
        actions.closeListbox()
        return d.nextFrame(() => data.buttonRef.current?.focus({ preventScroll: true }))

      case Keys.Tab:
        event.preventDefault()
        event.stopPropagation()
        break

      default:
        if (event.key.length === 1) {
          actions.search(event.key)
          searchDisposables.setTimeout(() => actions.clearSearch(), 350)
        }
        break
    }
  })

  let labelledby = useComputed(() => data.buttonRef.current?.id, [data.buttonRef.current])
  let slot = useMemo(
    () => ({ open: data.listboxState === ListboxStates.Open }) satisfies OptionsRenderPropArg,
    [data]
  )

  let ourProps = mergeProps(anchor ? getFloatingPanelProps() : {}, {
    id,
    ref: optionsRef,
    'aria-activedescendant':
      data.activeOptionIndex === null ? undefined : data.options[data.activeOptionIndex]?.id,
    'aria-multiselectable': data.mode === ValueMode.Multi ? true : undefined,
    'aria-labelledby': labelledby,
    'aria-orientation': data.orientation,
    onKeyDown: handleKeyDown,
    role: 'listbox',
    tabIndex: 0,
    style: {
      ...style,
      '--button-width': useElementSize(data.buttonRef, true).width,
    } as CSSProperties,
  })

  let Wrapper = modal ? Modal : anchor ? Portal : Fragment
  let wrapperProps = modal
    ? ({ enabled: data.listboxState === ListboxStates.Open } satisfies ModalProps)
    : {}

  // Frozen state, the selected value will only update visually when the user re-opens the <Listbox />
  let [frozenValue, setFrozenValue] = useState(data.value)
  if (
    data.value !== frozenValue &&
    data.listboxState === ListboxStates.Open &&
    data.mode !== ValueMode.Multi
  ) {
    setFrozenValue(data.value)
  }
  let isSelected = useEvent((compareValue: unknown) => {
    return data.compare(frozenValue, compareValue)
  })

  return (
    <Wrapper {...wrapperProps}>
      <ListboxDataContext.Provider
        value={data.mode === ValueMode.Multi ? data : { ...data, isSelected }}
      >
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
    </Wrapper>
  )
}

// ---

let DEFAULT_OPTION_TAG = 'li' as const
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
  let actions = useActions('Listbox.Option')

  let active =
    data.activeOptionIndex !== null ? data.options[data.activeOptionIndex].id === id : false

  let selected = data.isSelected(value)
  let internalOptionRef = useRef<HTMLLIElement | null>(null)
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

  useIsoMorphicEffect(() => {
    if (data.listboxState !== ListboxStates.Open) return
    if (!active) return
    if (data.activationTrigger === ActivationTrigger.Pointer) return
    let d = disposables()
    d.requestAnimationFrame(() => {
      internalOptionRef.current?.scrollIntoView?.({ block: 'nearest' })
    })
    return d.dispose
  }, [
    internalOptionRef,
    active,
    data.listboxState,
    data.activationTrigger,
    /* We also want to trigger this when the position of the active item changes so that we can re-trigger the scrollIntoView */ data.activeOptionIndex,
  ])

  useIsoMorphicEffect(() => {
    if (usedInSelectedOption) return
    return actions.registerOption(id, bag)
  }, [bag, id, usedInSelectedOption])

  let handleClick = useEvent((event: { preventDefault: Function }) => {
    if (disabled) return event.preventDefault()
    actions.onChange(value)
    if (data.mode === ValueMode.Single) {
      actions.closeListbox()
      disposables().nextFrame(() => data.buttonRef.current?.focus({ preventScroll: true }))
    }
  })

  let handleFocus = useEvent(() => {
    if (disabled) return actions.goToOption(Focus.Nothing)
    actions.goToOption(Focus.Specific, id)
  })

  let pointer = useTrackedPointer()

  let handleEnter = useEvent((evt) => {
    pointer.update(evt)
    if (disabled) return
    if (active) return
    actions.goToOption(Focus.Specific, id, ActivationTrigger.Pointer)
  })

  let handleMove = useEvent((evt) => {
    if (!pointer.wasMoved(evt)) return
    if (disabled) return
    if (active) return
    actions.goToOption(Focus.Specific, id, ActivationTrigger.Pointer)
  })

  let handleLeave = useEvent((evt) => {
    if (!pointer.wasMoved(evt)) return
    if (disabled) return
    if (!active) return
    actions.goToOption(Focus.Nothing)
  })

  let slot = useMemo(
    () =>
      ({
        active,
        focus: active,
        selected,
        disabled,
        selectedOption: selected && usedInSelectedOption,
      }) satisfies OptionRenderPropArg,
    [active, selected, disabled, usedInSelectedOption]
  )
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
  ): JSX.Element
}

export interface _internal_ComponentListboxButton extends HasDisplayName {
  <TTag extends ElementType = typeof DEFAULT_BUTTON_TAG>(
    props: ListboxButtonProps<TTag> & RefProp<typeof ButtonFn>
  ): JSX.Element
}

export interface _internal_ComponentListboxLabel extends _internal_ComponentLabel {}

export interface _internal_ComponentListboxOptions extends HasDisplayName {
  <TTag extends ElementType = typeof DEFAULT_OPTIONS_TAG>(
    props: ListboxOptionsProps<TTag> & RefProp<typeof OptionsFn>
  ): JSX.Element
}

export interface _internal_ComponentListboxOption extends HasDisplayName {
  <
    TTag extends ElementType = typeof DEFAULT_OPTION_TAG,
    TType = Parameters<typeof ListboxRoot>[0]['value'],
  >(
    props: ListboxOptionProps<TTag, TType> & RefProp<typeof OptionFn>
  ): JSX.Element
}

export interface _internal_ComponentListboxSelectedOption extends HasDisplayName {
  <TTag extends ElementType = typeof DEFAULT_SELECTED_OPTION_TAG>(
    props: ListboxSelectedOptionProps<TTag> & RefProp<typeof SelectedFn>
  ): JSX.Element
}

let ListboxRoot = forwardRefWithAs(ListboxFn) as unknown as _internal_ComponentListbox
export let ListboxButton = forwardRefWithAs(ButtonFn) as unknown as _internal_ComponentListboxButton
/** @deprecated use `<Label>` instead of `<ListboxLabel>` */
export let ListboxLabel = Label as _internal_ComponentListboxLabel
export let ListboxOptions = forwardRefWithAs(
  OptionsFn
) as unknown as _internal_ComponentListboxOptions
export let ListboxOption = forwardRefWithAs(OptionFn) as unknown as _internal_ComponentListboxOption
export let ListboxSelectedOption = forwardRefWithAs(
  SelectedFn
) as unknown as _internal_ComponentListboxSelectedOption

export let Listbox = Object.assign(ListboxRoot, {
  Button: ListboxButton,
  /** @deprecated use `<Label>` instead of `<Listbox.Label>` */
  Label: ListboxLabel,
  Options: ListboxOptions,
  Option: ListboxOption,
})
