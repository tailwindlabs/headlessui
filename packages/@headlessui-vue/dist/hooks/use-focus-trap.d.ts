import { Ref } from 'vue';
export declare function useFocusTrap(containers: Ref<Set<HTMLElement>>, enabled?: Ref<boolean>, options?: Ref<{
    initialFocus?: HTMLElement | null;
}>): void;
