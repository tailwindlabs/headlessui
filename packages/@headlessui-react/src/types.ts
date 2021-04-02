import { ReactNode, ReactElement } from 'react'

// A unique placeholder we can use as a default. This is nice because we can use this instead of
// defaulting to null / never / ... and possibly collide with actual data.
// Ideally we use a unique symbol here.
let __ = '1D45E01E-AF44-47C4-988A-19A94EBAF55C' as const
export type __ = typeof __

export type Expand<T> = T extends infer O ? { [K in keyof O]: O[K] } : never

export type PropsOf<TTag = any> = TTag extends React.ElementType
  ? React.ComponentProps<TTag>
  : never

export type Props<
  TTag,
  TSlot = any,
  TOmitableProps extends keyof any = __
> = (TOmitableProps extends __
  ? Omit<PropsOf<TTag>, 'as' | 'children' | 'refName'>
  : Omit<PropsOf<TTag>, TOmitableProps | 'as' | 'children' | 'refName'>) & {
  as?: TTag
  children?: ReactNode | ((bag: TSlot) => ReactElement)
  refName?: string
}

type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never }
export type XOR<T, U> = T | U extends __
  ? never
  : T extends __
  ? U
  : U extends __
  ? T
  : T | U extends object
  ? (Without<T, U> & U) | (Without<U, T> & T)
  : T | U
