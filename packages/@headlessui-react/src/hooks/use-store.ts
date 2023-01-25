import { useSyncExternalStore } from '../use-sync-external-store-shim'
import { Store } from '../utils/store'

export function useStore<T>(store: Store<T>) {
  return useSyncExternalStore(store.subscribe, store.getSnapshot)
}
