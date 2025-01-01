type AcceptNode = (node: HTMLElement) => typeof NodeFilter.FILTER_ACCEPT | typeof NodeFilter.FILTER_SKIP | typeof NodeFilter.FILTER_REJECT;
export declare function useTreeWalker(enabled: boolean, { container, accept, walk, }: {
    container: HTMLElement | null;
    accept: AcceptNode;
    walk(node: HTMLElement): void;
}): void;
export {};
