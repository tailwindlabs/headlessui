import type { ElementType, Ref } from 'react';
import type { Props } from '../types.js';
import { type HasDisplayName, type RefProp } from '../utils/render.js';
declare let DEFAULT_VISUALLY_HIDDEN_TAG: "span";
export declare enum HiddenFeatures {
    None = 1,
    Focusable = 2,
    Hidden = 4
}
type HiddenRenderPropArg = {};
type HiddenPropsWeControl = never;
export type HiddenProps<TTag extends ElementType = typeof DEFAULT_VISUALLY_HIDDEN_TAG> = Props<TTag, HiddenRenderPropArg, HiddenPropsWeControl, {
    features?: HiddenFeatures;
}>;
declare function VisuallyHidden<TTag extends ElementType = typeof DEFAULT_VISUALLY_HIDDEN_TAG>(props: HiddenProps<TTag>, ref: Ref<HTMLElement>): import("react").ReactElement<any, string | import("react").JSXElementConstructor<any>> | null;
interface ComponentHidden extends HasDisplayName {
    <TTag extends ElementType = typeof DEFAULT_VISUALLY_HIDDEN_TAG>(props: HiddenProps<TTag> & RefProp<typeof VisuallyHidden>): React.JSX.Element;
}
export declare let Hidden: ComponentHidden;
export {};
