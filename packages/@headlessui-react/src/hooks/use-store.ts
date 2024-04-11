import { useSyncExternalStore } from 'react'
import type { Store } from '../utils/store'

export function useStore<T>(store: Store<T, any>) {
  return useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot)
}
