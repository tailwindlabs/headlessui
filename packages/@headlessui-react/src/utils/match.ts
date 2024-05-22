import { assert } from './assert'

export function match<TValue extends string | number = string, TReturnValue = unknown>(
  value: TValue,
  lookup: Record<TValue, TReturnValue | ((...args: any[]) => TReturnValue)>,
  ...args: any[]
): TReturnValue {
  assert(
    value in lookup,
    () =>
      `Tried to handle "${value}" but there is no handler defined. Only defined handlers are: ${Object.keys(
        lookup
      )
        .map((key) => `"${key}"`)
        .join(', ')}.`,
    match
  )

  let returnValue = lookup[value]
  return typeof returnValue === 'function' ? returnValue(...args) : returnValue
}
