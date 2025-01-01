import React, { type ElementType, type MutableRefObject, type Ref } from 'react';
import type { Props } from '../../types.js';
import { type HasDisplayName, type RefProp } from '../../utils/render.js';
declare let DEFAULT_PORTAL_TAG: React.ExoticComponent<{
    children?: React.ReactNode | undefined;
}>;
type PortalRenderPropArg = {};
type PortalPropsWeControl = never;
export type PortalProps<TTag extends ElementType = typeof DEFAULT_PORTAL_TAG> = Props<TTag, PortalRenderPropArg, PortalPropsWeControl, {
    enabled?: boolean;
    ownerDocument?: Document | null;
}>;
declare function PortalFn<TTag extends ElementType = typeof DEFAULT_PORTAL_TAG>(props: PortalProps<TTag>, ref: Ref<HTMLElement>): React.JSX.Element | null;
declare let DEFAULT_GROUP_TAG: React.ExoticComponent<{
    children?: React.ReactNode | undefined;
}>;
type GroupRenderPropArg = {};
type GroupPropsWeControl = never;
export type PortalGroupProps<TTag extends ElementType = typeof DEFAULT_GROUP_TAG> = Props<TTag, GroupRenderPropArg, GroupPropsWeControl, {
    target: MutableRefObject<HTMLElement | null>;
}>;
declare function GroupFn<TTag extends ElementType = typeof DEFAULT_GROUP_TAG>(props: PortalGroupProps<TTag>, ref: Ref<HTMLElement>): React.JSX.Element;
export declare function useNestedPortals(): readonly [React.MutableRefObject<HTMLElement[]>, ({ children }: {
    children: React.ReactNode;
}) => React.JSX.Element];
export interface _internal_ComponentPortal extends HasDisplayName {
    <TTag extends ElementType = typeof DEFAULT_PORTAL_TAG>(props: PortalProps<TTag> & RefProp<typeof PortalFn>): React.JSX.Element;
}
export interface _internal_ComponentPortalGroup extends HasDisplayName {
    <TTag extends ElementType = typeof DEFAULT_GROUP_TAG>(props: PortalGroupProps<TTag> & RefProp<typeof GroupFn>): React.JSX.Element;
}
export declare let PortalGroup: _internal_ComponentPortalGroup;
export declare let Portal: _internal_ComponentPortal & {
    /** @deprecated use `<PortalGroup>` instead of `<Portal.Group>` */
    Group: _internal_ComponentPortalGroup;
};
export {};
