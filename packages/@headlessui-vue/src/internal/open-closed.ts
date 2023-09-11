import { inject, provide, type InjectionKey, type Ref } from 'vue'

let Context = Symbol('Context') as InjectionKey<Ref<State>>

export enum State {
  Open = 1 << 0,
  Closed = 1 << 1,
  Closing = 1 << 2,
  Opening = 1 << 3,
}

export function hasOpenClosed() {
  return useOpenClosed() !== null
}

export function useOpenClosed() {
  return inject(Context, null)
}

export function useOpenClosedProvider(value: Ref<State>) {
  provide(Context, value)
}
