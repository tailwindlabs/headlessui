import type { JSXElementConstructor, ReactElement, ReactNode } from 'react';
export type ReactTag = keyof React.JSX.IntrinsicElements | JSXElementConstructor<any>;
export type Expand<T> = T extends infer O ? {
    [K in keyof O]: O[K];
} : never;
export type PropsOf<TTag extends ReactTag> = TTag extends React.ElementType ? Omit<React.ComponentProps<TTag>, 'ref'> : never;
type PropsWeControl = 'as' | 'children' | 'refName' | 'className';
type CleanProps<TTag extends ReactTag, TOmittableProps extends PropertyKey = never> = Omit<PropsOf<TTag>, TOmittableProps | PropsWeControl>;
type OurProps<TTag extends ReactTag, TSlot> = {
    as?: TTag;
    children?: ReactNode | ((bag: TSlot) => ReactElement);
    refName?: string;
};
type HasProperty<T extends object, K extends PropertyKey> = T extends never ? never : K extends keyof T ? true : never;
type ClassNameOverride<TTag extends ReactTag, TSlot = {}> = true extends HasProperty<PropsOf<TTag>, 'className'> ? {
    className?: PropsOf<TTag>['className'] | ((bag: TSlot) => string);
} : {};
export type Props<TTag extends ReactTag, TSlot = {}, TOmittableProps extends PropertyKey = never, Overrides = {}> = CleanProps<TTag, TOmittableProps | keyof Overrides> & OurProps<TTag, TSlot> & ClassNameOverride<TTag, TSlot> & Overrides;
export type EnsureArray<T> = T extends any[] ? T : Expand<T>[];
export {};
