import { Keys } from '../components/keyboard'
import { useEventListener } from './use-event-listener'
import { Position, useHierarchy } from './use-hierarchy'

export function useEscape(
  enabled: boolean,
  view = typeof document !== 'undefined' ? document.defaultView : null,
  cb: (event: KeyboardEvent) => void
) {
  let position = useHierarchy(enabled, 'escape')

  useEventListener(view, 'keydown', (event) => {
    if ((position & Position.Leaf) !== Position.Leaf) return
    if (event.defaultPrevented) return
    if (event.key !== Keys.Escape) return

    cb(event)
  })
}
