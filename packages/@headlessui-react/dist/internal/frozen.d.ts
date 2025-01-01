import React from 'react';
export declare function Frozen({ children, freeze }: {
    children: React.ReactNode;
    freeze: boolean;
}): React.JSX.Element;
export declare function useFrozenData<T>(freeze: boolean, data: T): T;
