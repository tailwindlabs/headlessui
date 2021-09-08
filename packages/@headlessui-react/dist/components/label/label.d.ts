import React, { ElementType, ReactNode } from 'react';
import { Props } from '../../types';
interface SharedData {
    slot?: {};
    name?: string;
    props?: {};
}
interface LabelProviderProps extends SharedData {
    children: ReactNode;
}
export declare function useLabels(): [string | undefined, (props: LabelProviderProps) => JSX.Element];
declare let DEFAULT_LABEL_TAG: "label";
interface LabelRenderPropArg {
}
declare type LabelPropsWeControl = 'id';
export declare function Label<TTag extends ElementType = typeof DEFAULT_LABEL_TAG>(props: Props<TTag, LabelRenderPropArg, LabelPropsWeControl> & {
    passive?: boolean;
}): React.ReactElement<any, string | ((props: any) => React.ReactElement<any, string | any | (new (props: any) => React.Component<any, any, any>)> | null) | (new (props: any) => React.Component<any, any, any>)> | null;
export {};
