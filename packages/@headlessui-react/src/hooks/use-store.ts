import { useSyncExternalStore } from '../use-sync-external-store-shim/index'
import type { Store } from '../utils/store'

export function useStore<T>(store: Store<T, any>) {
  return useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot)
}
