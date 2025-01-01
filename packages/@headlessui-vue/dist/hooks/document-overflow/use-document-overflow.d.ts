import { type Ref } from 'vue';
import { type MetaFn } from './overflow-store.js';
export declare function useDocumentOverflowLockedEffect(doc: Ref<Document | null>, shouldBeLocked: Ref<boolean>, meta: MetaFn): import("vue").ComputedRef<boolean>;
