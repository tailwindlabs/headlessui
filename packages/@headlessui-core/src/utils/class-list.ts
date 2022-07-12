type ClassListFactory = string | string[] | (() => string | string[])

function normalize(classes: ClassListFactory): Set<string> {
  if (typeof classes === 'function') {
    return normalize(classes())
  }

  if (typeof classes === 'string') {
    return new Set(classes.split(/\s+/))
  }

  return new Set(classes.flatMap((c) => c.split(/\s+/)))
}

export function createClassList(classes: ClassListFactory) {
  let normalized = normalize(classes)

  return {
    add(...classes: string[]) {
      classes.forEach((className) => normalized.add(className))

      return normalized
    },

    remove(...classes: string[]) {
      classes.forEach((className) => normalized.delete(className))

      return normalized
    },

    update({ add, remove }: { add?: string[], remove?: string[] }) {
      remove?.forEach((className) => normalized.delete(className))
      add?.forEach((className) => normalized.add(className))

      return normalized
    },
  }
}
