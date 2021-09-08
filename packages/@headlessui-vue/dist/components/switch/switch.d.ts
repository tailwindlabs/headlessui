import { Ref } from 'vue';
export declare let SwitchGroup: import("vue").DefineComponent<{
    as: {
        type: (ObjectConstructor | StringConstructor)[];
        default: string;
    };
}, () => import("vue").VNode<import("vue").RendererNode, import("vue").RendererElement, {
    [key: string]: any;
}> | import("vue").VNode<import("vue").RendererNode, import("vue").RendererElement, {
    [key: string]: any;
}>[] | null | undefined, unknown, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, Record<string, any>, string, import("vue").VNodeProps & import("vue").AllowedComponentProps & import("vue").ComponentCustomProps, Readonly<{
    as: string;
} & {}>, {
    as: string;
}>;
export declare let Switch: import("vue").DefineComponent<{
    as: {
        type: (ObjectConstructor | StringConstructor)[];
        default: string;
    };
    modelValue: {
        type: BooleanConstructor;
        default: boolean;
    };
}, {
    id: string;
    el: Ref<HTMLButtonElement | null>;
    type: Ref<unknown>;
    labelledby: Ref<string | undefined> | undefined;
    describedby: Ref<string | undefined> | undefined;
    handleClick(event: MouseEvent): void;
    handleKeyUp(event: KeyboardEvent): void;
    handleKeyPress(event: KeyboardEvent): void;
}, unknown, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {
    'update:modelValue': (_value: boolean) => true;
}, string, import("vue").VNodeProps & import("vue").AllowedComponentProps & import("vue").ComponentCustomProps, Readonly<{
    as: string;
    modelValue: boolean;
} & {}>, {
    as: string;
    modelValue: boolean;
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
}, {
    id: string;
    context: {
        register(value: string): () => void;
        slot: Record<string, unknown>;
        name: string;
        props: Record<string, unknown>;
    };
}, unknown, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, Record<string, any>, string, import("vue").VNodeProps & import("vue").AllowedComponentProps & import("vue").ComponentCustomProps, Readonly<{
    as: string;
    passive: boolean;
} & {}>, {
    as: string;
    passive: boolean;
}>;
export declare let SwitchDescription: import("vue").DefineComponent<{
    as: {
        type: (ObjectConstructor | StringConstructor)[];
        default: string;
    };
}, {
    id: string;
    context: {
        register(value: string): () => void;
        slot: Ref<Record<string, any>>;
        name: string;
        props: Record<string, any>;
    };
}, unknown, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, Record<string, any>, string, import("vue").VNodeProps & import("vue").AllowedComponentProps & import("vue").ComponentCustomProps, Readonly<{
    as: string;
} & {}>, {
    as: string;
}>;
