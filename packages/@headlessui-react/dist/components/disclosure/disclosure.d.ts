import React, { type ElementType, type MutableRefObject, type Ref } from 'react';
import type { Props } from '../../types.js';
import { type HasDisplayName, type PropsForFeatures, type RefProp } from '../../utils/render.js';
declare let DEFAULT_DISCLOSURE_TAG: React.ExoticComponent<{
    children?: React.ReactNode | undefined;
}>;
type DisclosureRenderPropArg = {
    open: boolean;
    close: (focusableElement?: HTMLElement | MutableRefObject<HTMLElement | null>) => void;
};
type DisclosurePropsWeControl = never;
export type DisclosureProps<TTag extends ElementType = typeof DEFAULT_DISCLOSURE_TAG> = Props<TTag, DisclosureRenderPropArg, DisclosurePropsWeControl, {
    defaultOpen?: boolean;
}>;
declare function DisclosureFn<TTag extends ElementType = typeof DEFAULT_DISCLOSURE_TAG>(props: DisclosureProps<TTag>, ref: Ref<HTMLElement>): React.JSX.Element;
declare let DEFAULT_BUTTON_TAG: "button";
type ButtonRenderPropArg = {
    open: boolean;
    hover: boolean;
    active: boolean;
    disabled: boolean;
    focus: boolean;
    autofocus: boolean;
};
type ButtonPropsWeControl = 'aria-controls' | 'aria-expanded';
export type DisclosureButtonProps<TTag extends ElementType = typeof DEFAULT_BUTTON_TAG> = Props<TTag, ButtonRenderPropArg, ButtonPropsWeControl, {
    disabled?: boolean;
    autoFocus?: boolean;
}>;
declare function ButtonFn<TTag extends ElementType = typeof DEFAULT_BUTTON_TAG>(props: DisclosureButtonProps<TTag>, ref: Ref<HTMLButtonElement>): React.ReactElement<any, string | React.JSXElementConstructor<any>> | null;
declare let DEFAULT_PANEL_TAG: "div";
type PanelRenderPropArg = {
    open: boolean;
    close: (focusableElement?: HTMLElement | MutableRefObject<HTMLElement | null>) => void;
};
type DisclosurePanelPropsWeControl = never;
declare let PanelRenderFeatures: number;
export type DisclosurePanelProps<TTag extends ElementType = typeof DEFAULT_PANEL_TAG> = Props<TTag, PanelRenderPropArg, DisclosurePanelPropsWeControl, {
    transition?: boolean;
} & PropsForFeatures<typeof PanelRenderFeatures>>;
declare function PanelFn<TTag extends ElementType = typeof DEFAULT_PANEL_TAG>(props: DisclosurePanelProps<TTag>, ref: Ref<HTMLElement>): React.JSX.Element;
export interface _internal_ComponentDisclosure extends HasDisplayName {
    <TTag extends ElementType = typeof DEFAULT_DISCLOSURE_TAG>(props: DisclosureProps<TTag> & RefProp<typeof DisclosureFn>): React.JSX.Element;
}
export interface _internal_ComponentDisclosureButton extends HasDisplayName {
    <TTag extends ElementType = typeof DEFAULT_BUTTON_TAG>(props: DisclosureButtonProps<TTag> & RefProp<typeof ButtonFn>): React.JSX.Element;
}
export interface _internal_ComponentDisclosurePanel extends HasDisplayName {
    <TTag extends ElementType = typeof DEFAULT_PANEL_TAG>(props: DisclosurePanelProps<TTag> & RefProp<typeof PanelFn>): React.JSX.Element;
}
export declare let DisclosureButton: _internal_ComponentDisclosureButton;
export declare let DisclosurePanel: _internal_ComponentDisclosurePanel;
export declare let Disclosure: _internal_ComponentDisclosure & {
    /** @deprecated use `<DisclosureButton>` instead of `<Disclosure.Button>` */
    Button: _internal_ComponentDisclosureButton;
    /** @deprecated use `<DisclosurePanel>` instead of `<Disclosure.Panel>` */
    Panel: _internal_ComponentDisclosurePanel;
};
export {};
