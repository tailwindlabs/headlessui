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
import { FocusableMode, isFocusableElement, sortByDomNode } from '../../utils/focus-management'
import { useOutsideClick } from '../../hooks/use-outside-click'
import { VisuallyHidden } from '../../internal/visually-hidden'
import { objectToFormEntries } from '../../utils/form'

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

function nextFrame(cb: () => void) {
  requestAnimationFrame(() => requestAnimationFrame(cb))
}

type ListboxOptionData = {
  textValue: string
  disabled: boolean
  value: unknown
  domRef: Ref<HTMLElement | null>
}

type StateDefinition = {
  // State
  listboxState: Ref<ListboxStates>
  value: ComputedRef<unknown>
  orientation: Ref<'vertical' | 'horizontal'>

  mode: ComputedRef<ValueMode>

  labelRef: Ref<HTMLLabelElement | null>
  buttonRef: Ref<HTMLButtonElement | null>
  optionsRef: Ref<HTMLDivElement | null>

  disabled: Ref<boolean>
  options: Ref<{ id: string; dataRef: ComputedRef<ListboxOptionData> }[]>
  searchQuery: Ref<string>
  activeOptionIndex: Ref<number | null>
  activationTrigger: Ref<ActivationTrigger>

  // State mutators
  closeListbox(): void
  openListbox(): void
  goToOption(focus: Focus, id?: string, trigger?: ActivationTrigger): void
  search(value: string): void
  clearSearch(): void
  registerOption(id: string, dataRef: ComputedRef<ListboxOptionData>): void
  unregisterOption(id: string): void
  select(value: unknown): void
}

let ListboxContext = Symbol('ListboxContext') as InjectionKey<StateDefinition>

function useListboxContext(component: string) {
  let context = inject(ListboxContext, null)

  if (context === null) {
    let err = new Error(`<${component} /> is missing a parent <Listbox /> component.`)
    if (Error.captureStackTrace) Error.captureStackTrace(err, useListboxContext)
    throw err
  }

  return context
}

// ---

export let Listbox = defineComponent({
  name: 'Listbox',
  emits: { 'update:modelValue': (_value: any) => true },
  props: {
    as: { type: [Object, String], default: 'template' },
    disabled: { type: [Boolean], default: false },
    horizontal: { type: [Boolean], default: false },
    modelValue: { type: [Object, String, Number, Boolean] },
    name: { type: String, optional: true },
    multiple: { type: [Boolean], default: false },
  },
  setup(props, { slots, attrs, emit }) {
    let listboxState = ref<StateDefinition['listboxState']['value']>(ListboxStates.Closed)
    let labelRef = ref<StateDefinition['labelRef']['value']>(null)
    let buttonRef = ref<StateDefinition['buttonRef']['value']>(null)
    let optionsRef = ref<StateDefinition['optionsRef']['value']>(null)
    let options = ref<StateDefinition['options']['value']>([])
    let searchQuery = ref<StateDefinition['searchQuery']['value']>('')
    let activeOptionIndex = ref<StateDefinition['activeOptionIndex']['value']>(null)
    let activationTrigger = ref<StateDefinition['activationTrigger']['value']>(
      ActivationTrigger.Other
    )

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

    let api = {
      listboxState,
      value,
      mode,
      orientation: computed(() => (props.horizontal ? 'horizontal' : 'vertical')),
      labelRef,
      buttonRef,
      optionsRef,
      disabled: computed(() => props.disabled),
      options,
      searchQuery,
      activeOptionIndex,
      activationTrigger,
      closeListbox() {
        if (props.disabled) return
        if (listboxState.value === ListboxStates.Closed) return
        listboxState.value = ListboxStates.Closed
        activeOptionIndex.value = null
      },
      openListbox() {
        if (props.disabled) return
        if (listboxState.value === ListboxStates.Open) return
        listboxState.value = ListboxStates.Open
      },
      goToOption(focus: Focus, id?: string, trigger?: ActivationTrigger) {
        if (props.disabled) return
        if (listboxState.value === ListboxStates.Closed) return

        let adjustedState = adjustOrderedState()
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

        searchQuery.value = ''
        activeOptionIndex.value = nextActiveOptionIndex
        activationTrigger.value = trigger ?? ActivationTrigger.Other
        options.value = adjustedState.options
      },
      search(value: string) {
        if (props.disabled) return
        if (listboxState.value === ListboxStates.Closed) return

        let wasAlreadySearching = searchQuery.value !== ''
        let offset = wasAlreadySearching ? 0 : 1

        searchQuery.value += value.toLowerCase()

        let reOrderedOptions =
          activeOptionIndex.value !== null
            ? options.value
                .slice(activeOptionIndex.value + offset)
                .concat(options.value.slice(0, activeOptionIndex.value + offset))
            : options.value

        let matchingOption = reOrderedOptions.find(
          (option) =>
            option.dataRef.textValue.startsWith(searchQuery.value) && !option.dataRef.disabled
        )

        let matchIdx = matchingOption ? options.value.indexOf(matchingOption) : -1
        if (matchIdx === -1 || matchIdx === activeOptionIndex.value) return

        activeOptionIndex.value = matchIdx
        activationTrigger.value = ActivationTrigger.Other
      },
      clearSearch() {
        if (props.disabled) return
        if (listboxState.value === ListboxStates.Closed) return
        if (searchQuery.value === '') return

        searchQuery.value = ''
      },
      registerOption(id: string, dataRef: ListboxOptionData) {
        let adjustedState = adjustOrderedState((options) => {
          return [...options, { id, dataRef }]
        })

        options.value = adjustedState.options
        activeOptionIndex.value = adjustedState.activeOptionIndex
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
      select(value: unknown) {
        if (props.disabled) return
        emit(
          'update:modelValue',
          match(mode.value, {
            [ValueMode.Single]: () => value,
            [ValueMode.Multi]: () => {
              let copy = toRaw(api.value.value as unknown[]).slice()
              let raw = toRaw(value)

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
      },
    }

    // Handle outside click
    useOutsideClick([buttonRef, optionsRef], (event, target) => {
      if (listboxState.value !== ListboxStates.Open) return

      api.closeListbox()

      if (!isFocusableElement(target, FocusableMode.Loose)) {
        event.preventDefault()
        dom(buttonRef)?.focus()
      }
    })

    // @ts-expect-error Types of property 'dataRef' are incompatible.
    provide(ListboxContext, api)
    useOpenClosedProvider(
      computed(() =>
        match(listboxState.value, {
          [ListboxStates.Open]: State.Open,
          [ListboxStates.Closed]: State.Closed,
        })
      )
    )

    return () => {
      let { name, modelValue, disabled, ...incomingProps } = props

      let slot = { open: listboxState.value === ListboxStates.Open, disabled }

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
          props: omit(incomingProps, ['onUpdate:modelValue', 'horizontal', 'multiple']),
          slot,
          slots,
          attrs,
          name: 'Listbox',
        }),
      ])
    }
  },
})

// ---

export let ListboxLabel = defineComponent({
  name: 'ListboxLabel',
  props: { as: { type: [Object, String], default: 'label' } },
  setup(props, { attrs, slots }) {
    let api = useListboxContext('ListboxLabel')
    let id = `headlessui-listbox-label-${useId()}`

    function handleClick() {
      dom(api.buttonRef)?.focus({ preventScroll: true })
    }

    return () => {
      let slot = {
        open: api.listboxState.value === ListboxStates.Open,
        disabled: api.disabled.value,
      }
      let ourProps = { id, ref: api.labelRef, onClick: handleClick }

      return render({
        props: { ...props, ...ourProps },
        slot,
        attrs,
        slots,
        name: 'ListboxLabel',
      })
    }
  },
})

// ---

export let ListboxButton = defineComponent({
  name: 'ListboxButton',
  props: {
    as: { type: [Object, String], default: 'button' },
  },
  setup(props, { attrs, slots, expose }) {
    let api = useListboxContext('ListboxButton')
    let id = `headlessui-listbox-button-${useId()}`

    expose({ el: api.buttonRef, $el: api.buttonRef })

    function handleKeyDown(event: KeyboardEvent) {
      switch (event.key) {
        // Ref: https://www.w3.org/TR/wai-aria-practices-1.2/#keyboard-interaction-13

        case Keys.Space:
        case Keys.Enter:
        case Keys.ArrowDown:
          event.preventDefault()
          api.openListbox()
          nextTick(() => {
            dom(api.optionsRef)?.focus({ preventScroll: true })
            if (!api.value.value) api.goToOption(Focus.First)
          })
          break

        case Keys.ArrowUp:
          event.preventDefault()
          api.openListbox()
          nextTick(() => {
            dom(api.optionsRef)?.focus({ preventScroll: true })
            if (!api.value.value) api.goToOption(Focus.Last)
          })
          break
      }
    }

    function handleKeyUp(event: KeyboardEvent) {
      switch (event.key) {
        case Keys.Space:
          // Required for firefox, event.preventDefault() in handleKeyDown for
          // the Space key doesn't cancel the handleKeyUp, which in turn
          // triggers a *click*.
          event.preventDefault()
          break
      }
    }

    function handleClick(event: MouseEvent) {
      if (api.disabled.value) return
      if (api.listboxState.value === ListboxStates.Open) {
        api.closeListbox()
        nextTick(() => dom(api.buttonRef)?.focus({ preventScroll: true }))
      } else {
        event.preventDefault()
        api.openListbox()
        nextFrame(() => dom(api.optionsRef)?.focus({ preventScroll: true }))
      }
    }

    let type = useResolveButtonType(
      computed(() => ({ as: props.as, type: attrs.type })),
      api.buttonRef
    )

    return () => {
      let slot = {
        open: api.listboxState.value === ListboxStates.Open,
        disabled: api.disabled.value,
      }
      let ourProps = {
        ref: api.buttonRef,
        id,
        type: type.value,
        'aria-haspopup': true,
        'aria-controls': dom(api.optionsRef)?.id,
        'aria-expanded': api.disabled.value
          ? undefined
          : api.listboxState.value === ListboxStates.Open,
        'aria-labelledby': api.labelRef.value ? [dom(api.labelRef)?.id, id].join(' ') : undefined,
        disabled: api.disabled.value === true ? true : undefined,
        onKeydown: handleKeyDown,
        onKeyup: handleKeyUp,
        onClick: handleClick,
      }

      return render({
        props: { ...props, ...ourProps },
        slot,
        attrs,
        slots,
        name: 'ListboxButton',
      })
    }
  },
})

// ---

export let ListboxOptions = defineComponent({
  name: 'ListboxOptions',
  props: {
    as: { type: [Object, String], default: 'ul' },
    static: { type: Boolean, default: false },
    unmount: { type: Boolean, default: true },
  },
  setup(props, { attrs, slots, expose }) {
    let api = useListboxContext('ListboxOptions')
    let id = `headlessui-listbox-options-${useId()}`
    let searchDebounce = ref<ReturnType<typeof setTimeout> | null>(null)

    expose({ el: api.optionsRef, $el: api.optionsRef })

    function handleKeyDown(event: KeyboardEvent) {
      if (searchDebounce.value) clearTimeout(searchDebounce.value)

      switch (event.key) {
        // Ref: https://www.w3.org/TR/wai-aria-practices-1.2/#keyboard-interaction-12

        // @ts-expect-error Fallthrough is expected here
        case Keys.Space:
          if (api.searchQuery.value !== '') {
            event.preventDefault()
            event.stopPropagation()
            return api.search(event.key)
          }
        // When in type ahead mode, fallthrough
        case Keys.Enter:
          event.preventDefault()
          event.stopPropagation()
          if (api.activeOptionIndex.value !== null) {
            let activeOption = api.options.value[api.activeOptionIndex.value]
            api.select(activeOption.dataRef.value)
          }
          if (api.mode.value === ValueMode.Single) {
            api.closeListbox()
            nextTick(() => dom(api.buttonRef)?.focus({ preventScroll: true }))
          }
          break

        case match(api.orientation.value, {
          vertical: Keys.ArrowDown,
          horizontal: Keys.ArrowRight,
        }):
          event.preventDefault()
          event.stopPropagation()
          return api.goToOption(Focus.Next)

        case match(api.orientation.value, { vertical: Keys.ArrowUp, horizontal: Keys.ArrowLeft }):
          event.preventDefault()
          event.stopPropagation()
          return api.goToOption(Focus.Previous)

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
          event.stopPropagation()
          api.closeListbox()
          nextTick(() => dom(api.buttonRef)?.focus({ preventScroll: true }))
          break

        case Keys.Tab:
          event.preventDefault()
          event.stopPropagation()
          break

        default:
          if (event.key.length === 1) {
            api.search(event.key)
            searchDebounce.value = setTimeout(() => api.clearSearch(), 350)
          }
          break
      }
    }

    let usesOpenClosedState = useOpenClosed()
    let visible = computed(() => {
      if (usesOpenClosedState !== null) {
        return usesOpenClosedState.value === State.Open
      }

      return api.listboxState.value === ListboxStates.Open
    })

    return () => {
      let slot = { open: api.listboxState.value === ListboxStates.Open }
      let ourProps = {
        'aria-activedescendant':
          api.activeOptionIndex.value === null
            ? undefined
            : api.options.value[api.activeOptionIndex.value]?.id,
        'aria-multiselectable': api.mode.value === ValueMode.Multi ? true : undefined,
        'aria-labelledby': dom(api.labelRef)?.id ?? dom(api.buttonRef)?.id,
        'aria-orientation': api.orientation.value,
        id,
        onKeydown: handleKeyDown,
        role: 'listbox',
        tabIndex: 0,
        ref: api.optionsRef,
      }
      let incomingProps = props

      return render({
        props: { ...incomingProps, ...ourProps },
        slot,
        attrs,
        slots,
        features: Features.RenderStrategy | Features.Static,
        visible: visible.value,
        name: 'ListboxOptions',
      })
    }
  },
})

export let ListboxOption = defineComponent({
  name: 'ListboxOption',
  props: {
    as: { type: [Object, String], default: 'li' },
    value: { type: [Object, String, Number, Boolean] },
    disabled: { type: Boolean, default: false },
  },
  setup(props, { slots, attrs, expose }) {
    let api = useListboxContext('ListboxOption')
    let id = `headlessui-listbox-option-${useId()}`
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
    let isFirstSelected = computed(() => {
      return match(api.mode.value, {
        [ValueMode.Multi]: () => {
          let currentValues = toRaw(api.value.value) as unknown[]

          return (
            api.options.value.find((option) => currentValues.includes(option.dataRef.value))?.id ===
            id
          )
        },
        [ValueMode.Single]: () => selected.value,
      })
    })

    let dataRef = computed<ListboxOptionData>(() => ({
      disabled: props.disabled,
      value: props.value,
      textValue: '',
      domRef: internalOptionRef,
    }))
    onMounted(() => {
      let textValue = dom(internalOptionRef)?.textContent?.toLowerCase().trim()
      if (textValue !== undefined) dataRef.value.textValue = textValue
    })

    onMounted(() => api.registerOption(id, dataRef))
    onUnmounted(() => api.unregisterOption(id))

    onMounted(() => {
      watch(
        [api.listboxState, selected],
        () => {
          if (api.listboxState.value !== ListboxStates.Open) return
          if (!selected.value) return

          match(api.mode.value, {
            [ValueMode.Multi]: () => {
              if (isFirstSelected.value) api.goToOption(Focus.Specific, id)
            },
            [ValueMode.Single]: () => {
              api.goToOption(Focus.Specific, id)
            },
          })
        },
        { immediate: true }
      )
    })

    watchEffect(() => {
      if (api.listboxState.value !== ListboxStates.Open) return
      if (!active.value) return
      if (api.activationTrigger.value === ActivationTrigger.Pointer) return
      nextTick(() => dom(internalOptionRef)?.scrollIntoView?.({ block: 'nearest' }))
    })

    function handleClick(event: MouseEvent) {
      if (props.disabled) return event.preventDefault()
      api.select(props.value)
      if (api.mode.value === ValueMode.Single) {
        api.closeListbox()
        nextTick(() => dom(api.buttonRef)?.focus({ preventScroll: true }))
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
        props: { ...omit(props, ['value', 'disabled']), ...ourProps },
        slot,
        attrs,
        slots,
        name: 'ListboxOption',
      })
    }
  },
})
