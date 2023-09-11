import { inject, onMounted, onUnmounted, provide, watch, type InjectionKey, type Ref } from 'vue'

type OnUpdate = (message: StackMessage, type: string, element: Ref<HTMLElement | null>) => void

let StackContext = Symbol('StackContext') as InjectionKey<OnUpdate>

export enum StackMessage {
  Add,
  Remove,
}

export function useStackContext() {
  return inject(StackContext, () => {})
}

export function useStackProvider({
  type,
  enabled,
  element,
  onUpdate,
}: {
  type: string
  enabled: Ref<boolean | undefined>
  element: Ref<HTMLElement | null>
  onUpdate?: OnUpdate
}) {
  let parentUpdate = useStackContext()

  function notify(...args: Parameters<OnUpdate>) {
    // Notify our layer
    onUpdate?.(...args)

    // Notify the parent
    parentUpdate(...args)
  }

  onMounted(() => {
    watch(
      enabled,
      (isEnabled, oldIsEnabled) => {
        if (isEnabled) {
          notify(StackMessage.Add, type, element)
        } else if (oldIsEnabled === true) {
          notify(StackMessage.Remove, type, element)
        }
      },
      { immediate: true, flush: 'sync' }
    )
  })

  onUnmounted(() => {
    if (enabled.value) {
      notify(StackMessage.Remove, type, element)
    }
  })

  provide(StackContext, notify)
}
