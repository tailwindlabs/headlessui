import { computed, ComputedRef, ref } from 'vue'

export function useControllable<T>(
  controlledValue: ComputedRef<T | undefined>,
  onChange?: (value: T) => void,
  defaultValue?: ComputedRef<T>
) {
  let internalValue = ref(defaultValue?.value)
  let isControlled = computed(() => controlledValue.value !== undefined)

  return [
    computed(() => (isControlled.value ? controlledValue.value : internalValue.value)),
    function (value: unknown) {
      if (isControlled.value) {
        return onChange?.(value as T)
      } else {
        internalValue.value = value as T
        return onChange?.(value as T)
      }
    },
  ] as const
}
