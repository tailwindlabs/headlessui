/**
 * Resolve the actual rendered tag of a DOM node. If the `tag` provided is
 * already a string we can use that as-is. This will happen when the `as` prop is
 * not used or when it's used with a string value.
 *
 * If an actual component is used, then we need to do some more work because
 * then we actually need to render the component to know what the tag name is.
 */
export declare function useResolvedTag<T extends React.ElementType>(tag: T): readonly [string | undefined, (ref: any) => void];
