import React, { ElementType } from 'react';
import { Props } from '../../types';
declare let DEFAULT_MENU_TAG: React.ExoticComponent<{
    children?: React.ReactNode;
}>;
interface MenuRenderPropArg {
    open: boolean;
}
export declare function Menu<TTag extends ElementType = typeof DEFAULT_MENU_TAG>(props: Props<TTag, MenuRenderPropArg>): JSX.Element;
export declare namespace Menu {
    var Button: (<TTag extends React.ElementType<any> = "button">(props: Props<TTag, ButtonRenderPropArg, ButtonPropsWeControl>, ref: React.Ref<HTMLButtonElement>) => React.ReactElement<any, string | ((props: any) => React.ReactElement<any, string | any | (new (props: any) => React.Component<any, any, any>)> | null) | (new (props: any) => React.Component<any, any, any>)> | null) & {
        displayName: string;
    };
    var Items: (<TTag extends React.ElementType<any> = "div">(props: (Pick<import("../../types").PropsOf<TTag>, Exclude<keyof import("../../types").PropsOf<TTag>, "children" | "as" | "refName" | "className" | "id">> & {
        as?: TTag | undefined;
        children?: string | number | boolean | {} | React.ReactElement<any, string | ((props: any) => React.ReactElement<any, string | any | (new (props: any) => React.Component<any, any, any>)> | null) | (new (props: any) => React.Component<any, any, any>)> | React.ReactNodeArray | React.ReactPortal | ((bag: ItemsRenderPropArg) => React.ReactElement<any, string | ((props: any) => React.ReactElement<any, string | any | (new (props: any) => React.Component<any, any, any>)> | null) | (new (props: any) => React.Component<any, any, any>)>) | null | undefined;
        refName?: string | undefined;
    } & (import("../../types").PropsOf<TTag> extends {
        className?: any;
    } ? {
        className?: string | ((bag: ItemsRenderPropArg) => string) | undefined;
    } : {}) & {
        static?: undefined;
    } & {
        unmount?: boolean | undefined;
    }) | (Pick<import("../../types").PropsOf<TTag>, Exclude<keyof import("../../types").PropsOf<TTag>, "children" | "as" | "refName" | "className" | "id">> & {
        as?: TTag | undefined;
        children?: string | number | boolean | {} | React.ReactElement<any, string | ((props: any) => React.ReactElement<any, string | any | (new (props: any) => React.Component<any, any, any>)> | null) | (new (props: any) => React.Component<any, any, any>)> | React.ReactNodeArray | React.ReactPortal | ((bag: ItemsRenderPropArg) => React.ReactElement<any, string | ((props: any) => React.ReactElement<any, string | any | (new (props: any) => React.Component<any, any, any>)> | null) | (new (props: any) => React.Component<any, any, any>)>) | null | undefined;
        refName?: string | undefined;
    } & (import("../../types").PropsOf<TTag> extends {
        className?: any;
    } ? {
        className?: string | ((bag: ItemsRenderPropArg) => string) | undefined;
    } : {}) & {
        unmount?: undefined;
    } & {
        static?: boolean | undefined;
    }) | (Pick<import("../../types").PropsOf<TTag>, Exclude<keyof import("../../types").PropsOf<TTag>, "children" | "as" | "refName" | "className" | "onKeyDown">> & {
        as?: TTag | undefined;
        children?: string | number | boolean | {} | React.ReactElement<any, string | ((props: any) => React.ReactElement<any, string | any | (new (props: any) => React.Component<any, any, any>)> | null) | (new (props: any) => React.Component<any, any, any>)> | React.ReactNodeArray | React.ReactPortal | ((bag: ItemsRenderPropArg) => React.ReactElement<any, string | ((props: any) => React.ReactElement<any, string | any | (new (props: any) => React.Component<any, any, any>)> | null) | (new (props: any) => React.Component<any, any, any>)>) | null | undefined;
        refName?: string | undefined;
    } & (import("../../types").PropsOf<TTag> extends {
        className?: any;
    } ? {
        className?: string | ((bag: ItemsRenderPropArg) => string) | undefined;
    } : {}) & {
        static?: undefined;
    } & {
        unmount?: boolean | undefined;
    }) | (Pick<import("../../types").PropsOf<TTag>, Exclude<keyof import("../../types").PropsOf<TTag>, "children" | "as" | "refName" | "className" | "onKeyDown">> & {
        as?: TTag | undefined;
        children?: string | number | boolean | {} | React.ReactElement<any, string | ((props: any) => React.ReactElement<any, string | any | (new (props: any) => React.Component<any, any, any>)> | null) | (new (props: any) => React.Component<any, any, any>)> | React.ReactNodeArray | React.ReactPortal | ((bag: ItemsRenderPropArg) => React.ReactElement<any, string | ((props: any) => React.ReactElement<any, string | any | (new (props: any) => React.Component<any, any, any>)> | null) | (new (props: any) => React.Component<any, any, any>)>) | null | undefined;
        refName?: string | undefined;
    } & (import("../../types").PropsOf<TTag> extends {
        className?: any;
    } ? {
        className?: string | ((bag: ItemsRenderPropArg) => string) | undefined;
    } : {}) & {
        unmount?: undefined;
    } & {
        static?: boolean | undefined;
    }) | (Pick<import("../../types").PropsOf<TTag>, Exclude<keyof import("../../types").PropsOf<TTag>, "children" | "as" | "refName" | "className" | "aria-activedescendant">> & {
        as?: TTag | undefined;
        children?: string | number | boolean | {} | React.ReactElement<any, string | ((props: any) => React.ReactElement<any, string | any | (new (props: any) => React.Component<any, any, any>)> | null) | (new (props: any) => React.Component<any, any, any>)> | React.ReactNodeArray | React.ReactPortal | ((bag: ItemsRenderPropArg) => React.ReactElement<any, string | ((props: any) => React.ReactElement<any, string | any | (new (props: any) => React.Component<any, any, any>)> | null) | (new (props: any) => React.Component<any, any, any>)>) | null | undefined;
        refName?: string | undefined;
    } & (import("../../types").PropsOf<TTag> extends {
        className?: any;
    } ? {
        className?: string | ((bag: ItemsRenderPropArg) => string) | undefined;
    } : {}) & {
        static?: undefined;
    } & {
        unmount?: boolean | undefined;
    }) | (Pick<import("../../types").PropsOf<TTag>, Exclude<keyof import("../../types").PropsOf<TTag>, "children" | "as" | "refName" | "className" | "aria-activedescendant">> & {
        as?: TTag | undefined;
        children?: string | number | boolean | {} | React.ReactElement<any, string | ((props: any) => React.ReactElement<any, string | any | (new (props: any) => React.Component<any, any, any>)> | null) | (new (props: any) => React.Component<any, any, any>)> | React.ReactNodeArray | React.ReactPortal | ((bag: ItemsRenderPropArg) => React.ReactElement<any, string | ((props: any) => React.ReactElement<any, string | any | (new (props: any) => React.Component<any, any, any>)> | null) | (new (props: any) => React.Component<any, any, any>)>) | null | undefined;
        refName?: string | undefined;
    } & (import("../../types").PropsOf<TTag> extends {
        className?: any;
    } ? {
        className?: string | ((bag: ItemsRenderPropArg) => string) | undefined;
    } : {}) & {
        unmount?: undefined;
    } & {
        static?: boolean | undefined;
    }) | (Pick<import("../../types").PropsOf<TTag>, Exclude<keyof import("../../types").PropsOf<TTag>, "children" | "as" | "refName" | "className" | "aria-labelledby">> & {
        as?: TTag | undefined;
        children?: string | number | boolean | {} | React.ReactElement<any, string | ((props: any) => React.ReactElement<any, string | any | (new (props: any) => React.Component<any, any, any>)> | null) | (new (props: any) => React.Component<any, any, any>)> | React.ReactNodeArray | React.ReactPortal | ((bag: ItemsRenderPropArg) => React.ReactElement<any, string | ((props: any) => React.ReactElement<any, string | any | (new (props: any) => React.Component<any, any, any>)> | null) | (new (props: any) => React.Component<any, any, any>)>) | null | undefined;
        refName?: string | undefined;
    } & (import("../../types").PropsOf<TTag> extends {
        className?: any;
    } ? {
        className?: string | ((bag: ItemsRenderPropArg) => string) | undefined;
    } : {}) & {
        static?: undefined;
    } & {
        unmount?: boolean | undefined;
    }) | (Pick<import("../../types").PropsOf<TTag>, Exclude<keyof import("../../types").PropsOf<TTag>, "children" | "as" | "refName" | "className" | "aria-labelledby">> & {
        as?: TTag | undefined;
        children?: string | number | boolean | {} | React.ReactElement<any, string | ((props: any) => React.ReactElement<any, string | any | (new (props: any) => React.Component<any, any, any>)> | null) | (new (props: any) => React.Component<any, any, any>)> | React.ReactNodeArray | React.ReactPortal | ((bag: ItemsRenderPropArg) => React.ReactElement<any, string | ((props: any) => React.ReactElement<any, string | any | (new (props: any) => React.Component<any, any, any>)> | null) | (new (props: any) => React.Component<any, any, any>)>) | null | undefined;
        refName?: string | undefined;
    } & (import("../../types").PropsOf<TTag> extends {
        className?: any;
    } ? {
        className?: string | ((bag: ItemsRenderPropArg) => string) | undefined;
    } : {}) & {
        unmount?: undefined;
    } & {
        static?: boolean | undefined;
    }) | (Pick<import("../../types").PropsOf<TTag>, Exclude<keyof import("../../types").PropsOf<TTag>, "children" | "as" | "refName" | "className" | "role">> & {
        as?: TTag | undefined;
        children?: string | number | boolean | {} | React.ReactElement<any, string | ((props: any) => React.ReactElement<any, string | any | (new (props: any) => React.Component<any, any, any>)> | null) | (new (props: any) => React.Component<any, any, any>)> | React.ReactNodeArray | React.ReactPortal | ((bag: ItemsRenderPropArg) => React.ReactElement<any, string | ((props: any) => React.ReactElement<any, string | any | (new (props: any) => React.Component<any, any, any>)> | null) | (new (props: any) => React.Component<any, any, any>)>) | null | undefined;
        refName?: string | undefined;
    } & (import("../../types").PropsOf<TTag> extends {
        className?: any;
    } ? {
        className?: string | ((bag: ItemsRenderPropArg) => string) | undefined;
    } : {}) & {
        static?: undefined;
    } & {
        unmount?: boolean | undefined;
    }) | (Pick<import("../../types").PropsOf<TTag>, Exclude<keyof import("../../types").PropsOf<TTag>, "children" | "as" | "refName" | "className" | "role">> & {
        as?: TTag | undefined;
        children?: string | number | boolean | {} | React.ReactElement<any, string | ((props: any) => React.ReactElement<any, string | any | (new (props: any) => React.Component<any, any, any>)> | null) | (new (props: any) => React.Component<any, any, any>)> | React.ReactNodeArray | React.ReactPortal | ((bag: ItemsRenderPropArg) => React.ReactElement<any, string | ((props: any) => React.ReactElement<any, string | any | (new (props: any) => React.Component<any, any, any>)> | null) | (new (props: any) => React.Component<any, any, any>)>) | null | undefined;
        refName?: string | undefined;
    } & (import("../../types").PropsOf<TTag> extends {
        className?: any;
    } ? {
        className?: string | ((bag: ItemsRenderPropArg) => string) | undefined;
    } : {}) & {
        unmount?: undefined;
    } & {
        static?: boolean | undefined;
    }) | (Pick<import("../../types").PropsOf<TTag>, Exclude<keyof import("../../types").PropsOf<TTag>, "children" | "as" | "refName" | "className" | "tabIndex">> & {
        as?: TTag | undefined;
        children?: string | number | boolean | {} | React.ReactElement<any, string | ((props: any) => React.ReactElement<any, string | any | (new (props: any) => React.Component<any, any, any>)> | null) | (new (props: any) => React.Component<any, any, any>)> | React.ReactNodeArray | React.ReactPortal | ((bag: ItemsRenderPropArg) => React.ReactElement<any, string | ((props: any) => React.ReactElement<any, string | any | (new (props: any) => React.Component<any, any, any>)> | null) | (new (props: any) => React.Component<any, any, any>)>) | null | undefined;
        refName?: string | undefined;
    } & (import("../../types").PropsOf<TTag> extends {
        className?: any;
    } ? {
        className?: string | ((bag: ItemsRenderPropArg) => string) | undefined;
    } : {}) & {
        static?: undefined;
    } & {
        unmount?: boolean | undefined;
    }) | (Pick<import("../../types").PropsOf<TTag>, Exclude<keyof import("../../types").PropsOf<TTag>, "children" | "as" | "refName" | "className" | "tabIndex">> & {
        as?: TTag | undefined;
        children?: string | number | boolean | {} | React.ReactElement<any, string | ((props: any) => React.ReactElement<any, string | any | (new (props: any) => React.Component<any, any, any>)> | null) | (new (props: any) => React.Component<any, any, any>)> | React.ReactNodeArray | React.ReactPortal | ((bag: ItemsRenderPropArg) => React.ReactElement<any, string | ((props: any) => React.ReactElement<any, string | any | (new (props: any) => React.Component<any, any, any>)> | null) | (new (props: any) => React.Component<any, any, any>)>) | null | undefined;
        refName?: string | undefined;
    } & (import("../../types").PropsOf<TTag> extends {
        className?: any;
    } ? {
        className?: string | ((bag: ItemsRenderPropArg) => string) | undefined;
    } : {}) & {
        unmount?: undefined;
    } & {
        static?: boolean | undefined;
    }), ref: React.Ref<HTMLDivElement>) => React.ReactElement<any, string | ((props: any) => React.ReactElement<any, string | any | (new (props: any) => React.Component<any, any, any>)> | null) | (new (props: any) => React.Component<any, any, any>)> | null) & {
        displayName: string;
    };
    var Item: <TTag extends React.ElementType<any> = React.ExoticComponent<{
        children?: React.ReactNode;
    }>>(props: (Pick<import("../../types").PropsOf<TTag>, Exclude<keyof import("../../types").PropsOf<TTag>, "children" | "as" | "refName" | "className" | "id">> & {
        as?: TTag | undefined;
        children?: string | number | boolean | {} | React.ReactElement<any, string | ((props: any) => React.ReactElement<any, string | any | (new (props: any) => React.Component<any, any, any>)> | null) | (new (props: any) => React.Component<any, any, any>)> | React.ReactNodeArray | React.ReactPortal | ((bag: ItemRenderPropArg) => React.ReactElement<any, string | ((props: any) => React.ReactElement<any, string | any | (new (props: any) => React.Component<any, any, any>)> | null) | (new (props: any) => React.Component<any, any, any>)>) | null | undefined;
        refName?: string | undefined;
    } & (import("../../types").PropsOf<TTag> extends {
        className?: any;
    } ? {
        className?: string | ((bag: ItemRenderPropArg) => string) | undefined;
    } : {}) & {
        disabled?: boolean | undefined;
        onClick?: ((event: {
            preventDefault: Function;
        }) => void) | undefined;
    }) | (Pick<import("../../types").PropsOf<TTag>, Exclude<keyof import("../../types").PropsOf<TTag>, "children" | "as" | "refName" | "className" | "role">> & {
        as?: TTag | undefined;
        children?: string | number | boolean | {} | React.ReactElement<any, string | ((props: any) => React.ReactElement<any, string | any | (new (props: any) => React.Component<any, any, any>)> | null) | (new (props: any) => React.Component<any, any, any>)> | React.ReactNodeArray | React.ReactPortal | ((bag: ItemRenderPropArg) => React.ReactElement<any, string | ((props: any) => React.ReactElement<any, string | any | (new (props: any) => React.Component<any, any, any>)> | null) | (new (props: any) => React.Component<any, any, any>)>) | null | undefined;
        refName?: string | undefined;
    } & (import("../../types").PropsOf<TTag> extends {
        className?: any;
    } ? {
        className?: string | ((bag: ItemRenderPropArg) => string) | undefined;
    } : {}) & {
        disabled?: boolean | undefined;
        onClick?: ((event: {
            preventDefault: Function;
        }) => void) | undefined;
    }) | (Pick<import("../../types").PropsOf<TTag>, Exclude<keyof import("../../types").PropsOf<TTag>, "children" | "as" | "refName" | "className" | "tabIndex">> & {
        as?: TTag | undefined;
        children?: string | number | boolean | {} | React.ReactElement<any, string | ((props: any) => React.ReactElement<any, string | any | (new (props: any) => React.Component<any, any, any>)> | null) | (new (props: any) => React.Component<any, any, any>)> | React.ReactNodeArray | React.ReactPortal | ((bag: ItemRenderPropArg) => React.ReactElement<any, string | ((props: any) => React.ReactElement<any, string | any | (new (props: any) => React.Component<any, any, any>)> | null) | (new (props: any) => React.Component<any, any, any>)>) | null | undefined;
        refName?: string | undefined;
    } & (import("../../types").PropsOf<TTag> extends {
        className?: any;
    } ? {
        className?: string | ((bag: ItemRenderPropArg) => string) | undefined;
    } : {}) & {
        disabled?: boolean | undefined;
        onClick?: ((event: {
            preventDefault: Function;
        }) => void) | undefined;
    }) | (Pick<import("../../types").PropsOf<TTag>, Exclude<keyof import("../../types").PropsOf<TTag>, "children" | "as" | "refName" | "className" | "aria-disabled">> & {
        as?: TTag | undefined;
        children?: string | number | boolean | {} | React.ReactElement<any, string | ((props: any) => React.ReactElement<any, string | any | (new (props: any) => React.Component<any, any, any>)> | null) | (new (props: any) => React.Component<any, any, any>)> | React.ReactNodeArray | React.ReactPortal | ((bag: ItemRenderPropArg) => React.ReactElement<any, string | ((props: any) => React.ReactElement<any, string | any | (new (props: any) => React.Component<any, any, any>)> | null) | (new (props: any) => React.Component<any, any, any>)>) | null | undefined;
        refName?: string | undefined;
    } & (import("../../types").PropsOf<TTag> extends {
        className?: any;
    } ? {
        className?: string | ((bag: ItemRenderPropArg) => string) | undefined;
    } : {}) & {
        disabled?: boolean | undefined;
        onClick?: ((event: {
            preventDefault: Function;
        }) => void) | undefined;
    }) | (Pick<import("../../types").PropsOf<TTag>, Exclude<keyof import("../../types").PropsOf<TTag>, "children" | "as" | "refName" | "className" | "onPointerLeave">> & {
        as?: TTag | undefined;
        children?: string | number | boolean | {} | React.ReactElement<any, string | ((props: any) => React.ReactElement<any, string | any | (new (props: any) => React.Component<any, any, any>)> | null) | (new (props: any) => React.Component<any, any, any>)> | React.ReactNodeArray | React.ReactPortal | ((bag: ItemRenderPropArg) => React.ReactElement<any, string | ((props: any) => React.ReactElement<any, string | any | (new (props: any) => React.Component<any, any, any>)> | null) | (new (props: any) => React.Component<any, any, any>)>) | null | undefined;
        refName?: string | undefined;
    } & (import("../../types").PropsOf<TTag> extends {
        className?: any;
    } ? {
        className?: string | ((bag: ItemRenderPropArg) => string) | undefined;
    } : {}) & {
        disabled?: boolean | undefined;
        onClick?: ((event: {
            preventDefault: Function;
        }) => void) | undefined;
    }) | (Pick<import("../../types").PropsOf<TTag>, Exclude<keyof import("../../types").PropsOf<TTag>, "children" | "as" | "refName" | "className" | "onPointerMove">> & {
        as?: TTag | undefined;
        children?: string | number | boolean | {} | React.ReactElement<any, string | ((props: any) => React.ReactElement<any, string | any | (new (props: any) => React.Component<any, any, any>)> | null) | (new (props: any) => React.Component<any, any, any>)> | React.ReactNodeArray | React.ReactPortal | ((bag: ItemRenderPropArg) => React.ReactElement<any, string | ((props: any) => React.ReactElement<any, string | any | (new (props: any) => React.Component<any, any, any>)> | null) | (new (props: any) => React.Component<any, any, any>)>) | null | undefined;
        refName?: string | undefined;
    } & (import("../../types").PropsOf<TTag> extends {
        className?: any;
    } ? {
        className?: string | ((bag: ItemRenderPropArg) => string) | undefined;
    } : {}) & {
        disabled?: boolean | undefined;
        onClick?: ((event: {
            preventDefault: Function;
        }) => void) | undefined;
    }) | (Pick<import("../../types").PropsOf<TTag>, Exclude<keyof import("../../types").PropsOf<TTag>, "children" | "as" | "refName" | "className" | "onMouseLeave">> & {
        as?: TTag | undefined;
        children?: string | number | boolean | {} | React.ReactElement<any, string | ((props: any) => React.ReactElement<any, string | any | (new (props: any) => React.Component<any, any, any>)> | null) | (new (props: any) => React.Component<any, any, any>)> | React.ReactNodeArray | React.ReactPortal | ((bag: ItemRenderPropArg) => React.ReactElement<any, string | ((props: any) => React.ReactElement<any, string | any | (new (props: any) => React.Component<any, any, any>)> | null) | (new (props: any) => React.Component<any, any, any>)>) | null | undefined;
        refName?: string | undefined;
    } & (import("../../types").PropsOf<TTag> extends {
        className?: any;
    } ? {
        className?: string | ((bag: ItemRenderPropArg) => string) | undefined;
    } : {}) & {
        disabled?: boolean | undefined;
        onClick?: ((event: {
            preventDefault: Function;
        }) => void) | undefined;
    }) | (Pick<import("../../types").PropsOf<TTag>, Exclude<keyof import("../../types").PropsOf<TTag>, "children" | "as" | "refName" | "className" | "onMouseMove">> & {
        as?: TTag | undefined;
        children?: string | number | boolean | {} | React.ReactElement<any, string | ((props: any) => React.ReactElement<any, string | any | (new (props: any) => React.Component<any, any, any>)> | null) | (new (props: any) => React.Component<any, any, any>)> | React.ReactNodeArray | React.ReactPortal | ((bag: ItemRenderPropArg) => React.ReactElement<any, string | ((props: any) => React.ReactElement<any, string | any | (new (props: any) => React.Component<any, any, any>)> | null) | (new (props: any) => React.Component<any, any, any>)>) | null | undefined;
        refName?: string | undefined;
    } & (import("../../types").PropsOf<TTag> extends {
        className?: any;
    } ? {
        className?: string | ((bag: ItemRenderPropArg) => string) | undefined;
    } : {}) & {
        disabled?: boolean | undefined;
        onClick?: ((event: {
            preventDefault: Function;
        }) => void) | undefined;
    }) | (Pick<import("../../types").PropsOf<TTag>, Exclude<keyof import("../../types").PropsOf<TTag>, "children" | "as" | "refName" | "className" | "onFocus">> & {
        as?: TTag | undefined;
        children?: string | number | boolean | {} | React.ReactElement<any, string | ((props: any) => React.ReactElement<any, string | any | (new (props: any) => React.Component<any, any, any>)> | null) | (new (props: any) => React.Component<any, any, any>)> | React.ReactNodeArray | React.ReactPortal | ((bag: ItemRenderPropArg) => React.ReactElement<any, string | ((props: any) => React.ReactElement<any, string | any | (new (props: any) => React.Component<any, any, any>)> | null) | (new (props: any) => React.Component<any, any, any>)>) | null | undefined;
        refName?: string | undefined;
    } & (import("../../types").PropsOf<TTag> extends {
        className?: any;
    } ? {
        className?: string | ((bag: ItemRenderPropArg) => string) | undefined;
    } : {}) & {
        disabled?: boolean | undefined;
        onClick?: ((event: {
            preventDefault: Function;
        }) => void) | undefined;
    })) => React.ReactElement<any, string | ((props: any) => React.ReactElement<any, string | any | (new (props: any) => React.Component<any, any, any>)> | null) | (new (props: any) => React.Component<any, any, any>)> | null;
}
interface ButtonRenderPropArg {
    open: boolean;
}
declare type ButtonPropsWeControl = 'id' | 'type' | 'aria-haspopup' | 'aria-controls' | 'aria-expanded' | 'onKeyDown' | 'onClick';
interface ItemsRenderPropArg {
    open: boolean;
}
interface ItemRenderPropArg {
    active: boolean;
    disabled: boolean;
}
export {};
