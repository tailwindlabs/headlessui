import { type ComputedRef, type UnwrapRef } from 'vue';
export declare function useControllable<T>(controlledValue: ComputedRef<T | undefined>, onChange?: (value: T) => void, defaultValue?: ComputedRef<T>): readonly [ComputedRef<T | UnwrapRef<T> | undefined>, (value: unknown) => void | undefined];
