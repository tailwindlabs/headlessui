export declare let SwitchGroup: import("vue").DefineComponent<{
    as: {
        type: (ObjectConstructor | StringConstructor)[];
        default: string;
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
}>>, {
    as: string | Record<string, any>;
}>;
export declare let Switch: import("vue").DefineComponent<{
    as: {
        type: (ObjectConstructor | StringConstructor)[];
        default: string;
    };
    modelValue: {
        type: BooleanConstructor;
        default: undefined;
    };
    defaultChecked: {
        type: BooleanConstructor;
        optional: boolean;
    };
    form: {
        type: StringConstructor;
        optional: boolean;
    };
    name: {
        type: StringConstructor;
        optional: boolean;
    };
    value: {
        type: StringConstructor;
        optional: boolean;
    };
    id: {
        type: StringConstructor;
        default: () => string;
    };
    disabled: {
        type: BooleanConstructor;
        default: boolean;
    };
    tabIndex: {
        type: NumberConstructor;
        default: number;
    };
}, () => import("vue").VNode<import("vue").RendererNode, import("vue").RendererElement, {
    [key: string]: any;
}>, unknown, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {
    'update:modelValue': (_value: boolean) => true;
}, string, import("vue").VNodeProps & import("vue").AllowedComponentProps & import("vue").ComponentCustomProps, Readonly<import("vue").ExtractPropTypes<{
    as: {
        type: (ObjectConstructor | StringConstructor)[];
        default: string;
    };
    modelValue: {
        type: BooleanConstructor;
        default: undefined;
    };
    defaultChecked: {
        type: BooleanConstructor;
        optional: boolean;
    };
    form: {
        type: StringConstructor;
        optional: boolean;
    };
    name: {
        type: StringConstructor;
        optional: boolean;
    };
    value: {
        type: StringConstructor;
        optional: boolean;
    };
    id: {
        type: StringConstructor;
        default: () => string;
    };
    disabled: {
        type: BooleanConstructor;
        default: boolean;
    };
    tabIndex: {
        type: NumberConstructor;
        default: number;
    };
}>> & {
    "onUpdate:modelValue"?: ((_value: boolean) => any) | undefined;
}, {
    id: string;
    tabIndex: number;
    as: string | Record<string, any>;
    disabled: boolean;
    modelValue: boolean;
    defaultChecked: boolean;
}>;
export declare let SwitchLabel: import("vue").DefineComponent<{
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
export declare let SwitchDescription: import("vue").DefineComponent<{
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
