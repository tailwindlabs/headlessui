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
    resolveId(item: TItem, index: number, items: TItem[]): string
    resolveDisabled(item: TItem, index: number, items: TItem[]): boolean
  }
) {
  let items = resolvers.resolveItems()
  if (items.length <= 0) return null

  let currentActiveIndex = resolvers.resolveActiveIndex()
  let activeIndex = currentActiveIndex ?? -1

  switch (action.focus) {
    case Focus.First: {
      for (let i = 0; i < items.length; ++i) {
        if (!resolvers.resolveDisabled(items[i], i, items)) {
          return i
        }
      }
      return currentActiveIndex
    }

    case Focus.Previous: {
      for (let i = activeIndex - 1; i >= 0; --i) {
        if (!resolvers.resolveDisabled(items[i], i, items)) {
          return i
        }
      }
      return currentActiveIndex
    }

    case Focus.Next: {
      for (let i = activeIndex + 1; i < items.length; ++i) {
        if (!resolvers.resolveDisabled(items[i], i, items)) {
          return i
        }
      }
      return currentActiveIndex
    }

    case Focus.Last: {
      for (let i = items.length - 1; i >= 0; --i) {
        if (!resolvers.resolveDisabled(items[i], i, items)) {
          return i
        }
      }
      return currentActiveIndex
    }

    case Focus.Specific: {
      for (let i = 0; i < items.length; ++i) {
        if (resolvers.resolveId(items[i], i, items) === action.id) {
          return i
        }
      }
      return currentActiveIndex
    }

    case Focus.Nothing:
      return null

    default:
      assertNever(action)
  }
}
