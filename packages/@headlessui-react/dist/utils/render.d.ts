import React, { type ElementType, type Ref } from 'react';
import type { Expand, Props } from '../types.js';
export declare enum RenderFeatures {
    /** No features at all */
    None = 0,
    /**
     * When used, this will allow us to use one of the render strategies.
     *
     * **The render strategies are:**
     *    - **Unmount**   _(Will unmount the component.)_
     *    - **Hidden**    _(Will hide the component using the [hidden] attribute.)_
     */
    RenderStrategy = 1,
    /**
     * When used, this will allow the user of our component to be in control. This can be used when
     * you want to transition based on some state.
     */
    Static = 2
}
export declare enum RenderStrategy {
    Unmount = 0,
    Hidden = 1
}
type UnionToIntersection<T> = (T extends any ? (x: T) => any : never) extends (x: infer R) => any ? R : never;
type PropsForFeature<TPassedInFeatures extends RenderFeatures, TForFeature extends RenderFeatures, TProps> = TPassedInFeatures extends TForFeature ? TProps : {};
export type PropsForFeatures<T extends RenderFeatures> = Expand<UnionToIntersection<PropsForFeature<T, RenderFeatures.Static, {
    static?: boolean;
}> | PropsForFeature<T, RenderFeatures.RenderStrategy, {
    unmount?: boolean;
}>>>;
export declare function useRender(): typeof render;
declare function render<TFeature extends RenderFeatures, TTag extends ElementType, TSlot>({ ourProps, theirProps, slot, defaultTag, features, visible, name, mergeRefs, }: {
    ourProps: Expand<Props<TTag, TSlot, any> & PropsForFeatures<TFeature>> & {
        ref?: Ref<HTMLElement | ElementType>;
    };
    theirProps: Expand<Props<TTag, TSlot, any>>;
    slot?: TSlot;
    defaultTag: ElementType;
    features?: TFeature;
    visible?: boolean;
    name: string;
    mergeRefs?: ReturnType<typeof useMergeRefsFn>;
}): ReturnType<typeof _render> | null;
declare function _render<TTag extends ElementType, TSlot>(props: Props<TTag, TSlot> & {
    ref?: unknown;
}, slot: TSlot | undefined, tag: ElementType, name: string, mergeRefs: ReturnType<typeof useMergeRefsFn>): React.ReactElement<any, string | React.JSXElementConstructor<any>>;
/**
 * This is a singleton hook. **You can ONLY call the returned
 * function *once* to produce expected results.** If you need
 * to call `mergeRefs()` multiple times you need to create a
 * separate function for each invocation. This happens as we
 * store the list of `refs` to update and always return the
 * same function that refers to that list of refs.
 *
 * You shouldn't normally read refs during render but this
 * should actually be okay because React itself is calling
 * the `function` that updates these refs and can only do
 * so once the ref that contains the list is updated.
 */
declare function useMergeRefsFn(): (...refs: any[]) => ((value: any) => void) | undefined;
export type HasDisplayName = {
    displayName: string;
};
export type RefProp<T extends Function> = T extends (props: any, ref: Ref<infer RefType>) => any ? {
    ref?: Ref<RefType>;
} : never;
export declare function mergeProps<T extends Props<any, any>[]>(...listOfProps: T): Props<any, any>;
/**
 * This is a hack, but basically we want to keep the full 'API' of the component, but we do want to
 * wrap it in a forwardRef so that we _can_ passthrough the ref
 */
export declare function forwardRefWithAs<T extends {
    name: string;
    displayName?: string;
}>(component: T): T & {
    displayName: string;
};
export declare function compact<T extends Record<any, any>>(object: T): {} & T;
export {};
