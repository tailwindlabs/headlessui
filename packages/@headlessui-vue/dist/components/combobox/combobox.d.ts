import { type PropType } from 'vue';
export declare let Combobox: import("vue").DefineComponent<{
    as: {
        type: (ObjectConstructor | StringConstructor)[];
        default: string;
    };
    disabled: {
        type: BooleanConstructor[];
        default: boolean;
    };
    by: {
        type: (StringConstructor | FunctionConstructor)[];
        nullable: boolean;
        default: null;
    };
    modelValue: {
        type: PropType<object | string | number | boolean | null>;
        default: undefined;
    };
    defaultValue: {
        type: PropType<object | string | number | boolean | null>;
        default: undefined;
    };
    form: {
        type: StringConstructor;
        optional: boolean;
    };
    name: {
        type: StringConstructor;
        optional: boolean;
    };
    nullable: {
        type: BooleanConstructor;
        default: boolean;
    };
    multiple: {
        type: BooleanConstructor[];
        default: boolean;
    };
    immediate: {
        type: BooleanConstructor[];
        default: boolean;
    };
    virtual: {
        type: PropType<null | {
            options: unknown[];
            disabled?: (value: unknown) => boolean;
        }>;
        default: null;
    };
}, () => import("vue").VNode<import("vue").RendererNode, import("vue").RendererElement, {
    [key: string]: any;
}>, unknown, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {
    'update:modelValue': (_value: any) => true;
}, string, import("vue").VNodeProps & import("vue").AllowedComponentProps & import("vue").ComponentCustomProps, Readonly<import("vue").ExtractPropTypes<{
    as: {
        type: (ObjectConstructor | StringConstructor)[];
        default: string;
    };
    disabled: {
        type: BooleanConstructor[];
        default: boolean;
    };
    by: {
        type: (StringConstructor | FunctionConstructor)[];
        nullable: boolean;
        default: null;
    };
    modelValue: {
        type: PropType<object | string | number | boolean | null>;
        default: undefined;
    };
    defaultValue: {
        type: PropType<object | string | number | boolean | null>;
        default: undefined;
    };
    form: {
        type: StringConstructor;
        optional: boolean;
    };
    name: {
        type: StringConstructor;
        optional: boolean;
    };
    nullable: {
        type: BooleanConstructor;
        default: boolean;
    };
    multiple: {
        type: BooleanConstructor[];
        default: boolean;
    };
    immediate: {
        type: BooleanConstructor[];
        default: boolean;
    };
    virtual: {
        type: PropType<null | {
            options: unknown[];
            disabled?: (value: unknown) => boolean;
        }>;
        default: null;
    };
}>> & {
    "onUpdate:modelValue"?: ((_value: any) => any) | undefined;
}, {
    as: string | Record<string, any>;
    disabled: boolean;
    by: string | Function;
    modelValue: string | number | boolean | object | null;
    defaultValue: string | number | boolean | object | null;
    nullable: boolean;
    multiple: boolean;
    immediate: boolean;
    virtual: {
        options: unknown[];
        disabled?: (value: unknown) => boolean;
    } | null;
}>;
export declare let ComboboxLabel: import("vue").DefineComponent<{
    as: {
        type: (ObjectConstructor | StringConstructor)[];
        default: string;
    };
    id: {
        type: StringConstructor;
        default: () => string;
    };
}, () => import("vue").VNode<import("vue").RendererNode, import("vue").RendererElement, {
    [key: string]: any;
}> | import("vue").VNode<import("vue").RendererNode, import("vue").RendererElement, {
    [key: string]: any;
}>[] | null, unknown, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, Record<string, any>, string, import("vue").VNodeProps & import("vue").AllowedComponentProps & import("vue").ComponentCustomProps, Readonly<import("vue").ExtractPropTypes<{
    as: {
        type: (ObjectConstructor | StringConstructor)[];
        default: string;
    };
    id: {
        type: StringConstructor;
        default: () => string;
    };
}>>, {
    id: string;
    as: string | Record<string, any>;
}>;
export declare let ComboboxButton: import("vue").DefineComponent<{
    as: {
        type: (ObjectConstructor | StringConstructor)[];
        default: string;
    };
    id: {
        type: StringConstructor;
        default: () => string;
    };
}, () => import("vue").VNode<import("vue").RendererNode, import("vue").RendererElement, {
    [key: string]: any;
}> | import("vue").VNode<import("vue").RendererNode, import("vue").RendererElement, {
    [key: string]: any;
}>[] | null, unknown, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, Record<string, any>, string, import("vue").VNodeProps & import("vue").AllowedComponentProps & import("vue").ComponentCustomProps, Readonly<import("vue").ExtractPropTypes<{
    as: {
        type: (ObjectConstructor | StringConstructor)[];
        default: string;
    };
    id: {
        type: StringConstructor;
        default: () => string;
    };
}>>, {
    id: string;
    as: string | Record<string, any>;
}>;
export declare let ComboboxInput: import("vue").DefineComponent<{
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
    displayValue: {
        type: PropType<(item: unknown) => string>;
    };
    defaultValue: {
        type: StringConstructor;
        default: undefined;
    };
    id: {
        type: StringConstructor;
        default: () => string;
    };
    autocomplete: {
        type: PropType<HTMLInputElement["autocomplete"]>;
        default: string;
    };
}, () => import("vue").VNode<import("vue").RendererNode, import("vue").RendererElement, {
    [key: string]: any;
}> | import("vue").VNode<import("vue").RendererNode, import("vue").RendererElement, {
    [key: string]: any;
}>[] | null, unknown, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {
    change: (_value: Event & {
        target: HTMLInputElement;
    }) => true;
}, string, import("vue").VNodeProps & import("vue").AllowedComponentProps & import("vue").ComponentCustomProps, Readonly<import("vue").ExtractPropTypes<{
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
    displayValue: {
        type: PropType<(item: unknown) => string>;
    };
    defaultValue: {
        type: StringConstructor;
        default: undefined;
    };
    id: {
        type: StringConstructor;
        default: () => string;
    };
    autocomplete: {
        type: PropType<HTMLInputElement["autocomplete"]>;
        default: string;
    };
}>> & {
    onChange?: ((_value: Event & {
        target: HTMLInputElement;
    }) => any) | undefined;
}, {
    id: string;
    as: string | Record<string, any>;
    unmount: boolean;
    static: boolean;
    defaultValue: string;
    autocomplete: AutoFill;
}>;
export declare let ComboboxOptions: import("vue").DefineComponent<{
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
    hold: {
        type: BooleanConstructor[];
        default: boolean;
    };
}, () => import("vue").VNode<import("vue").RendererNode, import("vue").RendererElement, {
    [key: string]: any;
}> | import("vue").VNode<import("vue").RendererNode, import("vue").RendererElement, {
    [key: string]: any;
}>[] | null, unknown, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, Record<string, any>, string, import("vue").VNodeProps & import("vue").AllowedComponentProps & import("vue").ComponentCustomProps, Readonly<import("vue").ExtractPropTypes<{
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
    hold: {
        type: BooleanConstructor[];
        default: boolean;
    };
}>>, {
    as: string | Record<string, any>;
    unmount: boolean;
    static: boolean;
    hold: boolean;
}>;
export declare let ComboboxOption: import("vue").DefineComponent<{
    as: {
        type: (ObjectConstructor | StringConstructor)[];
        default: string;
    };
    value: {
        type: PropType<object | string | number | boolean | null>;
    };
    disabled: {
        type: BooleanConstructor;
        default: boolean;
    };
    order: {
        type: NumberConstructor[];
        default: null;
    };
}, () => import("vue").VNode<import("vue").RendererNode, import("vue").RendererElement, {
    [key: string]: any;
}> | import("vue").VNode<import("vue").RendererNode, import("vue").RendererElement, {
    [key: string]: any;
}>[] | null, unknown, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, Record<string, any>, string, import("vue").VNodeProps & import("vue").AllowedComponentProps & import("vue").ComponentCustomProps, Readonly<import("vue").ExtractPropTypes<{
    as: {
        type: (ObjectConstructor | StringConstructor)[];
        default: string;
    };
    value: {
        type: PropType<object | string | number | boolean | null>;
    };
    disabled: {
        type: BooleanConstructor;
        default: boolean;
    };
    order: {
        type: NumberConstructor[];
        default: null;
    };
}>>, {
    as: string | Record<string, any>;
    disabled: boolean;
    order: number;
}>;
