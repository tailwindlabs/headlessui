import { ElementType, MutableRefObject } from 'react';
import { Props } from '../../types';
declare let DEFAULT_FOCUS_TRAP_TAG: "div";
export declare function FocusTrap<TTag extends ElementType = typeof DEFAULT_FOCUS_TRAP_TAG>(props: Props<TTag> & {
    initialFocus?: MutableRefObject<HTMLElement | null>;
}): import("react").ReactElement<any, string | ((props: any) => import("react").ReactElement<any, string | any | (new (props: any) => import("react").Component<any, any, any>)> | null) | (new (props: any) => import("react").Component<any, any, any>)> | null;
export {};
