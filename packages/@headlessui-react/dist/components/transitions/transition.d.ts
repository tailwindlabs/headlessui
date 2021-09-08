import React, { ElementType, MutableRefObject } from 'react';
import { Props } from '../../types';
import { Features, PropsForFeatures } from '../../utils/render';
export interface TransitionClasses {
    enter?: string;
    enterFrom?: string;
    enterTo?: string;
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
declare type TransitionChildProps<TTag> = Props<TTag, TransitionChildRenderPropArg> & PropsForFeatures<typeof TransitionChildRenderFeatures> & TransitionClasses & TransitionEvents & {
    appear?: boolean;
};
declare let DEFAULT_TRANSITION_CHILD_TAG: "div";
declare type TransitionChildRenderPropArg = MutableRefObject<HTMLDivElement>;
declare let TransitionChildRenderFeatures: Features;
export declare function Transition<TTag extends ElementType = typeof DEFAULT_TRANSITION_CHILD_TAG>(props: TransitionChildProps<TTag> & {
    show?: boolean;
    appear?: boolean;
}): JSX.Element;
export declare namespace Transition {
    var Child: <TTag extends React.ElementType<any> = "div">(props: TransitionChildProps<TTag>) => JSX.Element;
    var Root: typeof Transition;
}
export {};
