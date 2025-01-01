import { type PropType, type Ref } from 'vue';
type Containers = (() => Iterable<HTMLElement>) | Ref<Set<Ref<HTMLElement | null>>>;
declare enum Features {
    /** No features enabled for the focus trap. */
    None = 1,
    /** Ensure that we move focus initially into the container. */
    InitialFocus = 2,
    /** Ensure that pressing `Tab` and `Shift+Tab` is trapped within the container. */
    TabLock = 4,
    /** Ensure that programmatically moving focus outside of the container is disallowed. */
    FocusLock = 8,
    /** Ensure that we restore the focus when unmounting the focus trap. */
    RestoreFocus = 16,
    /** Enable all features. */
    All = 30
}
export declare let FocusTrap: {
    new (...args: any[]): {
        $: import("vue").ComponentInternalInstance;
        $data: {};
        $props: Partial<{
            features: Features;
            as: string | Record<string, any>;
            initialFocus: HTMLElement | null;
            containers: Containers;
        }> & Omit<Readonly<import("vue").ExtractPropTypes<{
            as: {
                type: (ObjectConstructor | StringConstructor)[];
                default: string;
            };
            initialFocus: {
                type: PropType<HTMLElement | null>;
                default: null;
            };
            features: {
                type: PropType<Features>;
                default: Features;
            };
            containers: {
                type: PropType<Containers>;
                default: Ref<Set<unknown>>;
            };
        }>> & import("vue").VNodeProps & import("vue").AllowedComponentProps & import("vue").ComponentCustomProps, "features" | "as" | "initialFocus" | "containers">;
        $attrs: {
            [x: string]: unknown;
        };
        $refs: {
            [x: string]: unknown;
        };
        $slots: import("vue").Slots;
        $root: import("vue").ComponentPublicInstance | null;
        $parent: import("vue").ComponentPublicInstance | null;
        $emit: (event: string, ...args: any[]) => void;
        $el: any;
        $options: import("vue").ComponentOptionsBase<Readonly<import("vue").ExtractPropTypes<{
            as: {
                type: (ObjectConstructor | StringConstructor)[];
                default: string;
            };
            initialFocus: {
                type: PropType<HTMLElement | null>;
                default: null;
            };
            features: {
                type: PropType<Features>;
                default: Features;
            };
            containers: {
                type: PropType<Containers>;
                default: Ref<Set<unknown>>;
            };
        }>>, () => import("vue").VNode<import("vue").RendererNode, import("vue").RendererElement, {
            [key: string]: any;
        }>, unknown, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, Record<string, any>, string, {
            features: Features;
            as: string | Record<string, any>;
            initialFocus: HTMLElement | null;
            containers: Containers;
        }> & {
            beforeCreate?: (() => void) | (() => void)[];
            created?: (() => void) | (() => void)[];
            beforeMount?: (() => void) | (() => void)[];
            mounted?: (() => void) | (() => void)[];
            beforeUpdate?: (() => void) | (() => void)[];
            updated?: (() => void) | (() => void)[];
            activated?: (() => void) | (() => void)[];
            deactivated?: (() => void) | (() => void)[];
            beforeDestroy?: (() => void) | (() => void)[];
            beforeUnmount?: (() => void) | (() => void)[];
            destroyed?: (() => void) | (() => void)[];
            unmounted?: (() => void) | (() => void)[];
            renderTracked?: ((e: import("vue").DebuggerEvent) => void) | ((e: import("vue").DebuggerEvent) => void)[];
            renderTriggered?: ((e: import("vue").DebuggerEvent) => void) | ((e: import("vue").DebuggerEvent) => void)[];
            errorCaptured?: ((err: unknown, instance: import("vue").ComponentPublicInstance | null, info: string) => boolean | void) | ((err: unknown, instance: import("vue").ComponentPublicInstance | null, info: string) => boolean | void)[];
        };
        $forceUpdate: () => void;
        $nextTick: typeof import("vue").nextTick;
        $watch(source: string | Function, cb: Function, options?: import("vue").WatchOptions): import("vue").WatchStopHandle;
    } & Readonly<import("vue").ExtractPropTypes<{
        as: {
            type: (ObjectConstructor | StringConstructor)[];
            default: string;
        };
        initialFocus: {
            type: PropType<HTMLElement | null>;
            default: null;
        };
        features: {
            type: PropType<Features>;
            default: Features;
        };
        containers: {
            type: PropType<Containers>;
            default: Ref<Set<unknown>>;
        };
    }>> & import("vue").ShallowUnwrapRef<() => import("vue").VNode<import("vue").RendererNode, import("vue").RendererElement, {
        [key: string]: any;
    }>> & {} & import("vue").ComponentCustomProperties;
    __isFragment?: never;
    __isTeleport?: never;
    __isSuspense?: never;
} & import("vue").ComponentOptionsBase<Readonly<import("vue").ExtractPropTypes<{
    as: {
        type: (ObjectConstructor | StringConstructor)[];
        default: string;
    };
    initialFocus: {
        type: PropType<HTMLElement | null>;
        default: null;
    };
    features: {
        type: PropType<Features>;
        default: Features;
    };
    containers: {
        type: PropType<Containers>;
        default: Ref<Set<unknown>>;
    };
}>>, () => import("vue").VNode<import("vue").RendererNode, import("vue").RendererElement, {
    [key: string]: any;
}>, unknown, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, Record<string, any>, string, {
    features: Features;
    as: string | Record<string, any>;
    initialFocus: HTMLElement | null;
    containers: Containers;
}> & import("vue").VNodeProps & import("vue").AllowedComponentProps & import("vue").ComponentCustomProps & {
    features: typeof Features;
};
export {};
