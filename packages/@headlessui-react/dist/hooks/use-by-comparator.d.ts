export type ByComparator<T> = (NonNullable<T> extends never ? string : keyof NonNullable<T> & string) | ((a: T, z: T) => boolean);
export declare function useByComparator<T>(by?: ByComparator<T>): (a: T, z: T) => boolean;
