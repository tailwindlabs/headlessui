import type { Virtualizer } from '@tanstack/virtual-core'
import { useVirtualizer } from '@tanstack/vue-virtual'
import {
  Fragment,
  cloneVNode,
  computed,
  defineComponent,
  h,
  inject,
  nextTick,
  onMounted,
  onUnmounted,
  provide,
  reactive,
  ref,
  toRaw,
  watch,
  watchEffect,
  type ComputedRef,
  type InjectionKey,
  type PropType,
  type Ref,
  type UnwrapNestedRefs,
} from 'vue'
import { useControllable } from '../../hooks/use-controllable'
import { useId } from '../../hooks/use-id'
import { useOutsideClick } from '../../hooks/use-outside-click'
import { useResolveButtonType } from '../../hooks/use-resolve-button-type'
import { useTrackedPointer } from '../../hooks/use-tracked-pointer'
import { useTreeWalker } from '../../hooks/use-tree-walker'
import { Hidden, Features as HiddenFeatures } from '../../internal/hidden'
import { State, useOpenClosed, useOpenClosedProvider } from '../../internal/open-closed'
import { Keys } from '../../keyboard'
import { history } from '../../utils/active-element-history'
import { Focus, calculateActiveIndex } from '../../utils/calculate-active-index'
import { disposables } from '../../utils/disposables'
import { dom } from '../../utils/dom'
import { sortByDomNode } from '../../utils/focus-management'
import { objectToFormEntries } from '../../utils/form'
import { match } from '../../utils/match'
import { getOwnerDocument } from '../../utils/owner'
import { isMobile } from '../../utils/platform'
import { Features, compact, omit, render } from '../../utils/render'

function defaultComparator<T>(a: T, z: T): boolean {
  return a === z
}

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
  Focus,
  Other,
}

type ComboboxOptionData = {
  disabled: boolean
  value: unknown
  domRef: Ref<HTMLElement | null>
  order: Ref<number | null>
}
type StateDefinition = {
  // State
  comboboxState: Ref<ComboboxStates>
  value: ComputedRef<unknown>
  defaultValue: ComputedRef<unknown>

  mode: ComputedRef<ValueMode>
  nullable: ComputedRef<boolean>
  immediate: ComputedRef<boolean>

  virtual: ComputedRef<{
    options: unknown[]
    disabled: (value: unknown) => boolean
  } | null>
  calculateIndex(value: unknown): number
  isSelected(value: unknown): boolean
  isActive(value: unknown): boolean

  compare: (a: unknown, z: unknown) => boolean

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
  setActivationTrigger(trigger: ActivationTrigger): void
  goToOption(focus: Focus, idx?: number, trigger?: ActivationTrigger): void
  change(value: unknown): void
  selectOption(id: string): void
  selectActiveOption(): void
  registerOption(id: string, dataRef: ComputedRef<ComboboxOptionData>): void
  unregisterOption(id: string, active: boolean): void
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

let VirtualContext = Symbol('VirtualContext') as InjectionKey<Ref<Virtualizer<any, any>> | null>

let VirtualProvider = defineComponent({
  name: 'VirtualProvider',
  setup(_, { slots }) {
    let api = useComboboxContext('VirtualProvider')

    let padding = computed(() => {
      let el = dom(api.optionsRef)
      if (!el) return { start: 0, end: 0 }

      let styles = window.getComputedStyle(el)

      return {
        start: parseFloat(styles.paddingBlockStart || styles.paddingTop),
        end: parseFloat(styles.paddingBlockEnd || styles.paddingBottom),
      }
    })

    let virtualizer = useVirtualizer<HTMLDivElement, HTMLLIElement>(
      computed(() => {
        return {
          scrollPaddingStart: padding.value.start,
          scrollPaddingEnd: padding.value.end,
          count: api.virtual.value!.options.length,
          estimateSize() {
            return 40
          },
          getScrollElement() {
            return dom(api.optionsRef)
          },
          overscan: 12,
        }
      })
    )

    let options = computed(() => api.virtual.value?.options)
    let baseKey = ref(0)
    watch([options], () => {
      baseKey.value += 1
    })

    provide(VirtualContext, api.virtual.value ? virtualizer : null)

    return () => {
      return [
        h(
          'div',
          {
            style: {
              position: 'relative',
              width: '100%',
              height: `${virtualizer.value.getTotalSize()}px`,
            },
            ref: (el) => {
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
                if (api.activationTrigger.value === ActivationTrigger.Pointer) {
                  return
                }

                if (
                  api.activeOptionIndex.value !== null &&
                  api.virtual.value!.options.length > api.activeOptionIndex.value
                ) {
                  virtualizer.value.scrollToIndex(api.activeOptionIndex.value)
                }
              }
            },
          },
          virtualizer.value.getVirtualItems().map((item) => {
            return cloneVNode(
              slots.default!({
                option: api.virtual.value!.options[item.index],
                open: api.comboboxState.value === ComboboxStates.Open,
              })![0],
              {
                key: `${baseKey.value}-${item.index}`,
                'data-index': item.index,
                'aria-setsize': api.virtual.value!.options.length,
                'aria-posinset': item.index + 1,
                style: {
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  transform: `translateY(${item.start}px)`,
                  overflowAnchor: 'none',
                },
              }
            )
          })
        ),
      ]
    }
  },
})

// ---

export let Combobox = defineComponent({
  name: 'Combobox',
  emits: { 'update:modelValue': (_value: any) => true },
  props: {
    as: { type: [Object, String], default: 'template' },
    disabled: { type: [Boolean], default: false },
    by: { type: [String, Function], nullable: true, default: null },
    modelValue: {
      type: [Object, String, Number, Boolean] as PropType<
        object | string | number | boolean | null
      >,
      default: undefined,
    },
    defaultValue: {
      type: [Object, String, Number, Boolean] as PropType<
        object | string | number | boolean | null
      >,
      default: undefined,
    },
    form: { type: String, optional: true },
    name: { type: String, optional: true },
    nullable: { type: Boolean, default: false },
    multiple: { type: [Boolean], default: false },
    immediate: { type: [Boolean], default: false },
    virtual: {
      type: Object as PropType<null | {
        options: unknown[]
        disabled?: (value: unknown) => boolean
      }>,
      default: null,
    },
  },
  inheritAttrs: false,
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

      let list = adjustment(options.value.slice())

      let sortedOptions =
        list.length > 0 && list[0].dataRef.order.value !== null
          ? // Prefer sorting based on the `order`
            list.sort((a, z) => a.dataRef.order.value! - z.dataRef.order.value!)
          : // Fallback to much slower DOM order
            sortByDomNode(list, (option) => dom(option.dataRef.domRef))

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

    let mode = computed(() => (props.multiple ? ValueMode.Multi : ValueMode.Single))
    let nullable = computed(() => props.nullable)
    let [directValue, theirOnChange] = useControllable(
      computed(() => props.modelValue),
      (value: unknown) => emit('update:modelValue', value),
      computed(() => props.defaultValue)
    )

    let value = computed(() =>
      directValue.value === undefined
        ? match(mode.value, {
            [ValueMode.Multi]: [],
            [ValueMode.Single]: undefined,
          })
        : directValue.value
    )

    let goToOptionRaf: ReturnType<typeof requestAnimationFrame> | null = null
    let orderOptionsRaf: ReturnType<typeof requestAnimationFrame> | null = null

    function onChange(value: unknown) {
      return match(mode.value, {
        [ValueMode.Single]() {
          return theirOnChange?.(value)
        },
        [ValueMode.Multi]: () => {
          let copy = toRaw(api.value.value as unknown[]).slice()
          let raw = toRaw(value)

          let idx = copy.findIndex((value) => api.compare(raw, toRaw(value)))
          if (idx === -1) {
            copy.push(raw)
          } else {
            copy.splice(idx, 1)
          }

          return theirOnChange?.(copy)
        },
      })
    }

    let virtualOptions = computed(() => props.virtual?.options)
    watch([virtualOptions], ([newOptions], [oldOptions]) => {
      if (!api.virtual.value) return
      if (!newOptions) return
      if (!oldOptions) return

      if (activeOptionIndex.value !== null) {
        let idx = newOptions.indexOf(oldOptions[activeOptionIndex.value])
        if (idx !== -1) {
          activeOptionIndex.value = idx
        } else {
          activeOptionIndex.value = null
        }
      }
    })

    let api: StateDefinition = {
      comboboxState,
      value,
      mode,
      compare(a: any, z: any) {
        if (typeof props.by === 'string') {
          let property = props.by as unknown as any
          return a?.[property] === z?.[property]
        }

        if (props.by === null) {
          return defaultComparator(a, z)
        }

        return props.by(a, z)
      },
      calculateIndex(value: any) {
        if (api.virtual.value) {
          if (props.by === null) {
            return api.virtual.value!.options.indexOf(value)
          } else {
            return api.virtual.value!.options.findIndex((other) => api.compare(other, value))
          }
        } else {
          return options.value.findIndex((other) => api.compare(other.dataRef.value, value))
        }
      },
      defaultValue: computed(() => props.defaultValue),
      nullable,
      immediate: computed(() => props.immediate),
      virtual: computed(() => {
        return props.virtual
          ? {
              options: props.virtual.options,
              disabled: props.virtual.disabled ?? (() => false),
            }
          : null
      }),
      inputRef,
      labelRef,
      buttonRef,
      optionsRef,
      disabled: computed(() => props.disabled),
      // @ts-expect-error dateRef types are incorrect due to unwrapped or wrapped refs
      options,
      change(value: unknown) {
        theirOnChange(value as typeof props.modelValue)
      },
      activeOptionIndex: computed(() => {
        if (
          defaultToFirstOption.value &&
          activeOptionIndex.value === null &&
          (api.virtual.value ? api.virtual.value.options.length > 0 : options.value.length > 0)
        ) {
          if (api.virtual.value) {
            let localActiveOptionIndex = api.virtual.value.options.findIndex(
              (option) => !api.virtual.value?.disabled(option)
            )

            if (localActiveOptionIndex !== -1) {
              return localActiveOptionIndex
            }
          }

          let localActiveOptionIndex = options.value.findIndex((option) => !option.dataRef.disabled)
          if (localActiveOptionIndex !== -1) {
            return localActiveOptionIndex
          }
        }

        return activeOptionIndex.value
      }),
      activationTrigger,
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

        // Check if we have a selected value that we can make active
        if (api.value.value) {
          let idx = api.calculateIndex(api.value.value)
          if (idx !== -1) {
            activeOptionIndex.value = idx
          }
        }

        comboboxState.value = ComboboxStates.Open
      },
      setActivationTrigger(trigger: ActivationTrigger) {
        activationTrigger.value = trigger
      },
      goToOption(focus: Focus, idx?: number, trigger?: ActivationTrigger) {
        defaultToFirstOption.value = false

        if (goToOptionRaf !== null) {
          cancelAnimationFrame(goToOptionRaf)
        }

        goToOptionRaf = requestAnimationFrame(() => {
          if (props.disabled) return
          if (
            optionsRef.value &&
            !optionsPropsRef.value.static &&
            comboboxState.value === ComboboxStates.Closed
          ) {
            return
          }

          if (api.virtual.value) {
            activeOptionIndex.value =
              focus === Focus.Specific
                ? idx!
                : calculateActiveIndex(
                    { focus: focus as Exclude<Focus, Focus.Specific> },
                    {
                      resolveItems: () => api.virtual.value!.options,
                      resolveActiveIndex: () => {
                        return (
                          api.activeOptionIndex.value ??
                          api.virtual.value!.options.findIndex(
                            (option) => !api.virtual.value?.disabled(option)
                          ) ??
                          null
                        )
                      },
                      resolveDisabled: (item) => api.virtual.value!.disabled(item),
                      resolveId() {
                        throw new Error('Function not implemented.')
                      },
                    }
                  )
            activationTrigger.value = trigger ?? ActivationTrigger.Other
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

          let nextActiveOptionIndex =
            focus === Focus.Specific
              ? idx!
              : calculateActiveIndex(
                  { focus: focus as Exclude<Focus, Focus.Specific> },
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
        })
      },
      selectOption(id: string) {
        let option = options.value.find((item) => item.id === id)
        if (!option) return

        let { dataRef } = option

        onChange(dataRef.value)
      },
      selectActiveOption() {
        if (api.activeOptionIndex.value === null) return

        if (api.virtual.value) {
          onChange(api.virtual.value.options[api.activeOptionIndex.value])
        } else {
          let { dataRef } = options.value[api.activeOptionIndex.value]
          onChange(dataRef.value)
        }

        // It could happen that the `activeOptionIndex` stored in state is actually null,
        // but we are getting the fallback active option back instead.
        api.goToOption(Focus.Specific, api.activeOptionIndex.value)
      },
      registerOption(id: string, dataRef: ComputedRef<ComboboxOptionData>) {
        let option = reactive({ id, dataRef }) as unknown as {
          id: typeof id
          dataRef: (typeof dataRef)['value']
        }

        if (api.virtual.value) {
          options.value.push(option)
          return
        }

        if (orderOptionsRaf) cancelAnimationFrame(orderOptionsRaf)

        let adjustedState = adjustOrderedState((options) => {
          options.push(option)
          return options
        })

        // Check if we need to make the newly registered option active.
        if (activeOptionIndex.value === null) {
          if (api.isSelected(dataRef.value.value)) {
            adjustedState.activeOptionIndex = adjustedState.options.indexOf(option)
          }
        }

        options.value = adjustedState.options
        activeOptionIndex.value = adjustedState.activeOptionIndex
        activationTrigger.value = ActivationTrigger.Other

        // If some of the DOM elements aren't ready yet, then we can retry in the next tick.
        if (adjustedState.options.some((option) => !dom(option.dataRef.domRef))) {
          orderOptionsRaf = requestAnimationFrame(() => {
            let adjustedState = adjustOrderedState()
            options.value = adjustedState.options

            activeOptionIndex.value = adjustedState.activeOptionIndex
          })
        }
      },
      unregisterOption(id: string, active: boolean) {
        if (goToOptionRaf !== null) {
          cancelAnimationFrame(goToOptionRaf)
        }

        // When we are unregistering the currently active option, then we also have to make sure to
        // reset the `defaultToFirstOption` flag, so that visually something is selected and the
        // next time you press a key on your keyboard it will go to the proper next or previous
        // option in the list.
        //
        // Since this was the active option and it could have been anywhere in the list, resetting
        // to the very first option seems like a fine default. We _could_ be smarter about this by
        // going to the previous / next item in list if we know the direction of the keyboard
        // navigation, but that might be too complex/confusing from an end users perspective.
        if (active) {
          defaultToFirstOption.value = true
        }

        if (api.virtual.value) {
          options.value = options.value.filter((option) => option.id !== id)
          return
        }

        let adjustedState = adjustOrderedState((options) => {
          let idx = options.findIndex((option) => option.id === id)
          if (idx !== -1) options.splice(idx, 1)
          return options
        })

        options.value = adjustedState.options
        activeOptionIndex.value = adjustedState.activeOptionIndex
        activationTrigger.value = ActivationTrigger.Other
      },
      isSelected(other) {
        return match(mode.value, {
          [ValueMode.Single]: () => api.compare(toRaw(api.value.value), toRaw(other)),
          [ValueMode.Multi]: () =>
            (toRaw(api.value.value) as unknown[]).some((option) =>
              api.compare(toRaw(option), toRaw(other))
            ),
        })
      },
      isActive(other) {
        return activeOptionIndex.value === api.calculateIndex(other)
      },
    }

    // Handle outside click
    useOutsideClick(
      [inputRef, buttonRef, optionsRef],
      () => api.closeCombobox(),
      computed(() => comboboxState.value === ComboboxStates.Open)
    )

    provide(ComboboxContext, api)

    useOpenClosedProvider(
      computed(() =>
        match(comboboxState.value, {
          [ComboboxStates.Open]: State.Open,
          [ComboboxStates.Closed]: State.Closed,
        })
      )
    )

    let form = computed(() => dom(inputRef)?.closest('form'))
    onMounted(() => {
      watch(
        [form],
        () => {
          if (!form.value) return
          if (props.defaultValue === undefined) return

          function handle() {
            api.change(props.defaultValue)
          }

          form.value.addEventListener('reset', handle)

          return () => {
            form.value?.removeEventListener('reset', handle)
          }
        },
        { immediate: true }
      )
    })

    return () => {
      let { name, disabled, form, ...theirProps } = props
      let slot = {
        open: comboboxState.value === ComboboxStates.Open,
        disabled,
        activeIndex: api.activeOptionIndex.value,
        activeOption:
          api.activeOptionIndex.value === null
            ? null
            : api.virtual.value
              ? api.virtual.value.options[api.activeOptionIndex.value ?? 0]
              : api.options.value[api.activeOptionIndex.value]?.dataRef.value.value ?? null,
        value: value.value,
      }

      return h(Fragment, [
        ...(name != null && value.value != null
          ? objectToFormEntries({ [name]: value.value }).map(([name, value]) => {
              return h(
                Hidden,
                compact({
                  features: HiddenFeatures.Hidden,
                  key: name,
                  as: 'input',
                  type: 'hidden',
                  hidden: true,
                  readOnly: true,
                  form,
                  name,
                  value,
                })
              )
            })
          : []),
        render({
          theirProps: {
            ...attrs,
            ...omit(theirProps, [
              'by',
              'defaultValue',
              'immediate',
              'modelValue',
              'multiple',
              'nullable',
              'onUpdate:modelValue',
              'virtual',
            ]),
          },
          ourProps: {},
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
  props: {
    as: { type: [Object, String], default: 'label' },
    id: { type: String, default: () => `headlessui-combobox-label-${useId()}` },
  },
  setup(props, { attrs, slots }) {
    let api = useComboboxContext('ComboboxLabel')

    function handleClick() {
      dom(api.inputRef)?.focus({ preventScroll: true })
    }

    return () => {
      let slot = {
        open: api.comboboxState.value === ComboboxStates.Open,
        disabled: api.disabled.value,
      }

      let { id, ...theirProps } = props
      let ourProps = { id, ref: api.labelRef, onClick: handleClick }

      return render({
        ourProps,
        theirProps,
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
    id: { type: String, default: () => `headlessui-combobox-button-${useId()}` },
  },
  setup(props, { attrs, slots, expose }) {
    let api = useComboboxContext('ComboboxButton')

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
        // Ref: https://www.w3.org/WAI/ARIA/apg/patterns/menu/#keyboard-interaction-12

        case Keys.ArrowDown:
          event.preventDefault()
          event.stopPropagation()
          if (api.comboboxState.value === ComboboxStates.Closed) {
            api.openCombobox()
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
          if (api.comboboxState.value !== ComboboxStates.Open) return
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
        value: api.value.value,
      }
      let { id, ...theirProps } = props
      let ourProps = {
        ref: api.buttonRef,
        id,
        type: type.value,
        tabindex: '-1',
        'aria-haspopup': 'listbox',
        'aria-controls': dom(api.optionsRef)?.id,
        'aria-expanded': api.comboboxState.value === ComboboxStates.Open,
        'aria-labelledby': api.labelRef.value ? [dom(api.labelRef)?.id, id].join(' ') : undefined,
        disabled: api.disabled.value === true ? true : undefined,
        onKeydown: handleKeydown,
        onClick: handleClick,
      }

      return render({
        ourProps,
        theirProps,
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
    defaultValue: { type: String, default: undefined },
    id: { type: String, default: () => `headlessui-combobox-input-${useId()}` },
  },
  emits: {
    change: (_value: Event & { target: HTMLInputElement }) => true,
  },
  setup(props, { emit, attrs, slots, expose }) {
    let api = useComboboxContext('ComboboxInput')
    let ownerDocument = computed(() => getOwnerDocument(dom(api.inputRef)))

    let isTyping = { value: false }

    expose({ el: api.inputRef, $el: api.inputRef })

    function clear() {
      api.change(null)
      let options = dom(api.optionsRef)
      if (options) {
        options.scrollTop = 0
      }
      api.goToOption(Focus.Nothing)
    }

    // When a `displayValue` prop is given, we should use it to transform the current selected
    // option(s) so that the format can be chosen by developers implementing this. This is useful if
    // your data is an object and you just want to pick a certain property or want to create a dynamic
    // value like `firstName + ' ' + lastName`.
    //
    // Note: This can also be used with multiple selected options, but this is a very simple transform
    // which should always result in a string (since we are filling in the value of the text input),
    // you don't have to use this at all, a more common UI is a "tag" based UI, which you can render
    // yourself using the selected option(s).
    let currentDisplayValue = computed(() => {
      let value = api.value.value
      if (!dom(api.inputRef)) return ''

      if (typeof props.displayValue !== 'undefined' && value !== undefined) {
        return props.displayValue(value as unknown) ?? ''
      } else if (typeof value === 'string') {
        return value
      } else {
        return ''
      }
    })

    onMounted(() => {
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
      watch(
        [currentDisplayValue, api.comboboxState, ownerDocument],
        ([currentDisplayValue, state], [oldCurrentDisplayValue, oldState]) => {
          // When the user is typing, we want to not touch the `input` at all. Especially when they
          // are using an IME, we don't want to mess with the input at all.
          if (isTyping.value) return

          let input = dom(api.inputRef)
          if (!input) return

          if (oldState === ComboboxStates.Open && state === ComboboxStates.Closed) {
            input.value = currentDisplayValue
          } else if (currentDisplayValue !== oldCurrentDisplayValue) {
            input.value = currentDisplayValue
          }

          // Once we synced the input value, we want to make sure the cursor is at the end of the
          // input field. This makes it easier to continue typing and append to the query. We will
          // bail out if the user is currently typing, because we don't want to mess with the cursor
          // position while typing.
          requestAnimationFrame(() => {
            if (isTyping.value) return
            if (!input) return

            // Bail when the input is not the currently focused element. When it is not the focused
            // element, and we call the `setSelectionRange`, then it will become the focused
            // element which may be unwanted.
            if (ownerDocument.value?.activeElement !== input) return

            let { selectionStart, selectionEnd } = input

            // A custom selection is used, no need to move the caret
            if (Math.abs((selectionEnd ?? 0) - (selectionStart ?? 0)) !== 0) return

            // A custom caret position is used, no need to move the caret
            if (selectionStart !== 0) return

            // Move the caret to the end
            input.setSelectionRange(input.value.length, input.value.length)
          })
        },
        { immediate: true }
      )

      // Trick VoiceOver in behaving a little bit better. Manually "resetting" the input makes
      // VoiceOver a bit more happy and doesn't require some changes manually first before
      // announcing items correctly. This is a bit of a hacks, but it is a workaround for a
      // VoiceOver bug.
      //
      // TODO: VoiceOver is still relatively buggy if you start VoiceOver while the Combobox is
      // already in an open state.
      watch([api.comboboxState], ([newState], [oldState]) => {
        if (newState === ComboboxStates.Open && oldState === ComboboxStates.Closed) {
          // When the user is typing, we want to not touch the `input` at all. Especially when they
          // are using an IME, we don't want to mess with the input at all.
          if (isTyping.value) return

          let input = dom(api.inputRef)
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
      })
    })

    let isComposing = ref(false)
    function handleCompositionstart() {
      isComposing.value = true
    }
    function handleCompositionend() {
      disposables().nextFrame(() => {
        isComposing.value = false
      })
    }

    function handleKeyDown(event: KeyboardEvent) {
      isTyping.value = true
      switch (event.key) {
        // Ref: https://www.w3.org/WAI/ARIA/apg/patterns/menu/#keyboard-interaction-12

        case Keys.Enter:
          isTyping.value = false
          if (api.comboboxState.value !== ComboboxStates.Open) return

          // When the user is still in the middle of composing by using an IME, then we don't want
          // to submit this value and close the Combobox yet. Instead, we will fallback to the
          // default behaviour which is to "end" the composition.
          if (isComposing.value) return

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
          isTyping.value = false
          event.preventDefault()
          event.stopPropagation()
          return match(api.comboboxState.value, {
            [ComboboxStates.Open]: () => api.goToOption(Focus.Next),
            [ComboboxStates.Closed]: () => api.openCombobox(),
          })

        case Keys.ArrowUp:
          isTyping.value = false
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
          if (event.shiftKey) {
            break
          }

          isTyping.value = false
          event.preventDefault()
          event.stopPropagation()
          return api.goToOption(Focus.First)

        case Keys.PageUp:
          isTyping.value = false
          event.preventDefault()
          event.stopPropagation()
          return api.goToOption(Focus.First)

        case Keys.End:
          if (event.shiftKey) {
            break
          }

          isTyping.value = false
          event.preventDefault()
          event.stopPropagation()
          return api.goToOption(Focus.Last)

        case Keys.PageDown:
          isTyping.value = false
          event.preventDefault()
          event.stopPropagation()
          return api.goToOption(Focus.Last)

        case Keys.Escape:
          isTyping.value = false
          if (api.comboboxState.value !== ComboboxStates.Open) return
          event.preventDefault()
          if (api.optionsRef.value && !api.optionsPropsRef.value.static) {
            event.stopPropagation()
          }

          if (api.nullable.value && api.mode.value === ValueMode.Single) {
            // We want to clear the value when the user presses escape if and only if the current
            // value is not set (aka, they didn't select anything yet, or they cleared the input which
            // caused the value to be set to `null`). If the current value is set, then we want to
            // fallback to that value when we press escape (this part is handled in the watcher that
            // syncs the value with the input field again).
            if (api.value.value === null) {
              clear()
            }
          }

          api.closeCombobox()
          break

        case Keys.Tab:
          isTyping.value = false
          if (api.comboboxState.value !== ComboboxStates.Open) return
          if (
            api.mode.value === ValueMode.Single &&
            api.activationTrigger.value !== ActivationTrigger.Focus
          ) {
            api.selectActiveOption()
          }
          api.closeCombobox()
          break
      }
    }

    function handleInput(event: Event & { target: HTMLInputElement }) {
      // Always call the onChange listener even if the user is still typing using an IME (Input Method
      // Editor).
      //
      // The main issue is Android, where typing always uses the IME APIs. Just waiting until the
      // compositionend event is fired to trigger an onChange is not enough, because then filtering
      // options while typing won't work at all because we are still in "composing" mode.
      emit('change', event)

      // When the value becomes empty in a single value mode while being nullable then we want to clear
      // the option entirely.
      //
      // This is can happen when you press backspace, but also when you select all the text and press
      // ctrl/cmd+x.
      if (api.nullable.value && api.mode.value === ValueMode.Single) {
        if (event.target.value === '') {
          clear()
        }
      }

      // Open the combobox to show the results based on what the user has typed
      api.openCombobox()
    }

    function handleBlur(event: FocusEvent) {
      let relatedTarget =
        (event.relatedTarget as HTMLElement) ?? history.find((x) => x !== event.currentTarget)
      isTyping.value = false

      // Focus is moved into the list, we don't want to close yet.
      if (dom(api.optionsRef)?.contains(relatedTarget)) {
        return
      }

      if (dom(api.buttonRef)?.contains(relatedTarget)) {
        return
      }

      if (api.comboboxState.value !== ComboboxStates.Open) return
      event.preventDefault()

      if (api.mode.value === ValueMode.Single) {
        // We want to clear the value when the user presses escape if and only if the current
        // value is not set (aka, they didn't select anything yet, or they cleared the input which
        // caused the value to be set to `null`). If the current value is set, then we want to
        // fallback to that value when we press escape (this part is handled in the watcher that
        // syncs the value with the input field again).
        if (api.nullable.value && api.value.value === null) {
          clear()
        }

        // We do have a value, so let's select the active option, unless we were just going through
        // the form and we opened it due to the focus event.
        else if (api.activationTrigger.value !== ActivationTrigger.Focus) {
          api.selectActiveOption()
        }
      }

      return api.closeCombobox()
    }

    function handleFocus(event: FocusEvent) {
      let relatedTarget =
        (event.relatedTarget as HTMLElement) ?? history.find((x) => x !== event.currentTarget)

      if (dom(api.buttonRef)?.contains(relatedTarget)) return
      if (dom(api.optionsRef)?.contains(relatedTarget)) return
      if (api.disabled.value) return

      if (!api.immediate.value) return
      if (api.comboboxState.value === ComboboxStates.Open) return

      api.openCombobox()

      // We need to make sure that tabbing through a form doesn't result in incorrectly setting the
      // value of the combobox. We will set the activation trigger to `Focus`, and we will ignore
      // selecting the active option when the user tabs away.
      disposables().nextFrame(() => {
        api.setActivationTrigger(ActivationTrigger.Focus)
      })
    }

    let defaultValue = computed(() => {
      return (
        props.defaultValue ??
        (api.defaultValue.value !== undefined
          ? props.displayValue?.(api.defaultValue.value)
          : null) ??
        api.defaultValue.value ??
        ''
      )
    })

    return () => {
      let slot = { open: api.comboboxState.value === ComboboxStates.Open }
      let { id, displayValue, onChange: _onChange, ...theirProps } = props
      let ourProps = {
        'aria-controls': api.optionsRef.value?.id,
        'aria-expanded': api.comboboxState.value === ComboboxStates.Open,
        'aria-activedescendant':
          api.activeOptionIndex.value === null
            ? undefined
            : api.virtual.value
              ? api.options.value.find((option) => {
                  return (
                    !api.virtual.value!.disabled(option.dataRef.value) &&
                    api.compare(
                      option.dataRef.value,
                      api.virtual.value!.options[api.activeOptionIndex.value!]
                    )
                  )
                })?.id
              : api.options.value[api.activeOptionIndex.value]?.id,
        'aria-labelledby': dom(api.labelRef)?.id ?? dom(api.buttonRef)?.id,
        'aria-autocomplete': 'list',
        id,
        onCompositionstart: handleCompositionstart,
        onCompositionend: handleCompositionend,
        onKeydown: handleKeyDown,
        onInput: handleInput,
        onFocus: handleFocus,
        onBlur: handleBlur,
        role: 'combobox',
        type: attrs.type ?? 'text',
        tabIndex: 0,
        ref: api.inputRef,
        defaultValue: defaultValue.value,
        disabled: api.disabled.value === true ? true : undefined,
      }

      return render({
        ourProps,
        theirProps,
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
        return (usesOpenClosedState.value & State.Open) === State.Open
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
        'aria-labelledby': dom(api.labelRef)?.id ?? dom(api.buttonRef)?.id,
        id,
        ref: api.optionsRef,
        role: 'listbox',
        'aria-multiselectable': api.mode.value === ValueMode.Multi ? true : undefined,
      }
      let theirProps = omit(props, ['hold'])

      return render({
        ourProps,
        theirProps,
        slot,
        attrs,
        slots:
          api.virtual.value && api.comboboxState.value === ComboboxStates.Open
            ? {
                ...slots,
                default: () => [h(VirtualProvider, {}, slots.default)],
              }
            : slots,
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
    value: {
      type: [Object, String, Number, Boolean] as PropType<
        object | string | number | boolean | null
      >,
    },
    disabled: { type: Boolean, default: false },
    order: { type: [Number], default: null },
  },
  setup(props, { slots, attrs, expose }) {
    let api = useComboboxContext('ComboboxOption')
    let id = `headlessui-combobox-option-${useId()}`
    let internalOptionRef = ref<HTMLElement | null>(null)

    expose({ el: internalOptionRef, $el: internalOptionRef })

    let active = computed(() => {
      return api.virtual.value
        ? api.activeOptionIndex.value === api.calculateIndex(props.value)
        : api.activeOptionIndex.value === null
          ? false
          : api.options.value[api.activeOptionIndex.value]?.id === id
    })

    let selected = computed(() => api.isSelected(props.value))

    let virtualizer = inject(VirtualContext, null)
    let dataRef = computed<ComboboxOptionData>(() => ({
      disabled: props.disabled,
      value: props.value,
      domRef: internalOptionRef,
      order: computed(() => props.order),
    }))

    onMounted(() => api.registerOption(id, dataRef))
    onUnmounted(() => api.unregisterOption(id, active.value))

    watchEffect(() => {
      let el = dom(internalOptionRef)
      if (!el) return

      virtualizer?.value.measureElement(el)
    })

    watchEffect(() => {
      if (api.comboboxState.value !== ComboboxStates.Open) return
      if (!active.value) return
      if (api.virtual.value) return
      if (api.activationTrigger.value === ActivationTrigger.Pointer) return
      nextTick(() => dom(internalOptionRef)?.scrollIntoView?.({ block: 'nearest' }))
    })

    function handleClick(event: MouseEvent) {
      if (props.disabled || api.virtual.value?.disabled(props.value)) return event.preventDefault()
      api.selectOption(id)

      // We want to make sure that we don't accidentally trigger the virtual keyboard.
      //
      // This would happen if the input is focused, the options are open, you select an option
      // (which would blur the input, and focus the option (button), then we re-focus the input).
      //
      // This would be annoying on mobile (or on devices with a virtual keyboard). Right now we are
      // assuming that the virtual keyboard would open on mobile devices (iOS / Android). This
      // assumption is not perfect, but will work in the majority of the cases.
      //
      // Ideally we can have a better check where we can explicitly check for the virtual keyboard.
      // But right now this is still an experimental feature:
      // https://developer.mozilla.org/en-US/docs/Web/API/Navigator/virtualKeyboard
      if (!isMobile()) {
        requestAnimationFrame(() => dom(api.inputRef)?.focus({ preventScroll: true }))
      }

      if (api.mode.value === ValueMode.Single) {
        requestAnimationFrame(() => api.closeCombobox())
      }
    }

    function handleFocus() {
      if (props.disabled || api.virtual.value?.disabled(props.value)) {
        return api.goToOption(Focus.Nothing)
      }
      let idx = api.calculateIndex(props.value)
      api.goToOption(Focus.Specific, idx)
    }

    let pointer = useTrackedPointer()

    function handleEnter(evt: PointerEvent) {
      pointer.update(evt)
    }

    function handleMove(evt: PointerEvent) {
      if (!pointer.wasMoved(evt)) return
      if (props.disabled || api.virtual.value?.disabled(props.value)) return
      if (active.value) return
      let idx = api.calculateIndex(props.value)
      api.goToOption(Focus.Specific, idx, ActivationTrigger.Pointer)
    }

    function handleLeave(evt: PointerEvent) {
      if (!pointer.wasMoved(evt)) return
      if (props.disabled || api.virtual.value?.disabled(props.value)) return
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
        // multi-select,but Voice-Over disagrees. So we use aria-selected instead for
        // both single and multi-select.
        'aria-selected': selected.value,
        disabled: undefined, // Never forward the `disabled` prop
        onClick: handleClick,
        onFocus: handleFocus,
        onPointerenter: handleEnter,
        onMouseenter: handleEnter,
        onPointermove: handleMove,
        onMousemove: handleMove,
        onPointerleave: handleLeave,
        onMouseleave: handleLeave,
      }

      let theirProps = omit(props, ['order', 'value'])

      return render({
        ourProps,
        theirProps,
        slot,
        attrs,
        slots,
        name: 'ComboboxOption',
      })
    }
  },
})
