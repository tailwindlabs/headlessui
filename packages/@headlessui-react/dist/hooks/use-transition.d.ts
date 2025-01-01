type TransitionData = {
    closed?: boolean;
    enter?: boolean;
    leave?: boolean;
    transition?: boolean;
};
export declare function transitionDataAttributes(data: TransitionData): Record<string, string>;
export declare function useTransition(enabled: boolean, element: HTMLElement | null, show: boolean, events?: {
    start?(show: boolean): void;
    end?(show: boolean): void;
}): [visible: boolean, data: TransitionData];
export {};
