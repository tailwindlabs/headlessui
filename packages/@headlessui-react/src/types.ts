import { ReactNode, ReactElement, JSXElementConstructor } from 'react'

export type ReactTag = keyof JSX.IntrinsicElements | JSXElementConstructor<any>

// A unique placeholder we can use as a default. This is nice because we can use this instead of
// defaulting to null / never / ... and possibly collide with actual data.
// Ideally we use a unique symbol here.
let __ = '1D45E01E-AF44-47C4-988A-19A94EBAF55C' as const
export type __ = typeof __

export type Expand<T> = T extends infer O ? { [K in keyof O]: O[K] } : never

export type PropsOf<TTag extends ReactTag> = TTag extends React.ElementType
  ? React.ComponentProps<TTag>
  : never

type PropsWeControl = 'as' | 'children' | 'refName' | 'className'

// Resolve the props of the component, but ensure to omit certain props that we control
type CleanProps<
  TTag extends ReactTag,
  TOmitableProps extends PropertyKey = __
> = TOmitableProps extends __
  ? Omit<PropsOf<TTag>, PropsWeControl>
  : Omit<PropsOf<TTag>, TOmitableProps | PropsWeControl>

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
  TOmitableProps extends PropertyKey = __
> = CleanProps<TTag, TOmitableProps> & OurProps<TTag, TSlot> & ClassNameOverride<TTag, TSlot>

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

export type ByComparator<T> = (keyof T & string) | ((a: T, b: T) => boolean)
export type EnsureArray<T> = T extends any[] ? T : Expand<T>[]
export type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (
  k: infer I
) => void
  ? I
  : never

// If this is a simple type UnionToIntersection<Key> will be the same type, otherwise it will an intersection
// of all types in the union and will not extend `Key` when at least two types are "different"
export type IsUnion<TType> = [TType] extends [UnionToIntersection<TType>] ? true : false

// Determines if two types are exact matches
// This means:
// 1. boolean === true | false
// 2. boolean !== true
// 3. boolean !== false
// 4. boolean !== true | false | 'lol'
export type IsExactType<TypeOne, TypeTwo> =
  UnionToIntersection<TypeOne> extends UnionToIntersection<TypeTwo> ? true : false

/**
 * Extract from T those types that are assignable to U
 * Only when types are _exact_ matches, not when they are assignable
 */
type ExtractExact1<T extends object, U extends object> = T extends U
  ? {
      [K in keyof T]: K extends keyof U
        ? IsExactType<T[K], U[K]> extends true
          ? T[K]
          : never
        : T[K]
    }
  : never

/**
 * Gets all keys that are never in an object
 */
type GetNeverKeys<O extends object> = {
  [K in keyof O]-?: IsExactType<never, O[K]> extends true ? K : never
}[keyof O]

/**
 * Eliminate all union possibilities containing a never
 */
type ExcludeUnionsWithNeverKeys<T extends object> = IsExactType<never, GetNeverKeys<T>> extends true
  ? T
  : Exclude<T, Record<GetNeverKeys<T>, never>>

export type ExtractExact<T extends object, U extends object> = ExcludeUnionsWithNeverKeys<
  ExtractExact1<T, U>
>

type Union =
  | { a: true; b: '1' }
  | { a: false; b: '2' }
  | { a: boolean; b: '3' }
  | { a: boolean; b: '4' }
  | { a: undefined; b: '5' }

type _1 = ExtractExact<Union, { a: true }> // { a: true; b: '1' }
type _2 = ExtractExact<Union, { a: false }> // { a: false; b: '2' }
type _3 = ExtractExact<Union, { a: boolean }> // { a: boolean; b: '3' } | { a: boolean; b: '4' }
type _4 = ExtractExact<Union, { a: undefined }> // { a: undefined; b: '5' }

let a: _1
let b: _2
let c: _3
let d: _4
