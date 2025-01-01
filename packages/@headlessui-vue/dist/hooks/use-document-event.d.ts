import { type Ref } from 'vue';
export declare function useDocumentEvent<TType extends keyof DocumentEventMap>(enabled: Ref<boolean>, type: TType, listener: (this: Document, ev: DocumentEventMap[TType]) => any, options?: boolean | AddEventListenerOptions): void;
