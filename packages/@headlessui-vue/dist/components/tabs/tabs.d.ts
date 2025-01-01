export declare let TabGroup: import("vue").DefineComponent<{
    as: {
        type: (ObjectConstructor | StringConstructor)[];
        default: string;
    };
    selectedIndex: {
        type: NumberConstructor[];
        default: null;
    };
    defaultIndex: {
        type: NumberConstructor[];
        default: number;
    };
    vertical: {
        type: BooleanConstructor[];
        default: boolean;
    };
    manual: {
        type: BooleanConstructor[];
        default: boolean;
    };
}, () => import("vue").VNode<import("vue").RendererNode, import("vue").RendererElement, {
    [key: string]: any;
}>, unknown, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {
    change: (_index: number) => true;
}, string, import("vue").VNodeProps & import("vue").AllowedComponentProps & import("vue").ComponentCustomProps, Readonly<import("vue").ExtractPropTypes<{
    as: {
        type: (ObjectConstructor | StringConstructor)[];
        default: string;
    };
    selectedIndex: {
        type: NumberConstructor[];
        default: null;
    };
    defaultIndex: {
        type: NumberConstructor[];
        default: number;
    };
    vertical: {
        type: BooleanConstructor[];
        default: boolean;
    };
    manual: {
        type: BooleanConstructor[];
        default: boolean;
    };
}>> & {
    onChange?: ((_index: number) => any) | undefined;
}, {
    as: string | Record<string, any>;
    vertical: boolean;
    manual: boolean;
    selectedIndex: number;
    defaultIndex: number;
}>;
export declare let TabList: import("vue").DefineComponent<{
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
export declare let Tab: import("vue").DefineComponent<{
    as: {
        type: (ObjectConstructor | StringConstructor)[];
        default: string;
    };
    disabled: {
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
    disabled: {
        type: BooleanConstructor[];
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
export declare let TabPanels: import("vue").DefineComponent<{
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
export declare let TabPanel: import("vue").DefineComponent<{
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
    tabIndex: {
        type: NumberConstructor;
        default: number;
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
    tabIndex: {
        type: NumberConstructor;
        default: number;
    };
}>>, {
    id: string;
    tabIndex: number;
    as: string | Record<string, any>;
    unmount: boolean;
    static: boolean;
}>;
