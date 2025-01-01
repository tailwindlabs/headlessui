import React, { type ElementType, type MutableRefObject, type Ref } from 'react';
import type { Props } from '../../types.js';
import { type HasDisplayName, type PropsForFeatures, type RefProp } from '../../utils/render.js';
import { type _internal_ComponentDescription } from '../description/description.js';
declare let DEFAULT_DIALOG_TAG: "div";
type DialogRenderPropArg = {
    open: boolean;
};
type DialogPropsWeControl = 'aria-describedby' | 'aria-labelledby' | 'aria-modal';
declare let DialogRenderFeatures: number;
export type DialogProps<TTag extends ElementType = typeof DEFAULT_DIALOG_TAG> = Props<TTag, DialogRenderPropArg, DialogPropsWeControl, PropsForFeatures<typeof DialogRenderFeatures> & {
    open?: boolean;
    onClose: (value: boolean) => void;
    initialFocus?: MutableRefObject<HTMLElement | null>;
    role?: 'dialog' | 'alertdialog';
    autoFocus?: boolean;
    transition?: boolean;
    __demoMode?: boolean;
}>;
declare function DialogFn<TTag extends ElementType = typeof DEFAULT_DIALOG_TAG>(props: DialogProps<TTag>, ref: Ref<HTMLElement>): React.JSX.Element;
declare let DEFAULT_PANEL_TAG: "div";
type PanelRenderPropArg = {
    open: boolean;
};
export type DialogPanelProps<TTag extends ElementType = typeof DEFAULT_PANEL_TAG> = Props<TTag, PanelRenderPropArg, never, {
    transition?: boolean;
}>;
declare function PanelFn<TTag extends ElementType = typeof DEFAULT_PANEL_TAG>(props: DialogPanelProps<TTag>, ref: Ref<HTMLElement>): React.JSX.Element;
declare let DEFAULT_BACKDROP_TAG: "div";
type BackdropRenderPropArg = {
    open: boolean;
};
export type DialogBackdropProps<TTag extends ElementType = typeof DEFAULT_BACKDROP_TAG> = Props<TTag, BackdropRenderPropArg, never, {
    transition?: boolean;
}>;
declare function BackdropFn<TTag extends ElementType = typeof DEFAULT_BACKDROP_TAG>(props: DialogBackdropProps<TTag>, ref: Ref<HTMLElement>): React.JSX.Element;
declare let DEFAULT_TITLE_TAG: "h2";
type TitleRenderPropArg = {
    open: boolean;
};
export type DialogTitleProps<TTag extends ElementType = typeof DEFAULT_TITLE_TAG> = Props<TTag, TitleRenderPropArg>;
declare function TitleFn<TTag extends ElementType = typeof DEFAULT_TITLE_TAG>(props: DialogTitleProps<TTag>, ref: Ref<HTMLElement>): React.ReactElement<any, string | React.JSXElementConstructor<any>> | null;
export interface _internal_ComponentDialog extends HasDisplayName {
    <TTag extends ElementType = typeof DEFAULT_DIALOG_TAG>(props: DialogProps<TTag> & RefProp<typeof DialogFn>): React.JSX.Element;
}
export interface _internal_ComponentDialogPanel extends HasDisplayName {
    <TTag extends ElementType = typeof DEFAULT_PANEL_TAG>(props: DialogPanelProps<TTag> & RefProp<typeof PanelFn>): React.JSX.Element;
}
export interface _internal_ComponentDialogBackdrop extends HasDisplayName {
    <TTag extends ElementType = typeof DEFAULT_BACKDROP_TAG>(props: DialogBackdropProps<TTag> & RefProp<typeof BackdropFn>): React.JSX.Element;
}
export interface _internal_ComponentDialogTitle extends HasDisplayName {
    <TTag extends ElementType = typeof DEFAULT_TITLE_TAG>(props: DialogTitleProps<TTag> & RefProp<typeof TitleFn>): React.JSX.Element;
}
export interface _internal_ComponentDialogDescription extends _internal_ComponentDescription {
}
export declare let DialogPanel: _internal_ComponentDialogPanel;
export declare let DialogBackdrop: _internal_ComponentDialogBackdrop;
export declare let DialogTitle: _internal_ComponentDialogTitle;
/** @deprecated use `<Description>` instead of `<DialogDescription>` */
export declare let DialogDescription: _internal_ComponentDialogDescription;
export declare let Dialog: _internal_ComponentDialog & {
    /** @deprecated use `<DialogPanel>` instead of `<Dialog.Panel>` */
    Panel: _internal_ComponentDialogPanel;
    /** @deprecated use `<DialogTitle>` instead of `<Dialog.Title>` */
    Title: _internal_ComponentDialogTitle;
    /** @deprecated use `<Description>` instead of `<Dialog.Description>` */
    Description: _internal_ComponentDialogDescription;
};
export {};
