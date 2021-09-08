import { Ref } from 'vue';
export declare let Disclosure: import("vue").DefineComponent<{
    as: {
        type: (ObjectConstructor | StringConstructor)[];
        default: string;
    };
    defaultOpen: {
        type: BooleanConstructor[];
        default: boolean;
    };
}, () => import("vue").VNode<import("vue").RendererNode, import("vue").RendererElement, {
    [key: string]: any;
}> | import("vue").VNode<import("vue").RendererNode, import("vue").RendererElement, {
    [key: string]: any;
}>[] | null | undefined, unknown, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, Record<string, any>, string, import("vue").VNodeProps & import("vue").AllowedComponentProps & import("vue").ComponentCustomProps, Readonly<{
    as: string;
    defaultOpen: boolean;
} & {}>, {
    as: string;
    defaultOpen: boolean;
}>;
export declare let DisclosureButton: import("vue").DefineComponent<{
    as: {
        type: (ObjectConstructor | StringConstructor)[];
        default: string;
    };
    disabled: {
        type: BooleanConstructor[];
        default: boolean;
    };
}, {
    isWithinPanel: boolean;
    id: string;
    el: Ref<null>;
    type: Ref<unknown>;
    handleClick(): void;
    handleKeyDown(event: KeyboardEvent): void;
    handleKeyUp(event: KeyboardEvent): void;
}, unknown, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, Record<string, any>, string, import("vue").VNodeProps & import("vue").AllowedComponentProps & import("vue").ComponentCustomProps, Readonly<{
    as: string;
    disabled: boolean;
} & {}>, {
    as: string;
    disabled: boolean;
}>;
export declare let DisclosurePanel: import("vue").DefineComponent<{
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
    el: Ref<HTMLElement | null>;
    visible: import("vue").ComputedRef<boolean>;
}, unknown, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, Record<string, any>, string, import("vue").VNodeProps & import("vue").AllowedComponentProps & import("vue").ComponentCustomProps, Readonly<{
    as: string;
    unmount: boolean;
    static: boolean;
} & {}>, {
    as: string;
    unmount: boolean;
    static: boolean;
}>;
