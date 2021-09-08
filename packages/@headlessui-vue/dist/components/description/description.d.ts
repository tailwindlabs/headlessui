import { ComputedRef, Ref } from 'vue';
export declare function useDescriptions({ slot, name, props, }?: {
    slot?: Ref<Record<string, unknown>>;
    name?: string;
    props?: Record<string, unknown>;
}): ComputedRef<string | undefined>;
export declare let Description: import("vue").DefineComponent<{
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
