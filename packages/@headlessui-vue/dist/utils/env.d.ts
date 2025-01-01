type RenderEnv = 'client' | 'server';
declare class Env {
    current: RenderEnv;
    currentId: number;
    set(env: RenderEnv): void;
    reset(): void;
    nextId(): number;
    get isServer(): boolean;
    get isClient(): boolean;
    private detect;
}
export declare let env: Env;
export {};
