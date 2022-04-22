import {
  Fragment,
  computed,
  defineComponent,
  h,
  inject,
  nextTick,
  onMounted,
  onUnmounted,
  provide,
  ref,
  toRaw,
  watch,
  watchEffect,

  // Types
  ComputedRef,
  InjectionKey,
  PropType,
  Ref,
  UnwrapNestedRefs,
} from 'vue'

import { Features, render, omit, compact } from '../../utils/render'
import { useId } from '../../hooks/use-id'
import { Keys } from '../../keyboard'
import { calculateActiveIndex, Focus } from '../../utils/calculate-active-index'
import { dom } from '../../utils/dom'
import { useOpenClosed, State, useOpenClosedProvider } from '../../internal/open-closed'
import { match } from '../../utils/match'
import { useResolveButtonType } from '../../hooks/use-resolve-button-type'
import { useTreeWalker } from '../../hooks/use-tree-walker'
import { sortByDomNode } from '../../utils/focus-management'
import { useOutsideClick } from '../../hooks/use-outside-click'
import { VisuallyHidden } from '../../internal/visually-hidden'
import { objectToFormEntries } from '../../utils/form'

enum ComboboxStates {
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

type ComboboxOptionData = {
  disabled: boolean
  value: unknown
  domRef: Ref<HTMLElement | null>
}
type StateDefinition = {
  // State
  comboboxState: Ref<ComboboxStates>
  value: ComputedRef<unknown>

  mode: ComputedRef<ValueMode>
  nullable: ComputedRef<boolean>

  inputPropsRef: Ref<{ displayValue?: (item: unknown) => string }>
  optionsPropsRef: Ref<{ static: boolean; hold: boolean }>

  labelRef: Ref<HTMLLabelElement | null>
  inputRef: Ref<HTMLInputElement | null>
  buttonRef: Ref<HTMLButtonElement | null>
  optionsRef: Ref<HTMLDivElement | null>

  disabled: Ref<boolean>
  options: Ref<{ id: string; dataRef: ComputedRef<ComboboxOptionData> }[]>
  activeOptionIndex: Ref<number | null>
  activationTrigger: Ref<ActivationTrigger>

  // State mutators
  closeCombobox(): void
  openCombobox(): void
  goToOption(focus: Focus, id?: string, trigger?: ActivationTrigger): void
  change(value: unknown): void
  selectOption(id: string): void
  selectActiveOption(): void
  registerOption(id: string, dataRef: ComputedRef<ComboboxOptionData>): void
  unregisterOption(id: string): void
  select(value: unknown): void
}

let ComboboxContext = Symbol('ComboboxContext') as InjectionKey<StateDefinition>

function useComboboxContext(component: string) {
  let context = inject(ComboboxContext, null)

  if (context === null) {
    let err = new Error(`<${component} /> is missing a parent <Combobox /> component.`)
    if (Error.captureStackTrace) Error.captureStackTrace(err, useComboboxContext)
    throw err
  }

  return context
}

// ---

export let Combobox = defineComponent({
  name: 'Combobox',
  emits: { 'update:modelValue': (_value: any) => true },
  props: {
    as: { type: [Object, String], default: 'template' },
    disabled: { type: [Boolean], default: false },
    modelValue: { type: [Object, String, Number, Boolean] },
    name: { type: String },
    nullable: { type: Boolean, default: false },
    multiple: { type: [Boolean], default: false },
  },
  setup(props, { slots, attrs, emit }) {
    let comboboxState = ref<StateDefinition['comboboxState']['value']>(ComboboxStates.Closed)
    let labelRef = ref<StateDefinition['labelRef']['value']>(null)
    let inputRef = ref<StateDefinition['inputRef']['value']>(null) as StateDefinition['inputRef']
    let buttonRef = ref<StateDefinition['buttonRef']['value']>(null) as StateDefinition['buttonRef']
    let optionsRef = ref<StateDefinition['optionsRef']['value']>(
      null
    ) as StateDefinition['optionsRef']
    let optionsPropsRef = ref<StateDefinition['optionsPropsRef']['value']>({
      static: false,
      hold: false,
    }) as StateDefinition['optionsPropsRef']
    let options = ref<StateDefinition['options']['value']>([])
    let activeOptionIndex = ref<StateDefinition['activeOptionIndex']['value']>(null)
    let activationTrigger = ref<StateDefinition['activationTrigger']['value']>(
      ActivationTrigger.Other
    )
    let defaultToFirstOption = ref(false)

    function adjustOrderedState(
      adjustment: (
        options: UnwrapNestedRefs<StateDefinition['options']['value']>
      ) => UnwrapNestedRefs<StateDefinition['options']['value']> = (i) => i
    ) {
      let currentActiveOption =
        activeOptionIndex.value !== null ? options.value[activeOptionIndex.value] : null

      let sortedOptions = sortByDomNode(adjustment(options.value.slice()), (option) =>
        dom(option.dataRef.domRef)
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

    let value = computed(() => props.modelValue)
    let mode = computed(() => (props.multiple ? ValueMode.Multi : ValueMode.Single))
    let nullable = computed(() => props.nullable)

    let api = {
      comboboxState,
      value,
      mode,
      nullable,
      inputRef,
      labelRef,
      buttonRef,
      optionsRef,
      disabled: computed(() => props.disabled),
      options,
      change(value: unknown) {
        emit('update:modelValue', value)
      },
      activeOptionIndex: computed(() => {
        if (
          defaultToFirstOption.value &&
          activeOptionIndex.value === null &&
          options.value.length > 0
        ) {
          let localActiveOptionIndex = options.value.findIndex((option) => !option.dataRef.disabled)
          if (localActiveOptionIndex !== -1) {
            return localActiveOptionIndex
          }
        }

        return activeOptionIndex.value
      }),
      activationTrigger,
      inputPropsRef: ref<StateDefinition['inputPropsRef']['value']>({ displayValue: undefined }),
      optionsPropsRef,
      closeCombobox() {
        defaultToFirstOption.value = false

        if (props.disabled) return
        if (comboboxState.value === ComboboxStates.Closed) return
        comboboxState.value = ComboboxStates.Closed
        activeOptionIndex.value = null
      },
      openCombobox() {
        defaultToFirstOption.value = true

        if (props.disabled) return
        if (comboboxState.value === ComboboxStates.Open) return

        // Check if we have a selected value that we can make active.
        let optionIdx = options.value.findIndex((option) => {
          let optionValue = toRaw(option.dataRef.value)
          let selected = match(mode.value, {
            [ValueMode.Single]: () => toRaw(api.value.value) === toRaw(optionValue),
            [ValueMode.Multi]: () =>
              (toRaw(api.value.value) as unknown[]).includes(toRaw(optionValue)),
          })

          return selected
        })

        if (optionIdx !== -1) {
          activeOptionIndex.value = optionIdx
        }

        comboboxState.value = ComboboxStates.Open
      },
      goToOption(focus: Focus, id?: string, trigger?: ActivationTrigger) {
        defaultToFirstOption.value = false

        if (props.disabled) return
        if (
          optionsRef.value &&
          !optionsPropsRef.value.static &&
          comboboxState.value === ComboboxStates.Closed
        ) {
          return
        }

        let adjustedState = adjustOrderedState()

        // It's possible that the activeOptionIndex is set to `null` internally, but
        // this means that we will fallback to the first non-disabled option by default.
        // We have to take this into account.
        if (adjustedState.activeOptionIndex === null) {
          let localActiveOptionIndex = adjustedState.options.findIndex(
            (option) => !option.dataRef.disabled
          )

          if (localActiveOptionIndex !== -1) {
            adjustedState.activeOptionIndex = localActiveOptionIndex
          }
        }

        let nextActiveOptionIndex = calculateActiveIndex(
          focus === Focus.Specific
            ? { focus: Focus.Specific, id: id! }
            : { focus: focus as Exclude<Focus, Focus.Specific> },
          {
            resolveItems: () => adjustedState.options,
            resolveActiveIndex: () => adjustedState.activeOptionIndex,
            resolveId: (option) => option.id,
            resolveDisabled: (option) => option.dataRef.disabled,
          }
        )

        activeOptionIndex.value = nextActiveOptionIndex
        activationTrigger.value = trigger ?? ActivationTrigger.Other
        options.value = adjustedState.options
      },
      syncInputValue() {
        let value = api.value.value
        if (!dom(api.inputRef)) return
        let displayValue = api.inputPropsRef.value.displayValue

        if (typeof displayValue === 'function') {
          api.inputRef!.value!.value = displayValue(value) ?? ''
        } else if (typeof value === 'string') {
          api.inputRef!.value!.value = value
        } else {
          api.inputRef!.value!.value = ''
        }
      },
      selectOption(id: string) {
        let option = options.value.find((item) => item.id === id)
        if (!option) return

        let { dataRef } = option
        emit(
          'update:modelValue',
          match(mode.value, {
            [ValueMode.Single]: () => dataRef.value,
            [ValueMode.Multi]: () => {
              let copy = toRaw(api.value.value as unknown[]).slice()
              let raw = toRaw(dataRef.value)

              let idx = copy.indexOf(raw)
              if (idx === -1) {
                copy.push(raw)
              } else {
                copy.splice(idx, 1)
              }

              return copy
            },
          })
        )
        api.syncInputValue()
      },
      selectActiveOption() {
        if (api.activeOptionIndex.value === null) return

        let { dataRef, id } = options.value[api.activeOptionIndex.value]
        emit(
          'update:modelValue',
          match(mode.value, {
            [ValueMode.Single]: () => dataRef.value,
            [ValueMode.Multi]: () => {
              let copy = toRaw(api.value.value as unknown[]).slice()
              let raw = toRaw(dataRef.value)

              let idx = copy.indexOf(raw)
              if (idx === -1) {
                copy.push(raw)
              } else {
                copy.splice(idx, 1)
              }

              return copy
            },
          })
        )
        api.syncInputValue()

        // It could happen that the `activeOptionIndex` stored in state is actually null,
        // but we are getting the fallback active option back instead.
        api.goToOption(Focus.Specific, id)
      },
      registerOption(id: string, dataRef: ComboboxOptionData) {
        let option = { id, dataRef }
        let adjustedState = adjustOrderedState((options) => [...options, option])

        // Check if we have a selected value that we can make active.
        if (activeOptionIndex.value === null) {
          let optionValue = (dataRef.value as any).value
          let selected = match(mode.value, {
            [ValueMode.Single]: () => toRaw(api.value.value) === toRaw(optionValue),
            [ValueMode.Multi]: () =>
              (toRaw(api.value.value) as unknown[]).includes(toRaw(optionValue)),
          })

          if (selected) {
            adjustedState.activeOptionIndex = adjustedState.options.indexOf(option)
          }
        }

        options.value = adjustedState.options
        activeOptionIndex.value = adjustedState.activeOptionIndex
        activationTrigger.value = ActivationTrigger.Other
      },
      unregisterOption(id: string) {
        let adjustedState = adjustOrderedState((options) => {
          let idx = options.findIndex((a) => a.id === id)
          if (idx !== -1) options.splice(idx, 1)
          return options
        })

        options.value = adjustedState.options
        activeOptionIndex.value = adjustedState.activeOptionIndex
        activationTrigger.value = ActivationTrigger.Other
      },
    }

    // Handle outside click
    useOutsideClick([inputRef, buttonRef, optionsRef], () => {
      if (comboboxState.value !== ComboboxStates.Open) return
      api.closeCombobox()
    })

    watch([api.value, api.inputRef], () => api.syncInputValue(), {
      immediate: true,
    })

    // Only sync the input value on close as typing into the input will trigger it to open
    // causing a resync of the input value with the currently stored, stale value that is
    // one character behind since the input's value has just been updated by the browser
    watch(
      api.comboboxState,
      (state) => {
        if (state === ComboboxStates.Closed) {
          api.syncInputValue()
        }
      },
      {
        immediate: true,
      }
    )

    // @ts-expect-error Types of property 'dataRef' are incompatible.
    provide(ComboboxContext, api)
    useOpenClosedProvider(
      computed(() =>
        match(comboboxState.value, {
          [ComboboxStates.Open]: State.Open,
          [ComboboxStates.Closed]: State.Closed,
        })
      )
    )

    let activeOption = computed(() =>
      api.activeOptionIndex.value === null
        ? null
        : (options.value[api.activeOptionIndex.value].dataRef.value as any)
    )

    return () => {
      let { name, modelValue, disabled, ...incomingProps } = props
      let slot = {
        open: comboboxState.value === ComboboxStates.Open,
        disabled,
        activeIndex: api.activeOptionIndex.value,
        activeOption: activeOption.value,
      }

      return h(Fragment, [
        ...(name != null && modelValue != null
          ? objectToFormEntries({ [name]: modelValue }).map(([name, value]) =>
              h(
                VisuallyHidden,
                compact({
                  key: name,
                  as: 'input',
                  type: 'hidden',
                  hidden: true,
                  readOnly: true,
                  name,
                  value,
                })
              )
            )
          : []),
        render({
          props: omit(incomingProps, ['nullable', 'multiple', 'onUpdate:modelValue']),
          slot,
          slots,
          attrs,
          name: 'Combobox',
        }),
      ])
    }
  },
})

// ---

export let ComboboxLabel = defineComponent({
  name: 'ComboboxLabel',
  props: { as: { type: [Object, String], default: 'label' } },
  setup(props, { attrs, slots }) {
    let api = useComboboxContext('ComboboxLabel')
    let id = `headlessui-combobox-label-${useId()}`

    function handleClick() {
      dom(api.inputRef)?.focus({ preventScroll: true })
    }

    return () => {
      let slot = {
        open: api.comboboxState.value === ComboboxStates.Open,
        disabled: api.disabled.value,
      }

      let ourProps = { id, ref: api.labelRef, onClick: handleClick }

      return render({
        props: { ...props, ...ourProps },
        slot,
        attrs,
        slots,
        name: 'ComboboxLabel',
      })
    }
  },
})

// ---

export let ComboboxButton = defineComponent({
  name: 'ComboboxButton',
  props: {
    as: { type: [Object, String], default: 'button' },
  },
  setup(props, { attrs, slots, expose }) {
    let api = useComboboxContext('ComboboxButton')
    let id = `headlessui-combobox-button-${useId()}`

    expose({ el: api.buttonRef, $el: api.buttonRef })

    function handleClick(event: MouseEvent) {
      if (api.disabled.value) return
      if (api.comboboxState.value === ComboboxStates.Open) {
        api.closeCombobox()
      } else {
        event.preventDefault()
        api.openCombobox()
      }

      nextTick(() => dom(api.inputRef)?.focus({ preventScroll: true }))
    }

    function handleKeydown(event: KeyboardEvent) {
      switch (event.key) {
        // Ref: https://www.w3.org/TR/wai-aria-practices-1.2/#keyboard-interaction-12

        case Keys.ArrowDown:
          event.preventDefault()
          event.stopPropagation()
          if (api.comboboxState.value === ComboboxStates.Closed) {
            api.openCombobox()
            // TODO: We can't do this outside next frame because the options aren't rendered yet
            // But doing this in next frame results in a flicker because the dom mutations are async here
            // Basically:
            // Sync -> no option list yet
            // Next frame -> option list already rendered with selection -> dispatch -> next frame -> now we have the focus on the right element

            // TODO: The spec here is underspecified. There's mention of skipping to the next item when autocomplete has suggested something but nothing regarding a non-autocomplete selection/value
            nextTick(() => {
              if (!api.value.value) {
                api.goToOption(Focus.First)
              }
            })
          }
          nextTick(() => api.inputRef.value?.focus({ preventScroll: true }))
          return

        case Keys.ArrowUp:
          event.preventDefault()
          event.stopPropagation()
          if (api.comboboxState.value === ComboboxStates.Closed) {
            api.openCombobox()
            nextTick(() => {
              if (!api.value.value) {
                api.goToOption(Focus.Last)
              }
            })
          }
          nextTick(() => api.inputRef.value?.focus({ preventScroll: true }))
          return

        case Keys.Escape:
          event.preventDefault()
          if (api.optionsRef.value && !api.optionsPropsRef.value.static) {
            event.stopPropagation()
          }
          api.closeCombobox()
          nextTick(() => api.inputRef.value?.focus({ preventScroll: true }))
          return
      }
    }

    let type = useResolveButtonType(
      computed(() => ({ as: props.as, type: attrs.type })),
      api.buttonRef
    )

    return () => {
      let slot = {
        open: api.comboboxState.value === ComboboxStates.Open,
        disabled: api.disabled.value,
      }
      let ourProps = {
        ref: api.buttonRef,
        id,
        type: type.value,
        tabindex: '-1',
        'aria-haspopup': true,
        'aria-controls': dom(api.optionsRef)?.id,
        'aria-expanded': api.disabled.value
          ? undefined
          : api.comboboxState.value === ComboboxStates.Open,
        'aria-labelledby': api.labelRef.value ? [dom(api.labelRef)?.id, id].join(' ') : undefined,
        disabled: api.disabled.value === true ? true : undefined,
        onKeydown: handleKeydown,
        onClick: handleClick,
      }

      return render({
        props: { ...props, ...ourProps },
        slot,
        attrs,
        slots,
        name: 'ComboboxButton',
      })
    }
  },
})

// ---

export let ComboboxInput = defineComponent({
  name: 'ComboboxInput',
  props: {
    as: { type: [Object, String], default: 'input' },
    static: { type: Boolean, default: false },
    unmount: { type: Boolean, default: true },
    displayValue: { type: Function as PropType<(item: unknown) => string> },
  },
  emits: {
    change: (_value: Event & { target: HTMLInputElement }) => true,
  },
  setup(props, { emit, attrs, slots, expose }) {
    let api = useComboboxContext('ComboboxInput')
    let id = `headlessui-combobox-input-${useId()}`
    api.inputPropsRef = computed(() => props)

    expose({ el: api.inputRef, $el: api.inputRef })

    function handleKeyDown(event: KeyboardEvent) {
      switch (event.key) {
        // Ref: https://www.w3.org/TR/wai-aria-practices-1.2/#keyboard-interaction-12

        case Keys.Backspace:
        case Keys.Delete:
          if (api.mode.value !== ValueMode.Single) return
          if (!api.nullable.value) return

          let input = event.currentTarget as HTMLInputElement
          requestAnimationFrame(() => {
            if (input.value === '') {
              api.change(null)
              let options = dom(api.optionsRef)
              if (options) {
                options.scrollTop = 0
              }
              api.goToOption(Focus.Nothing)
            }
          })
          break

        case Keys.Enter:
          if (api.comboboxState.value !== ComboboxStates.Open) return

          event.preventDefault()
          event.stopPropagation()

          if (api.activeOptionIndex.value === null) {
            api.closeCombobox()
            return
          }

          api.selectActiveOption()
          if (api.mode.value === ValueMode.Single) {
            api.closeCombobox()
          }
          break

        case Keys.ArrowDown:
          event.preventDefault()
          event.stopPropagation()
          return match(api.comboboxState.value, {
            [ComboboxStates.Open]: () => api.goToOption(Focus.Next),
            [ComboboxStates.Closed]: () => {
              api.openCombobox()
              nextTick(() => {
                if (!api.value.value) {
                  api.goToOption(Focus.First)
                }
              })
            },
          })

        case Keys.ArrowUp:
          event.preventDefault()
          event.stopPropagation()
          return match(api.comboboxState.value, {
            [ComboboxStates.Open]: () => api.goToOption(Focus.Previous),
            [ComboboxStates.Closed]: () => {
              api.openCombobox()
              nextTick(() => {
                if (!api.value.value) {
                  api.goToOption(Focus.Last)
                }
              })
            },
          })

        case Keys.Home:
        case Keys.PageUp:
          event.preventDefault()
          event.stopPropagation()
          return api.goToOption(Focus.First)

        case Keys.End:
        case Keys.PageDown:
          event.preventDefault()
          event.stopPropagation()
          return api.goToOption(Focus.Last)

        case Keys.Escape:
          event.preventDefault()
          if (api.optionsRef.value && !api.optionsPropsRef.value.static) {
            event.stopPropagation()
          }
          api.closeCombobox()
          break

        case Keys.Tab:
          api.selectActiveOption()
          api.closeCombobox()
          break
      }
    }

    function handleChange(event: Event & { target: HTMLInputElement }) {
      emit('change', event)
    }

    function handleInput(event: Event & { target: HTMLInputElement }) {
      api.openCombobox()
      emit('change', event)
    }

    return () => {
      let slot = { open: api.comboboxState.value === ComboboxStates.Open }
      let ourProps = {
        'aria-controls': api.optionsRef.value?.id,
        'aria-expanded': api.disabled ? undefined : api.comboboxState.value === ComboboxStates.Open,
        'aria-activedescendant':
          api.activeOptionIndex.value === null
            ? undefined
            : api.options.value[api.activeOptionIndex.value]?.id,
        'aria-multiselectable': api.mode.value === ValueMode.Multi ? true : undefined,
        'aria-labelledby': dom(api.labelRef)?.id ?? dom(api.buttonRef)?.id,
        id,
        onKeydown: handleKeyDown,
        onChange: handleChange,
        onInput: handleInput,
        role: 'combobox',
        type: 'text',
        tabIndex: 0,
        ref: api.inputRef,
      }
      let incomingProps = omit(props, ['displayValue'])

      return render({
        props: { ...incomingProps, ...ourProps },
        slot,
        attrs,
        slots,
        features: Features.RenderStrategy | Features.Static,
        name: 'ComboboxInput',
      })
    }
  },
})

// ---

export let ComboboxOptions = defineComponent({
  name: 'ComboboxOptions',
  props: {
    as: { type: [Object, String], default: 'ul' },
    static: { type: Boolean, default: false },
    unmount: { type: Boolean, default: true },
    hold: { type: [Boolean], default: false },
  },
  setup(props, { attrs, slots, expose }) {
    let api = useComboboxContext('ComboboxOptions')
    let id = `headlessui-combobox-options-${useId()}`

    expose({ el: api.optionsRef, $el: api.optionsRef })

    watchEffect(() => {
      api.optionsPropsRef.value.static = props.static
    })

    watchEffect(() => {
      api.optionsPropsRef.value.hold = props.hold
    })

    let usesOpenClosedState = useOpenClosed()
    let visible = computed(() => {
      if (usesOpenClosedState !== null) {
        return usesOpenClosedState.value === State.Open
      }

      return api.comboboxState.value === ComboboxStates.Open
    })

    useTreeWalker({
      container: computed(() => dom(api.optionsRef)),
      enabled: computed(() => api.comboboxState.value === ComboboxStates.Open),
      accept(node) {
        if (node.getAttribute('role') === 'option') return NodeFilter.FILTER_REJECT
        if (node.hasAttribute('role')) return NodeFilter.FILTER_SKIP
        return NodeFilter.FILTER_ACCEPT
      },
      walk(node) {
        node.setAttribute('role', 'none')
      },
    })

    return () => {
      let slot = { open: api.comboboxState.value === ComboboxStates.Open }
      let ourProps = {
        'aria-activedescendant':
          api.activeOptionIndex.value === null
            ? undefined
            : api.options.value[api.activeOptionIndex.value]?.id,
        'aria-labelledby': dom(api.labelRef)?.id ?? dom(api.buttonRef)?.id,
        id,
        ref: api.optionsRef,
        role: 'listbox',
      }
      let incomingProps = omit(props, ['hold'])

      return render({
        props: { ...incomingProps, ...ourProps },
        slot,
        attrs,
        slots,
        features: Features.RenderStrategy | Features.Static,
        visible: visible.value,
        name: 'ComboboxOptions',
      })
    }
  },
})

export let ComboboxOption = defineComponent({
  name: 'ComboboxOption',
  props: {
    as: { type: [Object, String], default: 'li' },
    value: { type: [Object, String, Number, Boolean] },
    disabled: { type: Boolean, default: false },
  },
  setup(props, { slots, attrs, expose }) {
    let api = useComboboxContext('ComboboxOption')
    let id = `headlessui-combobox-option-${useId()}`
    let internalOptionRef = ref<HTMLElement | null>(null)

    expose({ el: internalOptionRef, $el: internalOptionRef })

    let active = computed(() => {
      return api.activeOptionIndex.value !== null
        ? api.options.value[api.activeOptionIndex.value].id === id
        : false
    })

    let selected = computed(() =>
      match(api.mode.value, {
        [ValueMode.Single]: () => toRaw(api.value.value) === toRaw(props.value),
        [ValueMode.Multi]: () => (toRaw(api.value.value) as unknown[]).includes(toRaw(props.value)),
      })
    )

    let dataRef = computed<ComboboxOptionData>(() => ({
      disabled: props.disabled,
      value: props.value,
      domRef: internalOptionRef,
    }))

    onMounted(() => api.registerOption(id, dataRef))
    onUnmounted(() => api.unregisterOption(id))

    watchEffect(() => {
      if (api.comboboxState.value !== ComboboxStates.Open) return
      if (!active.value) return
      if (api.activationTrigger.value === ActivationTrigger.Pointer) return
      nextTick(() => dom(internalOptionRef)?.scrollIntoView?.({ block: 'nearest' }))
    })

    function handleClick(event: MouseEvent) {
      if (props.disabled) return event.preventDefault()
      api.selectOption(id)
      if (api.mode.value === ValueMode.Single) {
        api.closeCombobox()
        nextTick(() => dom(api.inputRef)?.focus({ preventScroll: true }))
      }
    }

    function handleFocus() {
      if (props.disabled) return api.goToOption(Focus.Nothing)
      api.goToOption(Focus.Specific, id)
    }

    function handleMove() {
      if (props.disabled) return
      if (active.value) return
      api.goToOption(Focus.Specific, id, ActivationTrigger.Pointer)
    }

    function handleLeave() {
      if (props.disabled) return
      if (!active.value) return
      if (api.optionsPropsRef.value.hold) return
      api.goToOption(Focus.Nothing)
    }

    return () => {
      let { disabled } = props
      let slot = { active: active.value, selected: selected.value, disabled }
      let ourProps = {
        id,
        ref: internalOptionRef,
        role: 'option',
        tabIndex: disabled === true ? undefined : -1,
        'aria-disabled': disabled === true ? true : undefined,
        // According to the WAI-ARIA best practices, we should use aria-checked for
        // multi-select,but Voice-Over disagrees. So we use aria-checked instead for
        // both single and multi-select.
        'aria-selected': selected.value === true ? selected.value : undefined,
        disabled: undefined, // Never forward the `disabled` prop
        onClick: handleClick,
        onFocus: handleFocus,
        onPointermove: handleMove,
        onMousemove: handleMove,
        onPointerleave: handleLeave,
        onMouseleave: handleLeave,
      }

      return render({
        props: { ...props, ...ourProps },
        slot,
        attrs,
        slots,
        name: 'ComboboxOption',
      })
    }
  },
})
