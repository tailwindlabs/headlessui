import * as React from 'react'

import { disposables } from '../utils/disposables'

export function useDisposables() {
  // Using useState instead of useRef so that we can use the initializer function.
  const [d] = React.useState(disposables)
  React.useEffect(() => () => d.dispose(), [d])
  return d
}
