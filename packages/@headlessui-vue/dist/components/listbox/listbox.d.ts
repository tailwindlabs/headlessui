import { type PropType } from 'vue';
declare function defaultComparator<T>(a: T, z: T): boolean;
export declare let Listbox: import("vue").DefineComponent<{
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
        default: () => typeof defaultComparator;
    };
    horizontal: {
        type: BooleanConstructor[];
        default: boolean;
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
    multiple: {
        type: BooleanConstructor[];
        default: boolean;
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
        default: () => typeof defaultComparator;
    };
    horizontal: {
        type: BooleanConstructor[];
        default: boolean;
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
    multiple: {
        type: BooleanConstructor[];
        default: boolean;
    };
}>> & {
    "onUpdate:modelValue"?: ((_value: any) => any) | undefined;
}, {
    as: string | Record<string, any>;
    disabled: boolean;
    horizontal: boolean;
    by: string | Function;
    modelValue: string | number | boolean | object | null;
    defaultValue: string | number | boolean | object | null;
    multiple: boolean;
}>;
export declare let ListboxLabel: import("vue").DefineComponent<{
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
export declare let ListboxButton: import("vue").DefineComponent<{
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
    static: {
        type: BooleanConstructor;
        default: boolean;
    };
    unmount: {
        type: BooleanConstructor;
        default: boolean;
    };
    id: {
        type: StringConstructor;
        default: () => string;
    };
}>>, {
    id: string;
    as: string | Record<string, any>;
    unmount: boolean;
    static: boolean;
}>;
export declare let ListboxOption: import("vue").DefineComponent<{
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
    value: {
        type: PropType<object | string | number | boolean | null>;
    };
    disabled: {
        type: BooleanConstructor;
        default: boolean;
    };
    id: {
        type: StringConstructor;
        default: () => string;
    };
}>>, {
    id: string;
    as: string | Record<string, any>;
    disabled: boolean;
}>;
export {};
