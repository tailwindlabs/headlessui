import React, {
  Fragment,
  createContext,
  createRef,
  useCallback,
  useContext,
  useMemo,
  useReducer,
  useRef,

  // Types
  Dispatch,
  ElementType,
  KeyboardEvent as ReactKeyboardEvent,
  MouseEvent as ReactMouseEvent,
  MutableRefObject,
  Ref,
  useEffect,
} from 'react'

import { useDisposables } from '../../hooks/use-disposables'
import { useId } from '../../hooks/use-id'
import { useIsoMorphicEffect } from '../../hooks/use-iso-morphic-effect'
import { useComputed } from '../../hooks/use-computed'
import { useSyncRefs } from '../../hooks/use-sync-refs'
import { Props } from '../../types'
import { Features, forwardRefWithAs, PropsForFeatures, render, compact } from '../../utils/render'
import { match } from '../../utils/match'
import { disposables } from '../../utils/disposables'
import { Keys } from '../keyboard'
import { Focus, calculateActiveIndex } from '../../utils/calculate-active-index'
import { isDisabledReactIssue7711 } from '../../utils/bugs'
import { isFocusableElement, FocusableMode, sortByDomNode } from '../../utils/focus-management'
import { useOpenClosed, State, OpenClosedProvider } from '../../internal/open-closed'
import { useResolveButtonType } from '../../hooks/use-resolve-button-type'
import { useOutsideClick } from '../../hooks/use-outside-click'
import { VisuallyHidden } from '../../internal/visually-hidden'
import { objectToFormEntries } from '../../utils/form'
import { getOwnerDocument } from '../../utils/owner'

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

type ListboxOptionDataRef = MutableRefObject<{
  textValue?: string
  disabled: boolean
  value: unknown
  domRef: MutableRefObject<HTMLElement | null>
}>

interface StateDefinition {
  listboxState: ListboxStates

  orientation: 'horizontal' | 'vertical'

  propsRef: MutableRefObject<{ value: unknown; onChange(value: unknown): void; mode: ValueMode }>
  labelRef: MutableRefObject<HTMLLabelElement | null>
  buttonRef: MutableRefObject<HTMLButtonElement | null>
  optionsRef: MutableRefObject<HTMLUListElement | null>

  disabled: boolean
  options: { id: string; dataRef: ListboxOptionDataRef }[]
  searchQuery: string
  activeOptionIndex: number | null
  activationTrigger: ActivationTrigger
}

enum ActionTypes {
  OpenListbox,
  CloseListbox,

  SetDisabled,
  SetOrientation,

  GoToOption,
  Search,
  ClearSearch,

  RegisterOption,
  UnregisterOption,
}

function adjustOrderedState(
  state: StateDefinition,
  adjustment: (options: StateDefinition['options']) => StateDefinition['options'] = (i) => i
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

type Actions =
  | { type: ActionTypes.CloseListbox }
  | { type: ActionTypes.OpenListbox }
  | { type: ActionTypes.SetDisabled; disabled: boolean }
  | { type: ActionTypes.SetOrientation; orientation: StateDefinition['orientation'] }
  | { type: ActionTypes.GoToOption; focus: Focus.Specific; id: string; trigger?: ActivationTrigger }
  | {
      type: ActionTypes.GoToOption
      focus: Exclude<Focus, Focus.Specific>
      trigger?: ActivationTrigger
    }
  | { type: ActionTypes.Search; value: string }
  | { type: ActionTypes.ClearSearch }
  | { type: ActionTypes.RegisterOption; id: string; dataRef: ListboxOptionDataRef }
  | { type: ActionTypes.UnregisterOption; id: string }

let reducers: {
  [P in ActionTypes]: (
    state: StateDefinition,
    action: Extract<Actions, { type: P }>
  ) => StateDefinition
} = {
  [ActionTypes.CloseListbox](state) {
    if (state.disabled) return state
    if (state.listboxState === ListboxStates.Closed) return state
    return { ...state, activeOptionIndex: null, listboxState: ListboxStates.Closed }
  },
  [ActionTypes.OpenListbox](state) {
    if (state.disabled) return state
    if (state.listboxState === ListboxStates.Open) return state

    // Check if we have a selected value that we can make active
    let activeOptionIndex = state.activeOptionIndex
    let { value, mode } = state.propsRef.current
    let optionIdx = state.options.findIndex((option) => {
      let optionValue = option.dataRef.current.value
      let selected = match(mode, {
        [ValueMode.Multi]: () => (value as unknown[]).includes(optionValue),
        [ValueMode.Single]: () => value === optionValue,
      })

      return selected
    })

    if (optionIdx !== -1) {
      activeOptionIndex = optionIdx
    }

    return { ...state, listboxState: ListboxStates.Open, activeOptionIndex }
  },
  [ActionTypes.SetDisabled](state, action) {
    if (state.disabled === action.disabled) return state
    return { ...state, disabled: action.disabled }
  },
  [ActionTypes.SetOrientation](state, action) {
    if (state.orientation === action.orientation) return state
    return { ...state, orientation: action.orientation }
  },
  [ActionTypes.GoToOption](state, action) {
    if (state.disabled) return state
    if (state.listboxState === ListboxStates.Closed) return state

    let adjustedState = adjustOrderedState(state)
    let activeOptionIndex = calculateActiveIndex(action, {
      resolveItems: () => adjustedState.options,
      resolveActiveIndex: () => adjustedState.activeOptionIndex,
      resolveId: (option) => option.id,
      resolveDisabled: (option) => option.dataRef.current.disabled,
    })

    return {
      ...state,
      ...adjustedState,
      searchQuery: '',
      activeOptionIndex,
      activationTrigger: action.trigger ?? ActivationTrigger.Other,
    }
  },
  [ActionTypes.Search]: (state, action) => {
    if (state.disabled) return state
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
    if (state.disabled) return state
    if (state.listboxState === ListboxStates.Closed) return state
    if (state.searchQuery === '') return state
    return { ...state, searchQuery: '' }
  },
  [ActionTypes.RegisterOption]: (state, action) => {
    let option = { id: action.id, dataRef: action.dataRef }
    let adjustedState = adjustOrderedState(state, (options) => [...options, option])

    // Check if we need to make the newly registered option active.
    if (state.activeOptionIndex === null) {
      let { value, mode } = state.propsRef.current
      let optionValue = action.dataRef.current.value
      let selected = match(mode, {
        [ValueMode.Multi]: () => (value as unknown[]).includes(optionValue),
        [ValueMode.Single]: () => value === optionValue,
      })
      if (selected) {
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

let ListboxContext = createContext<[StateDefinition, Dispatch<Actions>] | null>(null)
ListboxContext.displayName = 'ListboxContext'

function useListboxContext(component: string) {
  let context = useContext(ListboxContext)
  if (context === null) {
    let err = new Error(`<${component} /> is missing a parent <Listbox /> component.`)
    if (Error.captureStackTrace) Error.captureStackTrace(err, useListboxContext)
    throw err
  }
  return context
}

function stateReducer(state: StateDefinition, action: Actions) {
  return match(action.type, reducers, state, action)
}

// ---

let DEFAULT_LISTBOX_TAG = Fragment
interface ListboxRenderPropArg {
  open: boolean
  disabled: boolean
}

let ListboxRoot = forwardRefWithAs(function Listbox<
  TTag extends ElementType = typeof DEFAULT_LISTBOX_TAG,
  TType = string,
  TActualType = TType extends (infer U)[] ? U : TType
>(
  props: Props<
    TTag,
    ListboxRenderPropArg,
    'value' | 'onChange' | 'disabled' | 'horizontal' | 'name' | 'multiple'
  > & {
    value: TType
    onChange(value: TType): void
    disabled?: boolean
    horizontal?: boolean
    name?: string
    multiple?: boolean
  },
  ref: Ref<TTag>
) {
  let {
    value,
    name,
    onChange,
    disabled = false,
    horizontal = false,
    multiple = false,
    ...theirProps
  } = props
  const orientation = horizontal ? 'horizontal' : 'vertical'
  let listboxRef = useSyncRefs(ref)

  let reducerBag = useReducer(stateReducer, {
    listboxState: ListboxStates.Closed,
    propsRef: {
      current: { value, onChange, mode: multiple ? ValueMode.Multi : ValueMode.Single },
    },
    labelRef: createRef(),
    buttonRef: createRef(),
    optionsRef: createRef(),
    disabled,
    orientation,
    options: [],
    searchQuery: '',
    activeOptionIndex: null,
    activationTrigger: ActivationTrigger.Other,
  } as StateDefinition)
  let [{ listboxState, propsRef, optionsRef, buttonRef }, dispatch] = reducerBag

  propsRef.current.value = value
  propsRef.current.mode = multiple ? ValueMode.Multi : ValueMode.Single

  useIsoMorphicEffect(() => {
    propsRef.current.onChange = (value: unknown) => {
      return match(propsRef.current.mode, {
        [ValueMode.Single]() {
          return onChange(value as TType)
        },
        [ValueMode.Multi]() {
          let copy = (propsRef.current.value as TActualType[]).slice()

          let idx = copy.indexOf(value as TActualType)
          if (idx === -1) {
            copy.push(value as TActualType)
          } else {
            copy.splice(idx, 1)
          }

          return onChange(copy as unknown as TType)
        },
      })
    }
  }, [onChange, propsRef])
  useIsoMorphicEffect(() => dispatch({ type: ActionTypes.SetDisabled, disabled }), [disabled])
  useIsoMorphicEffect(
    () => dispatch({ type: ActionTypes.SetOrientation, orientation }),
    [orientation]
  )

  // Handle outside click
  useOutsideClick([buttonRef, optionsRef], (event, target) => {
    if (listboxState !== ListboxStates.Open) return

    dispatch({ type: ActionTypes.CloseListbox })

    if (!isFocusableElement(target, FocusableMode.Loose)) {
      event.preventDefault()
      buttonRef.current?.focus()
    }
  })

  let slot = useMemo<ListboxRenderPropArg>(
    () => ({ open: listboxState === ListboxStates.Open, disabled }),
    [listboxState, disabled]
  )

  let ourProps = { ref: listboxRef }

  return (
    <ListboxContext.Provider value={reducerBag}>
      <OpenClosedProvider
        value={match(listboxState, {
          [ListboxStates.Open]: State.Open,
          [ListboxStates.Closed]: State.Closed,
        })}
      >
        {name != null &&
          value != null &&
          objectToFormEntries({ [name]: value }).map(([name, value]) => (
            <VisuallyHidden
              {...compact({
                key: name,
                as: 'input',
                type: 'hidden',
                hidden: true,
                readOnly: true,
                name,
                value,
              })}
            />
          ))}
        {render({ ourProps, theirProps, slot, defaultTag: DEFAULT_LISTBOX_TAG, name: 'Listbox' })}
      </OpenClosedProvider>
    </ListboxContext.Provider>
  )
})

// ---

let DEFAULT_BUTTON_TAG = 'button' as const
interface ButtonRenderPropArg {
  open: boolean
  disabled: boolean
}
type ButtonPropsWeControl =
  | 'id'
  | 'type'
  | 'aria-haspopup'
  | 'aria-controls'
  | 'aria-expanded'
  | 'aria-labelledby'
  | 'disabled'
  | 'onKeyDown'
  | 'onClick'

let Button = forwardRefWithAs(function Button<TTag extends ElementType = typeof DEFAULT_BUTTON_TAG>(
  props: Props<TTag, ButtonRenderPropArg, ButtonPropsWeControl>,
  ref: Ref<HTMLButtonElement>
) {
  let [state, dispatch] = useListboxContext('Listbox.Button')
  let buttonRef = useSyncRefs(state.buttonRef, ref)

  let id = `headlessui-listbox-button-${useId()}`
  let d = useDisposables()

  let handleKeyDown = useCallback(
    (event: ReactKeyboardEvent<HTMLButtonElement>) => {
      switch (event.key) {
        // Ref: https://www.w3.org/TR/wai-aria-practices-1.2/#keyboard-interaction-13

        case Keys.Space:
        case Keys.Enter:
        case Keys.ArrowDown:
          event.preventDefault()
          dispatch({ type: ActionTypes.OpenListbox })
          d.nextFrame(() => {
            if (!state.propsRef.current.value)
              dispatch({ type: ActionTypes.GoToOption, focus: Focus.First })
          })
          break

        case Keys.ArrowUp:
          event.preventDefault()
          dispatch({ type: ActionTypes.OpenListbox })
          d.nextFrame(() => {
            if (!state.propsRef.current.value)
              dispatch({ type: ActionTypes.GoToOption, focus: Focus.Last })
          })
          break
      }
    },
    [dispatch, state, d]
  )

  let handleKeyUp = useCallback((event: ReactKeyboardEvent<HTMLButtonElement>) => {
    switch (event.key) {
      case Keys.Space:
        // Required for firefox, event.preventDefault() in handleKeyDown for
        // the Space key doesn't cancel the handleKeyUp, which in turn
        // triggers a *click*.
        event.preventDefault()
        break
    }
  }, [])

  let handleClick = useCallback(
    (event: ReactMouseEvent) => {
      if (isDisabledReactIssue7711(event.currentTarget)) return event.preventDefault()
      if (state.listboxState === ListboxStates.Open) {
        dispatch({ type: ActionTypes.CloseListbox })
        d.nextFrame(() => state.buttonRef.current?.focus({ preventScroll: true }))
      } else {
        event.preventDefault()
        dispatch({ type: ActionTypes.OpenListbox })
      }
    },
    [dispatch, d, state]
  )

  let labelledby = useComputed(() => {
    if (!state.labelRef.current) return undefined
    return [state.labelRef.current.id, id].join(' ')
  }, [state.labelRef.current, id])

  let slot = useMemo<ButtonRenderPropArg>(
    () => ({ open: state.listboxState === ListboxStates.Open, disabled: state.disabled }),
    [state]
  )
  let theirProps = props
  let ourProps = {
    ref: buttonRef,
    id,
    type: useResolveButtonType(props, state.buttonRef),
    'aria-haspopup': true,
    'aria-controls': state.optionsRef.current?.id,
    'aria-expanded': state.disabled ? undefined : state.listboxState === ListboxStates.Open,
    'aria-labelledby': labelledby,
    disabled: state.disabled,
    onKeyDown: handleKeyDown,
    onKeyUp: handleKeyUp,
    onClick: handleClick,
  }

  return render({
    ourProps,
    theirProps,
    slot,
    defaultTag: DEFAULT_BUTTON_TAG,
    name: 'Listbox.Button',
  })
})

// ---

let DEFAULT_LABEL_TAG = 'label' as const
interface LabelRenderPropArg {
  open: boolean
  disabled: boolean
}
type LabelPropsWeControl = 'id' | 'ref' | 'onClick'

let Label = forwardRefWithAs(function Label<TTag extends ElementType = typeof DEFAULT_LABEL_TAG>(
  props: Props<TTag, LabelRenderPropArg, LabelPropsWeControl>,
  ref: Ref<HTMLElement>
) {
  let [state] = useListboxContext('Listbox.Label')
  let id = `headlessui-listbox-label-${useId()}`
  let labelRef = useSyncRefs(state.labelRef, ref)

  let handleClick = useCallback(
    () => state.buttonRef.current?.focus({ preventScroll: true }),
    [state.buttonRef]
  )

  let slot = useMemo<LabelRenderPropArg>(
    () => ({ open: state.listboxState === ListboxStates.Open, disabled: state.disabled }),
    [state]
  )
  let theirProps = props
  let ourProps = { ref: labelRef, id, onClick: handleClick }

  return render({
    ourProps,
    theirProps,
    slot,
    defaultTag: DEFAULT_LABEL_TAG,
    name: 'Listbox.Label',
  })
})

// ---

let DEFAULT_OPTIONS_TAG = 'ul' as const
interface OptionsRenderPropArg {
  open: boolean
}
type OptionsPropsWeControl =
  | 'aria-activedescendant'
  | 'aria-labelledby'
  | 'aria-orientation'
  | 'id'
  | 'onKeyDown'
  | 'role'
  | 'tabIndex'

let OptionsRenderFeatures = Features.RenderStrategy | Features.Static

let Options = forwardRefWithAs(function Options<
  TTag extends ElementType = typeof DEFAULT_OPTIONS_TAG
>(
  props: Props<TTag, OptionsRenderPropArg, OptionsPropsWeControl> &
    PropsForFeatures<typeof OptionsRenderFeatures>,
  ref: Ref<HTMLElement>
) {
  let [state, dispatch] = useListboxContext('Listbox.Options')
  let optionsRef = useSyncRefs(state.optionsRef, ref)

  let id = `headlessui-listbox-options-${useId()}`
  let d = useDisposables()
  let searchDisposables = useDisposables()

  let usesOpenClosedState = useOpenClosed()
  let visible = (() => {
    if (usesOpenClosedState !== null) {
      return usesOpenClosedState === State.Open
    }

    return state.listboxState === ListboxStates.Open
  })()

  useEffect(() => {
    let container = state.optionsRef.current
    if (!container) return
    if (state.listboxState !== ListboxStates.Open) return
    if (container === getOwnerDocument(container)?.activeElement) return

    container.focus({ preventScroll: true })
  }, [state.listboxState, state.optionsRef])

  let handleKeyDown = useCallback(
    (event: ReactKeyboardEvent<HTMLUListElement>) => {
      searchDisposables.dispose()

      switch (event.key) {
        // Ref: https://www.w3.org/TR/wai-aria-practices-1.2/#keyboard-interaction-12

        // @ts-expect-error Fallthrough is expected here
        case Keys.Space:
          if (state.searchQuery !== '') {
            event.preventDefault()
            event.stopPropagation()
            return dispatch({ type: ActionTypes.Search, value: event.key })
          }
        // When in type ahead mode, fallthrough
        case Keys.Enter:
          event.preventDefault()
          event.stopPropagation()

          if (state.activeOptionIndex !== null) {
            let { dataRef } = state.options[state.activeOptionIndex]
            state.propsRef.current.onChange(dataRef.current.value)
          }
          if (state.propsRef.current.mode === ValueMode.Single) {
            dispatch({ type: ActionTypes.CloseListbox })
            disposables().nextFrame(() => state.buttonRef.current?.focus({ preventScroll: true }))
          }
          break

        case match(state.orientation, { vertical: Keys.ArrowDown, horizontal: Keys.ArrowRight }):
          event.preventDefault()
          event.stopPropagation()
          return dispatch({ type: ActionTypes.GoToOption, focus: Focus.Next })

        case match(state.orientation, { vertical: Keys.ArrowUp, horizontal: Keys.ArrowLeft }):
          event.preventDefault()
          event.stopPropagation()
          return dispatch({ type: ActionTypes.GoToOption, focus: Focus.Previous })

        case Keys.Home:
        case Keys.PageUp:
          event.preventDefault()
          event.stopPropagation()
          return dispatch({ type: ActionTypes.GoToOption, focus: Focus.First })

        case Keys.End:
        case Keys.PageDown:
          event.preventDefault()
          event.stopPropagation()
          return dispatch({ type: ActionTypes.GoToOption, focus: Focus.Last })

        case Keys.Escape:
          event.preventDefault()
          event.stopPropagation()
          dispatch({ type: ActionTypes.CloseListbox })
          return d.nextFrame(() => state.buttonRef.current?.focus({ preventScroll: true }))

        case Keys.Tab:
          event.preventDefault()
          event.stopPropagation()
          break

        default:
          if (event.key.length === 1) {
            dispatch({ type: ActionTypes.Search, value: event.key })
            searchDisposables.setTimeout(() => dispatch({ type: ActionTypes.ClearSearch }), 350)
          }
          break
      }
    },
    [d, dispatch, searchDisposables, state]
  )

  let labelledby = useComputed(
    () => state.labelRef.current?.id ?? state.buttonRef.current?.id,
    [state.labelRef.current, state.buttonRef.current]
  )

  let slot = useMemo<OptionsRenderPropArg>(
    () => ({ open: state.listboxState === ListboxStates.Open }),
    [state]
  )

  let theirProps = props
  let ourProps = {
    'aria-activedescendant':
      state.activeOptionIndex === null ? undefined : state.options[state.activeOptionIndex]?.id,
    'aria-multiselectable': state.propsRef.current.mode === ValueMode.Multi ? true : undefined,
    'aria-labelledby': labelledby,
    'aria-orientation': state.orientation,
    id,
    onKeyDown: handleKeyDown,
    role: 'listbox',
    tabIndex: 0,
    ref: optionsRef,
  }

  return render({
    ourProps,
    theirProps,
    slot,
    defaultTag: DEFAULT_OPTIONS_TAG,
    features: OptionsRenderFeatures,
    visible,
    name: 'Listbox.Options',
  })
})

// ---

let DEFAULT_OPTION_TAG = 'li' as const
interface OptionRenderPropArg {
  active: boolean
  selected: boolean
  disabled: boolean
}
type ListboxOptionPropsWeControl =
  | 'id'
  | 'role'
  | 'tabIndex'
  | 'aria-disabled'
  | 'aria-selected'
  | 'onPointerLeave'
  | 'onMouseLeave'
  | 'onPointerMove'
  | 'onMouseMove'
  | 'onFocus'

let Option = forwardRefWithAs(function Option<
  TTag extends ElementType = typeof DEFAULT_OPTION_TAG,
  // TODO: One day we will be able to infer this type from the generic in Listbox itself.
  // But today is not that day..
  TType = Parameters<typeof ListboxRoot>[0]['value']
>(
  props: Props<TTag, OptionRenderPropArg, ListboxOptionPropsWeControl | 'value'> & {
    disabled?: boolean
    value: TType
  },
  ref: Ref<HTMLElement>
) {
  let { disabled = false, value, ...theirProps } = props
  let [state, dispatch] = useListboxContext('Listbox.Option')
  let id = `headlessui-listbox-option-${useId()}`
  let active =
    state.activeOptionIndex !== null ? state.options[state.activeOptionIndex].id === id : false
  let selected = match(state.propsRef.current.mode, {
    [ValueMode.Multi]: () => (state.propsRef.current.value as TType[]).includes(value),
    [ValueMode.Single]: () => state.propsRef.current.value === value,
  })

  let internalOptionRef = useRef<HTMLLIElement | null>(null)
  let optionRef = useSyncRefs(ref, internalOptionRef)

  useIsoMorphicEffect(() => {
    if (state.listboxState !== ListboxStates.Open) return
    if (!active) return
    if (state.activationTrigger === ActivationTrigger.Pointer) return
    let d = disposables()
    d.requestAnimationFrame(() => {
      internalOptionRef.current?.scrollIntoView?.({ block: 'nearest' })
    })
    return d.dispose
  }, [internalOptionRef, active, state.listboxState, state.activationTrigger, /* We also want to trigger this when the position of the active item changes so that we can re-trigger the scrollIntoView */ state.activeOptionIndex])

  let bag = useRef<ListboxOptionDataRef['current']>({ disabled, value, domRef: internalOptionRef })

  useIsoMorphicEffect(() => {
    bag.current.disabled = disabled
  }, [bag, disabled])
  useIsoMorphicEffect(() => {
    bag.current.value = value
  }, [bag, value])
  useIsoMorphicEffect(() => {
    bag.current.textValue = internalOptionRef.current?.textContent?.toLowerCase()
  }, [bag, internalOptionRef])

  let select = useCallback(() => state.propsRef.current.onChange(value), [state.propsRef, value])

  useIsoMorphicEffect(() => {
    dispatch({ type: ActionTypes.RegisterOption, id, dataRef: bag })
    return () => dispatch({ type: ActionTypes.UnregisterOption, id })
  }, [bag, id])

  let handleClick = useCallback(
    (event: { preventDefault: Function }) => {
      if (disabled) return event.preventDefault()
      select()
      if (state.propsRef.current.mode === ValueMode.Single) {
        dispatch({ type: ActionTypes.CloseListbox })
        disposables().nextFrame(() => state.buttonRef.current?.focus({ preventScroll: true }))
      }
    },
    [dispatch, state.buttonRef, disabled, select]
  )

  let handleFocus = useCallback(() => {
    if (disabled) return dispatch({ type: ActionTypes.GoToOption, focus: Focus.Nothing })
    dispatch({ type: ActionTypes.GoToOption, focus: Focus.Specific, id })
  }, [disabled, id, dispatch])

  let handleMove = useCallback(() => {
    if (disabled) return
    if (active) return
    dispatch({
      type: ActionTypes.GoToOption,
      focus: Focus.Specific,
      id,
      trigger: ActivationTrigger.Pointer,
    })
  }, [disabled, active, id, dispatch])

  let handleLeave = useCallback(() => {
    if (disabled) return
    if (!active) return
    dispatch({ type: ActionTypes.GoToOption, focus: Focus.Nothing })
  }, [disabled, active, dispatch])

  let slot = useMemo<OptionRenderPropArg>(
    () => ({ active, selected, disabled }),
    [active, selected, disabled]
  )
  let ourProps = {
    id,
    ref: optionRef,
    role: 'option',
    tabIndex: disabled === true ? undefined : -1,
    'aria-disabled': disabled === true ? true : undefined,
    // According to the WAI-ARIA best practices, we should use aria-checked for
    // multi-select,but Voice-Over disagrees. So we use aria-checked instead for
    // both single and multi-select.
    'aria-selected': selected === true ? true : undefined,
    disabled: undefined, // Never forward the `disabled` prop
    onClick: handleClick,
    onFocus: handleFocus,
    onPointerMove: handleMove,
    onMouseMove: handleMove,
    onPointerLeave: handleLeave,
    onMouseLeave: handleLeave,
  }

  return render({
    ourProps,
    theirProps,
    slot,
    defaultTag: DEFAULT_OPTION_TAG,
    name: 'Listbox.Option',
  })
})

// ---

export let Listbox = Object.assign(ListboxRoot, { Button, Label, Options, Option })
