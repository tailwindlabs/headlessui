'use client'

import { useFocusRing } from '@react-aria/focus'
import { useHover } from '@react-aria/interactions'
import { Virtualizer, useVirtualizer } from '@tanstack/react-virtual'
import React, {
  Fragment,
  createContext,
  createRef,
  useCallback,
  useContext,
  useMemo,
  useReducer,
  useRef,
  useState,
  type CSSProperties,
  type ElementType,
  type MutableRefObject,
  type FocusEvent as ReactFocusEvent,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
  type Ref,
} from 'react'
import { useActivePress } from '../../hooks/use-active-press'
import { useByComparator, type ByComparator } from '../../hooks/use-by-comparator'
import { useControllable } from '../../hooks/use-controllable'
import { useDisposables } from '../../hooks/use-disposables'
import { useElementSize } from '../../hooks/use-element-size'
import { useEvent } from '../../hooks/use-event'
import { useFrameDebounce } from '../../hooks/use-frame-debounce'
import { useId } from '../../hooks/use-id'
import { useIsoMorphicEffect } from '../../hooks/use-iso-morphic-effect'
import { useLatestValue } from '../../hooks/use-latest-value'
import { useOnDisappear } from '../../hooks/use-on-disappear'
import { useOutsideClick } from '../../hooks/use-outside-click'
import { useOwnerDocument } from '../../hooks/use-owner'
import { useRefocusableInput } from '../../hooks/use-refocusable-input'
import { useResolveButtonType } from '../../hooks/use-resolve-button-type'
import { useSyncRefs } from '../../hooks/use-sync-refs'
import { useTrackedPointer } from '../../hooks/use-tracked-pointer'
import { useTreeWalker } from '../../hooks/use-tree-walker'
import { useWatch } from '../../hooks/use-watch'
import { useDisabled } from '../../internal/disabled'
import {
  FloatingProvider,
  useFloatingPanel,
  useFloatingPanelProps,
  useFloatingReference,
  type AnchorProps,
} from '../../internal/floating'
import { FormFields } from '../../internal/form-fields'
import { useProvidedId } from '../../internal/id'
import { OpenClosedProvider, State, useOpenClosed } from '../../internal/open-closed'
import type { EnsureArray, Props } from '../../types'
import { history } from '../../utils/active-element-history'
import { isDisabledReactIssue7711 } from '../../utils/bugs'
import { Focus, calculateActiveIndex } from '../../utils/calculate-active-index'
import { disposables } from '../../utils/disposables'
import { sortByDomNode } from '../../utils/focus-management'
import { match } from '../../utils/match'
import { isMobile } from '../../utils/platform'
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
import { MouseButton } from '../mouse'

enum ComboboxState {
  Open,
  Closed,
}

enum ValueMode {
  Single,
  Multi,
}

enum ActivationTrigger {
  Pointer,
  Focus,
  Other,
}

type ComboboxOptionDataRef<T> = MutableRefObject<{
  disabled: boolean
  value: T
  domRef: MutableRefObject<HTMLElement | null>
  order: number | null
}>

interface StateDefinition<T> {
  dataRef: MutableRefObject<_Data | null>

  virtual: { options: T[]; disabled: (value: unknown) => boolean } | null

  comboboxState: ComboboxState

  options: { id: string; dataRef: ComboboxOptionDataRef<T> }[]
  activeOptionIndex: number | null
  activationTrigger: ActivationTrigger
}

enum ActionTypes {
  OpenCombobox,
  CloseCombobox,

  GoToOption,

  RegisterOption,
  UnregisterOption,

  SetActivationTrigger,

  UpdateVirtualOptions,
}

function adjustOrderedState<T>(
  state: StateDefinition<T>,
  adjustment: (options: StateDefinition<T>['options']) => StateDefinition<T>['options'] = (i) => i
) {
  let currentActiveOption =
    state.activeOptionIndex !== null ? state.options[state.activeOptionIndex] : null

  let list = adjustment(state.options.slice())
  let sortedOptions =
    list.length > 0 && list[0].dataRef.current.order !== null
      ? // Prefer sorting based on the `order`
        list.sort((a, z) => a.dataRef.current.order! - z.dataRef.current.order!)
      : // Fallback to much slower DOM order
        sortByDomNode(list, (option) => option.dataRef.current.domRef.current)

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
  | { type: ActionTypes.CloseCombobox }
  | { type: ActionTypes.OpenCombobox }
  | {
      type: ActionTypes.GoToOption
      focus: Focus.Specific
      idx: number
      trigger?: ActivationTrigger
    }
  | {
      type: ActionTypes.GoToOption
      focus: Exclude<Focus, Focus.Specific>
      trigger?: ActivationTrigger
    }
  | {
      type: ActionTypes.RegisterOption
      payload: { id: string; dataRef: ComboboxOptionDataRef<T> }
    }
  | { type: ActionTypes.UnregisterOption; id: string }
  | { type: ActionTypes.SetActivationTrigger; trigger: ActivationTrigger }
  | { type: ActionTypes.UpdateVirtualOptions; options: T[] }

let reducers: {
  [P in ActionTypes]: <T>(
    state: StateDefinition<T>,
    action: Extract<Actions<T>, { type: P }>
  ) => StateDefinition<T>
} = {
  [ActionTypes.CloseCombobox](state) {
    if (state.dataRef.current?.disabled) return state
    if (state.comboboxState === ComboboxState.Closed) return state

    return { ...state, activeOptionIndex: null, comboboxState: ComboboxState.Closed }
  },
  [ActionTypes.OpenCombobox](state) {
    if (state.dataRef.current?.disabled) return state
    if (state.comboboxState === ComboboxState.Open) return state

    // Check if we have a selected value that we can make active
    if (state.dataRef.current?.value) {
      let idx = state.dataRef.current.calculateIndex(state.dataRef.current.value)
      if (idx !== -1) {
        return {
          ...state,
          activeOptionIndex: idx,
          comboboxState: ComboboxState.Open,
        }
      }
    }

    return { ...state, comboboxState: ComboboxState.Open }
  },
  [ActionTypes.GoToOption](state, action) {
    if (state.dataRef.current?.disabled) return state
    if (
      state.dataRef.current?.optionsRef.current &&
      !state.dataRef.current?.optionsPropsRef.current.static &&
      state.comboboxState === ComboboxState.Closed
    ) {
      return state
    }

    if (state.virtual) {
      let activeOptionIndex =
        action.focus === Focus.Specific
          ? action.idx
          : calculateActiveIndex(action, {
              resolveItems: () => state.virtual!.options,
              resolveActiveIndex: () =>
                state.activeOptionIndex ??
                state.virtual!.options.findIndex((option) => !state.virtual!.disabled(option)) ??
                null,
              resolveDisabled: state.virtual!.disabled,
              resolveId() {
                throw new Error('Function not implemented.')
              },
            })

      let activationTrigger = action.trigger ?? ActivationTrigger.Other

      if (
        state.activeOptionIndex === activeOptionIndex &&
        state.activationTrigger === activationTrigger
      ) {
        return state
      }

      return {
        ...state,
        activeOptionIndex,
        activationTrigger,
      }
    }

    let adjustedState = adjustOrderedState(state)

    // It's possible that the activeOptionIndex is set to `null` internally, but
    // this means that we will fallback to the first non-disabled option by default.
    // We have to take this into account.
    if (adjustedState.activeOptionIndex === null) {
      let localActiveOptionIndex = adjustedState.options.findIndex(
        (option) => !option.dataRef.current.disabled
      )

      if (localActiveOptionIndex !== -1) {
        adjustedState.activeOptionIndex = localActiveOptionIndex
      }
    }

    let activeOptionIndex =
      action.focus === Focus.Specific
        ? action.idx
        : calculateActiveIndex(action, {
            resolveItems: () => adjustedState.options,
            resolveActiveIndex: () => adjustedState.activeOptionIndex,
            resolveId: (item) => item.id,
            resolveDisabled: (item) => item.dataRef.current.disabled,
          })
    let activationTrigger = action.trigger ?? ActivationTrigger.Other

    if (
      state.activeOptionIndex === activeOptionIndex &&
      state.activationTrigger === activationTrigger
    ) {
      return state
    }

    return {
      ...state,
      ...adjustedState,
      activeOptionIndex,
      activationTrigger,
    }
  },
  [ActionTypes.RegisterOption]: (state, action) => {
    if (state.dataRef.current?.virtual) {
      return {
        ...state,
        options: [...state.options, action.payload],
      }
    }

    let option = action.payload

    let adjustedState = adjustOrderedState(state, (options) => {
      options.push(option)
      return options
    })

    // Check if we need to make the newly registered option active.
    if (state.activeOptionIndex === null) {
      if (state.dataRef.current?.isSelected(action.payload.dataRef.current.value)) {
        adjustedState.activeOptionIndex = adjustedState.options.indexOf(option)
      }
    }

    let nextState = {
      ...state,
      ...adjustedState,
      activationTrigger: ActivationTrigger.Other,
    }

    if (state.dataRef.current?.__demoMode && state.dataRef.current.value === undefined) {
      nextState.activeOptionIndex = 0
    }

    return nextState
  },
  [ActionTypes.UnregisterOption]: (state, action) => {
    if (state.dataRef.current?.virtual) {
      return {
        ...state,
        options: state.options.filter((option) => option.id !== action.id),
      }
    }

    let adjustedState = adjustOrderedState(state, (options) => {
      let idx = options.findIndex((option) => option.id === action.id)
      if (idx !== -1) options.splice(idx, 1)
      return options
    })

    return {
      ...state,
      ...adjustedState,
      activationTrigger: ActivationTrigger.Other,
    }
  },
  [ActionTypes.SetActivationTrigger]: (state, action) => {
    if (state.activationTrigger === action.trigger) {
      return state
    }

    return {
      ...state,
      activationTrigger: action.trigger,
    }
  },
  [ActionTypes.UpdateVirtualOptions]: (state, action) => {
    if (state.virtual?.options === action.options) {
      return state
    }

    let adjustedActiveOptionIndex = state.activeOptionIndex
    if (state.activeOptionIndex !== null) {
      let idx = action.options.indexOf(state.virtual!.options[state.activeOptionIndex])
      if (idx !== -1) {
        adjustedActiveOptionIndex = idx
      } else {
        adjustedActiveOptionIndex = null
      }
    }

    return {
      ...state,
      activeOptionIndex: adjustedActiveOptionIndex,
      virtual: Object.assign({}, state.virtual, { options: action.options }),
    }
  },
}

let ComboboxActionsContext = createContext<{
  openCombobox(): void
  closeCombobox(): void
  registerOption(id: string, dataRef: ComboboxOptionDataRef<unknown>): () => void
  goToOption(focus: Focus.Specific, idx: number, trigger?: ActivationTrigger): void
  goToOption(focus: Focus, idx?: number, trigger?: ActivationTrigger): void
  selectActiveOption(): void
  setActivationTrigger(trigger: ActivationTrigger): void
  onChange(value: unknown): void
} | null>(null)
ComboboxActionsContext.displayName = 'ComboboxActionsContext'

function useActions(component: string) {
  let context = useContext(ComboboxActionsContext)
  if (context === null) {
    let err = new Error(`<${component} /> is missing a parent <Combobox /> component.`)
    if (Error.captureStackTrace) Error.captureStackTrace(err, useActions)
    throw err
  }
  return context
}
type _Actions = ReturnType<typeof useActions>

let VirtualContext = createContext<Virtualizer<any, any> | null>(null)

function VirtualProvider(props: {
  children: (data: { option: unknown; open: boolean }) => React.ReactElement
}) {
  let data = useData('VirtualProvider')

  let [paddingStart, paddingEnd] = useMemo(() => {
    let el = data.optionsRef.current
    if (!el) return [0, 0]

    let styles = window.getComputedStyle(el)

    return [
      parseFloat(styles.paddingBlockStart || styles.paddingTop),
      parseFloat(styles.paddingBlockEnd || styles.paddingBottom),
    ]
  }, [data.optionsRef.current])

  let virtualizer = useVirtualizer({
    scrollPaddingStart: paddingStart,
    scrollPaddingEnd: paddingEnd,
    count: data.virtual!.options.length,
    estimateSize() {
      return 40
    },
    getScrollElement() {
      return (data.optionsRef.current ?? null) as HTMLElement | null
    },
    overscan: 12,
  })

  let [baseKey, setBaseKey] = useState(0)
  useIsoMorphicEffect(() => {
    setBaseKey((v) => v + 1)
  }, [data.virtual?.options])

  return (
    <VirtualContext.Provider value={virtualizer}>
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: `${virtualizer.getTotalSize()}px`,
        }}
        ref={(el) => {
          if (!el) {
            return
          }

          // Scroll to the active index
          {
            // Ignore this when we are in a test environment
            if (typeof process !== 'undefined' && process.env.JEST_WORKER_ID !== undefined) {
              return
            }

            // Do not scroll when the mouse/pointer is being used
            if (data.activationTrigger === ActivationTrigger.Pointer) {
              return
            }

            if (
              data.activeOptionIndex !== null &&
              data.virtual!.options.length > data.activeOptionIndex
            ) {
              virtualizer.scrollToIndex(data.activeOptionIndex)
            }
          }
        }}
      >
        {virtualizer.getVirtualItems().map((item) => {
          return (
            <Fragment key={item.key}>
              {React.cloneElement(
                props.children?.({
                  option: data.virtual!.options[item.index],
                  open: data.comboboxState === ComboboxState.Open,
                }),
                {
                  key: `${baseKey}-${item.key}`,
                  'data-index': item.index,
                  'aria-setsize': data.virtual!.options.length,
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

let ComboboxDataContext = createContext<
  | ({
      value: unknown
      defaultValue: unknown
      disabled: boolean
      mode: ValueMode
      activeOptionIndex: number | null
      immediate: boolean

      virtual: { options: unknown[]; disabled: (value: unknown) => boolean } | null
      calculateIndex(value: unknown): number
      compare(a: unknown, z: unknown): boolean
      isSelected(value: unknown): boolean
      isActive(value: unknown): boolean

      __demoMode: boolean

      optionsPropsRef: MutableRefObject<{
        static: boolean
        hold: boolean
      }>

      inputRef: MutableRefObject<HTMLInputElement | null>
      buttonRef: MutableRefObject<HTMLButtonElement | null>
      optionsRef: MutableRefObject<HTMLUListElement | null>
    } & Omit<StateDefinition<unknown>, 'dataRef'>)
  | null
>(null)
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

function stateReducer<T>(state: StateDefinition<T>, action: Actions<T>) {
  return match(action.type, reducers, state, action)
}

// ---

let DEFAULT_COMBOBOX_TAG = Fragment
type ComboboxRenderPropArg<TValue, TActive = TValue> = {
  open: boolean
  disabled: boolean
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
    form?: string
    name?: string
    immediate?: boolean
    virtual?: {
      options: NoInfer<TValue>[]
      disabled?: (value: NoInfer<TValue>) => boolean
    } | null

    __demoMode?: boolean
  }
>

function ComboboxFn<TValue, TTag extends ElementType = typeof DEFAULT_COMBOBOX_TAG>(
  props: ComboboxProps<TValue, boolean | undefined, TTag>,
  ref: Ref<HTMLElement>
) {
  let providedDisabled = useDisabled()
  let {
    value: controlledValue,
    defaultValue,
    onChange: controlledOnChange,
    form,
    name,
    by,
    disabled = providedDisabled || false,
    __demoMode = false,
    multiple = false,
    immediate = false,
    virtual = null,
    // Deprecated, but let's pluck it from the props such that it doesn't end up
    // on the `Fragment`
    nullable: _nullable,
    ...theirProps
  } = props
  let [value = multiple ? [] : undefined, theirOnChange] = useControllable<any>(
    controlledValue,
    controlledOnChange,
    defaultValue
  )

  let [state, dispatch] = useReducer(stateReducer, {
    dataRef: createRef(),
    comboboxState: __demoMode ? ComboboxState.Open : ComboboxState.Closed,
    options: [],
    virtual: virtual
      ? { options: virtual.options, disabled: virtual.disabled ?? (() => false) }
      : null,
    activeOptionIndex: null,
    activationTrigger: ActivationTrigger.Other,
  } as StateDefinition<TValue>)

  let defaultToFirstOption = useRef(false)

  let optionsPropsRef = useRef<_Data['optionsPropsRef']['current']>({ static: false, hold: false })

  let inputRef = useRef<_Data['inputRef']['current']>(null)
  let buttonRef = useRef<_Data['buttonRef']['current']>(null)
  let optionsRef = useRef<_Data['optionsRef']['current']>(null)

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
      return state.options.findIndex((other) => compare(other.dataRef.current.value, value))
    }
  })

  let isSelected: (value: TValue) => boolean = useCallback(
    (other) =>
      match(data.mode, {
        [ValueMode.Multi]: () =>
          (value as EnsureArray<TValue>).some((option) => compare(option, other)),
        [ValueMode.Single]: () => compare(value as TValue, other),
      }),
    [value]
  )

  let isActive = useEvent((other: TValue) => {
    return state.activeOptionIndex === calculateIndex(other)
  })

  let data = useMemo<_Data>(
    () => ({
      ...state,
      immediate,
      optionsPropsRef,
      inputRef,
      buttonRef,
      optionsRef,
      value,
      defaultValue,
      disabled,
      mode: multiple ? ValueMode.Multi : ValueMode.Single,
      virtual: state.virtual,
      get activeOptionIndex() {
        if (
          defaultToFirstOption.current &&
          state.activeOptionIndex === null &&
          (virtual ? virtual.options.length > 0 : state.options.length > 0)
        ) {
          if (virtual) {
            let localActiveOptionIndex = virtual.options.findIndex(
              (option) => !(virtual?.disabled?.(option) ?? false)
            )

            if (localActiveOptionIndex !== -1) {
              return localActiveOptionIndex
            }
          }

          let localActiveOptionIndex = state.options.findIndex((option) => {
            return !option.dataRef.current.disabled
          })

          if (localActiveOptionIndex !== -1) {
            return localActiveOptionIndex
          }
        }

        return state.activeOptionIndex
      },
      calculateIndex,
      compare,
      isSelected,
      isActive,
      __demoMode,
    }),
    [value, defaultValue, disabled, multiple, __demoMode, state, virtual]
  )

  useIsoMorphicEffect(() => {
    if (!virtual) return
    dispatch({ type: ActionTypes.UpdateVirtualOptions, options: virtual.options })
  }, [virtual, virtual?.options])

  useIsoMorphicEffect(() => {
    state.dataRef.current = data
  }, [data])

  // Handle outside click
  useOutsideClick(
    [data.buttonRef, data.inputRef, data.optionsRef],
    () => actions.closeCombobox(),
    data.comboboxState === ComboboxState.Open
  )

  let slot = useMemo(() => {
    return {
      open: data.comboboxState === ComboboxState.Open,
      disabled,
      activeIndex: data.activeOptionIndex,
      activeOption:
        data.activeOptionIndex === null
          ? null
          : data.virtual
            ? data.virtual.options[data.activeOptionIndex ?? 0]
            : (data.options[data.activeOptionIndex]?.dataRef.current.value as TValue) ?? null,
      value,
    } satisfies ComboboxRenderPropArg<unknown>
  }, [data, disabled, value])

  let selectActiveOption = useEvent(() => {
    if (data.activeOptionIndex === null) return

    if (data.virtual) {
      onChange(data.virtual.options[data.activeOptionIndex])
    } else {
      let { dataRef } = data.options[data.activeOptionIndex]
      onChange(dataRef.current.value)
    }

    // It could happen that the `activeOptionIndex` stored in state is actually null, but we are
    // getting the fallback active option back instead.
    actions.goToOption(Focus.Specific, data.activeOptionIndex)
  })

  let openCombobox = useEvent(() => {
    dispatch({ type: ActionTypes.OpenCombobox })
    defaultToFirstOption.current = true
  })

  let closeCombobox = useEvent(() => {
    dispatch({ type: ActionTypes.CloseCombobox })
    defaultToFirstOption.current = false
  })

  let goToOption = useEvent((focus, idx, trigger) => {
    defaultToFirstOption.current = false

    if (focus === Focus.Specific) {
      return dispatch({ type: ActionTypes.GoToOption, focus: Focus.Specific, idx: idx!, trigger })
    }

    return dispatch({ type: ActionTypes.GoToOption, focus, trigger })
  })

  let registerOption = useEvent((id, dataRef) => {
    dispatch({ type: ActionTypes.RegisterOption, payload: { id, dataRef } })
    return () => {
      // When we are unregistering the currently active option, then we also have to make sure to
      // reset the `defaultToFirstOption` flag, so that visually something is selected and the next
      // time you press a key on your keyboard it will go to the proper next or previous option in
      // the list.
      //
      // Since this was the active option and it could have been anywhere in the list, resetting to
      // the very first option seems like a fine default. We _could_ be smarter about this by going
      // to the previous / next item in list if we know the direction of the keyboard navigation,
      // but that might be too complex/confusing from an end users perspective.
      if (data.isActive(dataRef.current.value)) {
        defaultToFirstOption.current = true
      }

      dispatch({ type: ActionTypes.UnregisterOption, id })
    }
  })

  let onChange = useEvent((value: unknown) => {
    return match(data.mode, {
      [ValueMode.Single]() {
        return theirOnChange?.(value as TValue)
      },
      [ValueMode.Multi]() {
        let copy = (data.value as TValue[]).slice()

        let idx = copy.findIndex((item) => compare(item, value as TValue))
        if (idx === -1) {
          copy.push(value as TValue)
        } else {
          copy.splice(idx, 1)
        }

        return theirOnChange?.(copy as TValue[])
      },
    })
  })

  let setActivationTrigger = useEvent((trigger: ActivationTrigger) => {
    dispatch({ type: ActionTypes.SetActivationTrigger, trigger })
  })

  let actions = useMemo<_Actions>(
    () => ({
      onChange,
      registerOption,
      goToOption,
      closeCombobox,
      openCombobox,
      setActivationTrigger,
      selectActiveOption,
    }),
    []
  )

  let [labelledby, LabelProvider] = useLabels()

  let ourProps = ref === null ? {} : { ref }

  let reset = useCallback(() => {
    return theirOnChange?.(defaultValue)
  }, [theirOnChange /* Explicitly ignoring `defaultValue` */])

  return (
    <LabelProvider
      value={labelledby}
      props={{
        htmlFor: data.inputRef.current?.id,
      }}
      slot={{
        open: data.comboboxState === ComboboxState.Open,
        disabled,
      }}
    >
      <FloatingProvider>
        <ComboboxActionsContext.Provider value={actions}>
          <ComboboxDataContext.Provider value={data}>
            <OpenClosedProvider
              value={match(data.comboboxState, {
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
          </ComboboxDataContext.Provider>
        </ComboboxActionsContext.Provider>
      </FloatingProvider>
    </LabelProvider>
  )
}

// ---

let DEFAULT_INPUT_TAG = 'input' as const
type InputRenderPropArg = {
  open: boolean
  disabled: boolean
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
  let data = useData('Combobox.Input')
  let actions = useActions('Combobox.Input')

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

  let inputRef = useSyncRefs(data.inputRef, ref, useFloatingReference())
  let ownerDocument = useOwnerDocument(data.inputRef)

  let isTyping = useRef(false)

  let d = useDisposables()

  let clear = useEvent(() => {
    actions.onChange(null)
    if (data.optionsRef.current) {
      data.optionsRef.current.scrollTop = 0
    }
    actions.goToOption(Focus.Nothing)
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
      if (isTyping.current) return

      let input = data.inputRef.current
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
        if (isTyping.current) return
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
    [currentDisplayValue, data.comboboxState, ownerDocument]
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
        if (isTyping.current) return

        let input = data.inputRef.current
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
    [data.comboboxState]
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

  let debounce = useFrameDebounce()
  let handleKeyDown = useEvent((event: ReactKeyboardEvent<HTMLInputElement>) => {
    isTyping.current = true
    debounce(() => {
      isTyping.current = false
    })

    switch (event.key) {
      // Ref: https://www.w3.org/WAI/ARIA/apg/patterns/menu/#keyboard-interaction-12

      case Keys.Enter:
        isTyping.current = false
        if (data.comboboxState !== ComboboxState.Open) return

        // When the user is still in the middle of composing by using an IME, then we don't want to
        // submit this value and close the Combobox yet. Instead, we will fallback to the default
        // behavior which is to "end" the composition.
        if (isComposing.current) return

        event.preventDefault()
        event.stopPropagation()

        if (data.activeOptionIndex === null) {
          actions.closeCombobox()
          return
        }

        actions.selectActiveOption()
        if (data.mode === ValueMode.Single) {
          actions.closeCombobox()
        }
        break

      case Keys.ArrowDown:
        isTyping.current = false
        event.preventDefault()
        event.stopPropagation()
        return match(data.comboboxState, {
          [ComboboxState.Open]: () => actions.goToOption(Focus.Next),
          [ComboboxState.Closed]: () => actions.openCombobox(),
        })

      case Keys.ArrowUp:
        isTyping.current = false
        event.preventDefault()
        event.stopPropagation()
        return match(data.comboboxState, {
          [ComboboxState.Open]: () => actions.goToOption(Focus.Previous),
          [ComboboxState.Closed]: () => {
            actions.openCombobox()
            d.nextFrame(() => {
              if (!data.value) {
                actions.goToOption(Focus.Last)
              }
            })
          },
        })

      case Keys.Home:
        if (event.shiftKey) {
          break
        }

        isTyping.current = false
        event.preventDefault()
        event.stopPropagation()
        return actions.goToOption(Focus.First)

      case Keys.PageUp:
        isTyping.current = false
        event.preventDefault()
        event.stopPropagation()
        return actions.goToOption(Focus.First)

      case Keys.End:
        if (event.shiftKey) {
          break
        }

        isTyping.current = false
        event.preventDefault()
        event.stopPropagation()
        return actions.goToOption(Focus.Last)

      case Keys.PageDown:
        isTyping.current = false
        event.preventDefault()
        event.stopPropagation()
        return actions.goToOption(Focus.Last)

      case Keys.Escape:
        isTyping.current = false
        if (data.comboboxState !== ComboboxState.Open) return
        event.preventDefault()
        if (data.optionsRef.current && !data.optionsPropsRef.current.static) {
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

        return actions.closeCombobox()

      case Keys.Tab:
        isTyping.current = false
        if (data.comboboxState !== ComboboxState.Open) return
        if (data.mode === ValueMode.Single && data.activationTrigger !== ActivationTrigger.Focus) {
          actions.selectActiveOption()
        }
        actions.closeCombobox()
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
    actions.openCombobox()
  })

  let handleBlur = useEvent((event: ReactFocusEvent) => {
    let relatedTarget =
      (event.relatedTarget as HTMLElement) ?? history.find((x) => x !== event.currentTarget)
    isTyping.current = false

    // Focus is moved into the list, we don't want to close yet.
    if (data.optionsRef.current?.contains(relatedTarget)) return

    // Focus is moved to the button, we don't want to close yet.
    if (data.buttonRef.current?.contains(relatedTarget)) return

    // Focus is moved, but the combobox is not open. This can mean two things:
    //
    // 1. The combobox was never opened, so we don't have to do anything.
    // 2. The combobox was closed and focus was moved already. At that point we
    //    don't need to try and select the active option.
    if (data.comboboxState !== ComboboxState.Open) return

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

    return actions.closeCombobox()
  })

  let handleFocus = useEvent((event: ReactFocusEvent) => {
    let relatedTarget =
      (event.relatedTarget as HTMLElement) ?? history.find((x) => x !== event.currentTarget)
    if (data.buttonRef.current?.contains(relatedTarget)) return
    if (data.optionsRef.current?.contains(relatedTarget)) return
    if (data.disabled) return

    if (!data.immediate) return
    if (data.comboboxState === ComboboxState.Open) return

    actions.openCombobox()

    // We need to make sure that tabbing through a form doesn't result in incorrectly setting the
    // value of the combobox. We will set the activation trigger to `Focus`, and we will ignore
    // selecting the active option when the user tabs away.
    d.nextFrame(() => {
      actions.setActivationTrigger(ActivationTrigger.Focus)
    })
  })

  let labelledBy = useLabelledBy()
  let describedBy = useDescribedBy()

  let { isFocused: focus, focusProps } = useFocusRing({ autoFocus })
  let { isHovered: hover, hoverProps } = useHover({ isDisabled: disabled })

  let slot = useMemo(() => {
    return {
      open: data.comboboxState === ComboboxState.Open,
      disabled,
      hover,
      focus,
      autofocus: autoFocus,
    } satisfies InputRenderPropArg
  }, [data, hover, focus, autoFocus, disabled])

  let ourProps = mergeProps(
    {
      ref: inputRef,
      id,
      role: 'combobox',
      type,
      'aria-controls': data.optionsRef.current?.id,
      'aria-expanded': data.comboboxState === ComboboxState.Open,
      'aria-activedescendant':
        data.activeOptionIndex === null
          ? undefined
          : data.virtual
            ? data.options.find(
                (option) =>
                  !data.virtual?.disabled(option.dataRef.current.value) &&
                  data.compare(
                    option.dataRef.current.value,
                    data.virtual!.options[data.activeOptionIndex!]
                  )
              )?.id
            : data.options[data.activeOptionIndex]?.id,
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
  let data = useData('Combobox.Button')
  let actions = useActions('Combobox.Button')
  let buttonRef = useSyncRefs(data.buttonRef, ref)
  let internalId = useId()
  let {
    id = `headlessui-combobox-button-${internalId}`,
    disabled = data.disabled || false,
    autoFocus = false,
    ...theirProps
  } = props
  let d = useDisposables()

  let refocusInput = useRefocusableInput(data.inputRef)

  let handleKeyDown = useEvent((event: ReactKeyboardEvent<HTMLUListElement>) => {
    switch (event.key) {
      // Ref: https://www.w3.org/WAI/ARIA/apg/patterns/menu/#keyboard-interaction-12

      case Keys.Space:
      case Keys.Enter:
        event.preventDefault()
        event.stopPropagation()
        if (data.comboboxState === ComboboxState.Closed) {
          actions.openCombobox()
        }

        return d.nextFrame(() => refocusInput())

      case Keys.ArrowDown:
        event.preventDefault()
        event.stopPropagation()
        if (data.comboboxState === ComboboxState.Closed) {
          actions.openCombobox()
          d.nextFrame(() => {
            if (!data.value) {
              actions.goToOption(Focus.First)
            }
          })
        }

        return d.nextFrame(() => refocusInput())

      case Keys.ArrowUp:
        event.preventDefault()
        event.stopPropagation()
        if (data.comboboxState === ComboboxState.Closed) {
          actions.openCombobox()
          d.nextFrame(() => {
            if (!data.value) {
              actions.goToOption(Focus.Last)
            }
          })
        }
        return d.nextFrame(() => refocusInput())

      case Keys.Escape:
        if (data.comboboxState !== ComboboxState.Open) return
        event.preventDefault()
        if (data.optionsRef.current && !data.optionsPropsRef.current.static) {
          event.stopPropagation()
        }
        actions.closeCombobox()
        return d.nextFrame(() => refocusInput())

      default:
        return
    }
  })

  let handleMouseDown = useEvent((event: ReactMouseEvent<HTMLButtonElement>) => {
    // We use the `mousedown` event here since it fires before the focus event,
    // allowing us to cancel the event before focus is moved from the
    // `ComboboxInput` to the `ComboboxButton`. This keeps the input focused,
    // preserving the cursor position and any text selection.
    event.preventDefault()

    if (isDisabledReactIssue7711(event.currentTarget)) return

    // Since we're using the `mousedown` event instead of a `click` event here
    // to preserve the focus of the `ComboboxInput`, we need to also check
    // that the `left` mouse button was clicked.
    if (event.button === MouseButton.Left) {
      if (data.comboboxState === ComboboxState.Open) {
        actions.closeCombobox()
      } else {
        actions.openCombobox()
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
      open: data.comboboxState === ComboboxState.Open,
      active: active || data.comboboxState === ComboboxState.Open,
      disabled,
      value: data.value,
      hover,
      focus,
    } satisfies ButtonRenderPropArg
  }, [data, hover, focus, active, disabled])
  let ourProps = mergeProps(
    {
      ref: buttonRef,
      id,
      type: useResolveButtonType(props, data.buttonRef),
      tabIndex: -1,
      'aria-haspopup': 'listbox',
      'aria-controls': data.optionsRef.current?.id,
      'aria-expanded': data.comboboxState === ComboboxState.Open,
      'aria-labelledby': labelledBy,
      disabled: disabled || undefined,
      autoFocus,
      onMouseDown: handleMouseDown,
      onKeyDown: handleKeyDown,
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
    name: 'Combobox.Button',
  })
}

// ---

let DEFAULT_OPTIONS_TAG = 'ul' as const
type OptionsRenderPropArg = {
  open: boolean
  option: unknown
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
  }
>

function OptionsFn<TTag extends ElementType = typeof DEFAULT_OPTIONS_TAG>(
  props: ComboboxOptionsProps<TTag>,
  ref: Ref<HTMLUListElement>
) {
  let internalId = useId()
  let {
    id = `headlessui-combobox-options-${internalId}`,
    hold = false,
    anchor,
    ...theirProps
  } = props
  let data = useData('Combobox.Options')
  let actions = useActions('Combobox.Options')

  let [floatingRef, style] = useFloatingPanel(anchor)
  let getFloatingPanelProps = useFloatingPanelProps()
  let optionsRef = useSyncRefs(data.optionsRef, ref, anchor ? floatingRef : null)

  let usesOpenClosedState = useOpenClosed()
  let visible = (() => {
    if (usesOpenClosedState !== null) {
      return (usesOpenClosedState & State.Open) === State.Open
    }

    return data.comboboxState === ComboboxState.Open
  })()

  // Ensure we close the combobox as soon as the input becomes hidden
  useOnDisappear(data.inputRef, actions.closeCombobox, visible)

  useIsoMorphicEffect(() => {
    data.optionsPropsRef.current.static = props.static ?? false
  }, [data.optionsPropsRef, props.static])
  useIsoMorphicEffect(() => {
    data.optionsPropsRef.current.hold = hold
  }, [data.optionsPropsRef, hold])

  useTreeWalker({
    container: data.optionsRef.current,
    enabled: data.comboboxState === ComboboxState.Open,
    accept(node) {
      if (node.getAttribute('role') === 'option') return NodeFilter.FILTER_REJECT
      if (node.hasAttribute('role')) return NodeFilter.FILTER_SKIP
      return NodeFilter.FILTER_ACCEPT
    },
    walk(node) {
      node.setAttribute('role', 'none')
    },
  })

  let labelledBy = useLabelledBy([data.buttonRef.current?.id])

  let slot = useMemo(() => {
    return {
      open: data.comboboxState === ComboboxState.Open,
      option: undefined,
    } satisfies OptionsRenderPropArg
  }, [data])
  let ourProps = mergeProps(anchor ? getFloatingPanelProps() : {}, {
    'aria-labelledby': labelledBy,
    role: 'listbox',
    'aria-multiselectable': data.mode === ValueMode.Multi ? true : undefined,
    id,
    ref: optionsRef,
    style: {
      ...style,
      '--input-width': useElementSize(data.inputRef, true).width,
      '--button-width': useElementSize(data.buttonRef, true).width,
    } as CSSProperties,
  })

  // Map the children in a scrollable container when virtualization is enabled
  if (data.virtual && data.comboboxState === ComboboxState.Open) {
    Object.assign(theirProps, {
      // @ts-expect-error The `children` prop now is a callback function that receives `{ option }`.
      children: <VirtualProvider>{theirProps.children}</VirtualProvider>,
    })
  }

  return render({
    ourProps,
    theirProps,
    slot,
    defaultTag: DEFAULT_OPTIONS_TAG,
    features: OptionsRenderFeatures,
    visible,
    name: 'Combobox.Options',
  })
}

// ---

let DEFAULT_OPTION_TAG = 'li' as const
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
>(props: ComboboxOptionProps<TTag, TType>, ref: Ref<HTMLLIElement>) {
  let internalId = useId()
  let {
    id = `headlessui-combobox-option-${internalId}`,
    disabled = false,
    value,
    order = null,
    ...theirProps
  } = props

  let data = useData('Combobox.Option')
  let actions = useActions('Combobox.Option')

  let refocusInput = useRefocusableInput(data.inputRef)

  let active = data.virtual
    ? data.activeOptionIndex === data.calculateIndex(value)
    : data.activeOptionIndex === null
      ? false
      : data.options[data.activeOptionIndex]?.id === id

  let selected = data.isSelected(value)
  let internalOptionRef = useRef<HTMLLIElement | null>(null)

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

  let select = useEvent(() => actions.onChange(value))
  useIsoMorphicEffect(() => actions.registerOption(id, bag), [bag, id])

  let enableScrollIntoView = useRef(data.virtual || data.__demoMode ? false : true)
  useIsoMorphicEffect(() => {
    if (!data.virtual) return
    if (!data.__demoMode) return
    let d = disposables()
    d.requestAnimationFrame(() => {
      enableScrollIntoView.current = true
    })
    return d.dispose
  }, [data.virtual, data.__demoMode])

  useIsoMorphicEffect(() => {
    if (!enableScrollIntoView.current) return
    if (data.comboboxState !== ComboboxState.Open) return
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
    data.comboboxState,
    data.activationTrigger,
    /* We also want to trigger this when the position of the active item changes so that we can re-trigger the scrollIntoView */ data.activeOptionIndex,
  ])

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

    if (disabled || data.virtual?.disabled(value)) return
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
      requestAnimationFrame(() => actions.closeCombobox())
    }
  })

  let handleFocus = useEvent(() => {
    if (disabled || data.virtual?.disabled(value)) {
      return actions.goToOption(Focus.Nothing)
    }
    let idx = data.calculateIndex(value)
    actions.goToOption(Focus.Specific, idx)
  })

  let pointer = useTrackedPointer()

  let handleEnter = useEvent((evt) => pointer.update(evt))

  let handleMove = useEvent((evt) => {
    if (!pointer.wasMoved(evt)) return
    if (disabled || data.virtual?.disabled(value)) return
    if (active) return
    let idx = data.calculateIndex(value)
    actions.goToOption(Focus.Specific, idx, ActivationTrigger.Pointer)
  })

  let handleLeave = useEvent((evt) => {
    if (!pointer.wasMoved(evt)) return
    if (disabled || data.virtual?.disabled(value)) return
    if (!active) return
    if (data.optionsPropsRef.current.hold) return
    actions.goToOption(Focus.Nothing)
  })

  let slot = useMemo(
    () => ({ active, focus: active, selected, disabled }) satisfies OptionRenderPropArg,
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
    onMouseDown: handleMouseDown,
    onFocus: handleFocus,
    onPointerEnter: handleEnter,
    onMouseEnter: handleEnter,
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
  ): JSX.Element
}

export interface _internal_ComponentComboboxButton extends HasDisplayName {
  <TTag extends ElementType = typeof DEFAULT_BUTTON_TAG>(
    props: ComboboxButtonProps<TTag> & RefProp<typeof ButtonFn>
  ): JSX.Element
}

export interface _internal_ComponentComboboxInput extends HasDisplayName {
  <TType, TTag extends ElementType = typeof DEFAULT_INPUT_TAG>(
    props: ComboboxInputProps<TTag, TType> & RefProp<typeof InputFn>
  ): JSX.Element
}

export interface _internal_ComponentComboboxLabel extends _internal_ComponentLabel {}

export interface _internal_ComponentComboboxOptions extends HasDisplayName {
  <TTag extends ElementType = typeof DEFAULT_OPTIONS_TAG>(
    props: ComboboxOptionsProps<TTag> & RefProp<typeof OptionsFn>
  ): JSX.Element
}

export interface _internal_ComponentComboboxOption extends HasDisplayName {
  <
    TTag extends ElementType = typeof DEFAULT_OPTION_TAG,
    TType = Parameters<typeof ComboboxRoot>[0]['value'],
  >(
    props: ComboboxOptionProps<TTag, TType> & RefProp<typeof OptionFn>
  ): JSX.Element
}

let ComboboxRoot = forwardRefWithAs(ComboboxFn) as _internal_ComponentCombobox
export let ComboboxButton = forwardRefWithAs(ButtonFn) as _internal_ComponentComboboxButton
export let ComboboxInput = forwardRefWithAs(InputFn) as _internal_ComponentComboboxInput
/** @deprecated use `<Label>` instead of `<ComboboxLabel>` */
export let ComboboxLabel = Label as _internal_ComponentComboboxLabel
export let ComboboxOptions = forwardRefWithAs(OptionsFn) as _internal_ComponentComboboxOptions
export let ComboboxOption = forwardRefWithAs(OptionFn) as _internal_ComponentComboboxOption

export let Combobox = Object.assign(ComboboxRoot, {
  Input: ComboboxInput,
  Button: ComboboxButton,
  /** @deprecated use `<Label>` instead of `<Combobox.Label>` */
  Label: ComboboxLabel,
  Options: ComboboxOptions,
  Option: ComboboxOption,
})
