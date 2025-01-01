import { type Ref } from 'vue';
type OnUpdate = (message: StackMessage, type: string, element: Ref<HTMLElement | null>) => void;
export declare enum StackMessage {
    Add = 0,
    Remove = 1
}
export declare function useStackContext(): OnUpdate;
export declare function useStackProvider({ type, enabled, element, onUpdate, }: {
    type: string;
    enabled: Ref<boolean | undefined>;
    element: Ref<HTMLElement | null>;
    onUpdate?: OnUpdate;
}): void;
export {};
