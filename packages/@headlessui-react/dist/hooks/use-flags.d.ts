export declare function useFlags(initialFlags?: number): {
    addFlag: (flag: number) => void;
    hasFlag: (flag: number) => boolean;
    removeFlag: (flag: number) => void;
    toggleFlag: (flag: number) => void;
};
