import { useStore } from '../../hooks/use-store'
import { overflows } from './overflow-store'
import { computed, onMounted, onUnmounted, Ref, watch } from 'vue'

export function useDocumentOverflowLockedEffect(
  doc: Ref<Document | null>,
  shouldBeLocked: Ref<boolean>,
  meta: (meta?: Record<string, any>) => Record<string, any>
) {
  let store = useStore(overflows)
  let locked = computed(() => {
    let entry = doc.value ? store.value.get(doc.value) : undefined
    return entry ? entry.count > 0 : false
  })

  watch(
    [doc, shouldBeLocked],
    ([doc, shouldBeLocked], [oldDoc], onInvalidate) => {
      if (!doc || !shouldBeLocked) {
        return
      }

      // Prevent the document from scrolling
      overflows.dispatch('PUSH', doc, meta)

      // Allow document to scroll
      let didRunCleanup = false
      onInvalidate(() => {
        if (didRunCleanup) return
        overflows.dispatch('POP', oldDoc ?? doc)

        // This shouldn't be necessary, but it is.
        // Seems like a Vue bug.
        didRunCleanup = true
      })
    },
    {
      immediate: true,
    }
  )

  return locked
}
