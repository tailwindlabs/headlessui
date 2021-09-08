import React, { ElementType, ReactNode } from 'react';
import { Props } from '../../types';
interface SharedData {
    slot?: {};
    name?: string;
    props?: {};
}
interface DescriptionProviderProps extends SharedData {
    children: ReactNode;
}
export declare function useDescriptions(): [string | undefined, (props: DescriptionProviderProps) => JSX.Element];
declare let DEFAULT_DESCRIPTION_TAG: "p";
interface DescriptionRenderPropArg {
}
declare type DescriptionPropsWeControl = 'id';
export declare function Description<TTag extends ElementType = typeof DEFAULT_DESCRIPTION_TAG>(props: Props<TTag, DescriptionRenderPropArg, DescriptionPropsWeControl>): React.ReactElement<any, string | ((props: any) => React.ReactElement<any, string | any | (new (props: any) => React.Component<any, any, any>)> | null) | (new (props: any) => React.Component<any, any, any>)> | null;
export {};
