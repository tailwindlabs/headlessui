import { ComputedRef } from 'vue';
export declare function useLabels({ slot, name, props, }?: {
    slot?: Record<string, unknown>;
    name?: string;
    props?: Record<string, unknown>;
}): ComputedRef<string | undefined>;
export declare let Label: import("vue").DefineComponent<{
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
