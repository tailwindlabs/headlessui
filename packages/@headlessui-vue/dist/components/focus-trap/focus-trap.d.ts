import { PropType } from 'vue';
export declare let FocusTrap: import("vue").DefineComponent<{
    as: {
        type: (ObjectConstructor | StringConstructor)[];
        default: string;
    };
    initialFocus: {
        type: PropType<HTMLElement | null>;
        default: null;
    };
}, {
    el: import("vue").Ref<HTMLElement | null>;
}, unknown, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, Record<string, any>, string, import("vue").VNodeProps & import("vue").AllowedComponentProps & import("vue").ComponentCustomProps, Readonly<{
    as: string;
    initialFocus: HTMLElement | null;
} & {}>, {
    as: string;
    initialFocus: HTMLElement | null;
}>;
