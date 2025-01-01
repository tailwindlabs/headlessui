import React, { type ElementType, type Ref } from 'react';
import { type ByComparator } from '../../hooks/use-by-comparator.js';
import type { Props } from '../../types.js';
import { type HasDisplayName, type RefProp } from '../../utils/render.js';
import { type _internal_ComponentDescription } from '../description/description.js';
import { type _internal_ComponentLabel } from '../label/label.js';
declare let DEFAULT_RADIO_GROUP_TAG: "div";
type RadioGroupRenderPropArg<TType> = {
    value: TType;
};
type RadioGroupPropsWeControl = 'role' | 'aria-labelledby' | 'aria-describedby';
export type RadioGroupProps<TTag extends ElementType = typeof DEFAULT_RADIO_GROUP_TAG, TType = string> = Props<TTag, RadioGroupRenderPropArg<TType>, RadioGroupPropsWeControl, {
    value?: TType;
    defaultValue?: TType;
    onChange?(value: TType): void;
    by?: ByComparator<TType>;
    disabled?: boolean;
    form?: string;
    name?: string;
}>;
declare function RadioGroupFn<TTag extends ElementType = typeof DEFAULT_RADIO_GROUP_TAG, TType = string>(props: RadioGroupProps<TTag, TType>, ref: Ref<HTMLElement>): React.JSX.Element;
declare let DEFAULT_OPTION_TAG: "div";
type OptionRenderPropArg = {
    checked: boolean;
    /** @deprecated use `focus` instead */
    active: boolean;
    hover: boolean;
    focus: boolean;
    autofocus: boolean;
    disabled: boolean;
};
type OptionPropsWeControl = 'aria-checked' | 'aria-describedby' | 'aria-labelledby' | 'role' | 'tabIndex';
export type RadioOptionProps<TTag extends ElementType, TType> = Props<TTag, OptionRenderPropArg, OptionPropsWeControl, {
    value: TType;
    disabled?: boolean;
    autoFocus?: boolean;
}>;
declare function OptionFn<TTag extends ElementType = typeof DEFAULT_OPTION_TAG, TType = Parameters<typeof RadioGroupRoot>[0]['value']>(props: RadioOptionProps<TTag, TType>, ref: Ref<HTMLElement>): React.JSX.Element;
declare let DEFAULT_RADIO_TAG: "span";
type RadioRenderPropArg = {
    checked: boolean;
    hover: boolean;
    focus: boolean;
    autofocus: boolean;
    disabled: boolean;
};
type RadioPropsWeControl = 'aria-checked' | 'aria-describedby' | 'aria-labelledby' | 'role' | 'tabIndex';
export type RadioProps<TTag extends ElementType = typeof DEFAULT_RADIO_TAG, TType = string> = Props<TTag, RadioRenderPropArg, RadioPropsWeControl, {
    value: TType;
    disabled?: boolean;
    autoFocus?: boolean;
}>;
declare function RadioFn<TTag extends ElementType = typeof DEFAULT_RADIO_TAG, TType = Parameters<typeof RadioGroupRoot>[0]['value']>(props: RadioProps<TTag, TType>, ref: Ref<HTMLElement>): React.ReactElement<any, string | React.JSXElementConstructor<any>> | null;
export interface _internal_ComponentRadioGroup extends HasDisplayName {
    <TTag extends ElementType = typeof DEFAULT_RADIO_GROUP_TAG, TType = string>(props: RadioGroupProps<TTag, TType> & RefProp<typeof RadioGroupFn>): React.JSX.Element;
}
export interface _internal_ComponentRadioOption extends HasDisplayName {
    <TTag extends ElementType = typeof DEFAULT_OPTION_TAG, TType = string>(props: RadioOptionProps<TTag, TType> & RefProp<typeof OptionFn>): React.JSX.Element;
}
export interface _internal_ComponentRadio extends HasDisplayName {
    <TTag extends ElementType = typeof DEFAULT_RADIO_TAG, TType = string>(props: RadioProps<TTag, TType> & RefProp<typeof RadioFn>): React.JSX.Element;
}
export interface _internal_ComponentRadioLabel extends _internal_ComponentLabel {
}
export interface _internal_ComponentRadioDescription extends _internal_ComponentDescription {
}
declare let RadioGroupRoot: _internal_ComponentRadioGroup;
/** @deprecated use `<Radio>` instead of `<RadioGroupOption>` */
export declare let RadioGroupOption: _internal_ComponentRadioOption;
export declare let Radio: _internal_ComponentRadio;
/** @deprecated use `<Label>` instead of `<RadioGroupLabel>` */
export declare let RadioGroupLabel: _internal_ComponentRadioLabel;
/** @deprecated use `<Description>` instead of `<RadioGroupDescription>` */
export declare let RadioGroupDescription: _internal_ComponentRadioDescription;
export declare let RadioGroup: _internal_ComponentRadioGroup & {
    /** @deprecated use `<Radio>` instead of `<RadioGroup.Option>` */
    Option: _internal_ComponentRadioOption;
    /** @deprecated use `<Radio>` instead of `<RadioGroup.Radio>` */
    Radio: _internal_ComponentRadio;
    /** @deprecated use `<Label>` instead of `<RadioGroup.Label>` */
    Label: _internal_ComponentRadioLabel;
    /** @deprecated use `<Description>` instead of `<RadioGroup.Description>` */
    Description: _internal_ComponentRadioDescription;
};
export {};
