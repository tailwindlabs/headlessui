export function onDocumentReady(cb?: () => void) {
  let check = () => {
    if (document.readyState === 'loading') return
    cb?.()
    document.removeEventListener('DOMContentLoaded', check)
  }

  if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', check)
    check()
  }
}
