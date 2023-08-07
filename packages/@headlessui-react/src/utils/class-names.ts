export function classNames(...classes: (false | null | undefined | string)[]): string {
  return Array.from(
    new Set(
      classes.flatMap((value) => {
        if (typeof value === 'string') {
          return value.split(' ')
        }

        return []
      })
    )
  )
    .filter(Boolean)
    .join(' ')
}
