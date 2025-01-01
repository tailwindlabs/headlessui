import { type Slots, type VNode } from 'vue';
export declare enum Features {
    /** No features at all */
    None = 0,
    /**
     * When used, this will allow us to use one of the render strategies.
     *
     * **The render strategies are:**
     *    - **Unmount**   _(Will unmount the component.)_
     *    - **Hidden**    _(Will hide the component using the [hidden] attribute.)_
     */
    RenderStrategy = 1,
    /**
     * When used, this will allow the user of our component to be in control. This can be used when
     * you want to transition based on some state.
     */
    Static = 2
}
export declare enum RenderStrategy {
    Unmount = 0,
    Hidden = 1
}
export declare function render({ visible, features, ourProps, theirProps, ...main }: {
    ourProps: Record<string, any>;
    theirProps: Record<string, any>;
    slot: Record<string, any>;
    attrs: Record<string, any>;
    slots: Slots;
    name: string;
} & {
    features?: Features;
    visible?: boolean;
}): VNode<import("vue").RendererNode, import("vue").RendererElement, {
    [key: string]: any;
}> | VNode<import("vue").RendererNode, import("vue").RendererElement, {
    [key: string]: any;
}>[] | null;
export declare function compact<T extends Record<any, any>>(object: T): {} & T;
export declare function omit<T extends Record<any, any>, Keys extends keyof T>(object: T, keysToOmit?: readonly Keys[]): Omit<T, Keys>;
