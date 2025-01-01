type Container = HTMLElement | null;
type ContainerCollection = Container[] | Set<Container>;
type ContainerInput = Container | ContainerCollection;
export declare function useOutsideClick(enabled: boolean, containers: ContainerInput | (() => ContainerInput), cb: (event: MouseEvent | PointerEvent | FocusEvent | TouchEvent, target: HTMLElement) => void): void;
export {};
