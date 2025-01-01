import React, { type ElementType, type Ref } from 'react';
import { type AnchorProps } from '../../internal/floating.js';
import type { Props } from '../../types.js';
import { type HasDisplayName, type RefProp } from '../../utils/render.js';
declare let DEFAULT_MENU_TAG: React.ExoticComponent<{
    children?: React.ReactNode | undefined;
}>;
type MenuRenderPropArg = {
    open: boolean;
    close: () => void;
};
type MenuPropsWeControl = never;
export type MenuProps<TTag extends ElementType = typeof DEFAULT_MENU_TAG> = Props<TTag, MenuRenderPropArg, MenuPropsWeControl, {
    __demoMode?: boolean;
}>;
declare function MenuFn<TTag extends ElementType = typeof DEFAULT_MENU_TAG>(props: MenuProps<TTag>, ref: Ref<HTMLElement>): React.JSX.Element;
declare let DEFAULT_BUTTON_TAG: "button";
type ButtonRenderPropArg = {
    open: boolean;
    active: boolean;
    hover: boolean;
    focus: boolean;
    disabled: boolean;
    autofocus: boolean;
};
type ButtonPropsWeControl = 'aria-controls' | 'aria-expanded' | 'aria-haspopup';
export type MenuButtonProps<TTag extends ElementType = typeof DEFAULT_BUTTON_TAG> = Props<TTag, ButtonRenderPropArg, ButtonPropsWeControl, {
    disabled?: boolean;
    autoFocus?: boolean;
}>;
declare function ButtonFn<TTag extends ElementType = typeof DEFAULT_BUTTON_TAG>(props: MenuButtonProps<TTag>, ref: Ref<HTMLButtonElement>): React.ReactElement<any, string | React.JSXElementConstructor<any>> | null;
declare let DEFAULT_ITEMS_TAG: "div";
type ItemsRenderPropArg = {
    open: boolean;
};
type ItemsPropsWeControl = 'aria-activedescendant' | 'aria-labelledby' | 'role' | 'tabIndex';
export type MenuItemsProps<TTag extends ElementType = typeof DEFAULT_ITEMS_TAG> = Props<TTag, ItemsRenderPropArg, ItemsPropsWeControl, {
    anchor?: AnchorProps;
    portal?: boolean;
    modal?: boolean;
    transition?: boolean;
    static?: boolean;
    unmount?: boolean;
}>;
declare function ItemsFn<TTag extends ElementType = typeof DEFAULT_ITEMS_TAG>(props: MenuItemsProps<TTag>, ref: Ref<HTMLElement>): React.JSX.Element;
declare let DEFAULT_ITEM_TAG: React.ExoticComponent<{
    children?: React.ReactNode | undefined;
}>;
type ItemRenderPropArg = {
    /** @deprecated use `focus` instead */
    active: boolean;
    focus: boolean;
    disabled: boolean;
    close: () => void;
};
type ItemPropsWeControl = 'aria-describedby' | 'aria-disabled' | 'aria-labelledby' | 'role' | 'tabIndex';
export type MenuItemProps<TTag extends ElementType = typeof DEFAULT_ITEM_TAG> = Props<TTag, ItemRenderPropArg, ItemPropsWeControl, {
    disabled?: boolean;
}>;
declare function ItemFn<TTag extends ElementType = typeof DEFAULT_ITEM_TAG>(props: MenuItemProps<TTag>, ref: Ref<HTMLElement>): React.JSX.Element;
declare let DEFAULT_SECTION_TAG: "div";
type SectionRenderPropArg = {};
type SectionPropsWeControl = 'role' | 'aria-labelledby';
export type MenuSectionProps<TTag extends ElementType = typeof DEFAULT_SECTION_TAG> = Props<TTag, SectionRenderPropArg, SectionPropsWeControl>;
declare function SectionFn<TTag extends ElementType = typeof DEFAULT_SECTION_TAG>(props: MenuSectionProps<TTag>, ref: Ref<HTMLElement>): React.JSX.Element;
declare let DEFAULT_HEADING_TAG: "header";
type HeadingRenderPropArg = {};
type HeadingPropsWeControl = 'role';
export type MenuHeadingProps<TTag extends ElementType = typeof DEFAULT_HEADING_TAG> = Props<TTag, HeadingRenderPropArg, HeadingPropsWeControl>;
declare function HeadingFn<TTag extends ElementType = typeof DEFAULT_HEADING_TAG>(props: MenuHeadingProps<TTag>, ref: Ref<HTMLElement>): React.ReactElement<any, string | React.JSXElementConstructor<any>> | null;
declare let DEFAULT_SEPARATOR_TAG: "div";
type SeparatorRenderPropArg = {};
type SeparatorPropsWeControl = 'role';
export type MenuSeparatorProps<TTag extends ElementType = typeof DEFAULT_SEPARATOR_TAG> = Props<TTag, SeparatorRenderPropArg, SeparatorPropsWeControl>;
declare function SeparatorFn<TTag extends ElementType = typeof DEFAULT_SEPARATOR_TAG>(props: MenuSeparatorProps<TTag>, ref: Ref<HTMLElement>): React.ReactElement<any, string | React.JSXElementConstructor<any>> | null;
export interface _internal_ComponentMenu extends HasDisplayName {
    <TTag extends ElementType = typeof DEFAULT_MENU_TAG>(props: MenuProps<TTag> & RefProp<typeof MenuFn>): React.JSX.Element;
}
export interface _internal_ComponentMenuButton extends HasDisplayName {
    <TTag extends ElementType = typeof DEFAULT_BUTTON_TAG>(props: MenuButtonProps<TTag> & RefProp<typeof ButtonFn>): React.JSX.Element;
}
export interface _internal_ComponentMenuItems extends HasDisplayName {
    <TTag extends ElementType = typeof DEFAULT_ITEMS_TAG>(props: MenuItemsProps<TTag> & RefProp<typeof ItemsFn>): React.JSX.Element;
}
export interface _internal_ComponentMenuItem extends HasDisplayName {
    <TTag extends ElementType = typeof DEFAULT_ITEM_TAG>(props: MenuItemProps<TTag> & RefProp<typeof ItemFn>): React.JSX.Element;
}
export interface _internal_ComponentMenuSection extends HasDisplayName {
    <TTag extends ElementType = typeof DEFAULT_SECTION_TAG>(props: MenuSectionProps<TTag> & RefProp<typeof SectionFn>): React.JSX.Element;
}
export interface _internal_ComponentMenuHeading extends HasDisplayName {
    <TTag extends ElementType = typeof DEFAULT_HEADING_TAG>(props: MenuHeadingProps<TTag> & RefProp<typeof HeadingFn>): React.JSX.Element;
}
export interface _internal_ComponentMenuSeparator extends HasDisplayName {
    <TTag extends ElementType = typeof DEFAULT_SEPARATOR_TAG>(props: MenuSeparatorProps<TTag> & RefProp<typeof SeparatorFn>): React.JSX.Element;
}
export declare let MenuButton: _internal_ComponentMenuButton;
export declare let MenuItems: _internal_ComponentMenuItems;
export declare let MenuItem: _internal_ComponentMenuItem;
export declare let MenuSection: _internal_ComponentMenuSection;
export declare let MenuHeading: _internal_ComponentMenuHeading;
export declare let MenuSeparator: _internal_ComponentMenuSeparator;
export declare let Menu: _internal_ComponentMenu & {
    /** @deprecated use `<MenuButton>` instead of `<Menu.Button>` */
    Button: _internal_ComponentMenuButton;
    /** @deprecated use `<MenuItems>` instead of `<Menu.Items>` */
    Items: _internal_ComponentMenuItems;
    /** @deprecated use `<MenuItem>` instead of `<Menu.Item>` */
    Item: _internal_ComponentMenuItem;
    /** @deprecated use `<MenuSection>` instead of `<Menu.Section>` */
    Section: _internal_ComponentMenuSection;
    /** @deprecated use `<MenuHeading>` instead of `<Menu.Heading>` */
    Heading: _internal_ComponentMenuHeading;
    /** @deprecated use `<MenuSeparator>` instead of `<Menu.Separator>` */
    Separator: _internal_ComponentMenuSeparator;
};
export {};
