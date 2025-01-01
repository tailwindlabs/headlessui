import { type Ref } from 'vue';
export declare enum State {
    Open = 1,
    Closed = 2,
    Closing = 4,
    Opening = 8
}
export declare function hasOpenClosed(): boolean;
export declare function useOpenClosed(): Ref<State> | null;
export declare function useOpenClosedProvider(value: Ref<State>): void;
