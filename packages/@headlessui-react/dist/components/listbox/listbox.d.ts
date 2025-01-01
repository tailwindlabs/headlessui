import React, { type ElementType, type Ref } from 'react';
import { type ByComparator } from '../../hooks/use-by-comparator.js';
import { type AnchorPropsWithSelection } from '../../internal/floating.js';
import type { Props } from '../../types.js';
import { type HasDisplayName, type PropsForFeatures, type RefProp } from '../../utils/render.js';
import { type _internal_ComponentLabel } from '../label/label.js';
declare let DEFAULT_LISTBOX_TAG: React.ExoticComponent<{
    children?: React.ReactNode | undefined;
}>;
type ListboxRenderPropArg<T> = {
    open: boolean;
    disabled: boolean;
    invalid: boolean;
    value: T;
};
export type ListboxProps<TTag extends ElementType = typeof DEFAULT_LISTBOX_TAG, TType = string, TActualType = TType> = Props<TTag, ListboxRenderPropArg<TType>, 'value' | 'defaultValue' | 'onChange' | 'by' | 'disabled' | 'horizontal' | 'name' | 'multiple', {
    value?: TType;
    defaultValue?: TType;
    onChange?(value: TType): void;
    by?: ByComparator<TActualType>;
    disabled?: boolean;
    invalid?: boolean;
    horizontal?: boolean;
    form?: string;
    name?: string;
    multiple?: boolean;
    __demoMode?: boolean;
}>;
declare function ListboxFn<TTag extends ElementType = typeof DEFAULT_LISTBOX_TAG, TType = string, TActualType = TType extends (infer U)[] ? U : TType>(props: ListboxProps<TTag, TType, TActualType>, ref: Ref<HTMLElement>): React.JSX.Element;
declare let DEFAULT_BUTTON_TAG: "button";
type ButtonRenderPropArg = {
    disabled: boolean;
    invalid: boolean;
    hover: boolean;
    focus: boolean;
    autofocus: boolean;
    open: boolean;
    active: boolean;
    value: any;
};
type ButtonPropsWeControl = 'aria-controls' | 'aria-expanded' | 'aria-haspopup' | 'aria-labelledby' | 'disabled';
export type ListboxButtonProps<TTag extends ElementType = typeof DEFAULT_BUTTON_TAG> = Props<TTag, ButtonRenderPropArg, ButtonPropsWeControl, {
    autoFocus?: boolean;
    disabled?: boolean;
}>;
declare function ButtonFn<TTag extends ElementType = typeof DEFAULT_BUTTON_TAG>(props: ListboxButtonProps<TTag>, ref: Ref<HTMLButtonElement>): React.ReactElement<any, string | React.JSXElementConstructor<any>> | null;
declare let DEFAULT_OPTIONS_TAG: "div";
type OptionsRenderPropArg = {
    open: boolean;
};
type OptionsPropsWeControl = 'aria-activedescendant' | 'aria-labelledby' | 'aria-multiselectable' | 'aria-orientation' | 'role' | 'tabIndex';
declare let OptionsRenderFeatures: number;
export type ListboxOptionsProps<TTag extends ElementType = typeof DEFAULT_OPTIONS_TAG> = Props<TTag, OptionsRenderPropArg, OptionsPropsWeControl, {
    anchor?: AnchorPropsWithSelection;
    portal?: boolean;
    modal?: boolean;
    transition?: boolean;
} & PropsForFeatures<typeof OptionsRenderFeatures>>;
declare function OptionsFn<TTag extends ElementType = typeof DEFAULT_OPTIONS_TAG>(props: ListboxOptionsProps<TTag>, ref: Ref<HTMLElement>): React.JSX.Element;
declare let DEFAULT_OPTION_TAG: "div";
type OptionRenderPropArg = {
    /** @deprecated use `focus` instead */
    active: boolean;
    focus: boolean;
    selected: boolean;
    disabled: boolean;
    selectedOption: boolean;
};
type OptionPropsWeControl = 'aria-disabled' | 'aria-selected' | 'role' | 'tabIndex';
export type ListboxOptionProps<TTag extends ElementType = typeof DEFAULT_OPTION_TAG, TType = string> = Props<TTag, OptionRenderPropArg, OptionPropsWeControl, {
    disabled?: boolean;
    value: TType;
}>;
declare function OptionFn<TTag extends ElementType = typeof DEFAULT_OPTION_TAG, TType = Parameters<typeof ListboxRoot>[0]['value']>(props: ListboxOptionProps<TTag, TType>, ref: Ref<HTMLElement>): React.ReactElement<any, string | React.JSXElementConstructor<any>> | null;
declare let DEFAULT_SELECTED_OPTION_TAG: React.ExoticComponent<{
    children?: React.ReactNode | undefined;
}>;
type SelectedOptionRenderPropArg = {};
type SelectedOptionPropsWeControl = never;
export type ListboxSelectedOptionProps<TTag extends ElementType = typeof DEFAULT_SELECTED_OPTION_TAG> = Props<TTag, SelectedOptionRenderPropArg, SelectedOptionPropsWeControl, {
    options: React.ReactNode;
    placeholder?: React.ReactNode;
}>;
declare function SelectedFn<TTag extends ElementType = typeof DEFAULT_SELECTED_OPTION_TAG>(props: ListboxSelectedOptionProps<TTag>, ref: Ref<HTMLElement>): React.JSX.Element;
export interface _internal_ComponentListbox extends HasDisplayName {
    <TTag extends ElementType = typeof DEFAULT_LISTBOX_TAG, TType = string, TActualType = TType extends (infer U)[] ? U : TType>(props: ListboxProps<TTag, TType, TActualType> & RefProp<typeof ListboxFn>): React.JSX.Element;
}
export interface _internal_ComponentListboxButton extends HasDisplayName {
    <TTag extends ElementType = typeof DEFAULT_BUTTON_TAG>(props: ListboxButtonProps<TTag> & RefProp<typeof ButtonFn>): React.JSX.Element;
}
export interface _internal_ComponentListboxLabel extends _internal_ComponentLabel {
}
export interface _internal_ComponentListboxOptions extends HasDisplayName {
    <TTag extends ElementType = typeof DEFAULT_OPTIONS_TAG>(props: ListboxOptionsProps<TTag> & RefProp<typeof OptionsFn>): React.JSX.Element;
}
export interface _internal_ComponentListboxOption extends HasDisplayName {
    <TTag extends ElementType = typeof DEFAULT_OPTION_TAG, TType = Parameters<typeof ListboxRoot>[0]['value']>(props: ListboxOptionProps<TTag, TType> & RefProp<typeof OptionFn>): React.JSX.Element;
}
export interface _internal_ComponentListboxSelectedOption extends HasDisplayName {
    <TTag extends ElementType = typeof DEFAULT_SELECTED_OPTION_TAG>(props: ListboxSelectedOptionProps<TTag> & RefProp<typeof SelectedFn>): React.JSX.Element;
}
declare let ListboxRoot: _internal_ComponentListbox;
export declare let ListboxButton: _internal_ComponentListboxButton;
/** @deprecated use `<Label>` instead of `<ListboxLabel>` */
export declare let ListboxLabel: _internal_ComponentListboxLabel;
export declare let ListboxOptions: _internal_ComponentListboxOptions;
export declare let ListboxOption: _internal_ComponentListboxOption;
export declare let ListboxSelectedOption: _internal_ComponentListboxSelectedOption;
export declare let Listbox: _internal_ComponentListbox & {
    /** @deprecated use `<ListboxButton>` instead of `<Listbox.Button>` */
    Button: _internal_ComponentListboxButton;
    /** @deprecated use `<Label>` instead of `<Listbox.Label>` */
    Label: _internal_ComponentListboxLabel;
    /** @deprecated use `<ListboxOptions>` instead of `<Listbox.Options>` */
    Options: _internal_ComponentListboxOptions;
    /** @deprecated use `<ListboxOption>` instead of `<Listbox.Option>` */
    Option: _internal_ComponentListboxOption;
    /** @deprecated use `<ListboxSelectedOption>` instead of `<Listbox.SelectedOption>` */
    SelectedOption: _internal_ComponentListboxSelectedOption;
};
export {};
