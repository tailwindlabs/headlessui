import React from 'react';
export declare function useClose(): () => void;
export declare function CloseProvider({ value, children }: React.PropsWithChildren<{
    value: () => void;
}>): React.JSX.Element;
