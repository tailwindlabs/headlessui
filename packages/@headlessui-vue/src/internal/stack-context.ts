import {
  inject,
  provide,
  onMounted,
  onUnmounted,

  // Types
  InjectionKey,
  Ref,
} from 'vue'

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
  element,
  onUpdate,
}: {
  type: string
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
    notify(StackMessage.Add, type, element)

    onUnmounted(() => {
      notify(StackMessage.Remove, type, element)
    })
  })

  provide(StackContext, notify)
}
