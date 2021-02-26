export function contains(containers: Set<HTMLElement>, element: HTMLElement) {
  for (let container of containers) {
    if (container.contains(element)) return true
  }

  return false
}
