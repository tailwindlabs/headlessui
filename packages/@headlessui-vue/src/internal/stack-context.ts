import {
  inject,
  provide,
  watchEffect,

  // Types
  InjectionKey,
  Ref,
} from 'vue'

type OnUpdate = (message: StackMessage, element: HTMLElement) => void

let StackContext = Symbol('StackContext') as InjectionKey<OnUpdate>

export enum StackMessage {
  AddElement,
  RemoveElement,
}

export function useStackContext() {
  return inject(StackContext, () => {})
}

export function useElemenStack(element: Ref<HTMLElement | null> | null) {
  let notify = useStackContext()

  watchEffect((onInvalidate) => {
    let domElement = element?.value
    if (!domElement) return

    notify(StackMessage.AddElement, domElement)
    onInvalidate(() => notify(StackMessage.RemoveElement, domElement!))
  })
}

export function useStackProvider(onUpdate?: OnUpdate) {
  let parentUpdate = useStackContext()

  function notify(...args: Parameters<OnUpdate>) {
    // Notify our layer
    onUpdate?.(...args)

    // Notify the parent
    parentUpdate(...args)
  }

  provide(StackContext, notify)
}
