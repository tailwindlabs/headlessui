import { render } from '@testing-library/react';
export declare function executeTimeline(element: JSX.Element, steps: ((tools: ReturnType<typeof render>) => (null | number)[])[]): Promise<string>;
export declare namespace executeTimeline {
    var fullTransition: (duration: number) => (number | null)[];
}
