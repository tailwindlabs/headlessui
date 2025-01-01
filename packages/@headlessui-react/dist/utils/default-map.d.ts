export declare class DefaultMap<T = string, V = any> extends Map<T, V> {
    private factory;
    constructor(factory: (key: T) => V);
    get(key: T): V;
}
