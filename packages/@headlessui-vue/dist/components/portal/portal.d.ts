import { type PropType, type Ref } from 'vue';
export declare let Portal: import("vue").DefineComponent<{
    as: {
        type: (ObjectConstructor | StringConstructor)[];
        default: string;
    };
}, () => import("vue").VNode<import("vue").RendererNode, import("vue").RendererElement, {
    [key: string]: any;
}> | null, unknown, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, Record<string, any>, string, import("vue").VNodeProps & import("vue").AllowedComponentProps & import("vue").ComponentCustomProps, Readonly<import("vue").ExtractPropTypes<{
    as: {
        type: (ObjectConstructor | StringConstructor)[];
        default: string;
    };
}>>, {
    as: string | Record<string, any>;
}>;
export declare function useNestedPortals(): readonly [Ref<HTMLElement[]>, import("vue").DefineComponent<{}, () => import("vue").VNode<import("vue").RendererNode, import("vue").RendererElement, {
    [key: string]: any;
}>[] | undefined, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, import("vue").EmitsOptions, string, import("vue").VNodeProps & import("vue").AllowedComponentProps & import("vue").ComponentCustomProps, Readonly<import("vue").ExtractPropTypes<{}>>, {}>];
export declare let PortalGroup: import("vue").DefineComponent<{
    as: {
        type: (ObjectConstructor | StringConstructor)[];
        default: string;
    };
    target: {
        type: PropType<HTMLElement | null>;
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
    target: {
        type: PropType<HTMLElement | null>;
        default: null;
    };
}>>, {
    as: string | Record<string, any>;
    target: HTMLElement | null;
}>;
