import { type Ref } from 'vue';
export declare function useRootContainers({ defaultContainers, portals, mainTreeNodeRef: _mainTreeNodeRef, }?: {
    defaultContainers?: (HTMLElement | null | Ref<HTMLElement | null>)[];
    portals?: Ref<HTMLElement[]>;
    mainTreeNodeRef?: Ref<HTMLElement | null>;
}): {
    resolveContainers: () => HTMLElement[];
    contains(element: HTMLElement): boolean;
    mainTreeNodeRef: Ref<HTMLElement | null>;
    MainTreeNode(): import("vue").VNode<import("vue").RendererNode, import("vue").RendererElement, {
        [key: string]: any;
    }> | null;
};
export declare function useMainTreeNode(): {
    mainTreeNodeRef: Ref<HTMLElement | null>;
    MainTreeNode(): import("vue").VNode<import("vue").RendererNode, import("vue").RendererElement, {
        [key: string]: any;
    }>;
};
