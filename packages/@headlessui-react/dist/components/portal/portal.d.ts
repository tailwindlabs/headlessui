import React, { ElementType } from 'react';
import { Props } from '../../types';
declare let DEFAULT_PORTAL_TAG: React.ExoticComponent<{
    children?: React.ReactNode;
}>;
interface PortalRenderPropArg {
}
export declare function Portal<TTag extends ElementType = typeof DEFAULT_PORTAL_TAG>(props: Props<TTag, PortalRenderPropArg>): React.ReactPortal | null;
export declare namespace Portal {
    var Group: <TTag extends React.ElementType<any> = React.ExoticComponent<{
        children?: React.ReactNode;
    }>>(props: Pick<import("../../types").PropsOf<TTag>, Exclude<keyof import("../../types").PropsOf<TTag>, "children" | "as" | "refName" | "className">> & {
        as?: TTag | undefined;
        children?: string | number | boolean | {} | React.ReactElement<any, string | ((props: any) => React.ReactElement<any, string | any | (new (props: any) => React.Component<any, any, any>)> | null) | (new (props: any) => React.Component<any, any, any>)> | React.ReactNodeArray | React.ReactPortal | ((bag: GroupRenderPropArg) => React.ReactElement<any, string | ((props: any) => React.ReactElement<any, string | any | (new (props: any) => React.Component<any, any, any>)> | null) | (new (props: any) => React.Component<any, any, any>)>) | null | undefined;
        refName?: string | undefined;
    } & (import("../../types").PropsOf<TTag> extends {
        className?: any;
    } ? {
        className?: string | ((bag: GroupRenderPropArg) => string) | undefined;
    } : {}) & {
        target: React.MutableRefObject<HTMLElement | null>;
    }) => JSX.Element;
}
interface GroupRenderPropArg {
}
export {};
