import React from 'react';
export declare function FormFieldsProvider(props: React.PropsWithChildren<{}>): React.JSX.Element;
export declare function HoistFormFields({ children }: React.PropsWithChildren<{}>): React.JSX.Element | null;
export declare function FormFields({ data, form: formId, disabled, onReset, overrides, }: {
    data: Record<string, any>;
    overrides?: Record<string, any>;
    form?: string;
    disabled?: boolean;
    onReset?: (e: Event) => void;
}): React.JSX.Element;
