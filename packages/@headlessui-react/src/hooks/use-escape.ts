import { Keys } from '../components/keyboard'
import { useEventListener } from './use-event-listener'

export function useEscape(
  enabled: boolean,
  cb: (event: KeyboardEvent) => void,
  element = document.defaultView
) {
  useEventListener(element, 'keydown', (event) => {
    if (!enabled) return
    if (event.defaultPrevented) return
    if (event.key !== Keys.Escape) return

    cb(event)
  })
}
