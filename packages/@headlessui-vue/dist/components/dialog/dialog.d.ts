import { PropType, Ref } from 'vue';
declare enum DialogStates {
    Open = 0,
    Closed = 1
}
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
        type: (StringConstructor | BooleanConstructor)[];
        default: string;
    };
    initialFocus: {
        type: PropType<HTMLElement | null>;
        default: null;
    };
}, {
    id: string;
    el: Ref<HTMLDivElement | null>;
    dialogRef: Ref<HTMLDivElement | null>;
    containers: Ref<Set<HTMLElement>>;
    dialogState: import("vue").ComputedRef<DialogStates>;
    titleId: Ref<string | null>;
    describedby: import("vue").ComputedRef<string | undefined>;
    visible: import("vue").ComputedRef<boolean>;
    open: import("vue").ComputedRef<string | boolean>;
    handleClick(event: MouseEvent): void;
}, unknown, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {
    close: (_close: boolean) => true;
}, string, import("vue").VNodeProps & import("vue").AllowedComponentProps & import("vue").ComponentCustomProps, Readonly<{
    as: string;
    static: boolean;
    unmount: boolean;
    open: string | boolean;
    initialFocus: HTMLElement | null;
} & {}>, {
    as: string;
    static: boolean;
    unmount: boolean;
    open: string | boolean;
    initialFocus: HTMLElement | null;
}>;
export declare let DialogOverlay: import("vue").DefineComponent<{
    as: {
        type: (ObjectConstructor | StringConstructor)[];
        default: string;
    };
}, {
    id: string;
    handleClick(event: MouseEvent): void;
}, unknown, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, Record<string, any>, string, import("vue").VNodeProps & import("vue").AllowedComponentProps & import("vue").ComponentCustomProps, Readonly<{
    as: string;
} & {}>, {
    as: string;
}>;
export declare let DialogTitle: import("vue").DefineComponent<{
    as: {
        type: (ObjectConstructor | StringConstructor)[];
        default: string;
    };
}, {
    id: string;
}, unknown, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, Record<string, any>, string, import("vue").VNodeProps & import("vue").AllowedComponentProps & import("vue").ComponentCustomProps, Readonly<{
    as: string;
} & {}>, {
    as: string;
}>;
export declare let DialogDescription: import("vue").DefineComponent<{
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
export {};
