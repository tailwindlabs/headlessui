import React, { type ElementType, type MutableRefObject, type Ref } from 'react';
import type { Props } from '../../types.js';
import { type HasDisplayName, type RefProp } from '../../utils/render.js';
type Containers = (() => Iterable<HTMLElement>) | MutableRefObject<Set<MutableRefObject<HTMLElement | null>>>;
declare let DEFAULT_FOCUS_TRAP_TAG: "div";
export declare enum FocusTrapFeatures {
    /** No features enabled for the focus trap. */
    None = 0,
    /** Ensure that we move focus initially into the container. */
    InitialFocus = 1,
    /** Ensure that pressing `Tab` and `Shift+Tab` is trapped within the container. */
    TabLock = 2,
    /** Ensure that programmatically moving focus outside of the container is disallowed. */
    FocusLock = 4,
    /** Ensure that we restore the focus when unmounting the focus trap. */
    RestoreFocus = 8,
    /** Initial focus should look for the `data-autofocus` */
    AutoFocus = 16
}
type FocusTrapRenderPropArg = {};
type FocusTrapPropsWeControl = never;
export type FocusTrapProps<TTag extends ElementType = typeof DEFAULT_FOCUS_TRAP_TAG> = Props<TTag, FocusTrapRenderPropArg, FocusTrapPropsWeControl, {
    initialFocus?: MutableRefObject<HTMLElement | null>;
    initialFocusFallback?: MutableRefObject<HTMLElement | null>;
    features?: FocusTrapFeatures;
    containers?: Containers;
}>;
declare function FocusTrapFn<TTag extends ElementType = typeof DEFAULT_FOCUS_TRAP_TAG>(props: FocusTrapProps<TTag>, ref: Ref<HTMLElement>): React.JSX.Element;
export interface _internal_ComponentFocusTrap extends HasDisplayName {
    <TTag extends ElementType = typeof DEFAULT_FOCUS_TRAP_TAG>(props: FocusTrapProps<TTag> & RefProp<typeof FocusTrapFn>): React.JSX.Element;
}
export declare let FocusTrap: _internal_ComponentFocusTrap & {
    /** @deprecated use `FocusTrapFeatures` instead of `FocusTrap.features` */
    features: typeof FocusTrapFeatures;
};
export {};
