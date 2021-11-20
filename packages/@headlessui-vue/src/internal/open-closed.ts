import {
  inject,
  provide,

  // Types
  InjectionKey,
  Ref,
} from 'vue'

let Context = Symbol('Context') as InjectionKey<Ref<State>>

export enum State {
  Open,
  Closed,
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
