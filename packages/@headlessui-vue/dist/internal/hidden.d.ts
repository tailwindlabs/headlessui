import { type PropType } from 'vue';
export declare enum Features {
    None = 1,
    Focusable = 2,
    Hidden = 4
}
export declare let Hidden: import("vue").DefineComponent<{
    as: {
        type: (ObjectConstructor | StringConstructor)[];
        default: string;
    };
    features: {
        type: PropType<Features>;
        default: Features;
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
    features: {
        type: PropType<Features>;
        default: Features;
    };
}>>, {
    features: Features;
    as: string | Record<string, any>;
}>;
