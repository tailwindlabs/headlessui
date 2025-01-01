import React, { type ElementType, type Ref } from 'react';
import { type ByComparator } from '../../hooks/use-by-comparator.js';
import { type AnchorProps } from '../../internal/floating.js';
import type { EnsureArray, Props } from '../../types.js';
import { type HasDisplayName, type PropsForFeatures, type RefProp } from '../../utils/render.js';
import { type _internal_ComponentLabel } from '../label/label.js';
declare let DEFAULT_COMBOBOX_TAG: React.ExoticComponent<{
    children?: React.ReactNode | undefined;
}>;
type ComboboxRenderPropArg<TValue, TActive = TValue> = {
    open: boolean;
    disabled: boolean;
    activeIndex: number | null;
    activeOption: TActive | null;
    value: TValue;
};
export type ComboboxProps<TValue, TMultiple extends boolean | undefined, TTag extends ElementType = typeof DEFAULT_COMBOBOX_TAG> = Props<TTag, ComboboxRenderPropArg<NoInfer<TValue>>, 'value' | 'defaultValue' | 'multiple' | 'onChange' | 'by', {
    value?: TMultiple extends true ? EnsureArray<TValue> : TValue;
    defaultValue?: TMultiple extends true ? EnsureArray<NoInfer<TValue>> : NoInfer<TValue>;
    onChange?(value: TMultiple extends true ? EnsureArray<NoInfer<TValue>> : NoInfer<TValue> | null): void;
    by?: ByComparator<TMultiple extends true ? EnsureArray<NoInfer<TValue>>[number] : NoInfer<TValue>>;
    /** @deprecated The `<Combobox />` is now nullable default */
    nullable?: boolean;
    multiple?: TMultiple;
    disabled?: boolean;
    form?: string;
    name?: string;
    immediate?: boolean;
    virtual?: {
        options: TMultiple extends true ? EnsureArray<NoInfer<TValue>> : NoInfer<TValue>[];
        disabled?: (value: TMultiple extends true ? EnsureArray<NoInfer<TValue>>[number] : NoInfer<TValue>) => boolean;
    } | null;
    onClose?(): void;
    __demoMode?: boolean;
}>;
declare function ComboboxFn<TValue, TTag extends ElementType = typeof DEFAULT_COMBOBOX_TAG>(props: ComboboxProps<TValue, boolean | undefined, TTag>, ref: Ref<HTMLElement>): React.JSX.Element;
declare let DEFAULT_INPUT_TAG: "input";
type InputRenderPropArg = {
    open: boolean;
    disabled: boolean;
    hover: boolean;
    focus: boolean;
    autofocus: boolean;
};
type InputPropsWeControl = 'aria-activedescendant' | 'aria-autocomplete' | 'aria-controls' | 'aria-expanded' | 'aria-labelledby' | 'disabled' | 'role';
export type ComboboxInputProps<TTag extends ElementType = typeof DEFAULT_INPUT_TAG, TType = string> = Props<TTag, InputRenderPropArg, InputPropsWeControl, {
    defaultValue?: TType;
    disabled?: boolean;
    displayValue?(item: TType): string;
    onChange?(event: React.ChangeEvent<HTMLInputElement>): void;
    autoFocus?: boolean;
    autocomplete?: {
        type: HTMLInputElement['autocomplete'];
        default: 'off';
    };
}>;
declare function InputFn<TTag extends ElementType = typeof DEFAULT_INPUT_TAG, TType = Parameters<typeof ComboboxRoot>[0]['value']>(props: ComboboxInputProps<TTag, TType>, ref: Ref<HTMLInputElement>): React.ReactElement<any, string | React.JSXElementConstructor<any>> | null;
declare let DEFAULT_BUTTON_TAG: "button";
type ButtonRenderPropArg = {
    open: boolean;
    active: boolean;
    disabled: boolean;
    value: any;
    focus: boolean;
    hover: boolean;
};
type ButtonPropsWeControl = 'aria-controls' | 'aria-expanded' | 'aria-haspopup' | 'aria-labelledby' | 'disabled' | 'tabIndex';
export type ComboboxButtonProps<TTag extends ElementType = typeof DEFAULT_BUTTON_TAG> = Props<TTag, ButtonRenderPropArg, ButtonPropsWeControl, {
    autoFocus?: boolean;
    disabled?: boolean;
}>;
declare function ButtonFn<TTag extends ElementType = typeof DEFAULT_BUTTON_TAG>(props: ComboboxButtonProps<TTag>, ref: Ref<HTMLButtonElement>): React.ReactElement<any, string | React.JSXElementConstructor<any>> | null;
declare let DEFAULT_OPTIONS_TAG: "div";
type OptionsRenderPropArg = {
    open: boolean;
    option: any;
};
type OptionsPropsWeControl = 'aria-labelledby' | 'aria-multiselectable' | 'role' | 'tabIndex';
declare let OptionsRenderFeatures: number;
export type ComboboxOptionsProps<TTag extends ElementType = typeof DEFAULT_OPTIONS_TAG> = Props<TTag, OptionsRenderPropArg, OptionsPropsWeControl, PropsForFeatures<typeof OptionsRenderFeatures> & {
    hold?: boolean;
    anchor?: AnchorProps;
    portal?: boolean;
    modal?: boolean;
    transition?: boolean;
}>;
declare function OptionsFn<TTag extends ElementType = typeof DEFAULT_OPTIONS_TAG>(props: ComboboxOptionsProps<TTag>, ref: Ref<HTMLElement>): React.JSX.Element;
declare let DEFAULT_OPTION_TAG: "div";
type OptionRenderPropArg = {
    focus: boolean;
    /** @deprecated use `focus` instead */
    active: boolean;
    selected: boolean;
    disabled: boolean;
};
type OptionPropsWeControl = 'role' | 'tabIndex' | 'aria-disabled' | 'aria-selected';
export type ComboboxOptionProps<TTag extends ElementType = typeof DEFAULT_OPTION_TAG, TType = string> = Props<TTag, OptionRenderPropArg, OptionPropsWeControl, {
    disabled?: boolean;
    value: TType;
    order?: number;
}>;
declare function OptionFn<TTag extends ElementType = typeof DEFAULT_OPTION_TAG, TType = Parameters<typeof ComboboxRoot>[0]['value']>(props: ComboboxOptionProps<TTag, TType>, ref: Ref<HTMLElement>): React.ReactElement<any, string | React.JSXElementConstructor<any>> | null;
export interface _internal_ComponentCombobox extends HasDisplayName {
    <TValue, TMultiple extends boolean | undefined = false, TTag extends ElementType = typeof DEFAULT_COMBOBOX_TAG>(props: ComboboxProps<TValue, TMultiple, TTag> & RefProp<typeof ComboboxFn>): React.JSX.Element;
}
export interface _internal_ComponentComboboxButton extends HasDisplayName {
    <TTag extends ElementType = typeof DEFAULT_BUTTON_TAG>(props: ComboboxButtonProps<TTag> & RefProp<typeof ButtonFn>): React.JSX.Element;
}
export interface _internal_ComponentComboboxInput extends HasDisplayName {
    <TType, TTag extends ElementType = typeof DEFAULT_INPUT_TAG>(props: ComboboxInputProps<TTag, TType> & RefProp<typeof InputFn>): React.JSX.Element;
}
export interface _internal_ComponentComboboxLabel extends _internal_ComponentLabel {
}
export interface _internal_ComponentComboboxOptions extends HasDisplayName {
    <TTag extends ElementType = typeof DEFAULT_OPTIONS_TAG>(props: ComboboxOptionsProps<TTag> & RefProp<typeof OptionsFn>): React.JSX.Element;
}
export interface _internal_ComponentComboboxOption extends HasDisplayName {
    <TTag extends ElementType = typeof DEFAULT_OPTION_TAG, TType = Parameters<typeof ComboboxRoot>[0]['value']>(props: ComboboxOptionProps<TTag, TType> & RefProp<typeof OptionFn>): React.JSX.Element;
}
declare let ComboboxRoot: _internal_ComponentCombobox;
export declare let ComboboxButton: _internal_ComponentComboboxButton;
export declare let ComboboxInput: _internal_ComponentComboboxInput;
/** @deprecated use `<Label>` instead of `<ComboboxLabel>` */
export declare let ComboboxLabel: _internal_ComponentComboboxLabel;
export declare let ComboboxOptions: _internal_ComponentComboboxOptions;
export declare let ComboboxOption: _internal_ComponentComboboxOption;
export declare let Combobox: _internal_ComponentCombobox & {
    /** @deprecated use `<ComboboxInput>` instead of `<Combobox.Input>` */
    Input: _internal_ComponentComboboxInput;
    /** @deprecated use `<ComboboxButton>` instead of `<Combobox.Button>` */
    Button: _internal_ComponentComboboxButton;
    /** @deprecated use `<Label>` instead of `<Combobox.Label>` */
    Label: _internal_ComponentComboboxLabel;
    /** @deprecated use `<ComboboxOptions>` instead of `<Combobox.Options>` */
    Options: _internal_ComponentComboboxOptions;
    /** @deprecated use `<ComboboxOption>` instead of `<Combobox.Option>` */
    Option: _internal_ComponentComboboxOption;
};
export {};
