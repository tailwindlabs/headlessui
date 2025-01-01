import React, { type ElementType, type ReactNode, type Ref } from 'react';
import type { Props } from '../../types.js';
import { type HasDisplayName, type RefProp } from '../../utils/render.js';
interface SharedData {
    slot?: {};
    name?: string;
    props?: Record<string, any>;
}
export declare function useLabelContext(): {
    value: string | undefined;
    register(value: string): () => void;
} & SharedData;
export declare function useLabelledBy(alwaysAvailableIds?: (string | undefined | null)[]): string | undefined;
interface LabelProviderProps extends SharedData {
    children: ReactNode;
    value?: string | undefined;
}
export declare function useLabels({ inherit }?: {
    inherit?: boolean | undefined;
}): [
    string | undefined,
    (props: LabelProviderProps & {
        inherit?: boolean;
    }) => React.JSX.Element
];
declare let DEFAULT_LABEL_TAG: "label";
export type LabelProps<TTag extends ElementType = typeof DEFAULT_LABEL_TAG> = Props<TTag> & {
    passive?: boolean;
    htmlFor?: string;
};
declare function LabelFn<TTag extends ElementType = typeof DEFAULT_LABEL_TAG>(props: LabelProps<TTag>, ref: Ref<HTMLLabelElement>): React.ReactElement<any, string | React.JSXElementConstructor<any>> | null;
export interface _internal_ComponentLabel extends HasDisplayName {
    <TTag extends ElementType = typeof DEFAULT_LABEL_TAG>(props: LabelProps<TTag> & RefProp<typeof LabelFn>): React.JSX.Element;
}
export declare let Label: _internal_ComponentLabel;
export {};
