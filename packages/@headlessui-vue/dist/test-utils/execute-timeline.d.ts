import { defineComponent } from 'vue';
import { render } from './vue-testing-library';
export declare function executeTimeline(element: ReturnType<typeof defineComponent>, steps: ((tools: ReturnType<typeof render>) => (null | number)[])[]): Promise<string>;
export declare namespace executeTimeline {
    var fullTransition: (duration: number) => (number | null)[];
}
