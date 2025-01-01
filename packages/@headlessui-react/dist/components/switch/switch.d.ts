import React, { type ElementType, type Ref } from 'react';
import type { Props } from '../../types.js';
import { type HasDisplayName, type RefProp } from '../../utils/render.js';
import { type _internal_ComponentDescription } from '../description/description.js';
import { type _internal_ComponentLabel } from '../label/label.js';
declare let DEFAULT_GROUP_TAG: React.ExoticComponent<{
    children?: React.ReactNode | undefined;
}>;
export type SwitchGroupProps<TTag extends ElementType = typeof DEFAULT_GROUP_TAG> = Props<TTag>;
declare function GroupFn<TTag extends ElementType = typeof DEFAULT_GROUP_TAG>(props: SwitchGroupProps<TTag>): React.JSX.Element;
declare let DEFAULT_SWITCH_TAG: "button";
type SwitchRenderPropArg = {
    checked: boolean;
    hover: boolean;
    focus: boolean;
    active: boolean;
    autofocus: boolean;
    changing: boolean;
    disabled: boolean;
};
type SwitchPropsWeControl = 'aria-checked' | 'aria-describedby' | 'aria-labelledby' | 'role';
export type SwitchProps<TTag extends ElementType = typeof DEFAULT_SWITCH_TAG> = Props<TTag, SwitchRenderPropArg, SwitchPropsWeControl, {
    checked?: boolean;
    defaultChecked?: boolean;
    onChange?(checked: boolean): void;
    name?: string;
    value?: string;
    form?: string;
    autoFocus?: boolean;
    disabled?: boolean;
    tabIndex?: number;
}>;
declare function SwitchFn<TTag extends ElementType = typeof DEFAULT_SWITCH_TAG>(props: SwitchProps<TTag>, ref: Ref<HTMLButtonElement>): React.JSX.Element;
export interface _internal_ComponentSwitch extends HasDisplayName {
    <TTag extends ElementType = typeof DEFAULT_SWITCH_TAG>(props: SwitchProps<TTag> & RefProp<typeof SwitchFn>): React.JSX.Element;
}
export interface _internal_ComponentSwitchGroup extends HasDisplayName {
    <TTag extends ElementType = typeof DEFAULT_GROUP_TAG>(props: SwitchGroupProps<TTag> & RefProp<typeof GroupFn>): React.JSX.Element;
}
export interface _internal_ComponentSwitchLabel extends _internal_ComponentLabel {
}
export interface _internal_ComponentSwitchDescription extends _internal_ComponentDescription {
}
/** @deprecated use `<Field>` instead of `<SwitchGroup>` */
export declare let SwitchGroup: _internal_ComponentSwitchGroup;
/** @deprecated use `<Label>` instead of `<SwitchLabel>` */
export declare let SwitchLabel: _internal_ComponentSwitchLabel;
/** @deprecated use `<Description>` instead of `<SwitchDescription>` */
export declare let SwitchDescription: _internal_ComponentSwitchDescription;
export declare let Switch: _internal_ComponentSwitch & {
    /** @deprecated use `<Field>` instead of `<Switch.Group>` */
    Group: _internal_ComponentSwitchGroup;
    /** @deprecated use `<Label>` instead of `<Switch.Label>` */
    Label: _internal_ComponentSwitchLabel;
    /** @deprecated use `<Description>` instead of `<Switch.Description>` */
    Description: _internal_ComponentSwitchDescription;
};
export {};
