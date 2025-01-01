import React, { type ElementType, type MouseEventHandler, type MutableRefObject, type Ref } from 'react';
import { type AnchorProps } from '../../internal/floating.js';
import type { Props } from '../../types.js';
import { type HasDisplayName, type PropsForFeatures, type RefProp } from '../../utils/render.js';
type MouseEvent<T> = Parameters<MouseEventHandler<T>>[0];
declare let DEFAULT_POPOVER_TAG: "div";
type PopoverRenderPropArg = {
    open: boolean;
    close: (focusableElement?: HTMLElement | MutableRefObject<HTMLElement | null> | MouseEvent<HTMLElement>) => void;
};
type PopoverPropsWeControl = never;
export type PopoverProps<TTag extends ElementType = typeof DEFAULT_POPOVER_TAG> = Props<TTag, PopoverRenderPropArg, PopoverPropsWeControl, {
    __demoMode?: boolean;
}>;
declare function PopoverFn<TTag extends ElementType = typeof DEFAULT_POPOVER_TAG>(props: PopoverProps<TTag>, ref: Ref<HTMLElement>): React.JSX.Element;
declare let DEFAULT_BUTTON_TAG: "button";
type ButtonRenderPropArg = {
    open: boolean;
    active: boolean;
    hover: boolean;
    focus: boolean;
    disabled: boolean;
    autofocus: boolean;
};
type ButtonPropsWeControl = 'aria-controls' | 'aria-expanded';
export type PopoverButtonProps<TTag extends ElementType = typeof DEFAULT_BUTTON_TAG> = Props<TTag, ButtonRenderPropArg, ButtonPropsWeControl, {
    disabled?: boolean;
    autoFocus?: boolean;
}>;
declare function ButtonFn<TTag extends ElementType = typeof DEFAULT_BUTTON_TAG>(props: PopoverButtonProps<TTag>, ref: Ref<HTMLButtonElement>): React.JSX.Element;
declare let DEFAULT_BACKDROP_TAG: "div";
type BackdropRenderPropArg = {
    open: boolean;
};
type BackdropPropsWeControl = 'aria-hidden';
declare let BackdropRenderFeatures: number;
export type PopoverBackdropProps<TTag extends ElementType = typeof DEFAULT_BACKDROP_TAG> = Props<TTag, BackdropRenderPropArg, BackdropPropsWeControl, {
    transition?: boolean;
} & PropsForFeatures<typeof BackdropRenderFeatures>>;
export type PopoverOverlayProps<TTag extends ElementType = typeof DEFAULT_BACKDROP_TAG> = PopoverBackdropProps<TTag>;
declare function BackdropFn<TTag extends ElementType = typeof DEFAULT_BACKDROP_TAG>(props: PopoverBackdropProps<TTag>, ref: Ref<HTMLElement>): React.ReactElement<any, string | React.JSXElementConstructor<any>> | null;
declare let DEFAULT_PANEL_TAG: "div";
type PanelRenderPropArg = {
    open: boolean;
    close: (focusableElement?: HTMLElement | MutableRefObject<HTMLElement | null>) => void;
};
type PanelPropsWeControl = 'tabIndex';
export type PopoverPanelProps<TTag extends ElementType = typeof DEFAULT_PANEL_TAG> = Props<TTag, PanelRenderPropArg, PanelPropsWeControl, {
    focus?: boolean;
    anchor?: AnchorProps;
    portal?: boolean;
    modal?: boolean;
    transition?: boolean;
    static?: boolean;
    unmount?: boolean;
}>;
declare function PanelFn<TTag extends ElementType = typeof DEFAULT_PANEL_TAG>(props: PopoverPanelProps<TTag>, ref: Ref<HTMLElement>): React.JSX.Element;
declare let DEFAULT_GROUP_TAG: "div";
type GroupRenderPropArg = {};
type GroupPropsWeControl = never;
export type PopoverGroupProps<TTag extends ElementType = typeof DEFAULT_GROUP_TAG> = Props<TTag, GroupRenderPropArg, GroupPropsWeControl>;
declare function GroupFn<TTag extends ElementType = typeof DEFAULT_GROUP_TAG>(props: PopoverGroupProps<TTag>, ref: Ref<HTMLElement>): React.JSX.Element;
export interface _internal_ComponentPopover extends HasDisplayName {
    <TTag extends ElementType = typeof DEFAULT_POPOVER_TAG>(props: PopoverProps<TTag> & RefProp<typeof PopoverFn>): React.JSX.Element;
}
export interface _internal_ComponentPopoverButton extends HasDisplayName {
    <TTag extends ElementType = typeof DEFAULT_BUTTON_TAG>(props: PopoverButtonProps<TTag> & RefProp<typeof ButtonFn>): React.JSX.Element;
}
export interface _internal_ComponentPopoverBackdrop extends HasDisplayName {
    <TTag extends ElementType = typeof DEFAULT_BACKDROP_TAG>(props: PopoverBackdropProps<TTag> & RefProp<typeof BackdropFn>): React.JSX.Element;
}
export interface _internal_ComponentPopoverPanel extends HasDisplayName {
    <TTag extends ElementType = typeof DEFAULT_PANEL_TAG>(props: PopoverPanelProps<TTag> & RefProp<typeof PanelFn>): React.JSX.Element;
}
export interface _internal_ComponentPopoverGroup extends HasDisplayName {
    <TTag extends ElementType = typeof DEFAULT_GROUP_TAG>(props: PopoverGroupProps<TTag> & RefProp<typeof GroupFn>): React.JSX.Element;
}
export declare let PopoverButton: _internal_ComponentPopoverButton;
/** @deprecated use `<PopoverBackdrop>` instead of `<PopoverOverlay>` */
export declare let PopoverOverlay: _internal_ComponentPopoverBackdrop;
export declare let PopoverBackdrop: _internal_ComponentPopoverBackdrop;
export declare let PopoverPanel: _internal_ComponentPopoverPanel;
export declare let PopoverGroup: _internal_ComponentPopoverGroup;
export declare let Popover: _internal_ComponentPopover & {
    /** @deprecated use `<PopoverButton>` instead of `<Popover.Button>` */
    Button: _internal_ComponentPopoverButton;
    /** @deprecated use `<PopoverBackdrop>` instead of `<Popover.Backdrop>` */
    Backdrop: _internal_ComponentPopoverBackdrop;
    /** @deprecated use `<PopoverOverlay>` instead of `<Popover.Overlay>` */
    Overlay: _internal_ComponentPopoverBackdrop;
    /** @deprecated use `<PopoverPanel>` instead of `<Popover.Panel>` */
    Panel: _internal_ComponentPopoverPanel;
    /** @deprecated use `<PopoverGroup>` instead of `<Popover.Group>` */
    Group: _internal_ComponentPopoverGroup;
};
export {};
