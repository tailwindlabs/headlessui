import { Ref } from 'vue';
declare type OnUpdate = (message: StackMessage, element: HTMLElement) => void;
export declare enum StackMessage {
    AddElement = 0,
    RemoveElement = 1
}
export declare function useStackContext(): OnUpdate;
export declare function useElemenStack(element: Ref<HTMLElement | null> | null): void;
export declare function useStackProvider(onUpdate?: OnUpdate): void;
export {};
