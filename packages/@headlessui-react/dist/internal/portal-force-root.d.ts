import React, { type ReactNode } from 'react';
export declare function usePortalRoot(): boolean;
interface ForcePortalRootProps {
    force: boolean;
    children: ReactNode;
}
export declare function ForcePortalRoot(props: ForcePortalRootProps): React.JSX.Element;
export {};
