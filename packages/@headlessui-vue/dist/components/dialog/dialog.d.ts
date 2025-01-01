import { type PropType } from 'vue';
export declare let Dialog: import("vue").DefineComponent<{
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
    open: {
        type: (BooleanConstructor | StringConstructor)[];
        default: string;
    };
    initialFocus: {
        type: PropType<HTMLElement | null>;
        default: null;
    };
    id: {
        type: StringConstructor;
        default: () => string;
    };
    role: {
        type: PropType<"dialog" | "alertdialog">;
        default: string;
    };
}, () => import("vue").VNode<import("vue").RendererNode, import("vue").RendererElement, {
    [key: string]: any;
}>, unknown, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {
    close: (_close: boolean) => true;
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
    open: {
        type: (BooleanConstructor | StringConstructor)[];
        default: string;
    };
    initialFocus: {
        type: PropType<HTMLElement | null>;
        default: null;
    };
    id: {
        type: StringConstructor;
        default: () => string;
    };
    role: {
        type: PropType<"dialog" | "alertdialog">;
        default: string;
    };
}>> & {
    onClose?: ((_close: boolean) => any) | undefined;
}, {
    id: string;
    role: "dialog" | "alertdialog";
    as: string | Record<string, any>;
    unmount: boolean;
    static: boolean;
    open: string | boolean;
    initialFocus: HTMLElement | null;
}>;
export declare let DialogOverlay: import("vue").DefineComponent<{
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
export declare let DialogBackdrop: import("vue").DefineComponent<{
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
}>, unknown, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, Record<string, any>, string, import("vue").VNodeProps & import("vue").AllowedComponentProps & import("vue").ComponentCustomProps, Readonly<import("vue").ExtractPropTypes<{
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
export declare let DialogPanel: import("vue").DefineComponent<{
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
export declare let DialogTitle: import("vue").DefineComponent<{
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
export declare let DialogDescription: import("vue").DefineComponent<{
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
