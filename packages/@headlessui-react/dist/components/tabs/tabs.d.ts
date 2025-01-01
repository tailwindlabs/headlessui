import React, { type ElementType, type Ref } from 'react';
import type { Props } from '../../types.js';
import { type HasDisplayName, type PropsForFeatures, type RefProp } from '../../utils/render.js';
declare let DEFAULT_TABS_TAG: "div";
type TabsRenderPropArg = {
    selectedIndex: number;
};
type TabsPropsWeControl = never;
export type TabGroupProps<TTag extends ElementType = typeof DEFAULT_TABS_TAG> = Props<TTag, TabsRenderPropArg, TabsPropsWeControl, {
    defaultIndex?: number;
    onChange?: (index: number) => void;
    selectedIndex?: number;
    vertical?: boolean;
    manual?: boolean;
}>;
declare function GroupFn<TTag extends ElementType = typeof DEFAULT_TABS_TAG>(props: TabGroupProps<TTag>, ref: Ref<HTMLElement>): React.JSX.Element;
declare let DEFAULT_LIST_TAG: "div";
type ListRenderPropArg = {
    selectedIndex: number;
};
type ListPropsWeControl = 'aria-orientation' | 'role';
export type TabListProps<TTag extends ElementType = typeof DEFAULT_LIST_TAG> = Props<TTag, ListRenderPropArg, ListPropsWeControl, {}>;
declare function ListFn<TTag extends ElementType = typeof DEFAULT_LIST_TAG>(props: TabListProps<TTag>, ref: Ref<HTMLElement>): React.ReactElement<any, string | React.JSXElementConstructor<any>> | null;
declare let DEFAULT_TAB_TAG: "button";
type TabRenderPropArg = {
    hover: boolean;
    focus: boolean;
    active: boolean;
    autofocus: boolean;
    selected: boolean;
    disabled: boolean;
};
type TabPropsWeControl = 'aria-controls' | 'aria-selected' | 'role' | 'tabIndex';
export type TabProps<TTag extends ElementType = typeof DEFAULT_TAB_TAG> = Props<TTag, TabRenderPropArg, TabPropsWeControl, {
    autoFocus?: boolean;
    disabled?: boolean;
}>;
declare function TabFn<TTag extends ElementType = typeof DEFAULT_TAB_TAG>(props: TabProps<TTag>, ref: Ref<HTMLElement>): React.ReactElement<any, string | React.JSXElementConstructor<any>> | null;
declare let DEFAULT_PANELS_TAG: "div";
type PanelsRenderPropArg = {
    selectedIndex: number;
};
export type TabPanelsProps<TTag extends ElementType = typeof DEFAULT_PANELS_TAG> = Props<TTag, PanelsRenderPropArg>;
declare function PanelsFn<TTag extends ElementType = typeof DEFAULT_PANELS_TAG>(props: TabPanelsProps<TTag>, ref: Ref<HTMLElement>): React.ReactElement<any, string | React.JSXElementConstructor<any>> | null;
declare let DEFAULT_PANEL_TAG: "div";
type PanelRenderPropArg = {
    selected: boolean;
    focus: boolean;
};
type PanelPropsWeControl = 'role' | 'aria-labelledby';
declare let PanelRenderFeatures: number;
export type TabPanelProps<TTag extends ElementType = typeof DEFAULT_PANEL_TAG> = Props<TTag, PanelRenderPropArg, PanelPropsWeControl, PropsForFeatures<typeof PanelRenderFeatures> & {
    id?: string;
    tabIndex?: number;
}>;
declare function PanelFn<TTag extends ElementType = typeof DEFAULT_PANEL_TAG>(props: TabPanelProps<TTag>, ref: Ref<HTMLElement>): React.JSX.Element | null;
export interface _internal_ComponentTab extends HasDisplayName {
    <TTag extends ElementType = typeof DEFAULT_TAB_TAG>(props: TabProps<TTag> & RefProp<typeof TabFn>): React.JSX.Element;
}
export interface _internal_ComponentTabGroup extends HasDisplayName {
    <TTag extends ElementType = typeof DEFAULT_TABS_TAG>(props: TabGroupProps<TTag> & RefProp<typeof GroupFn>): React.JSX.Element;
}
export interface _internal_ComponentTabList extends HasDisplayName {
    <TTag extends ElementType = typeof DEFAULT_LIST_TAG>(props: TabListProps<TTag> & RefProp<typeof ListFn>): React.JSX.Element;
}
export interface _internal_ComponentTabPanels extends HasDisplayName {
    <TTag extends ElementType = typeof DEFAULT_PANELS_TAG>(props: TabPanelsProps<TTag> & RefProp<typeof PanelsFn>): React.JSX.Element;
}
export interface _internal_ComponentTabPanel extends HasDisplayName {
    <TTag extends ElementType = typeof DEFAULT_PANEL_TAG>(props: TabPanelProps<TTag> & RefProp<typeof PanelFn>): React.JSX.Element;
}
export declare let TabGroup: _internal_ComponentTabGroup;
export declare let TabList: _internal_ComponentTabList;
export declare let TabPanels: _internal_ComponentTabPanels;
export declare let TabPanel: _internal_ComponentTabPanel;
export declare let Tab: _internal_ComponentTab & {
    /** @deprecated use `<TabGroup>` instead of `<Tab.Group>` */
    Group: _internal_ComponentTabGroup;
    /** @deprecated use `<TabList>` instead of `<Tab.List>` */
    List: _internal_ComponentTabList;
    /** @deprecated use `<TabPanels>` instead of `<Tab.Panels>` */
    Panels: _internal_ComponentTabPanels;
    /** @deprecated use `<TabPanel>` instead of `<Tab.Panel>` */
    Panel: _internal_ComponentTabPanel;
};
export {};
