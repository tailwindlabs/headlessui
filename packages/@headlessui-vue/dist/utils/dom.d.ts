import type { ComponentPublicInstance, Ref } from 'vue';
type AsElement<T extends HTMLElement | ComponentPublicInstance> = (T extends HTMLElement ? T : HTMLElement) | null;
export declare function dom<T extends HTMLElement | ComponentPublicInstance>(ref?: Ref<T | null>): AsElement<T> | null;
export {};
