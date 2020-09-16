import { disposables } from '../utils/disposables'

export function reportChanges<TType>(key: () => TType, onChange: (value: TType) => void) {
  const d = disposables()

  let previous: TType

  function track() {
    const next = key()
    if (previous !== next) {
      previous = next
      onChange(next)
    }
    d.requestAnimationFrame(track)
  }

  track()

  return d.dispose
}
