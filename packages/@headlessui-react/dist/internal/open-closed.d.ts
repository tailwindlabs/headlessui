import { ReactNode, ReactElement } from 'react';
export declare enum State {
    Open = 0,
    Closed = 1
}
export declare function useOpenClosed(): State | null;
interface Props {
    value: State;
    children: ReactNode;
}
export declare function OpenClosedProvider({ value, children }: Props): ReactElement;
export {};
