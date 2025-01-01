import React, { type ElementType, type ReactNode, type Ref } from 'react';
import type { Props } from '../../types.js';
import { type HasDisplayName, type RefProp } from '../../utils/render.js';
interface SharedData {
    slot?: {};
    name?: string;
    props?: {};
}
export declare function useDescribedBy(): string | undefined;
interface DescriptionProviderProps extends SharedData {
    children: ReactNode;
    value?: string | undefined;
}
export declare function useDescriptions(): [
    string | undefined,
    (props: DescriptionProviderProps) => React.JSX.Element
];
declare let DEFAULT_DESCRIPTION_TAG: "p";
export type DescriptionProps<TTag extends ElementType = typeof DEFAULT_DESCRIPTION_TAG> = Props<TTag>;
declare function DescriptionFn<TTag extends ElementType = typeof DEFAULT_DESCRIPTION_TAG>(props: DescriptionProps<TTag>, ref: Ref<HTMLElement>): React.ReactElement<any, string | React.JSXElementConstructor<any>> | null;
export interface _internal_ComponentDescription extends HasDisplayName {
    <TTag extends ElementType = typeof DEFAULT_DESCRIPTION_TAG>(props: DescriptionProps<TTag> & RefProp<typeof DescriptionFn>): React.JSX.Element;
}
export declare let Description: _internal_ComponentDescription;
export {};
