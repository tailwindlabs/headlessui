import type { JSXElementConstructor, ReactElement, ReactNode } from 'react'

export type ReactTag = keyof JSX.IntrinsicElements | JSXElementConstructor<any>

// A unique placeholder we can use as a default. This is nice because we can use this instead of
// defaulting to null / never / ... and possibly collide with actual data.
// Ideally we use a unique symbol here.
let __ = '1D45E01E-AF44-47C4-988A-19A94EBAF55C' as const
export type __ = typeof __

export type Expand<T> = T extends infer O ? { [K in keyof O]: O[K] } : never

export type PropsOf<TTag extends ReactTag> = TTag extends React.ElementType
  ? Omit<React.ComponentProps<TTag>, 'ref'>
  : never

type PropsWeControl = 'as' | 'children' | 'refName' | 'className'

// Resolve the props of the component, but ensure to omit certain props that we control
type CleanProps<TTag extends ReactTag, TOmittableProps extends PropertyKey = never> = Omit<
  PropsOf<TTag>,
  TOmittableProps | PropsWeControl
>

// Add certain props that we control
type OurProps<TTag extends ReactTag, TSlot> = {
  as?: TTag
  children?: ReactNode | ((bag: TSlot) => ReactElement)
  refName?: string
}

type HasProperty<T extends object, K extends PropertyKey> = T extends never
  ? never
  : K extends keyof T
    ? true
    : never

// Conditionally override the `className`, to also allow for a function
// if and only if the PropsOf<TTag> already defines `className`.
// This will allow us to have a TS error on as={Fragment}
type ClassNameOverride<TTag extends ReactTag, TSlot = {}> =
  // Order is important here, because `never extends true` is `true`...
  true extends HasProperty<PropsOf<TTag>, 'className'>
    ? { className?: PropsOf<TTag>['className'] | ((bag: TSlot) => string) }
    : {}

// Provide clean TypeScript props, which exposes some of our custom API's.
export type Props<
  TTag extends ReactTag,
  TSlot = {},
  TOmittableProps extends PropertyKey = never,
  Overrides = {},
> = CleanProps<TTag, TOmittableProps | keyof Overrides> &
  OurProps<TTag, TSlot> &
  ClassNameOverride<TTag, TSlot> &
  Overrides

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

export type EnsureArray<T> = T extends any[] ? T : Expand<T>[]
