declare function defaultComparator<T>(a: T, z: T): boolean;
export declare let RadioGroup: import("vue").DefineComponent<{
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
    modelValue: {
        type: (ObjectConstructor | NumberConstructor | BooleanConstructor | StringConstructor)[];
        default: undefined;
    };
    defaultValue: {
        type: (ObjectConstructor | NumberConstructor | BooleanConstructor | StringConstructor)[];
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
    id: {
        type: StringConstructor;
        default: () => string;
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
    modelValue: {
        type: (ObjectConstructor | NumberConstructor | BooleanConstructor | StringConstructor)[];
        default: undefined;
    };
    defaultValue: {
        type: (ObjectConstructor | NumberConstructor | BooleanConstructor | StringConstructor)[];
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
    id: {
        type: StringConstructor;
        default: () => string;
    };
}>> & {
    "onUpdate:modelValue"?: ((_value: any) => any) | undefined;
}, {
    id: string;
    as: string | Record<string, any>;
    disabled: boolean;
    by: string | Function;
    modelValue: string | number | boolean | Record<string, any>;
    defaultValue: string | number | boolean | Record<string, any>;
}>;
export declare let RadioGroupOption: import("vue").DefineComponent<{
    as: {
        type: (ObjectConstructor | StringConstructor)[];
        default: string;
    };
    value: {
        type: (ObjectConstructor | NumberConstructor | BooleanConstructor | StringConstructor)[];
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
        type: (ObjectConstructor | NumberConstructor | BooleanConstructor | StringConstructor)[];
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
export declare let RadioGroupLabel: import("vue").DefineComponent<{
    as: {
        type: (ObjectConstructor | StringConstructor)[];
        default: string;
    };
    passive: {
        type: BooleanConstructor[];
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
    passive: {
        type: BooleanConstructor[];
        default: boolean;
    };
    id: {
        type: StringConstructor;
        default: () => string;
    };
}>>, {
    passive: boolean;
    id: string;
    as: string | Record<string, any>;
}>;
export declare let RadioGroupDescription: import("vue").DefineComponent<{
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
export {};
