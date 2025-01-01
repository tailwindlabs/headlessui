import { type Ref } from 'vue';
export declare function useWindowEvent<TType extends keyof WindowEventMap>(enabled: Ref<boolean>, type: TType, listener: (this: Window, ev: WindowEventMap[TType]) => any, options?: boolean | AddEventListenerOptions): void;
