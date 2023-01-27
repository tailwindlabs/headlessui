import { useSyncExternalStore } from '../use-sync-external-store-shim/index'
import { Store } from '../utils/store'

export function useStore<T>(store: Store<T>) {
  return useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot)
}
