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

enum ComboboxStates {
  Open,
  Closed,
}

type ComboboxOptionDataRef = MutableRefObject<{
  disabled: boolean
  value: unknown
}>

interface StateDefinition {
  comboboxState: ComboboxStates

  orientation: 'horizontal' | 'vertical'

  propsRef: MutableRefObject<{
    value: unknown
    onChange(value: unknown): void
    onSearch(value: unknown): void
  }>
  labelRef: MutableRefObject<HTMLLabelElement | null>
  inputRef: MutableRefObject<HTMLInputElement | null>
  buttonRef: MutableRefObject<HTMLButtonElement | null>
  optionsRef: MutableRefObject<HTMLUListElement | null>

  disabled: boolean
  options: { id: string; dataRef: ComboboxOptionDataRef }[]
  searchQuery: string
  activeOptionIndex: number | null
}

enum ActionTypes {
  OpenCombobox,
  CloseCombobox,

  SetDisabled,
  SetOrientation,

  GoToOption,

  SelectOption,
  SelectActiveOption,

  RegisterOption,
  UnregisterOption,
}

type Actions =
  | { type: ActionTypes.CloseCombobox }
  | { type: ActionTypes.OpenCombobox }
  | { type: ActionTypes.SetDisabled; disabled: boolean }
  | { type: ActionTypes.SetOrientation; orientation: StateDefinition['orientation'] }
  | { type: ActionTypes.GoToOption; focus: Focus.Specific; id: string }
  | { type: ActionTypes.GoToOption; focus: Exclude<Focus, Focus.Specific> }
  | { type: ActionTypes.SelectOption; id: string }
  | { type: ActionTypes.SelectActiveOption }
  | { type: ActionTypes.RegisterOption; id: string; dataRef: ComboboxOptionDataRef }
  | { type: ActionTypes.UnregisterOption; id: string }

let reducers: {
  [P in ActionTypes]: (
    state: StateDefinition,
    action: Extract<Actions, { type: P }>
  ) => StateDefinition
} = {
  [ActionTypes.CloseCombobox](state) {
    if (state.disabled) return state
    if (state.comboboxState === ComboboxStates.Closed) return state
    return { ...state, activeOptionIndex: null, comboboxState: ComboboxStates.Closed }
  },
  [ActionTypes.OpenCombobox](state) {
    if (state.disabled) return state
    if (state.comboboxState === ComboboxStates.Open) return state
    return { ...state, comboboxState: ComboboxStates.Open }
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
    if (state.comboboxState === ComboboxStates.Closed) return state

    let activeOptionIndex = calculateActiveIndex(action, {
      resolveItems: () => state.options,
      resolveActiveIndex: () => state.activeOptionIndex,
      resolveId: item => item.id,
      resolveDisabled: item => item.dataRef.current.disabled,
    })

    if (state.searchQuery === '' && state.activeOptionIndex === activeOptionIndex) return state
    return { ...state, searchQuery: '', activeOptionIndex }
  },
  [ActionTypes.SelectOption](state, action) {
    let option = state.options.find(item => item.id === action.id)
    if (!option) return state

    let { dataRef } = option
    state.propsRef.current.onChange(dataRef.current.value)

    // TODO: make sure this is a proper string
    if (typeof dataRef.current.value === 'string' && state.inputRef.current) {
      state.inputRef.current.value = dataRef.current.value
    }

    return state
  },
  [ActionTypes.SelectActiveOption](state) {
    if (state.activeOptionIndex !== null) {
      let { dataRef } = state.options[state.activeOptionIndex]
      state.propsRef.current.onChange(dataRef.current.value)

      // TODO: make sure this is a proper string
      if (typeof dataRef.current.value === 'string' && state.inputRef.current) {
        state.inputRef.current.value = dataRef.current.value
      }
    }

    return state
  },
  [ActionTypes.RegisterOption]: (state, action) => {
    let orderMap = Array.from(
      state.optionsRef.current?.querySelectorAll('[id^="headlessui-combobox-option-"]')!
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

let ComboboxContext = createContext<[StateDefinition, Dispatch<Actions>] | null>(null)
ComboboxContext.displayName = 'ComboboxContext'

function useComboboxContext(component: string) {
  let context = useContext(ComboboxContext)
  if (context === null) {
    let err = new Error(`<${component} /> is missing a parent <${Combobox.name} /> component.`)
    if (Error.captureStackTrace) Error.captureStackTrace(err, useComboboxContext)
    throw err
  }
  return context
}

function stateReducer(state: StateDefinition, action: Actions) {
  return match(action.type, reducers, state, action)
}

// ---

let DEFAULT_COMBOBOX_TAG = Fragment
interface ComboboxRenderPropArg {
  open: boolean
  disabled: boolean
}

export function Combobox<TTag extends ElementType = typeof DEFAULT_COMBOBOX_TAG, TType = string>(
  props: Props<TTag, ComboboxRenderPropArg, 'value' | 'onChange'> & {
    value: TType
    onChange(value: TType): void
    onSearch(value: TType): void
    disabled?: boolean
    horizontal?: boolean
  }
) {
  let {
    value,
    onChange,
    disabled = false,
    horizontal = false,
    onSearch,
    ...passThroughProps
  } = props
  const orientation = horizontal ? 'horizontal' : 'vertical'

  let reducerBag = useReducer(stateReducer, {
    comboboxState: ComboboxStates.Closed,
    propsRef: { current: { value, onChange, onSearch } },
    labelRef: createRef(),
    inputRef: createRef(),
    buttonRef: createRef(),
    optionsRef: createRef(),
    disabled,
    orientation,
    options: [],
    searchQuery: '',
    activeOptionIndex: null,
  } as StateDefinition)
  let [{ comboboxState, propsRef, optionsRef, inputRef, buttonRef }, dispatch] = reducerBag

  useIsoMorphicEffect(() => {
    propsRef.current.value = value
  }, [value, propsRef])
  useIsoMorphicEffect(() => {
    propsRef.current.onChange = onChange
  }, [onChange, propsRef])
  useIsoMorphicEffect(() => {
    propsRef.current.onSearch = onSearch
  }, [onSearch, propsRef])
  useIsoMorphicEffect(() => dispatch({ type: ActionTypes.SetDisabled, disabled }), [disabled])
  useIsoMorphicEffect(() => dispatch({ type: ActionTypes.SetOrientation, orientation }), [
    orientation,
  ])

  // Handle outside click
  useWindowEvent('mousedown', event => {
    let target = event.target as HTMLElement

    if (comboboxState !== ComboboxStates.Open) return

    if (buttonRef.current?.contains(target)) return
    if (inputRef.current?.contains(target)) return
    if (optionsRef.current?.contains(target)) return

    dispatch({ type: ActionTypes.CloseCombobox })

    if (!isFocusableElement(target, FocusableMode.Loose)) {
      event.preventDefault()
      inputRef.current?.focus()
    }
  })

  let slot = useMemo<ComboboxRenderPropArg>(
    () => ({ open: comboboxState === ComboboxStates.Open, disabled }),
    [comboboxState, disabled]
  )

  return (
    <ComboboxContext.Provider value={reducerBag}>
      <OpenClosedProvider
        value={match(comboboxState, {
          [ComboboxStates.Open]: State.Open,
          [ComboboxStates.Closed]: State.Closed,
        })}
      >
        {render({
          props: passThroughProps,
          slot,
          defaultTag: DEFAULT_COMBOBOX_TAG,
          name: 'Combobox',
        })}
      </OpenClosedProvider>
    </ComboboxContext.Provider>
  )
}

// ---

let DEFAULT_INPUT_TAG = 'input' as const
interface InputRenderPropArg {}
type InputPropsWeControl =
  | 'id'
  | 'role'
  | 'aria-labelledby'
  | 'aria-expanded'
  | 'aria-activedescendant'
  | 'onKeyDown'
  | 'onFocus'

let Input = forwardRefWithAs(function Input<TTag extends ElementType = typeof DEFAULT_INPUT_TAG>(
  props: Props<TTag, InputRenderPropArg, InputPropsWeControl>,
  ref: Ref<HTMLInputElement>
) {
  let [state, dispatch] = useComboboxContext([Combobox.name, Input.name].join('.'))
  let inputRef = useSyncRefs(state.inputRef, ref)

  let id = `headlessui-combobox-input-${useId()}`
  let d = useDisposables()

  let handleKeyDown = useCallback(
    (event: ReactKeyboardEvent<HTMLUListElement>) => {
      switch (event.key) {
        // Ref: https://www.w3.org/TR/wai-aria-practices-1.2/#keyboard-interaction-12

        case Keys.Space:
        case Keys.Enter:
          event.preventDefault()
          event.stopPropagation()
          dispatch({ type: ActionTypes.SelectActiveOption })
          dispatch({ type: ActionTypes.CloseCombobox })
          disposables().nextFrame(() => state.inputRef.current?.focus({ preventScroll: true }))
          break

        case match(state.orientation, { vertical: Keys.ArrowDown, horizontal: Keys.ArrowRight }):
          event.preventDefault()
          event.stopPropagation()
          return match(state.comboboxState, {
            [ComboboxStates.Open]: () => {
              return dispatch({ type: ActionTypes.GoToOption, focus: Focus.Next })
            },
            [ComboboxStates.Closed]: () => {
              dispatch({ type: ActionTypes.OpenCombobox })
              d.nextFrame(() => {
                if (!state.propsRef.current.value)
                  dispatch({ type: ActionTypes.GoToOption, focus: Focus.First })
              })
            },
          })

        case match(state.orientation, { vertical: Keys.ArrowUp, horizontal: Keys.ArrowLeft }):
          event.preventDefault()
          event.stopPropagation()
          return match(state.comboboxState, {
            [ComboboxStates.Open]: () => {
              return dispatch({ type: ActionTypes.GoToOption, focus: Focus.Previous })
            },
            [ComboboxStates.Closed]: () => {
              dispatch({ type: ActionTypes.OpenCombobox })
              d.nextFrame(() => {
                if (!state.propsRef.current.value)
                  dispatch({ type: ActionTypes.GoToOption, focus: Focus.Last })
              })
            },
          })

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
          dispatch({ type: ActionTypes.CloseCombobox })
          return d.nextFrame(() => state.inputRef.current?.focus({ preventScroll: true }))

        case Keys.Tab:
          dispatch({ type: ActionTypes.SelectActiveOption })
          dispatch({ type: ActionTypes.CloseCombobox })
          break
      }
    },
    [d, dispatch, state]
  )

  let handleKeyUp = useCallback((event: ReactKeyboardEvent<HTMLButtonElement>) => {
    dispatch({ type: ActionTypes.OpenCombobox })
    state.propsRef.current.onSearch((event.target as HTMLInputElement).value)
  }, [])

  // TODO: Verify this. The spec says that, for the input/combobox, the lebel is the labelling element when present
  // Otherwise it's the ID of the non-label element
  let labelledby = useComputed(() => {
    if (!state.labelRef.current) return undefined
    return [state.labelRef.current.id].join(' ')
  }, [state.labelRef.current])

  let slot = useMemo<ButtonRenderPropArg>(
    () => ({ open: state.comboboxState === ComboboxStates.Open, disabled: state.disabled }),
    [state]
  )
  let passthroughProps = props
  let propsWeControl = {
    ref: inputRef,
    id,
    role: 'combobox',
    'aria-controls': state.optionsRef.current?.id,
    'aria-expanded': state.disabled ? undefined : state.comboboxState === ComboboxStates.Open,
    'aria-activedescendant':
      state.activeOptionIndex === null ? undefined : state.options[state.activeOptionIndex]?.id,
    'aria-labelledby': labelledby,
    disabled: state.disabled,
    onKeyDown: handleKeyDown,
    onKeyUp: handleKeyUp,
  }

  return render({
    props: { ...passthroughProps, ...propsWeControl },
    slot,
    defaultTag: DEFAULT_INPUT_TAG,
    name: 'Combobox.Input',
  })
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
  | 'tabIndex'
  | 'aria-haspopup'
  | 'aria-controls'
  | 'aria-expanded'
  | 'aria-labelledby'
  | 'disabled'
  | 'onClick'

let Button = forwardRefWithAs(function Button<TTag extends ElementType = typeof DEFAULT_BUTTON_TAG>(
  props: Props<TTag, ButtonRenderPropArg, ButtonPropsWeControl>,
  ref: Ref<HTMLButtonElement>
) {
  let [state, dispatch] = useComboboxContext([Combobox.name, Button.name].join('.'))
  let buttonRef = useSyncRefs(state.buttonRef, ref)

  let id = `headlessui-combobox-button-${useId()}`
  let d = useDisposables()

  let handleClick = useCallback(
    (event: ReactMouseEvent) => {
      if (isDisabledReactIssue7711(event.currentTarget)) return event.preventDefault()
      if (state.comboboxState === ComboboxStates.Open) {
        dispatch({ type: ActionTypes.CloseCombobox })
      } else {
        event.preventDefault()
        dispatch({ type: ActionTypes.OpenCombobox })
      }

      d.nextFrame(() => state.inputRef.current?.focus({ preventScroll: true }))
    },
    [dispatch, d, state]
  )

  let labelledby = useComputed(() => {
    if (!state.labelRef.current) return undefined
    return [state.labelRef.current.id, id].join(' ')
  }, [state.labelRef.current, id])

  let slot = useMemo<ButtonRenderPropArg>(
    () => ({ open: state.comboboxState === ComboboxStates.Open, disabled: state.disabled }),
    [state]
  )
  let passthroughProps = props
  let propsWeControl = {
    ref: buttonRef,
    id,
    type: useResolveButtonType(props, state.buttonRef),
    tabIndex: -1,
    'aria-haspopup': true,
    'aria-controls': state.optionsRef.current?.id,
    'aria-expanded': state.disabled ? undefined : state.comboboxState === ComboboxStates.Open,
    'aria-labelledby': labelledby,
    disabled: state.disabled,
    onClick: handleClick,
  }

  return render({
    props: { ...passthroughProps, ...propsWeControl },
    slot,
    defaultTag: DEFAULT_BUTTON_TAG,
    name: 'Combobox.Button',
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
  let [state] = useComboboxContext([Combobox.name, Label.name].join('.'))
  let id = `headlessui-combobox-label-${useId()}`

  let handleClick = useCallback(() => state.inputRef.current?.focus({ preventScroll: true }), [
    state.inputRef,
  ])

  let slot = useMemo<LabelRenderPropArg>(
    () => ({ open: state.comboboxState === ComboboxStates.Open, disabled: state.disabled }),
    [state]
  )
  let propsWeControl = { ref: state.labelRef, id, onClick: handleClick }
  return render({
    props: { ...props, ...propsWeControl },
    slot,
    defaultTag: DEFAULT_LABEL_TAG,
    name: 'Combobox.Label',
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
  let [state] = useComboboxContext([Combobox.name, Options.name].join('.'))
  let optionsRef = useSyncRefs(state.optionsRef, ref)

  let id = `headlessui-combobox-options-${useId()}`

  let usesOpenClosedState = useOpenClosed()
  let visible = (() => {
    if (usesOpenClosedState !== null) {
      return usesOpenClosedState === State.Open
    }

    return state.comboboxState === ComboboxStates.Open
  })()

  let labelledby = useComputed(() => state.labelRef.current?.id ?? state.buttonRef.current?.id, [
    state.labelRef.current,
    state.buttonRef.current,
  ])

  let slot = useMemo<OptionsRenderPropArg>(
    () => ({ open: state.comboboxState === ComboboxStates.Open }),
    [state]
  )
  let propsWeControl = {
    'aria-activedescendant':
      state.activeOptionIndex === null ? undefined : state.options[state.activeOptionIndex]?.id,
    'aria-labelledby': labelledby,
    'aria-orientation': state.orientation,
    id,
    ref: optionsRef,
  }
  let passthroughProps = props

  return render({
    props: { ...passthroughProps, ...propsWeControl },
    slot,
    defaultTag: DEFAULT_OPTIONS_TAG,
    features: OptionsRenderFeatures,
    visible,
    name: 'Combobox.Options',
  })
})

// ---

let DEFAULT_OPTION_TAG = 'li' as const
interface OptionRenderPropArg {
  active: boolean
  selected: boolean
  disabled: boolean
}
type ComboboxOptionPropsWeControl =
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
  // TODO: One day we will be able to infer this type from the generic in Combobox itself.
  // But today is not that day..
  TType = Parameters<typeof Combobox>[0]['value']
>(
  props: Props<TTag, OptionRenderPropArg, ComboboxOptionPropsWeControl | 'value'> & {
    disabled?: boolean
    value: TType
  }
) {
  let { disabled = false, value, ...passthroughProps } = props
  let [state, dispatch] = useComboboxContext([Combobox.name, Option.name].join('.'))
  let id = `headlessui-combobox-option-${useId()}`
  let active =
    state.activeOptionIndex !== null ? state.options[state.activeOptionIndex].id === id : false
  let selected = state.propsRef.current.value === value

  let bag = useRef<ComboboxOptionDataRef['current']>({ disabled, value })

  useIsoMorphicEffect(() => {
    bag.current.disabled = disabled
  }, [bag, disabled])
  useIsoMorphicEffect(() => {
    bag.current.value = value
  }, [bag, value])

  let select = useCallback(() => {
    dispatch({ type: ActionTypes.SelectOption, id })
  }, [dispatch, state.propsRef, id])

  useIsoMorphicEffect(() => {
    dispatch({ type: ActionTypes.RegisterOption, id, dataRef: bag })
    return () => dispatch({ type: ActionTypes.UnregisterOption, id })
  }, [bag, id])

  useIsoMorphicEffect(() => {
    if (state.comboboxState !== ComboboxStates.Open) return
    if (!selected) return
    dispatch({ type: ActionTypes.GoToOption, focus: Focus.Specific, id })
  }, [state.comboboxState])

  useIsoMorphicEffect(() => {
    if (state.comboboxState !== ComboboxStates.Open) return
    if (!active) return
    let d = disposables()
    d.nextFrame(() => document.getElementById(id)?.scrollIntoView?.({ block: 'nearest' }))
    return d.dispose
  }, [id, active, state.comboboxState])

  let handleClick = useCallback(
    (event: { preventDefault: Function }) => {
      if (disabled) return event.preventDefault()
      select()
      dispatch({ type: ActionTypes.CloseCombobox })
      disposables().nextFrame(() => state.inputRef.current?.focus({ preventScroll: true }))
    },
    [dispatch, state.inputRef, disabled, select]
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
    name: 'Combobox.Option',
  })
}

// ---

Combobox.Input = Input
Combobox.Button = Button
Combobox.Label = Label
Combobox.Options = Options
Combobox.Option = Option
