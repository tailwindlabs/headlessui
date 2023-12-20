import { onUnmounted, shallowRef } from 'vue'
import type { Store } from '../utils/store'

export function useStore<T>(store: Store<T, any>) {
  let state = shallowRef(store.getSnapshot())

  onUnmounted(
    store.subscribe(() => {
      state.value = store.getSnapshot()
    })
  )

  return state
}
