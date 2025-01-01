import { type ComputedRef } from 'vue';
type AcceptNode = (node: HTMLElement) => typeof NodeFilter.FILTER_ACCEPT | typeof NodeFilter.FILTER_SKIP | typeof NodeFilter.FILTER_REJECT;
export declare function useTreeWalker({ container, accept, walk, enabled, }: {
    container: ComputedRef<HTMLElement | null>;
    accept: AcceptNode;
    walk(node: HTMLElement): void;
    enabled?: ComputedRef<boolean>;
}): void;
export {};
