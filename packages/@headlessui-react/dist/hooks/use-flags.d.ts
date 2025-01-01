export declare function useFlags(initialFlags?: number): {
    flags: number;
    setFlag: (flag: number) => void;
    addFlag: (flag: number) => void;
    hasFlag: (flag: number) => boolean;
    removeFlag: (flag: number) => void;
    toggleFlag: (flag: number) => void;
};
