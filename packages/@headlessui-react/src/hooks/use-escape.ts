import { Keys } from '../components/keyboard'
import { useEventListener } from './use-event-listener'
import { useIsTopLayer } from './use-is-top-layer'

export function useEscape(
  enabled: boolean,
  view = typeof document !== 'undefined' ? document.defaultView : null,
  cb: (event: KeyboardEvent) => void
) {
  let isTopLayer = useIsTopLayer(enabled, 'escape')

  useEventListener(view, 'keydown', (event) => {
    if (!isTopLayer) return
    if (event.defaultPrevented) return
    if (event.key !== Keys.Escape) return

    cb(event)
  })
}
