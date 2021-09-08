import React, { ElementType } from 'react';
import { Props } from '../../types';
declare let DEFAULT_RADIO_GROUP_TAG: "div";
interface RadioGroupRenderPropArg {
}
declare type RadioGroupPropsWeControl = 'role' | 'aria-labelledby' | 'aria-describedby' | 'id';
export declare function RadioGroup<TTag extends ElementType = typeof DEFAULT_RADIO_GROUP_TAG, TType = string>(props: Props<TTag, RadioGroupRenderPropArg, RadioGroupPropsWeControl | 'value' | 'onChange' | 'disabled'> & {
    value: TType;
    onChange(value: TType): void;
    disabled?: boolean;
}): JSX.Element;
export declare namespace RadioGroup {
    var Option: <TTag extends React.ElementType<any> = "div", TType = unknown>(props: (Pick<import("../../types").PropsOf<TTag>, Exclude<keyof import("../../types").PropsOf<TTag>, "id" | "children" | "as" | "refName" | "className">> & {
        as?: TTag | undefined;
        children?: string | number | boolean | {} | React.ReactElement<any, string | ((props: any) => React.ReactElement<any, string | any | (new (props: any) => React.Component<any, any, any>)> | null) | (new (props: any) => React.Component<any, any, any>)> | React.ReactNodeArray | React.ReactPortal | ((bag: OptionRenderPropArg) => React.ReactElement<any, string | ((props: any) => React.ReactElement<any, string | any | (new (props: any) => React.Component<any, any, any>)> | null) | (new (props: any) => React.Component<any, any, any>)>) | null | undefined;
        refName?: string | undefined;
    } & (import("../../types").PropsOf<TTag> extends {
        className?: any;
    } ? {
        className?: string | ((bag: OptionRenderPropArg) => string) | undefined;
    } : {}) & {
        value: TType;
        disabled?: boolean | undefined;
    }) | (Pick<import("../../types").PropsOf<TTag>, Exclude<keyof import("../../types").PropsOf<TTag>, "value" | "children" | "as" | "refName" | "className">> & {
        as?: TTag | undefined;
        children?: string | number | boolean | {} | React.ReactElement<any, string | ((props: any) => React.ReactElement<any, string | any | (new (props: any) => React.Component<any, any, any>)> | null) | (new (props: any) => React.Component<any, any, any>)> | React.ReactNodeArray | React.ReactPortal | ((bag: OptionRenderPropArg) => React.ReactElement<any, string | ((props: any) => React.ReactElement<any, string | any | (new (props: any) => React.Component<any, any, any>)> | null) | (new (props: any) => React.Component<any, any, any>)>) | null | undefined;
        refName?: string | undefined;
    } & (import("../../types").PropsOf<TTag> extends {
        className?: any;
    } ? {
        className?: string | ((bag: OptionRenderPropArg) => string) | undefined;
    } : {}) & {
        value: TType;
        disabled?: boolean | undefined;
    }) | (Pick<import("../../types").PropsOf<TTag>, Exclude<keyof import("../../types").PropsOf<TTag>, "children" | "role" | "as" | "refName" | "className">> & {
        as?: TTag | undefined;
        children?: string | number | boolean | {} | React.ReactElement<any, string | ((props: any) => React.ReactElement<any, string | any | (new (props: any) => React.Component<any, any, any>)> | null) | (new (props: any) => React.Component<any, any, any>)> | React.ReactNodeArray | React.ReactPortal | ((bag: OptionRenderPropArg) => React.ReactElement<any, string | ((props: any) => React.ReactElement<any, string | any | (new (props: any) => React.Component<any, any, any>)> | null) | (new (props: any) => React.Component<any, any, any>)>) | null | undefined;
        refName?: string | undefined;
    } & (import("../../types").PropsOf<TTag> extends {
        className?: any;
    } ? {
        className?: string | ((bag: OptionRenderPropArg) => string) | undefined;
    } : {}) & {
        value: TType;
        disabled?: boolean | undefined;
    }) | (Pick<import("../../types").PropsOf<TTag>, Exclude<keyof import("../../types").PropsOf<TTag>, "children" | "as" | "refName" | "className" | "disabled">> & {
        as?: TTag | undefined;
        children?: string | number | boolean | {} | React.ReactElement<any, string | ((props: any) => React.ReactElement<any, string | any | (new (props: any) => React.Component<any, any, any>)> | null) | (new (props: any) => React.Component<any, any, any>)> | React.ReactNodeArray | React.ReactPortal | ((bag: OptionRenderPropArg) => React.ReactElement<any, string | ((props: any) => React.ReactElement<any, string | any | (new (props: any) => React.Component<any, any, any>)> | null) | (new (props: any) => React.Component<any, any, any>)>) | null | undefined;
        refName?: string | undefined;
    } & (import("../../types").PropsOf<TTag> extends {
        className?: any;
    } ? {
        className?: string | ((bag: OptionRenderPropArg) => string) | undefined;
    } : {}) & {
        value: TType;
        disabled?: boolean | undefined;
    }) | (Pick<import("../../types").PropsOf<TTag>, Exclude<keyof import("../../types").PropsOf<TTag>, "children" | "as" | "refName" | "className" | "aria-checked">> & {
        as?: TTag | undefined;
        children?: string | number | boolean | {} | React.ReactElement<any, string | ((props: any) => React.ReactElement<any, string | any | (new (props: any) => React.Component<any, any, any>)> | null) | (new (props: any) => React.Component<any, any, any>)> | React.ReactNodeArray | React.ReactPortal | ((bag: OptionRenderPropArg) => React.ReactElement<any, string | ((props: any) => React.ReactElement<any, string | any | (new (props: any) => React.Component<any, any, any>)> | null) | (new (props: any) => React.Component<any, any, any>)>) | null | undefined;
        refName?: string | undefined;
    } & (import("../../types").PropsOf<TTag> extends {
        className?: any;
    } ? {
        className?: string | ((bag: OptionRenderPropArg) => string) | undefined;
    } : {}) & {
        value: TType;
        disabled?: boolean | undefined;
    }) | (Pick<import("../../types").PropsOf<TTag>, Exclude<keyof import("../../types").PropsOf<TTag>, "children" | "as" | "refName" | "className" | "onBlur">> & {
        as?: TTag | undefined;
        children?: string | number | boolean | {} | React.ReactElement<any, string | ((props: any) => React.ReactElement<any, string | any | (new (props: any) => React.Component<any, any, any>)> | null) | (new (props: any) => React.Component<any, any, any>)> | React.ReactNodeArray | React.ReactPortal | ((bag: OptionRenderPropArg) => React.ReactElement<any, string | ((props: any) => React.ReactElement<any, string | any | (new (props: any) => React.Component<any, any, any>)> | null) | (new (props: any) => React.Component<any, any, any>)>) | null | undefined;
        refName?: string | undefined;
    } & (import("../../types").PropsOf<TTag> extends {
        className?: any;
    } ? {
        className?: string | ((bag: OptionRenderPropArg) => string) | undefined;
    } : {}) & {
        value: TType;
        disabled?: boolean | undefined;
    }) | (Pick<import("../../types").PropsOf<TTag>, Exclude<keyof import("../../types").PropsOf<TTag>, "children" | "as" | "refName" | "className" | "onClick">> & {
        as?: TTag | undefined;
        children?: string | number | boolean | {} | React.ReactElement<any, string | ((props: any) => React.ReactElement<any, string | any | (new (props: any) => React.Component<any, any, any>)> | null) | (new (props: any) => React.Component<any, any, any>)> | React.ReactNodeArray | React.ReactPortal | ((bag: OptionRenderPropArg) => React.ReactElement<any, string | ((props: any) => React.ReactElement<any, string | any | (new (props: any) => React.Component<any, any, any>)> | null) | (new (props: any) => React.Component<any, any, any>)>) | null | undefined;
        refName?: string | undefined;
    } & (import("../../types").PropsOf<TTag> extends {
        className?: any;
    } ? {
        className?: string | ((bag: OptionRenderPropArg) => string) | undefined;
    } : {}) & {
        value: TType;
        disabled?: boolean | undefined;
    }) | (Pick<import("../../types").PropsOf<TTag>, Exclude<keyof import("../../types").PropsOf<TTag>, "children" | "as" | "refName" | "className" | "onFocus">> & {
        as?: TTag | undefined;
        children?: string | number | boolean | {} | React.ReactElement<any, string | ((props: any) => React.ReactElement<any, string | any | (new (props: any) => React.Component<any, any, any>)> | null) | (new (props: any) => React.Component<any, any, any>)> | React.ReactNodeArray | React.ReactPortal | ((bag: OptionRenderPropArg) => React.ReactElement<any, string | ((props: any) => React.ReactElement<any, string | any | (new (props: any) => React.Component<any, any, any>)> | null) | (new (props: any) => React.Component<any, any, any>)>) | null | undefined;
        refName?: string | undefined;
    } & (import("../../types").PropsOf<TTag> extends {
        className?: any;
    } ? {
        className?: string | ((bag: OptionRenderPropArg) => string) | undefined;
    } : {}) & {
        value: TType;
        disabled?: boolean | undefined;
    }) | (Pick<import("../../types").PropsOf<TTag>, Exclude<keyof import("../../types").PropsOf<TTag>, "children" | "as" | "refName" | "className" | "ref">> & {
        as?: TTag | undefined;
        children?: string | number | boolean | {} | React.ReactElement<any, string | ((props: any) => React.ReactElement<any, string | any | (new (props: any) => React.Component<any, any, any>)> | null) | (new (props: any) => React.Component<any, any, any>)> | React.ReactNodeArray | React.ReactPortal | ((bag: OptionRenderPropArg) => React.ReactElement<any, string | ((props: any) => React.ReactElement<any, string | any | (new (props: any) => React.Component<any, any, any>)> | null) | (new (props: any) => React.Component<any, any, any>)>) | null | undefined;
        refName?: string | undefined;
    } & (import("../../types").PropsOf<TTag> extends {
        className?: any;
    } ? {
        className?: string | ((bag: OptionRenderPropArg) => string) | undefined;
    } : {}) & {
        value: TType;
        disabled?: boolean | undefined;
    }) | (Pick<import("../../types").PropsOf<TTag>, Exclude<keyof import("../../types").PropsOf<TTag>, "children" | "as" | "refName" | "className" | "tabIndex">> & {
        as?: TTag | undefined;
        children?: string | number | boolean | {} | React.ReactElement<any, string | ((props: any) => React.ReactElement<any, string | any | (new (props: any) => React.Component<any, any, any>)> | null) | (new (props: any) => React.Component<any, any, any>)> | React.ReactNodeArray | React.ReactPortal | ((bag: OptionRenderPropArg) => React.ReactElement<any, string | ((props: any) => React.ReactElement<any, string | any | (new (props: any) => React.Component<any, any, any>)> | null) | (new (props: any) => React.Component<any, any, any>)>) | null | undefined;
        refName?: string | undefined;
    } & (import("../../types").PropsOf<TTag> extends {
        className?: any;
    } ? {
        className?: string | ((bag: OptionRenderPropArg) => string) | undefined;
    } : {}) & {
        value: TType;
        disabled?: boolean | undefined;
    })) => JSX.Element;
    var Label: typeof import("../label/label").Label;
    var Description: typeof import("../description/description").Description;
}
interface OptionRenderPropArg {
    checked: boolean;
    active: boolean;
    disabled: boolean;
}
export {};
