export declare let TransitionChild: import("vue").DefineComponent<{
    as: {
        type: (ObjectConstructor | StringConstructor)[];
        default: string;
    };
    show: {
        type: BooleanConstructor[];
        default: null;
    };
    unmount: {
        type: BooleanConstructor[];
        default: boolean;
    };
    appear: {
        type: BooleanConstructor[];
        default: boolean;
    };
    enter: {
        type: StringConstructor[];
        default: string;
    };
    enterFrom: {
        type: StringConstructor[];
        default: string;
    };
    enterTo: {
        type: StringConstructor[];
        default: string;
    };
    entered: {
        type: StringConstructor[];
        default: string;
    };
    leave: {
        type: StringConstructor[];
        default: string;
    };
    leaveFrom: {
        type: StringConstructor[];
        default: string;
    };
    leaveTo: {
        type: StringConstructor[];
        default: string;
    };
}, () => import("vue").VNode<import("vue").RendererNode, import("vue").RendererElement, {
    [key: string]: any;
}> | import("vue").VNode<import("vue").RendererNode, import("vue").RendererElement, {
    [key: string]: any;
}>[] | null, unknown, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {
    beforeEnter: () => true;
    afterEnter: () => true;
    beforeLeave: () => true;
    afterLeave: () => true;
}, string, import("vue").VNodeProps & import("vue").AllowedComponentProps & import("vue").ComponentCustomProps, Readonly<import("vue").ExtractPropTypes<{
    as: {
        type: (ObjectConstructor | StringConstructor)[];
        default: string;
    };
    show: {
        type: BooleanConstructor[];
        default: null;
    };
    unmount: {
        type: BooleanConstructor[];
        default: boolean;
    };
    appear: {
        type: BooleanConstructor[];
        default: boolean;
    };
    enter: {
        type: StringConstructor[];
        default: string;
    };
    enterFrom: {
        type: StringConstructor[];
        default: string;
    };
    enterTo: {
        type: StringConstructor[];
        default: string;
    };
    entered: {
        type: StringConstructor[];
        default: string;
    };
    leave: {
        type: StringConstructor[];
        default: string;
    };
    leaveFrom: {
        type: StringConstructor[];
        default: string;
    };
    leaveTo: {
        type: StringConstructor[];
        default: string;
    };
}>> & {
    onBeforeEnter?: (() => any) | undefined;
    onAfterEnter?: (() => any) | undefined;
    onBeforeLeave?: (() => any) | undefined;
    onAfterLeave?: (() => any) | undefined;
}, {
    as: string | Record<string, any>;
    unmount: boolean;
    show: boolean;
    appear: boolean;
    enter: string;
    enterFrom: string;
    enterTo: string;
    entered: string;
    leave: string;
    leaveFrom: string;
    leaveTo: string;
}>;
export declare let TransitionRoot: import("vue").DefineComponent<{
    as: {
        type: (ObjectConstructor | StringConstructor)[];
        default: string;
    };
    show: {
        type: BooleanConstructor[];
        default: null;
    };
    unmount: {
        type: BooleanConstructor[];
        default: boolean;
    };
    appear: {
        type: BooleanConstructor[];
        default: boolean;
    };
    enter: {
        type: StringConstructor[];
        default: string;
    };
    enterFrom: {
        type: StringConstructor[];
        default: string;
    };
    enterTo: {
        type: StringConstructor[];
        default: string;
    };
    entered: {
        type: StringConstructor[];
        default: string;
    };
    leave: {
        type: StringConstructor[];
        default: string;
    };
    leaveFrom: {
        type: StringConstructor[];
        default: string;
    };
    leaveTo: {
        type: StringConstructor[];
        default: string;
    };
}, () => import("vue").VNode<import("vue").RendererNode, import("vue").RendererElement, {
    [key: string]: any;
}> | import("vue").VNode<import("vue").RendererNode, import("vue").RendererElement, {
    [key: string]: any;
}>[] | null, unknown, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {
    beforeEnter: () => true;
    afterEnter: () => true;
    beforeLeave: () => true;
    afterLeave: () => true;
}, string, import("vue").VNodeProps & import("vue").AllowedComponentProps & import("vue").ComponentCustomProps, Readonly<import("vue").ExtractPropTypes<{
    as: {
        type: (ObjectConstructor | StringConstructor)[];
        default: string;
    };
    show: {
        type: BooleanConstructor[];
        default: null;
    };
    unmount: {
        type: BooleanConstructor[];
        default: boolean;
    };
    appear: {
        type: BooleanConstructor[];
        default: boolean;
    };
    enter: {
        type: StringConstructor[];
        default: string;
    };
    enterFrom: {
        type: StringConstructor[];
        default: string;
    };
    enterTo: {
        type: StringConstructor[];
        default: string;
    };
    entered: {
        type: StringConstructor[];
        default: string;
    };
    leave: {
        type: StringConstructor[];
        default: string;
    };
    leaveFrom: {
        type: StringConstructor[];
        default: string;
    };
    leaveTo: {
        type: StringConstructor[];
        default: string;
    };
}>> & {
    onBeforeEnter?: (() => any) | undefined;
    onAfterEnter?: (() => any) | undefined;
    onBeforeLeave?: (() => any) | undefined;
    onAfterLeave?: (() => any) | undefined;
}, {
    as: string | Record<string, any>;
    unmount: boolean;
    show: boolean;
    appear: boolean;
    enter: string;
    enterFrom: string;
    enterTo: string;
    entered: string;
    leave: string;
    leaveFrom: string;
    leaveTo: string;
}>;
