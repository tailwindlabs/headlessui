import { Ref } from 'vue';
export declare enum State {
    Open = 0,
    Closed = 1
}
export declare function hasOpenClosed(): boolean;
export declare function useOpenClosed(): Ref<State> | null;
export declare function useOpenClosedProvider(value: Ref<State>): void;
