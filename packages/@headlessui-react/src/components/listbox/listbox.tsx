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
} from 'react'

import { useDisposables } from '../../hooks/use-disposables'
import { useId } from '../../hooks/use-id'
import { useIsoMorphicEffect } from '../../hooks/use-iso-morphic-effect'
import { useComputed } from '../../hooks/use-computed'
import { useSyncRefs } from '../../hooks/use-sync-refs'
import { Props } from '../../types'
import { Features, forwardRefWithAs, PropsForFeatures, render } from '../../utils/render'
import { match } from '../../utils/match'
import { disposables } from '../../utils/disposables'
import { Keys } from '../keyboard'
import { Focus, calculateActiveIndex } from '../../utils/calculate-active-index'
import { isDisabledReactIssue7711 } from '../../utils/bugs'
import { isFocusableElement, FocusableMode } from '../../utils/focus-management'
import { useWindowEvent } from '../../hooks/use-window-event'
import { useOpenClosed, State, OpenClosedProvider } from '../../internal/open-closed'
import { useResolveButtonType } from '../../hooks/use-resolve-button-type'

enum ListboxStates {
  Open,
  Closed,
}

type ListboxOptionDataRef = MutableRefObject<{
  textValue?: string
  disabled: boolean
  value: unknown
}>

interface StateDefinition {
  listboxState: ListboxStates

  orientation: 'horizontal' | 'vertical'

  propsRef: MutableRefObject<{ value: unknown; onChange(value: unknown): void }>
  labelRef: MutableRefObject<HTMLLabelElement | null>
  buttonRef: MutableRefObject<HTMLButtonElement | null>
  optionsRef: MutableRefObject<HTMLUListElement | null>

  disabled: boolean
  options: { id: string; dataRef: ListboxOptionDataRef }[]
  searchQuery: string
  activeOptionIndex: number | null
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

type Actions =
  | { type: ActionTypes.CloseListbox }
  | { type: ActionTypes.OpenListbox }
  | { type: ActionTypes.SetDisabled; disabled: boolean }
  | { type: ActionTypes.SetOrientation; orientation: StateDefinition['orientation'] }
  | { type: ActionTypes.GoToOption; focus: Focus.Specific; id: string }
  | { type: ActionTypes.GoToOption; focus: Exclude<Focus, Focus.Specific> }
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
    return { ...state, listboxState: ListboxStates.Open }
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

    let activeOptionIndex = calculateActiveIndex(action, {
      resolveItems: () => state.options,
      resolveActiveIndex: () => state.activeOptionIndex,
      resolveId: item => item.id,
      resolveDisabled: item => item.dataRef.current.disabled,
    })

    if (state.searchQuery === '' && state.activeOptionIndex === activeOptionIndex) return state
    return { ...state, searchQuery: '', activeOptionIndex }
  },
  [ActionTypes.Search]: (state, action) => {
    if (state.disabled) return state
    if (state.listboxState === ListboxStates.Closed) return state

    let searchQuery = state.searchQuery + action.value.toLowerCase()

    let reOrderedOptions =
      state.activeOptionIndex !== null
        ? state.options
            .slice(state.activeOptionIndex + 1)
            .concat(state.options.slice(0, state.activeOptionIndex + 1))
        : state.options

    let matchingOption = reOrderedOptions.find(
      option =>
        !option.dataRef.current.disabled &&
        option.dataRef.current.textValue?.startsWith(searchQuery)
    )

    let matchIdx = matchingOption ? state.options.indexOf(matchingOption) : -1

    if (matchIdx === -1 || matchIdx === state.activeOptionIndex) return { ...state, searchQuery }
    return { ...state, searchQuery, activeOptionIndex: matchIdx }
  },
  [ActionTypes.ClearSearch](state) {
    if (state.disabled) return state
    if (state.listboxState === ListboxStates.Closed) return state
    if (state.searchQuery === '') return state
    return { ...state, searchQuery: '' }
  },
  [ActionTypes.RegisterOption]: (state, action) => {
    let orderMap = Array.from(
      state.optionsRef.current?.querySelectorAll('[id^="headlessui-listbox-option-"]')!
    ).reduce(
      (lookup, element, index) => Object.assign(lookup, { [element.id]: index }),
      {}
    ) as Record<string, number>

    let options = [...state.options, { id: action.id, dataRef: action.dataRef }].sort(
      (a, z) => orderMap[a.id] - orderMap[z.id]
    )

    return { ...state, options }
  },
  [ActionTypes.UnregisterOption]: (state, action) => {
    let nextOptions = state.options.slice()
    let currentActiveOption =
      state.activeOptionIndex !== null ? nextOptions[state.activeOptionIndex] : null

    let idx = nextOptions.findIndex(a => a.id === action.id)

    if (idx !== -1) nextOptions.splice(idx, 1)

    return {
      ...state,
      options: nextOptions,
      activeOptionIndex: (() => {
        if (idx === state.activeOptionIndex) return null
        if (currentActiveOption === null) return null

        // If we removed the option before the actual active index, then it would be out of sync. To
        // fix this, we will find the correct (new) index position.
        return nextOptions.indexOf(currentActiveOption)
      })(),
    }
  },
}

let ListboxContext = createContext<[StateDefinition, Dispatch<Actions>] | null>(null)
ListboxContext.displayName = 'ListboxContext'

function useListboxContext(component: string) {
  let context = useContext(ListboxContext)
  if (context === null) {
    let err = new Error(`<${component} /> is missing a parent <${Listbox.name} /> component.`)
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

export function Listbox<TTag extends ElementType = typeof DEFAULT_LISTBOX_TAG, TType = string>(
  props: Props<TTag, ListboxRenderPropArg, 'value' | 'onChange'> & {
    value: TType
    onChange(value: TType): void
    disabled?: boolean
    horizontal?: boolean
  }
) {
  let { value, onChange, disabled = false, horizontal = false, ...passThroughProps } = props
  const orientation = horizontal ? 'horizontal' : 'vertical'

  let reducerBag = useReducer(stateReducer, {
    listboxState: ListboxStates.Closed,
    propsRef: { current: { value, onChange } },
    labelRef: createRef(),
    buttonRef: createRef(),
    optionsRef: createRef(),
    disabled,
    orientation,
    options: [],
    searchQuery: '',
    activeOptionIndex: null,
  } as StateDefinition)
  let [{ listboxState, propsRef, optionsRef, buttonRef }, dispatch] = reducerBag

  useIsoMorphicEffect(() => {
    propsRef.current.value = value
  }, [value, propsRef])
  useIsoMorphicEffect(() => {
    propsRef.current.onChange = onChange
  }, [onChange, propsRef])
  useIsoMorphicEffect(() => dispatch({ type: ActionTypes.SetDisabled, disabled }), [disabled])
  useIsoMorphicEffect(() => dispatch({ type: ActionTypes.SetOrientation, orientation }), [
    orientation,
  ])

  // Handle outside click
  useWindowEvent('mousedown', event => {
    let target = event.target as HTMLElement

    if (listboxState !== ListboxStates.Open) return

    if (buttonRef.current?.contains(target)) return
    if (optionsRef.current?.contains(target)) return

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

  return (
    <ListboxContext.Provider value={reducerBag}>
      <OpenClosedProvider
        value={match(listboxState, {
          [ListboxStates.Open]: State.Open,
          [ListboxStates.Closed]: State.Closed,
        })}
      >
        {render({
          props: passThroughProps,
          slot,
          defaultTag: DEFAULT_LISTBOX_TAG,
          name: 'Listbox',
        })}
      </OpenClosedProvider>
    </ListboxContext.Provider>
  )
}

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
  let [state, dispatch] = useListboxContext([Listbox.name, Button.name].join('.'))
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
  let passthroughProps = props
  let propsWeControl = {
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
    props: { ...passthroughProps, ...propsWeControl },
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

function Label<TTag extends ElementType = typeof DEFAULT_LABEL_TAG>(
  props: Props<TTag, LabelRenderPropArg, LabelPropsWeControl>
) {
  let [state] = useListboxContext([Listbox.name, Label.name].join('.'))
  let id = `headlessui-listbox-label-${useId()}`

  let handleClick = useCallback(() => state.buttonRef.current?.focus({ preventScroll: true }), [
    state.buttonRef,
  ])

  let slot = useMemo<LabelRenderPropArg>(
    () => ({ open: state.listboxState === ListboxStates.Open, disabled: state.disabled }),
    [state]
  )
  let propsWeControl = { ref: state.labelRef, id, onClick: handleClick }
  return render({
    props: { ...props, ...propsWeControl },
    slot,
    defaultTag: DEFAULT_LABEL_TAG,
    name: 'Listbox.Label',
  })
}

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
  ref: Ref<HTMLUListElement>
) {
  let [state, dispatch] = useListboxContext([Listbox.name, Options.name].join('.'))
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

  useIsoMorphicEffect(() => {
    let container = state.optionsRef.current
    if (!container) return
    if (state.listboxState !== ListboxStates.Open) return
    if (container === document.activeElement) return

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
          dispatch({ type: ActionTypes.CloseListbox })
          if (state.activeOptionIndex !== null) {
            let { dataRef } = state.options[state.activeOptionIndex]
            state.propsRef.current.onChange(dataRef.current.value)
          }
          disposables().nextFrame(() => state.buttonRef.current?.focus({ preventScroll: true }))
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

  let labelledby = useComputed(() => state.labelRef.current?.id ?? state.buttonRef.current?.id, [
    state.labelRef.current,
    state.buttonRef.current,
  ])

  let slot = useMemo<OptionsRenderPropArg>(
    () => ({ open: state.listboxState === ListboxStates.Open }),
    [state]
  )
  let propsWeControl = {
    'aria-activedescendant':
      state.activeOptionIndex === null ? undefined : state.options[state.activeOptionIndex]?.id,
    'aria-labelledby': labelledby,
    'aria-orientation': state.orientation,
    id,
    onKeyDown: handleKeyDown,
    role: 'listbox',
    tabIndex: 0,
    ref: optionsRef,
  }
  let passthroughProps = props

  return render({
    props: { ...passthroughProps, ...propsWeControl },
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

function Option<
  TTag extends ElementType = typeof DEFAULT_OPTION_TAG,
  // TODO: One day we will be able to infer this type from the generic in Listbox itself.
  // But today is not that day..
  TType = Parameters<typeof Listbox>[0]['value']
>(
  props: Props<TTag, OptionRenderPropArg, ListboxOptionPropsWeControl | 'value'> & {
    disabled?: boolean
    value: TType
  }
) {
  let { disabled = false, value, ...passthroughProps } = props
  let [state, dispatch] = useListboxContext([Listbox.name, Option.name].join('.'))
  let id = `headlessui-listbox-option-${useId()}`
  let active =
    state.activeOptionIndex !== null ? state.options[state.activeOptionIndex].id === id : false
  let selected = state.propsRef.current.value === value

  let bag = useRef<ListboxOptionDataRef['current']>({ disabled, value })

  useIsoMorphicEffect(() => {
    bag.current.disabled = disabled
  }, [bag, disabled])
  useIsoMorphicEffect(() => {
    bag.current.value = value
  }, [bag, value])
  useIsoMorphicEffect(() => {
    bag.current.textValue = document.getElementById(id)?.textContent?.toLowerCase()
  }, [bag, id])

  let select = useCallback(() => state.propsRef.current.onChange(value), [state.propsRef, value])

  useIsoMorphicEffect(() => {
    dispatch({ type: ActionTypes.RegisterOption, id, dataRef: bag })
    return () => dispatch({ type: ActionTypes.UnregisterOption, id })
  }, [bag, id])

  useIsoMorphicEffect(() => {
    if (state.listboxState !== ListboxStates.Open) return
    if (!selected) return
    dispatch({ type: ActionTypes.GoToOption, focus: Focus.Specific, id })
    document.getElementById(id)?.focus?.()
  }, [state.listboxState])

  useIsoMorphicEffect(() => {
    if (state.listboxState !== ListboxStates.Open) return
    if (!active) return
    let d = disposables()
    d.nextFrame(() => document.getElementById(id)?.scrollIntoView?.({ block: 'nearest' }))
    return d.dispose
  }, [id, active, state.listboxState])

  let handleClick = useCallback(
    (event: { preventDefault: Function }) => {
      if (disabled) return event.preventDefault()
      select()
      dispatch({ type: ActionTypes.CloseListbox })
      disposables().nextFrame(() => state.buttonRef.current?.focus({ preventScroll: true }))
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
    dispatch({ type: ActionTypes.GoToOption, focus: Focus.Specific, id })
  }, [disabled, active, id, dispatch])

  let handleLeave = useCallback(() => {
    if (disabled) return
    if (!active) return
    dispatch({ type: ActionTypes.GoToOption, focus: Focus.Nothing })
  }, [disabled, active, dispatch])

  let slot = useMemo<OptionRenderPropArg>(() => ({ active, selected, disabled }), [
    active,
    selected,
    disabled,
  ])
  let propsWeControl = {
    id,
    role: 'option',
    tabIndex: disabled === true ? undefined : -1,
    'aria-disabled': disabled === true ? true : undefined,
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
    props: { ...passthroughProps, ...propsWeControl },
    slot,
    defaultTag: DEFAULT_OPTION_TAG,
    name: 'Listbox.Option',
  })
}

// ---

Listbox.Button = Button
Listbox.Label = Label
Listbox.Options = Options
Listbox.Option = Option
