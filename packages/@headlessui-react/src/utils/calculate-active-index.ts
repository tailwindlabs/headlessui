function assertNever(x: never): never {
  throw new Error('Unexpected object: ' + x)
}

export enum Focus {
  /** Focus the first non-disabled item. */
  First,

  /** Focus the previous non-disabled item. */
  Previous,

  /** Focus the next non-disabled item. */
  Next,

  /** Focus the last non-disabled item. */
  Last,

  /** Focus a specific item based on the `id` of the item. */
  Specific,

  /** Focus no items at all. */
  Nothing,
}

export function calculateActiveIndex<TItem>(
  action: { focus: Focus.Specific; id: string } | { focus: Exclude<Focus, Focus.Specific> },
  resolvers: {
    resolveItems(): TItem[]
    resolveActiveIndex(): number | null
    resolveId(item: TItem): string
    resolveDisabled(item: TItem): boolean
  }
) {
  const items = resolvers.resolveItems()
  if (items.length <= 0) return null

  const currentActiveIndex = resolvers.resolveActiveIndex()
  const activeIndex = currentActiveIndex ?? -1

  const nextActiveIndex = (() => {
    switch (action.focus) {
      case Focus.First:
        return items.findIndex(item => !resolvers.resolveDisabled(item))

      case Focus.Previous: {
        let idx = activeIndex
        do {
          idx = idx - 1
          if (idx < 0) idx = items.length - 1
        } while (idx !== activeIndex && resolvers.resolveDisabled(items[idx]))
        return idx
      }

      case Focus.Next: {
        let idx = activeIndex
        do {
          idx = (idx + 1) % items.length
        } while (idx !== activeIndex && resolvers.resolveDisabled(items[idx]))
        return idx
      }

      case Focus.Last: {
        const idx = items
          .slice()
          .reverse()
          .findIndex(item => !resolvers.resolveDisabled(item))
        if (idx === -1) return idx
        return items.length - 1 - idx
      }

      case Focus.Specific:
        return items.findIndex(item => resolvers.resolveId(item) === action.id)

      case Focus.Nothing:
        return null

      default:
        assertNever(action)
    }
  })()

  return nextActiveIndex === -1 ? currentActiveIndex : nextActiveIndex
}
