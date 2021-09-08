import { Ref } from 'vue';
export declare let RadioGroup: import("vue").DefineComponent<{
    as: {
        type: (ObjectConstructor | StringConstructor)[];
        default: string;
    };
    disabled: {
        type: BooleanConstructor[];
        default: boolean;
    };
    modelValue: {
        type: (ObjectConstructor | StringConstructor | BooleanConstructor | NumberConstructor)[];
    };
}, {
    id: string;
    labelledby: import("vue").ComputedRef<string | undefined>;
    describedby: import("vue").ComputedRef<string | undefined>;
    el: Ref<HTMLElement | null>;
    handleKeyDown: (event: KeyboardEvent) => void;
}, unknown, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {
    'update:modelValue': (_value: any) => true;
}, string, import("vue").VNodeProps & import("vue").AllowedComponentProps & import("vue").ComponentCustomProps, Readonly<{
    as: string;
    disabled: boolean;
} & {
    modelValue?: unknown;
}>, {
    as: string;
    disabled: boolean;
}>;
declare enum OptionState {
    Empty = 1,
    Active = 2
}
export declare let RadioGroupOption: import("vue").DefineComponent<{
    as: {
        type: (ObjectConstructor | StringConstructor)[];
        default: string;
    };
    value: {
        type: (ObjectConstructor | StringConstructor | BooleanConstructor | NumberConstructor)[];
    };
    disabled: {
        type: BooleanConstructor;
        default: boolean;
    };
}, {
    id: string;
    el: Ref<HTMLElement | null>;
    labelledby: import("vue").ComputedRef<string | undefined>;
    describedby: import("vue").ComputedRef<string | undefined>;
    state: Ref<OptionState>;
    disabled: import("vue").ComputedRef<boolean>;
    checked: import("vue").ComputedRef<boolean>;
    tabIndex: import("vue").ComputedRef<0 | -1>;
    handleClick(): void;
    handleFocus(): void;
    handleBlur(): void;
}, unknown, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, Record<string, any>, string, import("vue").VNodeProps & import("vue").AllowedComponentProps & import("vue").ComponentCustomProps, Readonly<{
    as: string;
    disabled: boolean;
} & {
    value?: unknown;
}>, {
    as: string;
    disabled: boolean;
}>;
export declare let RadioGroupLabel: import("vue").DefineComponent<{
    as: {
        type: (ObjectConstructor | StringConstructor)[];
        default: string;
    };
    passive: {
        type: BooleanConstructor[];
        default: boolean;
    };
}, {
    id: string;
    context: {
        register(value: string): () => void;
        slot: Record<string, unknown>;
        name: string;
        props: Record<string, unknown>;
    };
}, unknown, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, Record<string, any>, string, import("vue").VNodeProps & import("vue").AllowedComponentProps & import("vue").ComponentCustomProps, Readonly<{
    as: string;
    passive: boolean;
} & {}>, {
    as: string;
    passive: boolean;
}>;
export declare let RadioGroupDescription: import("vue").DefineComponent<{
    as: {
        type: (ObjectConstructor | StringConstructor)[];
        default: string;
    };
}, {
    id: string;
    context: {
        register(value: string): () => void;
        slot: Ref<Record<string, any>>;
        name: string;
        props: Record<string, any>;
    };
}, unknown, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, Record<string, any>, string, import("vue").VNodeProps & import("vue").AllowedComponentProps & import("vue").ComponentCustomProps, Readonly<{
    as: string;
} & {}>, {
    as: string;
}>;
export {};
