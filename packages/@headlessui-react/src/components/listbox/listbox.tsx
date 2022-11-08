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

  // Types
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
import { EnsureArray, Props } from '../../types'
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
import { Hidden, Features as HiddenFeatures } from '../../internal/hidden'
import { objectToFormEntries } from '../../utils/form'
import { getOwnerDocument } from '../../utils/owner'
import { useEvent } from '../../hooks/use-event'
import { useControllable } from '../../hooks/use-controllable'
import { useLatestValue } from '../../hooks/use-latest-value'

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
  labelId: string | null

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

  RegisterLabel,
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
  | { type: ActionTypes.RegisterLabel; id: string | null }
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
  [ActionTypes.RegisterLabel]: (state, action) => {
    return {
      ...state,
      labelId: action.id,
    }
  },
}

let ListboxActionsContext = createContext<{
  openListbox(): void
  closeListbox(): void
  registerOption(id: string, dataRef: ListboxOptionDataRef<unknown>): () => void
  registerLabel(id: string): () => void
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
      mode: ValueMode
      orientation: 'horizontal' | 'vertical'
      activeOptionIndex: number | null
      compare(a: unknown, z: unknown): boolean
      isSelected(value: unknown): boolean

      optionsPropsRef: MutableRefObject<{
        static: boolean
        hold: boolean
      }>

      labelRef: MutableRefObject<HTMLLabelElement | null>
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
interface ListboxRenderPropArg<T> {
  open: boolean
  disabled: boolean
  value: T
}

let ListboxRoot = forwardRefWithAs(function Listbox<
  TTag extends ElementType = typeof DEFAULT_LISTBOX_TAG,
  TType = string,
  TActualType = TType extends (infer U)[] ? U : TType
>(
  props: Props<
    TTag,
    ListboxRenderPropArg<TType>,
    'value' | 'defaultValue' | 'onChange' | 'by' | 'disabled' | 'horizontal' | 'name' | 'multiple'
  > & {
    value?: TType
    defaultValue?: TType
    onChange?(value: TType): void
    by?: (keyof TActualType & string) | ((a: TActualType, z: TActualType) => boolean)
    disabled?: boolean
    horizontal?: boolean
    name?: string
    multiple?: boolean
  },
  ref: Ref<TTag>
) {
  let {
    value: controlledValue,
    defaultValue,
    name,
    onChange: controlledOnChange,
    by = (a, z) => a === z,
    disabled = false,
    horizontal = false,
    multiple = false,
    ...theirProps
  } = props
  const orientation = horizontal ? 'horizontal' : 'vertical'
  let listboxRef = useSyncRefs(ref)

  let [value, theirOnChange] = useControllable(controlledValue, controlledOnChange, defaultValue)

  let [state, dispatch] = useReducer(stateReducer, {
    dataRef: createRef(),
    listboxState: ListboxStates.Closed,
    options: [],
    searchQuery: '',
    labelId: null,
    activeOptionIndex: null,
    activationTrigger: ActivationTrigger.Other,
  } as StateDefinition<TType>)

  let optionsPropsRef = useRef<_Data['optionsPropsRef']['current']>({ static: false, hold: false })

  let labelRef = useRef<_Data['labelRef']['current']>(null)
  let buttonRef = useRef<_Data['buttonRef']['current']>(null)
  let optionsRef = useRef<_Data['optionsRef']['current']>(null)

  let compare = useEvent(
    typeof by === 'string'
      ? (a, z) => {
          let property = by as unknown as keyof TActualType
          return a?.[property] === z?.[property]
        }
      : by
  )

  let isSelected: (value: unknown) => boolean = useCallback(
    (compareValue) =>
      match(data.mode, {
        [ValueMode.Multi]: () =>
          (value as unknown as EnsureArray<TType>).some((option) => compare(option, compareValue)),
        [ValueMode.Single]: () => compare(value as TType, compareValue),
      }),
    [value]
  )

  let data = useMemo<_Data>(
    () => ({
      ...state,
      value,
      disabled,
      mode: multiple ? ValueMode.Multi : ValueMode.Single,
      orientation,
      compare,
      isSelected,
      optionsPropsRef,
      labelRef,
      buttonRef,
      optionsRef,
    }),
    [value, disabled, multiple, state]
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

  let slot = useMemo<ListboxRenderPropArg<TType>>(
    () => ({ open: data.listboxState === ListboxStates.Open, disabled, value }),
    [data, disabled, value]
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

  let goToOption = useEvent((focus, id, trigger) => {
    if (focus === Focus.Specific) {
      return dispatch({ type: ActionTypes.GoToOption, focus: Focus.Specific, id: id!, trigger })
    }

    return dispatch({ type: ActionTypes.GoToOption, focus, trigger })
  })

  let registerOption = useEvent((id, dataRef) => {
    dispatch({ type: ActionTypes.RegisterOption, id, dataRef })
    return () => dispatch({ type: ActionTypes.UnregisterOption, id })
  })

  let registerLabel = useEvent((id) => {
    dispatch({ type: ActionTypes.RegisterLabel, id })
    return () => dispatch({ type: ActionTypes.RegisterLabel, id: null })
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
      registerLabel,
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

  let ourProps = { ref: listboxRef }

  let form = useRef<HTMLFormElement | null>(null)
  let d = useDisposables()
  useEffect(() => {
    if (!form.current) return
    if (defaultValue === undefined) return

    d.addEventListener(form.current, 'reset', () => {
      onChange(defaultValue)
    })
  }, [form, onChange /* Explicitly ignoring `defaultValue` */])

  return (
    <ListboxActionsContext.Provider value={actions}>
      <ListboxDataContext.Provider value={data}>
        <OpenClosedProvider
          value={match(data.listboxState, {
            [ListboxStates.Open]: State.Open,
            [ListboxStates.Closed]: State.Closed,
          })}
        >
          {name != null &&
            value != null &&
            objectToFormEntries({ [name]: value }).map(([name, value], idx) => (
              <Hidden
                features={HiddenFeatures.Hidden}
                ref={
                  idx === 0
                    ? (element: HTMLInputElement | null) => {
                        form.current = element?.closest('form') ?? null
                      }
                    : undefined
                }
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
      </ListboxDataContext.Provider>
    </ListboxActionsContext.Provider>
  )
})

// ---

let DEFAULT_BUTTON_TAG = 'button' as const
interface ButtonRenderPropArg {
  open: boolean
  disabled: boolean
  value: any
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
  let data = useData('Listbox.Button')
  let actions = useActions('Listbox.Button')
  let buttonRef = useSyncRefs(data.buttonRef, ref)

  let id = `headlessui-listbox-button-${useId()}`
  let d = useDisposables()

  let handleKeyDown = useEvent((event: ReactKeyboardEvent<HTMLButtonElement>) => {
    switch (event.key) {
      // Ref: https://www.w3.org/TR/wai-aria-practices-1.2/#keyboard-interaction-13

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

  let labelledby = useComputed(() => {
    if (!data.labelId) return undefined
    return [data.labelId, id].join(' ')
  }, [data.labelId, id])

  let slot = useMemo<ButtonRenderPropArg>(
    () => ({
      open: data.listboxState === ListboxStates.Open,
      disabled: data.disabled,
      value: data.value,
    }),
    [data]
  )
  let theirProps = props
  let ourProps = {
    ref: buttonRef,
    id,
    type: useResolveButtonType(props, data.buttonRef),
    'aria-haspopup': true,
    'aria-controls': data.optionsRef.current?.id,
    'aria-expanded': data.disabled ? undefined : data.listboxState === ListboxStates.Open,
    'aria-labelledby': labelledby,
    disabled: data.disabled,
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
  let data = useData('Listbox.Label')
  let id = `headlessui-listbox-label-${useId()}`
  let actions = useActions('Listbox.Label')
  let labelRef = useSyncRefs(data.labelRef, ref)

  useIsoMorphicEffect(() => actions.registerLabel(id), [id])

  let handleClick = useEvent(() => data.buttonRef.current?.focus({ preventScroll: true }))

  let slot = useMemo<LabelRenderPropArg>(
    () => ({ open: data.listboxState === ListboxStates.Open, disabled: data.disabled }),
    [data]
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
  let data = useData('Listbox.Options')
  let actions = useActions('Listbox.Options')
  let optionsRef = useSyncRefs(data.optionsRef, ref)

  let id = `headlessui-listbox-options-${useId()}`
  let d = useDisposables()
  let searchDisposables = useDisposables()

  let usesOpenClosedState = useOpenClosed()
  let visible = (() => {
    if (usesOpenClosedState !== null) {
      return usesOpenClosedState === State.Open
    }

    return data.listboxState === ListboxStates.Open
  })()

  useEffect(() => {
    let container = data.optionsRef.current
    if (!container) return
    if (data.listboxState !== ListboxStates.Open) return
    if (container === getOwnerDocument(container)?.activeElement) return

    container.focus({ preventScroll: true })
  }, [data.listboxState, data.optionsRef])

  let handleKeyDown = useEvent((event: ReactKeyboardEvent<HTMLUListElement>) => {
    searchDisposables.dispose()

    switch (event.key) {
      // Ref: https://www.w3.org/TR/wai-aria-practices-1.2/#keyboard-interaction-12

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

  let labelledby = useComputed(
    () => data.labelRef.current?.id ?? data.buttonRef.current?.id,
    [data.labelRef.current, data.buttonRef.current]
  )

  let slot = useMemo<OptionsRenderPropArg>(
    () => ({ open: data.listboxState === ListboxStates.Open }),
    [data]
  )

  let theirProps = props
  let ourProps = {
    'aria-activedescendant':
      data.activeOptionIndex === null ? undefined : data.options[data.activeOptionIndex]?.id,
    'aria-multiselectable': data.mode === ValueMode.Multi ? true : undefined,
    'aria-labelledby': labelledby,
    'aria-orientation': data.orientation,
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
  let data = useData('Listbox.Option')
  let actions = useActions('Listbox.Option')

  let id = `headlessui-listbox-option-${useId()}`
  let active =
    data.activeOptionIndex !== null ? data.options[data.activeOptionIndex].id === id : false

  let selected = data.isSelected(value)
  let internalOptionRef = useRef<HTMLLIElement | null>(null)
  let bag = useLatestValue<ListboxOptionDataRef<TType>['current']>({
    disabled,
    value,
    domRef: internalOptionRef,
    get textValue() {
      return internalOptionRef.current?.textContent?.toLowerCase()
    },
  })
  let optionRef = useSyncRefs(ref, internalOptionRef)

  useIsoMorphicEffect(() => {
    if (data.listboxState !== ListboxStates.Open) return
    if (!active) return
    if (data.activationTrigger === ActivationTrigger.Pointer) return
    let d = disposables()
    d.requestAnimationFrame(() => {
      internalOptionRef.current?.scrollIntoView?.({ block: 'nearest' })
    })
    return d.dispose
  }, [internalOptionRef, active, data.listboxState, data.activationTrigger, /* We also want to trigger this when the position of the active item changes so that we can re-trigger the scrollIntoView */ data.activeOptionIndex])

  useIsoMorphicEffect(() => actions.registerOption(id, bag), [bag, id])

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

  let handleMove = useEvent(() => {
    if (disabled) return
    if (active) return
    actions.goToOption(Focus.Specific, id, ActivationTrigger.Pointer)
  })

  let handleLeave = useEvent(() => {
    if (disabled) return
    if (!active) return
    actions.goToOption(Focus.Nothing)
  })

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
    'aria-selected': selected,
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
