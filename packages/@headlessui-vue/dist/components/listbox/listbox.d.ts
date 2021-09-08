import { Ref, ComputedRef } from 'vue';
export declare let Listbox: import("vue").DefineComponent<{
    as: {
        type: (ObjectConstructor | StringConstructor)[];
        default: string;
    };
    disabled: {
        type: BooleanConstructor[];
        default: boolean;
    };
    horizontal: {
        type: BooleanConstructor[];
        default: boolean;
    };
    modelValue: {
        type: (ObjectConstructor | StringConstructor | BooleanConstructor | NumberConstructor)[];
    };
}, () => import("vue").VNode<import("vue").RendererNode, import("vue").RendererElement, {
    [key: string]: any;
}> | import("vue").VNode<import("vue").RendererNode, import("vue").RendererElement, {
    [key: string]: any;
}>[] | null | undefined, unknown, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {
    'update:modelValue': (_value: any) => true;
}, string, import("vue").VNodeProps & import("vue").AllowedComponentProps & import("vue").ComponentCustomProps, Readonly<{
    horizontal: boolean;
    as: string;
    disabled: boolean;
} & {
    modelValue?: unknown;
}>, {
    horizontal: boolean;
    as: string;
    disabled: boolean;
}>;
export declare let ListboxLabel: import("vue").DefineComponent<{
    as: {
        type: (ObjectConstructor | StringConstructor)[];
        default: string;
    };
}, {
    id: string;
    el: Ref<HTMLLabelElement | null>;
    handleClick(): void;
}, unknown, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, Record<string, any>, string, import("vue").VNodeProps & import("vue").AllowedComponentProps & import("vue").ComponentCustomProps, Readonly<{
    as: string;
} & {}>, {
    as: string;
}>;
export declare let ListboxButton: import("vue").DefineComponent<{
    as: {
        type: (ObjectConstructor | StringConstructor)[];
        default: string;
    };
}, {
    id: string;
    el: Ref<HTMLButtonElement | null>;
    type: Ref<unknown>;
    handleKeyDown: (event: KeyboardEvent) => void;
    handleKeyUp: (event: KeyboardEvent) => void;
    handleClick: (event: MouseEvent) => void;
}, unknown, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, Record<string, any>, string, import("vue").VNodeProps & import("vue").AllowedComponentProps & import("vue").ComponentCustomProps, Readonly<{
    as: string;
} & {}>, {
    as: string;
}>;
export declare let ListboxOptions: import("vue").DefineComponent<{
    as: {
        type: (ObjectConstructor | StringConstructor)[];
        default: string;
    };
    static: {
        type: BooleanConstructor;
        default: boolean;
    };
    unmount: {
        type: BooleanConstructor;
        default: boolean;
    };
}, {
    id: string;
    el: Ref<HTMLDivElement | null>;
    handleKeyDown: (event: KeyboardEvent) => void;
    visible: ComputedRef<boolean>;
}, unknown, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, Record<string, any>, string, import("vue").VNodeProps & import("vue").AllowedComponentProps & import("vue").ComponentCustomProps, Readonly<{
    as: string;
    unmount: boolean;
    static: boolean;
} & {}>, {
    as: string;
    unmount: boolean;
    static: boolean;
}>;
export declare let ListboxOption: import("vue").DefineComponent<{
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
}, () => import("vue").VNode<import("vue").RendererNode, import("vue").RendererElement, {
    [key: string]: any;
}> | import("vue").VNode<import("vue").RendererNode, import("vue").RendererElement, {
    [key: string]: any;
}>[] | null | undefined, unknown, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, Record<string, any>, string, import("vue").VNodeProps & import("vue").AllowedComponentProps & import("vue").ComponentCustomProps, Readonly<{
    as: string;
    disabled: boolean;
} & {
    value?: unknown;
}>, {
    as: string;
    disabled: boolean;
}>;
