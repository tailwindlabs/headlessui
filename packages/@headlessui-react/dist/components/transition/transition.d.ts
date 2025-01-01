import React, { type ElementType, type MutableRefObject, type Ref } from 'react';
import type { Props, ReactTag } from '../../types.js';
import { RenderFeatures, type HasDisplayName, type PropsForFeatures, type RefProp } from '../../utils/render.js';
export interface TransitionClasses {
    enter?: string;
    enterFrom?: string;
    enterTo?: string;
    /**
     * @deprecated The `enterTo` and `leaveTo` classes stay applied after the transition has finished.
     */
    entered?: string;
    leave?: string;
    leaveFrom?: string;
    leaveTo?: string;
}
export interface TransitionEvents {
    beforeEnter?: () => void;
    afterEnter?: () => void;
    beforeLeave?: () => void;
    afterLeave?: () => void;
}
type TransitionChildPropsWeControl = never;
export type TransitionChildProps<TTag extends ReactTag> = Props<TTag, TransitionChildRenderPropArg, TransitionChildPropsWeControl, PropsForFeatures<typeof TransitionChildRenderFeatures> & TransitionClasses & TransitionEvents & {
    transition?: boolean;
    appear?: boolean;
}>;
declare let DEFAULT_TRANSITION_CHILD_TAG: React.ExoticComponent<{
    children?: React.ReactNode | undefined;
}>;
type TransitionChildRenderPropArg = MutableRefObject<HTMLElement>;
declare let TransitionChildRenderFeatures: RenderFeatures;
declare function TransitionChildFn<TTag extends ElementType = typeof DEFAULT_TRANSITION_CHILD_TAG>(props: TransitionChildProps<TTag>, ref: Ref<HTMLElement>): React.JSX.Element;
export type TransitionRootProps<TTag extends ElementType = typeof DEFAULT_TRANSITION_CHILD_TAG> = TransitionChildProps<TTag> & {
    show?: boolean;
    appear?: boolean;
};
declare function TransitionRootFn<TTag extends ElementType = typeof DEFAULT_TRANSITION_CHILD_TAG>(props: TransitionRootProps<TTag>, ref: Ref<HTMLElement>): React.JSX.Element;
export interface _internal_ComponentTransitionRoot extends HasDisplayName {
    <TTag extends ElementType = typeof DEFAULT_TRANSITION_CHILD_TAG>(props: TransitionRootProps<TTag> & RefProp<typeof TransitionRootFn>): React.JSX.Element;
}
export interface _internal_ComponentTransitionChild extends HasDisplayName {
    <TTag extends ElementType = typeof DEFAULT_TRANSITION_CHILD_TAG>(props: TransitionChildProps<TTag> & RefProp<typeof TransitionChildFn>): React.JSX.Element;
}
export declare let TransitionChild: _internal_ComponentTransitionChild;
export declare let Transition: _internal_ComponentTransitionRoot & {
    /** @deprecated use `<TransitionChild>` instead of `<Transition.Child>` */
    Child: _internal_ComponentTransitionChild;
    /** @deprecated use `<Transition>` instead of `<Transition.Root>` */
    Root: _internal_ComponentTransitionRoot;
};
export {};
