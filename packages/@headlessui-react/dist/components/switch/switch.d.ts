import React, { ElementType } from 'react';
import { Props } from '../../types';
declare let DEFAULT_SWITCH_TAG: "button";
interface SwitchRenderPropArg {
    checked: boolean;
}
declare type SwitchPropsWeControl = 'id' | 'role' | 'tabIndex' | 'aria-checked' | 'aria-labelledby' | 'aria-describedby' | 'onClick' | 'onKeyUp' | 'onKeyPress';
export declare function Switch<TTag extends ElementType = typeof DEFAULT_SWITCH_TAG>(props: Props<TTag, SwitchRenderPropArg, SwitchPropsWeControl | 'checked' | 'onChange'> & {
    checked: boolean;
    onChange(checked: boolean): void;
}): React.ReactElement<any, string | ((props: any) => React.ReactElement<any, string | any | (new (props: any) => React.Component<any, any, any>)> | null) | (new (props: any) => React.Component<any, any, any>)> | null;
export declare namespace Switch {
    var Group: <TTag extends React.ElementType<any> = React.ExoticComponent<{
        children?: React.ReactNode;
    }>>(props: Props<TTag, any, "1D45E01E-AF44-47C4-988A-19A94EBAF55C">) => JSX.Element;
    var Label: typeof import("../label/label").Label;
    var Description: typeof import("../description/description").Description;
}
export {};
