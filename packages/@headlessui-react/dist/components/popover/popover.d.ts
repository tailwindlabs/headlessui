import React, { ElementType, MutableRefObject } from 'react';
import { Props } from '../../types';
declare let DEFAULT_POPOVER_TAG: "div";
interface PopoverRenderPropArg {
    open: boolean;
    close(focusableElement?: HTMLElement | MutableRefObject<HTMLElement | null>): void;
}
export declare function Popover<TTag extends ElementType = typeof DEFAULT_POPOVER_TAG>(props: Props<TTag, PopoverRenderPropArg>): JSX.Element;
export declare namespace Popover {
    var Button: (<TTag extends React.ElementType<any> = "button">(props: Props<TTag, ButtonRenderPropArg, ButtonPropsWeControl>, ref: React.Ref<HTMLButtonElement>) => React.ReactElement<any, string | ((props: any) => React.ReactElement<any, string | any | (new (props: any) => React.Component<any, any, any>)> | null) | (new (props: any) => React.Component<any, any, any>)> | null) & {
        displayName: string;
    };
    var Overlay: (<TTag extends React.ElementType<any> = "div">(props: (Pick<import("../../types").PropsOf<TTag>, Exclude<keyof import("../../types").PropsOf<TTag>, "children" | "as" | "refName" | "className" | "id">> & {
        as?: TTag | undefined;
        children?: string | number | boolean | {} | React.ReactElement<any, string | ((props: any) => React.ReactElement<any, string | any | (new (props: any) => React.Component<any, any, any>)> | null) | (new (props: any) => React.Component<any, any, any>)> | React.ReactNodeArray | React.ReactPortal | ((bag: OverlayRenderPropArg) => React.ReactElement<any, string | ((props: any) => React.ReactElement<any, string | any | (new (props: any) => React.Component<any, any, any>)> | null) | (new (props: any) => React.Component<any, any, any>)>) | null | undefined;
        refName?: string | undefined;
    } & (import("../../types").PropsOf<TTag> extends {
        className?: any;
    } ? {
        className?: string | ((bag: OverlayRenderPropArg) => string) | undefined;
    } : {}) & {
        static?: undefined;
    } & {
        unmount?: boolean | undefined;
    }) | (Pick<import("../../types").PropsOf<TTag>, Exclude<keyof import("../../types").PropsOf<TTag>, "children" | "as" | "refName" | "className" | "id">> & {
        as?: TTag | undefined;
        children?: string | number | boolean | {} | React.ReactElement<any, string | ((props: any) => React.ReactElement<any, string | any | (new (props: any) => React.Component<any, any, any>)> | null) | (new (props: any) => React.Component<any, any, any>)> | React.ReactNodeArray | React.ReactPortal | ((bag: OverlayRenderPropArg) => React.ReactElement<any, string | ((props: any) => React.ReactElement<any, string | any | (new (props: any) => React.Component<any, any, any>)> | null) | (new (props: any) => React.Component<any, any, any>)>) | null | undefined;
        refName?: string | undefined;
    } & (import("../../types").PropsOf<TTag> extends {
        className?: any;
    } ? {
        className?: string | ((bag: OverlayRenderPropArg) => string) | undefined;
    } : {}) & {
        unmount?: undefined;
    } & {
        static?: boolean | undefined;
    }) | (Pick<import("../../types").PropsOf<TTag>, Exclude<keyof import("../../types").PropsOf<TTag>, "children" | "as" | "refName" | "className" | "onClick">> & {
        as?: TTag | undefined;
        children?: string | number | boolean | {} | React.ReactElement<any, string | ((props: any) => React.ReactElement<any, string | any | (new (props: any) => React.Component<any, any, any>)> | null) | (new (props: any) => React.Component<any, any, any>)> | React.ReactNodeArray | React.ReactPortal | ((bag: OverlayRenderPropArg) => React.ReactElement<any, string | ((props: any) => React.ReactElement<any, string | any | (new (props: any) => React.Component<any, any, any>)> | null) | (new (props: any) => React.Component<any, any, any>)>) | null | undefined;
        refName?: string | undefined;
    } & (import("../../types").PropsOf<TTag> extends {
        className?: any;
    } ? {
        className?: string | ((bag: OverlayRenderPropArg) => string) | undefined;
    } : {}) & {
        static?: undefined;
    } & {
        unmount?: boolean | undefined;
    }) | (Pick<import("../../types").PropsOf<TTag>, Exclude<keyof import("../../types").PropsOf<TTag>, "children" | "as" | "refName" | "className" | "onClick">> & {
        as?: TTag | undefined;
        children?: string | number | boolean | {} | React.ReactElement<any, string | ((props: any) => React.ReactElement<any, string | any | (new (props: any) => React.Component<any, any, any>)> | null) | (new (props: any) => React.Component<any, any, any>)> | React.ReactNodeArray | React.ReactPortal | ((bag: OverlayRenderPropArg) => React.ReactElement<any, string | ((props: any) => React.ReactElement<any, string | any | (new (props: any) => React.Component<any, any, any>)> | null) | (new (props: any) => React.Component<any, any, any>)>) | null | undefined;
        refName?: string | undefined;
    } & (import("../../types").PropsOf<TTag> extends {
        className?: any;
    } ? {
        className?: string | ((bag: OverlayRenderPropArg) => string) | undefined;
    } : {}) & {
        unmount?: undefined;
    } & {
        static?: boolean | undefined;
    }) | (Pick<import("../../types").PropsOf<TTag>, Exclude<keyof import("../../types").PropsOf<TTag>, "children" | "as" | "refName" | "className" | "aria-hidden">> & {
        as?: TTag | undefined;
        children?: string | number | boolean | {} | React.ReactElement<any, string | ((props: any) => React.ReactElement<any, string | any | (new (props: any) => React.Component<any, any, any>)> | null) | (new (props: any) => React.Component<any, any, any>)> | React.ReactNodeArray | React.ReactPortal | ((bag: OverlayRenderPropArg) => React.ReactElement<any, string | ((props: any) => React.ReactElement<any, string | any | (new (props: any) => React.Component<any, any, any>)> | null) | (new (props: any) => React.Component<any, any, any>)>) | null | undefined;
        refName?: string | undefined;
    } & (import("../../types").PropsOf<TTag> extends {
        className?: any;
    } ? {
        className?: string | ((bag: OverlayRenderPropArg) => string) | undefined;
    } : {}) & {
        static?: undefined;
    } & {
        unmount?: boolean | undefined;
    }) | (Pick<import("../../types").PropsOf<TTag>, Exclude<keyof import("../../types").PropsOf<TTag>, "children" | "as" | "refName" | "className" | "aria-hidden">> & {
        as?: TTag | undefined;
        children?: string | number | boolean | {} | React.ReactElement<any, string | ((props: any) => React.ReactElement<any, string | any | (new (props: any) => React.Component<any, any, any>)> | null) | (new (props: any) => React.Component<any, any, any>)> | React.ReactNodeArray | React.ReactPortal | ((bag: OverlayRenderPropArg) => React.ReactElement<any, string | ((props: any) => React.ReactElement<any, string | any | (new (props: any) => React.Component<any, any, any>)> | null) | (new (props: any) => React.Component<any, any, any>)>) | null | undefined;
        refName?: string | undefined;
    } & (import("../../types").PropsOf<TTag> extends {
        className?: any;
    } ? {
        className?: string | ((bag: OverlayRenderPropArg) => string) | undefined;
    } : {}) & {
        unmount?: undefined;
    } & {
        static?: boolean | undefined;
    }), ref: React.Ref<HTMLDivElement>) => React.ReactElement<any, string | ((props: any) => React.ReactElement<any, string | any | (new (props: any) => React.Component<any, any, any>)> | null) | (new (props: any) => React.Component<any, any, any>)> | null) & {
        displayName: string;
    };
    var Panel: (<TTag extends React.ElementType<any> = "div">(props: (Pick<import("../../types").PropsOf<TTag>, Exclude<keyof import("../../types").PropsOf<TTag>, "children" | "as" | "refName" | "className" | "id">> & {
        as?: TTag | undefined;
        children?: string | number | boolean | {} | React.ReactElement<any, string | ((props: any) => React.ReactElement<any, string | any | (new (props: any) => React.Component<any, any, any>)> | null) | (new (props: any) => React.Component<any, any, any>)> | React.ReactNodeArray | React.ReactPortal | ((bag: PanelRenderPropArg) => React.ReactElement<any, string | ((props: any) => React.ReactElement<any, string | any | (new (props: any) => React.Component<any, any, any>)> | null) | (new (props: any) => React.Component<any, any, any>)>) | null | undefined;
        refName?: string | undefined;
    } & (import("../../types").PropsOf<TTag> extends {
        className?: any;
    } ? {
        className?: string | ((bag: PanelRenderPropArg) => string) | undefined;
    } : {}) & {
        static?: undefined;
    } & {
        unmount?: boolean | undefined;
    } & {
        focus?: boolean | undefined;
    }) | (Pick<import("../../types").PropsOf<TTag>, Exclude<keyof import("../../types").PropsOf<TTag>, "children" | "as" | "refName" | "className" | "id">> & {
        as?: TTag | undefined;
        children?: string | number | boolean | {} | React.ReactElement<any, string | ((props: any) => React.ReactElement<any, string | any | (new (props: any) => React.Component<any, any, any>)> | null) | (new (props: any) => React.Component<any, any, any>)> | React.ReactNodeArray | React.ReactPortal | ((bag: PanelRenderPropArg) => React.ReactElement<any, string | ((props: any) => React.ReactElement<any, string | any | (new (props: any) => React.Component<any, any, any>)> | null) | (new (props: any) => React.Component<any, any, any>)>) | null | undefined;
        refName?: string | undefined;
    } & (import("../../types").PropsOf<TTag> extends {
        className?: any;
    } ? {
        className?: string | ((bag: PanelRenderPropArg) => string) | undefined;
    } : {}) & {
        unmount?: undefined;
    } & {
        static?: boolean | undefined;
    } & {
        focus?: boolean | undefined;
    }) | (Pick<import("../../types").PropsOf<TTag>, Exclude<keyof import("../../types").PropsOf<TTag>, "children" | "as" | "refName" | "className" | "onKeyDown">> & {
        as?: TTag | undefined;
        children?: string | number | boolean | {} | React.ReactElement<any, string | ((props: any) => React.ReactElement<any, string | any | (new (props: any) => React.Component<any, any, any>)> | null) | (new (props: any) => React.Component<any, any, any>)> | React.ReactNodeArray | React.ReactPortal | ((bag: PanelRenderPropArg) => React.ReactElement<any, string | ((props: any) => React.ReactElement<any, string | any | (new (props: any) => React.Component<any, any, any>)> | null) | (new (props: any) => React.Component<any, any, any>)>) | null | undefined;
        refName?: string | undefined;
    } & (import("../../types").PropsOf<TTag> extends {
        className?: any;
    } ? {
        className?: string | ((bag: PanelRenderPropArg) => string) | undefined;
    } : {}) & {
        static?: undefined;
    } & {
        unmount?: boolean | undefined;
    } & {
        focus?: boolean | undefined;
    }) | (Pick<import("../../types").PropsOf<TTag>, Exclude<keyof import("../../types").PropsOf<TTag>, "children" | "as" | "refName" | "className" | "onKeyDown">> & {
        as?: TTag | undefined;
        children?: string | number | boolean | {} | React.ReactElement<any, string | ((props: any) => React.ReactElement<any, string | any | (new (props: any) => React.Component<any, any, any>)> | null) | (new (props: any) => React.Component<any, any, any>)> | React.ReactNodeArray | React.ReactPortal | ((bag: PanelRenderPropArg) => React.ReactElement<any, string | ((props: any) => React.ReactElement<any, string | any | (new (props: any) => React.Component<any, any, any>)> | null) | (new (props: any) => React.Component<any, any, any>)>) | null | undefined;
        refName?: string | undefined;
    } & (import("../../types").PropsOf<TTag> extends {
        className?: any;
    } ? {
        className?: string | ((bag: PanelRenderPropArg) => string) | undefined;
    } : {}) & {
        unmount?: undefined;
    } & {
        static?: boolean | undefined;
    } & {
        focus?: boolean | undefined;
    }), ref: React.Ref<HTMLDivElement>) => JSX.Element) & {
        displayName: string;
    };
    var Group: <TTag extends React.ElementType<any> = "div">(props: Props<TTag, GroupRenderPropArg, "id">) => JSX.Element;
}
interface ButtonRenderPropArg {
    open: boolean;
}
declare type ButtonPropsWeControl = 'id' | 'type' | 'aria-expanded' | 'aria-controls' | 'onKeyDown' | 'onClick';
interface OverlayRenderPropArg {
    open: boolean;
}
interface PanelRenderPropArg {
    open: boolean;
    close: (focusableElement?: HTMLElement | MutableRefObject<HTMLElement | null>) => void;
}
interface GroupRenderPropArg {
}
export {};
