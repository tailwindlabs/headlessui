import { disposables } from '../utils/disposables'

export function reportChanges<TType>(key: () => TType, onChange: (value: TType) => void) {
  let d = disposables()

  let previous: TType

  function track() {
    let next = key()
    if (previous !== next) {
      previous = next
      onChange(next)
    }
    d.requestAnimationFrame(track)
  }

  track()

  return d.dispose
}
