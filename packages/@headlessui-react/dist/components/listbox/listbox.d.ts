import React, { ElementType } from 'react';
import { Props } from '../../types';
declare let DEFAULT_LISTBOX_TAG: React.ExoticComponent<{
    children?: React.ReactNode;
}>;
interface ListboxRenderPropArg {
    open: boolean;
    disabled: boolean;
}
export declare function Listbox<TTag extends ElementType = typeof DEFAULT_LISTBOX_TAG, TType = string>(props: Props<TTag, ListboxRenderPropArg, 'value' | 'onChange'> & {
    value: TType;
    onChange(value: TType): void;
    disabled?: boolean;
    horizontal?: boolean;
}): JSX.Element;
export declare namespace Listbox {
    var Button: (<TTag extends React.ElementType<any> = "button">(props: Props<TTag, ButtonRenderPropArg, ButtonPropsWeControl>, ref: React.Ref<HTMLButtonElement>) => React.ReactElement<any, string | ((props: any) => React.ReactElement<any, string | any | (new (props: any) => React.Component<any, any, any>)> | null) | (new (props: any) => React.Component<any, any, any>)> | null) & {
        displayName: string;
    };
    var Label: <TTag extends React.ElementType<any> = "label">(props: Props<TTag, LabelRenderPropArg, LabelPropsWeControl>) => React.ReactElement<any, string | ((props: any) => React.ReactElement<any, string | any | (new (props: any) => React.Component<any, any, any>)> | null) | (new (props: any) => React.Component<any, any, any>)> | null;
    var Options: (<TTag extends React.ElementType<any> = "ul">(props: (Pick<import("../../types").PropsOf<TTag>, Exclude<keyof import("../../types").PropsOf<TTag>, "children" | "as" | "refName" | "className" | "id">> & {
        as?: TTag | undefined;
        children?: string | number | boolean | {} | React.ReactElement<any, string | ((props: any) => React.ReactElement<any, string | any | (new (props: any) => React.Component<any, any, any>)> | null) | (new (props: any) => React.Component<any, any, any>)> | React.ReactNodeArray | React.ReactPortal | ((bag: OptionsRenderPropArg) => React.ReactElement<any, string | ((props: any) => React.ReactElement<any, string | any | (new (props: any) => React.Component<any, any, any>)> | null) | (new (props: any) => React.Component<any, any, any>)>) | null | undefined;
        refName?: string | undefined;
    } & (import("../../types").PropsOf<TTag> extends {
        className?: any;
    } ? {
        className?: string | ((bag: OptionsRenderPropArg) => string) | undefined;
    } : {}) & {
        static?: undefined;
    } & {
        unmount?: boolean | undefined;
    }) | (Pick<import("../../types").PropsOf<TTag>, Exclude<keyof import("../../types").PropsOf<TTag>, "children" | "as" | "refName" | "className" | "id">> & {
        as?: TTag | undefined;
        children?: string | number | boolean | {} | React.ReactElement<any, string | ((props: any) => React.ReactElement<any, string | any | (new (props: any) => React.Component<any, any, any>)> | null) | (new (props: any) => React.Component<any, any, any>)> | React.ReactNodeArray | React.ReactPortal | ((bag: OptionsRenderPropArg) => React.ReactElement<any, string | ((props: any) => React.ReactElement<any, string | any | (new (props: any) => React.Component<any, any, any>)> | null) | (new (props: any) => React.Component<any, any, any>)>) | null | undefined;
        refName?: string | undefined;
    } & (import("../../types").PropsOf<TTag> extends {
        className?: any;
    } ? {
        className?: string | ((bag: OptionsRenderPropArg) => string) | undefined;
    } : {}) & {
        unmount?: undefined;
    } & {
        static?: boolean | undefined;
    }) | (Pick<import("../../types").PropsOf<TTag>, Exclude<keyof import("../../types").PropsOf<TTag>, "children" | "as" | "refName" | "className" | "aria-labelledby">> & {
        as?: TTag | undefined;
        children?: string | number | boolean | {} | React.ReactElement<any, string | ((props: any) => React.ReactElement<any, string | any | (new (props: any) => React.Component<any, any, any>)> | null) | (new (props: any) => React.Component<any, any, any>)> | React.ReactNodeArray | React.ReactPortal | ((bag: OptionsRenderPropArg) => React.ReactElement<any, string | ((props: any) => React.ReactElement<any, string | any | (new (props: any) => React.Component<any, any, any>)> | null) | (new (props: any) => React.Component<any, any, any>)>) | null | undefined;
        refName?: string | undefined;
    } & (import("../../types").PropsOf<TTag> extends {
        className?: any;
    } ? {
        className?: string | ((bag: OptionsRenderPropArg) => string) | undefined;
    } : {}) & {
        static?: undefined;
    } & {
        unmount?: boolean | undefined;
    }) | (Pick<import("../../types").PropsOf<TTag>, Exclude<keyof import("../../types").PropsOf<TTag>, "children" | "as" | "refName" | "className" | "aria-labelledby">> & {
        as?: TTag | undefined;
        children?: string | number | boolean | {} | React.ReactElement<any, string | ((props: any) => React.ReactElement<any, string | any | (new (props: any) => React.Component<any, any, any>)> | null) | (new (props: any) => React.Component<any, any, any>)> | React.ReactNodeArray | React.ReactPortal | ((bag: OptionsRenderPropArg) => React.ReactElement<any, string | ((props: any) => React.ReactElement<any, string | any | (new (props: any) => React.Component<any, any, any>)> | null) | (new (props: any) => React.Component<any, any, any>)>) | null | undefined;
        refName?: string | undefined;
    } & (import("../../types").PropsOf<TTag> extends {
        className?: any;
    } ? {
        className?: string | ((bag: OptionsRenderPropArg) => string) | undefined;
    } : {}) & {
        unmount?: undefined;
    } & {
        static?: boolean | undefined;
    }) | (Pick<import("../../types").PropsOf<TTag>, Exclude<keyof import("../../types").PropsOf<TTag>, "children" | "as" | "refName" | "className" | "onKeyDown">> & {
        as?: TTag | undefined;
        children?: string | number | boolean | {} | React.ReactElement<any, string | ((props: any) => React.ReactElement<any, string | any | (new (props: any) => React.Component<any, any, any>)> | null) | (new (props: any) => React.Component<any, any, any>)> | React.ReactNodeArray | React.ReactPortal | ((bag: OptionsRenderPropArg) => React.ReactElement<any, string | ((props: any) => React.ReactElement<any, string | any | (new (props: any) => React.Component<any, any, any>)> | null) | (new (props: any) => React.Component<any, any, any>)>) | null | undefined;
        refName?: string | undefined;
    } & (import("../../types").PropsOf<TTag> extends {
        className?: any;
    } ? {
        className?: string | ((bag: OptionsRenderPropArg) => string) | undefined;
    } : {}) & {
        static?: undefined;
    } & {
        unmount?: boolean | undefined;
    }) | (Pick<import("../../types").PropsOf<TTag>, Exclude<keyof import("../../types").PropsOf<TTag>, "children" | "as" | "refName" | "className" | "onKeyDown">> & {
        as?: TTag | undefined;
        children?: string | number | boolean | {} | React.ReactElement<any, string | ((props: any) => React.ReactElement<any, string | any | (new (props: any) => React.Component<any, any, any>)> | null) | (new (props: any) => React.Component<any, any, any>)> | React.ReactNodeArray | React.ReactPortal | ((bag: OptionsRenderPropArg) => React.ReactElement<any, string | ((props: any) => React.ReactElement<any, string | any | (new (props: any) => React.Component<any, any, any>)> | null) | (new (props: any) => React.Component<any, any, any>)>) | null | undefined;
        refName?: string | undefined;
    } & (import("../../types").PropsOf<TTag> extends {
        className?: any;
    } ? {
        className?: string | ((bag: OptionsRenderPropArg) => string) | undefined;
    } : {}) & {
        unmount?: undefined;
    } & {
        static?: boolean | undefined;
    }) | (Pick<import("../../types").PropsOf<TTag>, Exclude<keyof import("../../types").PropsOf<TTag>, "children" | "as" | "refName" | "className" | "aria-activedescendant">> & {
        as?: TTag | undefined;
        children?: string | number | boolean | {} | React.ReactElement<any, string | ((props: any) => React.ReactElement<any, string | any | (new (props: any) => React.Component<any, any, any>)> | null) | (new (props: any) => React.Component<any, any, any>)> | React.ReactNodeArray | React.ReactPortal | ((bag: OptionsRenderPropArg) => React.ReactElement<any, string | ((props: any) => React.ReactElement<any, string | any | (new (props: any) => React.Component<any, any, any>)> | null) | (new (props: any) => React.Component<any, any, any>)>) | null | undefined;
        refName?: string | undefined;
    } & (import("../../types").PropsOf<TTag> extends {
        className?: any;
    } ? {
        className?: string | ((bag: OptionsRenderPropArg) => string) | undefined;
    } : {}) & {
        static?: undefined;
    } & {
        unmount?: boolean | undefined;
    }) | (Pick<import("../../types").PropsOf<TTag>, Exclude<keyof import("../../types").PropsOf<TTag>, "children" | "as" | "refName" | "className" | "aria-activedescendant">> & {
        as?: TTag | undefined;
        children?: string | number | boolean | {} | React.ReactElement<any, string | ((props: any) => React.ReactElement<any, string | any | (new (props: any) => React.Component<any, any, any>)> | null) | (new (props: any) => React.Component<any, any, any>)> | React.ReactNodeArray | React.ReactPortal | ((bag: OptionsRenderPropArg) => React.ReactElement<any, string | ((props: any) => React.ReactElement<any, string | any | (new (props: any) => React.Component<any, any, any>)> | null) | (new (props: any) => React.Component<any, any, any>)>) | null | undefined;
        refName?: string | undefined;
    } & (import("../../types").PropsOf<TTag> extends {
        className?: any;
    } ? {
        className?: string | ((bag: OptionsRenderPropArg) => string) | undefined;
    } : {}) & {
        unmount?: undefined;
    } & {
        static?: boolean | undefined;
    }) | (Pick<import("../../types").PropsOf<TTag>, Exclude<keyof import("../../types").PropsOf<TTag>, "children" | "as" | "refName" | "className" | "aria-orientation">> & {
        as?: TTag | undefined;
        children?: string | number | boolean | {} | React.ReactElement<any, string | ((props: any) => React.ReactElement<any, string | any | (new (props: any) => React.Component<any, any, any>)> | null) | (new (props: any) => React.Component<any, any, any>)> | React.ReactNodeArray | React.ReactPortal | ((bag: OptionsRenderPropArg) => React.ReactElement<any, string | ((props: any) => React.ReactElement<any, string | any | (new (props: any) => React.Component<any, any, any>)> | null) | (new (props: any) => React.Component<any, any, any>)>) | null | undefined;
        refName?: string | undefined;
    } & (import("../../types").PropsOf<TTag> extends {
        className?: any;
    } ? {
        className?: string | ((bag: OptionsRenderPropArg) => string) | undefined;
    } : {}) & {
        static?: undefined;
    } & {
        unmount?: boolean | undefined;
    }) | (Pick<import("../../types").PropsOf<TTag>, Exclude<keyof import("../../types").PropsOf<TTag>, "children" | "as" | "refName" | "className" | "aria-orientation">> & {
        as?: TTag | undefined;
        children?: string | number | boolean | {} | React.ReactElement<any, string | ((props: any) => React.ReactElement<any, string | any | (new (props: any) => React.Component<any, any, any>)> | null) | (new (props: any) => React.Component<any, any, any>)> | React.ReactNodeArray | React.ReactPortal | ((bag: OptionsRenderPropArg) => React.ReactElement<any, string | ((props: any) => React.ReactElement<any, string | any | (new (props: any) => React.Component<any, any, any>)> | null) | (new (props: any) => React.Component<any, any, any>)>) | null | undefined;
        refName?: string | undefined;
    } & (import("../../types").PropsOf<TTag> extends {
        className?: any;
    } ? {
        className?: string | ((bag: OptionsRenderPropArg) => string) | undefined;
    } : {}) & {
        unmount?: undefined;
    } & {
        static?: boolean | undefined;
    }) | (Pick<import("../../types").PropsOf<TTag>, Exclude<keyof import("../../types").PropsOf<TTag>, "children" | "as" | "refName" | "className" | "role">> & {
        as?: TTag | undefined;
        children?: string | number | boolean | {} | React.ReactElement<any, string | ((props: any) => React.ReactElement<any, string | any | (new (props: any) => React.Component<any, any, any>)> | null) | (new (props: any) => React.Component<any, any, any>)> | React.ReactNodeArray | React.ReactPortal | ((bag: OptionsRenderPropArg) => React.ReactElement<any, string | ((props: any) => React.ReactElement<any, string | any | (new (props: any) => React.Component<any, any, any>)> | null) | (new (props: any) => React.Component<any, any, any>)>) | null | undefined;
        refName?: string | undefined;
    } & (import("../../types").PropsOf<TTag> extends {
        className?: any;
    } ? {
        className?: string | ((bag: OptionsRenderPropArg) => string) | undefined;
    } : {}) & {
        static?: undefined;
    } & {
        unmount?: boolean | undefined;
    }) | (Pick<import("../../types").PropsOf<TTag>, Exclude<keyof import("../../types").PropsOf<TTag>, "children" | "as" | "refName" | "className" | "role">> & {
        as?: TTag | undefined;
        children?: string | number | boolean | {} | React.ReactElement<any, string | ((props: any) => React.ReactElement<any, string | any | (new (props: any) => React.Component<any, any, any>)> | null) | (new (props: any) => React.Component<any, any, any>)> | React.ReactNodeArray | React.ReactPortal | ((bag: OptionsRenderPropArg) => React.ReactElement<any, string | ((props: any) => React.ReactElement<any, string | any | (new (props: any) => React.Component<any, any, any>)> | null) | (new (props: any) => React.Component<any, any, any>)>) | null | undefined;
        refName?: string | undefined;
    } & (import("../../types").PropsOf<TTag> extends {
        className?: any;
    } ? {
        className?: string | ((bag: OptionsRenderPropArg) => string) | undefined;
    } : {}) & {
        unmount?: undefined;
    } & {
        static?: boolean | undefined;
    }) | (Pick<import("../../types").PropsOf<TTag>, Exclude<keyof import("../../types").PropsOf<TTag>, "children" | "as" | "refName" | "className" | "tabIndex">> & {
        as?: TTag | undefined;
        children?: string | number | boolean | {} | React.ReactElement<any, string | ((props: any) => React.ReactElement<any, string | any | (new (props: any) => React.Component<any, any, any>)> | null) | (new (props: any) => React.Component<any, any, any>)> | React.ReactNodeArray | React.ReactPortal | ((bag: OptionsRenderPropArg) => React.ReactElement<any, string | ((props: any) => React.ReactElement<any, string | any | (new (props: any) => React.Component<any, any, any>)> | null) | (new (props: any) => React.Component<any, any, any>)>) | null | undefined;
        refName?: string | undefined;
    } & (import("../../types").PropsOf<TTag> extends {
        className?: any;
    } ? {
        className?: string | ((bag: OptionsRenderPropArg) => string) | undefined;
    } : {}) & {
        static?: undefined;
    } & {
        unmount?: boolean | undefined;
    }) | (Pick<import("../../types").PropsOf<TTag>, Exclude<keyof import("../../types").PropsOf<TTag>, "children" | "as" | "refName" | "className" | "tabIndex">> & {
        as?: TTag | undefined;
        children?: string | number | boolean | {} | React.ReactElement<any, string | ((props: any) => React.ReactElement<any, string | any | (new (props: any) => React.Component<any, any, any>)> | null) | (new (props: any) => React.Component<any, any, any>)> | React.ReactNodeArray | React.ReactPortal | ((bag: OptionsRenderPropArg) => React.ReactElement<any, string | ((props: any) => React.ReactElement<any, string | any | (new (props: any) => React.Component<any, any, any>)> | null) | (new (props: any) => React.Component<any, any, any>)>) | null | undefined;
        refName?: string | undefined;
    } & (import("../../types").PropsOf<TTag> extends {
        className?: any;
    } ? {
        className?: string | ((bag: OptionsRenderPropArg) => string) | undefined;
    } : {}) & {
        unmount?: undefined;
    } & {
        static?: boolean | undefined;
    }), ref: React.Ref<HTMLUListElement>) => React.ReactElement<any, string | ((props: any) => React.ReactElement<any, string | any | (new (props: any) => React.Component<any, any, any>)> | null) | (new (props: any) => React.Component<any, any, any>)> | null) & {
        displayName: string;
    };
    var Option: <TTag extends React.ElementType<any> = "li", TType = unknown>(props: (Pick<import("../../types").PropsOf<TTag>, Exclude<keyof import("../../types").PropsOf<TTag>, "value" | "children" | "as" | "refName" | "className">> & {
        as?: TTag | undefined;
        children?: string | number | boolean | {} | React.ReactElement<any, string | ((props: any) => React.ReactElement<any, string | any | (new (props: any) => React.Component<any, any, any>)> | null) | (new (props: any) => React.Component<any, any, any>)> | React.ReactNodeArray | React.ReactPortal | ((bag: OptionRenderPropArg) => React.ReactElement<any, string | ((props: any) => React.ReactElement<any, string | any | (new (props: any) => React.Component<any, any, any>)> | null) | (new (props: any) => React.Component<any, any, any>)>) | null | undefined;
        refName?: string | undefined;
    } & (import("../../types").PropsOf<TTag> extends {
        className?: any;
    } ? {
        className?: string | ((bag: OptionRenderPropArg) => string) | undefined;
    } : {}) & {
        disabled?: boolean | undefined;
        value: TType;
    }) | (Pick<import("../../types").PropsOf<TTag>, Exclude<keyof import("../../types").PropsOf<TTag>, "children" | "as" | "refName" | "className" | "id">> & {
        as?: TTag | undefined;
        children?: string | number | boolean | {} | React.ReactElement<any, string | ((props: any) => React.ReactElement<any, string | any | (new (props: any) => React.Component<any, any, any>)> | null) | (new (props: any) => React.Component<any, any, any>)> | React.ReactNodeArray | React.ReactPortal | ((bag: OptionRenderPropArg) => React.ReactElement<any, string | ((props: any) => React.ReactElement<any, string | any | (new (props: any) => React.Component<any, any, any>)> | null) | (new (props: any) => React.Component<any, any, any>)>) | null | undefined;
        refName?: string | undefined;
    } & (import("../../types").PropsOf<TTag> extends {
        className?: any;
    } ? {
        className?: string | ((bag: OptionRenderPropArg) => string) | undefined;
    } : {}) & {
        disabled?: boolean | undefined;
        value: TType;
    }) | (Pick<import("../../types").PropsOf<TTag>, Exclude<keyof import("../../types").PropsOf<TTag>, "children" | "as" | "refName" | "className" | "role">> & {
        as?: TTag | undefined;
        children?: string | number | boolean | {} | React.ReactElement<any, string | ((props: any) => React.ReactElement<any, string | any | (new (props: any) => React.Component<any, any, any>)> | null) | (new (props: any) => React.Component<any, any, any>)> | React.ReactNodeArray | React.ReactPortal | ((bag: OptionRenderPropArg) => React.ReactElement<any, string | ((props: any) => React.ReactElement<any, string | any | (new (props: any) => React.Component<any, any, any>)> | null) | (new (props: any) => React.Component<any, any, any>)>) | null | undefined;
        refName?: string | undefined;
    } & (import("../../types").PropsOf<TTag> extends {
        className?: any;
    } ? {
        className?: string | ((bag: OptionRenderPropArg) => string) | undefined;
    } : {}) & {
        disabled?: boolean | undefined;
        value: TType;
    }) | (Pick<import("../../types").PropsOf<TTag>, Exclude<keyof import("../../types").PropsOf<TTag>, "children" | "as" | "refName" | "className" | "tabIndex">> & {
        as?: TTag | undefined;
        children?: string | number | boolean | {} | React.ReactElement<any, string | ((props: any) => React.ReactElement<any, string | any | (new (props: any) => React.Component<any, any, any>)> | null) | (new (props: any) => React.Component<any, any, any>)> | React.ReactNodeArray | React.ReactPortal | ((bag: OptionRenderPropArg) => React.ReactElement<any, string | ((props: any) => React.ReactElement<any, string | any | (new (props: any) => React.Component<any, any, any>)> | null) | (new (props: any) => React.Component<any, any, any>)>) | null | undefined;
        refName?: string | undefined;
    } & (import("../../types").PropsOf<TTag> extends {
        className?: any;
    } ? {
        className?: string | ((bag: OptionRenderPropArg) => string) | undefined;
    } : {}) & {
        disabled?: boolean | undefined;
        value: TType;
    }) | (Pick<import("../../types").PropsOf<TTag>, Exclude<keyof import("../../types").PropsOf<TTag>, "children" | "as" | "refName" | "className" | "aria-disabled">> & {
        as?: TTag | undefined;
        children?: string | number | boolean | {} | React.ReactElement<any, string | ((props: any) => React.ReactElement<any, string | any | (new (props: any) => React.Component<any, any, any>)> | null) | (new (props: any) => React.Component<any, any, any>)> | React.ReactNodeArray | React.ReactPortal | ((bag: OptionRenderPropArg) => React.ReactElement<any, string | ((props: any) => React.ReactElement<any, string | any | (new (props: any) => React.Component<any, any, any>)> | null) | (new (props: any) => React.Component<any, any, any>)>) | null | undefined;
        refName?: string | undefined;
    } & (import("../../types").PropsOf<TTag> extends {
        className?: any;
    } ? {
        className?: string | ((bag: OptionRenderPropArg) => string) | undefined;
    } : {}) & {
        disabled?: boolean | undefined;
        value: TType;
    }) | (Pick<import("../../types").PropsOf<TTag>, Exclude<keyof import("../../types").PropsOf<TTag>, "children" | "as" | "refName" | "className" | "aria-selected">> & {
        as?: TTag | undefined;
        children?: string | number | boolean | {} | React.ReactElement<any, string | ((props: any) => React.ReactElement<any, string | any | (new (props: any) => React.Component<any, any, any>)> | null) | (new (props: any) => React.Component<any, any, any>)> | React.ReactNodeArray | React.ReactPortal | ((bag: OptionRenderPropArg) => React.ReactElement<any, string | ((props: any) => React.ReactElement<any, string | any | (new (props: any) => React.Component<any, any, any>)> | null) | (new (props: any) => React.Component<any, any, any>)>) | null | undefined;
        refName?: string | undefined;
    } & (import("../../types").PropsOf<TTag> extends {
        className?: any;
    } ? {
        className?: string | ((bag: OptionRenderPropArg) => string) | undefined;
    } : {}) & {
        disabled?: boolean | undefined;
        value: TType;
    }) | (Pick<import("../../types").PropsOf<TTag>, Exclude<keyof import("../../types").PropsOf<TTag>, "children" | "as" | "refName" | "className" | "onPointerLeave">> & {
        as?: TTag | undefined;
        children?: string | number | boolean | {} | React.ReactElement<any, string | ((props: any) => React.ReactElement<any, string | any | (new (props: any) => React.Component<any, any, any>)> | null) | (new (props: any) => React.Component<any, any, any>)> | React.ReactNodeArray | React.ReactPortal | ((bag: OptionRenderPropArg) => React.ReactElement<any, string | ((props: any) => React.ReactElement<any, string | any | (new (props: any) => React.Component<any, any, any>)> | null) | (new (props: any) => React.Component<any, any, any>)>) | null | undefined;
        refName?: string | undefined;
    } & (import("../../types").PropsOf<TTag> extends {
        className?: any;
    } ? {
        className?: string | ((bag: OptionRenderPropArg) => string) | undefined;
    } : {}) & {
        disabled?: boolean | undefined;
        value: TType;
    }) | (Pick<import("../../types").PropsOf<TTag>, Exclude<keyof import("../../types").PropsOf<TTag>, "children" | "as" | "refName" | "className" | "onMouseLeave">> & {
        as?: TTag | undefined;
        children?: string | number | boolean | {} | React.ReactElement<any, string | ((props: any) => React.ReactElement<any, string | any | (new (props: any) => React.Component<any, any, any>)> | null) | (new (props: any) => React.Component<any, any, any>)> | React.ReactNodeArray | React.ReactPortal | ((bag: OptionRenderPropArg) => React.ReactElement<any, string | ((props: any) => React.ReactElement<any, string | any | (new (props: any) => React.Component<any, any, any>)> | null) | (new (props: any) => React.Component<any, any, any>)>) | null | undefined;
        refName?: string | undefined;
    } & (import("../../types").PropsOf<TTag> extends {
        className?: any;
    } ? {
        className?: string | ((bag: OptionRenderPropArg) => string) | undefined;
    } : {}) & {
        disabled?: boolean | undefined;
        value: TType;
    }) | (Pick<import("../../types").PropsOf<TTag>, Exclude<keyof import("../../types").PropsOf<TTag>, "children" | "as" | "refName" | "className" | "onPointerMove">> & {
        as?: TTag | undefined;
        children?: string | number | boolean | {} | React.ReactElement<any, string | ((props: any) => React.ReactElement<any, string | any | (new (props: any) => React.Component<any, any, any>)> | null) | (new (props: any) => React.Component<any, any, any>)> | React.ReactNodeArray | React.ReactPortal | ((bag: OptionRenderPropArg) => React.ReactElement<any, string | ((props: any) => React.ReactElement<any, string | any | (new (props: any) => React.Component<any, any, any>)> | null) | (new (props: any) => React.Component<any, any, any>)>) | null | undefined;
        refName?: string | undefined;
    } & (import("../../types").PropsOf<TTag> extends {
        className?: any;
    } ? {
        className?: string | ((bag: OptionRenderPropArg) => string) | undefined;
    } : {}) & {
        disabled?: boolean | undefined;
        value: TType;
    }) | (Pick<import("../../types").PropsOf<TTag>, Exclude<keyof import("../../types").PropsOf<TTag>, "children" | "as" | "refName" | "className" | "onMouseMove">> & {
        as?: TTag | undefined;
        children?: string | number | boolean | {} | React.ReactElement<any, string | ((props: any) => React.ReactElement<any, string | any | (new (props: any) => React.Component<any, any, any>)> | null) | (new (props: any) => React.Component<any, any, any>)> | React.ReactNodeArray | React.ReactPortal | ((bag: OptionRenderPropArg) => React.ReactElement<any, string | ((props: any) => React.ReactElement<any, string | any | (new (props: any) => React.Component<any, any, any>)> | null) | (new (props: any) => React.Component<any, any, any>)>) | null | undefined;
        refName?: string | undefined;
    } & (import("../../types").PropsOf<TTag> extends {
        className?: any;
    } ? {
        className?: string | ((bag: OptionRenderPropArg) => string) | undefined;
    } : {}) & {
        disabled?: boolean | undefined;
        value: TType;
    }) | (Pick<import("../../types").PropsOf<TTag>, Exclude<keyof import("../../types").PropsOf<TTag>, "children" | "as" | "refName" | "className" | "onFocus">> & {
        as?: TTag | undefined;
        children?: string | number | boolean | {} | React.ReactElement<any, string | ((props: any) => React.ReactElement<any, string | any | (new (props: any) => React.Component<any, any, any>)> | null) | (new (props: any) => React.Component<any, any, any>)> | React.ReactNodeArray | React.ReactPortal | ((bag: OptionRenderPropArg) => React.ReactElement<any, string | ((props: any) => React.ReactElement<any, string | any | (new (props: any) => React.Component<any, any, any>)> | null) | (new (props: any) => React.Component<any, any, any>)>) | null | undefined;
        refName?: string | undefined;
    } & (import("../../types").PropsOf<TTag> extends {
        className?: any;
    } ? {
        className?: string | ((bag: OptionRenderPropArg) => string) | undefined;
    } : {}) & {
        disabled?: boolean | undefined;
        value: TType;
    })) => React.ReactElement<any, string | ((props: any) => React.ReactElement<any, string | any | (new (props: any) => React.Component<any, any, any>)> | null) | (new (props: any) => React.Component<any, any, any>)> | null;
}
interface ButtonRenderPropArg {
    open: boolean;
    disabled: boolean;
}
declare type ButtonPropsWeControl = 'id' | 'type' | 'aria-haspopup' | 'aria-controls' | 'aria-expanded' | 'aria-labelledby' | 'disabled' | 'onKeyDown' | 'onClick';
interface LabelRenderPropArg {
    open: boolean;
    disabled: boolean;
}
declare type LabelPropsWeControl = 'id' | 'ref' | 'onClick';
interface OptionsRenderPropArg {
    open: boolean;
}
interface OptionRenderPropArg {
    active: boolean;
    selected: boolean;
    disabled: boolean;
}
export {};
