import { mount } from '@vue/test-utils';
import { fireEvent, screen } from '@testing-library/dom';
export declare function render(TestComponent: any, options?: Parameters<typeof mount>[1] | undefined): {
    readonly container: HTMLElement;
    debug(element?: HTMLElement): void;
    asFragment(): DocumentFragment;
};
export { fireEvent, screen };
