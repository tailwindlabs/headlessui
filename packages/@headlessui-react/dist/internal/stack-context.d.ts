import { MutableRefObject, ReactNode } from 'react';
declare type OnUpdate = (message: StackMessage, type: string, element: MutableRefObject<HTMLElement | null>) => void;
export declare enum StackMessage {
    Add = 0,
    Remove = 1
}
export declare function useStackContext(): OnUpdate;
export declare function StackProvider({ children, onUpdate, type, element, }: {
    children: ReactNode;
    onUpdate?: OnUpdate;
    type: string;
    element: MutableRefObject<HTMLElement | null>;
}): JSX.Element;
export {};
