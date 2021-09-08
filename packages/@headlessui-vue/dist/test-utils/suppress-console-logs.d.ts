declare type FunctionPropertyNames<T> = {
    [K in keyof T]: T[K] extends (...args: any[]) => any ? K : never;
}[keyof T] & string;
export declare function suppressConsoleLogs<T extends unknown[]>(cb: (...args: T) => void, type?: FunctionPropertyNames<typeof global.console>): (...args: T) => Promise<void>;
export {};
