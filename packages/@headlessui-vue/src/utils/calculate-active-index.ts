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
  let items = resolvers.resolveItems()
  if (items.length <= 0) return null

  let currentActiveIndex = resolvers.resolveActiveIndex()
  let activeIndex = currentActiveIndex ?? -1

  let nextActiveIndex = (() => {
    switch (action.focus) {
      case Focus.First:
        return items.findIndex((item) => !resolvers.resolveDisabled(item))

      case Focus.Previous: {
        let idx = items
          .slice()
          .reverse()
          .findIndex((item, idx, all) => {
            if (activeIndex !== -1 && all.length - idx - 1 >= activeIndex) return false
            return !resolvers.resolveDisabled(item)
          })
        if (idx === -1) return idx
        return items.length - 1 - idx
      }

      case Focus.Next:
        return items.findIndex((item, idx) => {
          if (idx <= activeIndex) return false
          return !resolvers.resolveDisabled(item)
        })

      case Focus.Last: {
        let idx = items
          .slice()
          .reverse()
          .findIndex((item) => !resolvers.resolveDisabled(item))
        if (idx === -1) return idx
        return items.length - 1 - idx
      }

      case Focus.Specific:
        return items.findIndex((item) => resolvers.resolveId(item) === action.id)

      case Focus.Nothing:
        return null

      default:
        assertNever(action)
    }
  })()

  return nextActiveIndex === -1 ? currentActiveIndex : nextActiveIndex
}
