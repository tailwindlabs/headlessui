/// <reference types="react" />
export declare function useSyncRefs<TType>(...refs: (React.MutableRefObject<TType | null> | ((instance: TType) => void) | null)[]): (value: TType) => void;
