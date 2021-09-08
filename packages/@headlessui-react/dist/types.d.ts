import { ReactNode, ReactElement } from 'react';
declare let __: "1D45E01E-AF44-47C4-988A-19A94EBAF55C";
export declare type __ = typeof __;
export declare type Expand<T> = T extends infer O ? {
    [K in keyof O]: O[K];
} : never;
export declare type PropsOf<TTag = any> = TTag extends React.ElementType ? React.ComponentProps<TTag> : never;
declare type PropsWeControl = 'as' | 'children' | 'refName' | 'className';
declare type CleanProps<TTag, TOmitableProps extends keyof any = __> = TOmitableProps extends __ ? Omit<PropsOf<TTag>, PropsWeControl> : Omit<PropsOf<TTag>, TOmitableProps | PropsWeControl>;
declare type OurProps<TTag, TSlot = any> = {
    as?: TTag;
    children?: ReactNode | ((bag: TSlot) => ReactElement);
    refName?: string;
};
declare type ClassNameOverride<TTag, TSlot = any> = PropsOf<TTag> extends {
    className?: any;
} ? {
    className?: string | ((bag: TSlot) => string);
} : {};
export declare type Props<TTag, TSlot = any, TOmitableProps extends keyof any = __> = CleanProps<TTag, TOmitableProps> & OurProps<TTag, TSlot> & ClassNameOverride<TTag, TSlot>;
declare type Without<T, U> = {
    [P in Exclude<keyof T, keyof U>]?: never;
};
export declare type XOR<T, U> = T | U extends __ ? never : T extends __ ? U : U extends __ ? T : T | U extends object ? (Without<T, U> & U) | (Without<U, T> & T) : T | U;
export {};
