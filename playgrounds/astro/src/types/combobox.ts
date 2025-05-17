/**
 * Type definitions for the Combobox component and its subcomponents.
 */

/**
 * Props for the Combobox component.
 */
export interface ComboboxProps {
  /**
   * The selected value or values (for multiple selection mode).
   */
  value?: string | string[];

  /**
   * Callback fired when the selection changes.
   */
  onChange?: (value: string | string[]) => void;

  /**
   * Whether the combobox allows multiple selections.
   * @default false
   */
  multiple?: boolean;

  /**
   * Whether the combobox is disabled.
   * @default false
   */
  disabled?: boolean;

  /**
   * The element or component the Combobox should render as.
   * @default 'div'
   */
  as?: string;

  /**
   * Additional CSS classes to apply to the component.
   */
  class?: string;

  /**
   * String used to create unique IDs for accessibility.
   * If not provided, a random ID will be generated.
   */
  id?: string;

  /**
   * Initial open state of the combobox.
   * @default false
   */
  defaultOpen?: boolean;

  /**
   * Control whether the combobox is open (controlled mode).
   */
  open?: boolean;

  /**
   * Callback fired when the open state changes.
   */
  onOpenChange?: (open: boolean) => void;

  /**
   * Name for the hidden input element when using forms.
   */
  name?: string;

  /**
   * Function to filter options based on input value.
   * If not provided, a default filter will be used.
   */
  filter?: (value: string, option: string) => boolean;
}

/**
 * Props for the ComboboxInput component.
 */
export interface ComboboxInputProps {
  /**
   * Whether to display a clear button.
   * @default false
   */
  displayClearButton?: boolean;

  /**
   * Placeholder text for the input.
   */
  placeholder?: string;

  /**
   * The element or component the ComboboxInput should render as.
   * @default 'input'
   */
  as?: string;

  /**
   * Additional CSS classes to apply to the component.
   */
  class?: string;

  /**
   * Whether to open the dropdown when the input is focused.
   * @default false
   */
  openOnFocus?: boolean;

  /**
   * Callback fired when the input value changes.
   */
  onChange?: (event: Event) => void;
}

/**
 * Props for the ComboboxButton component.
 */
export interface ComboboxButtonProps {
  /**
   * The element or component the ComboboxButton should render as.
   * @default 'button'
   */
  as?: string;

  /**
   * Additional CSS classes to apply to the component.
   */
  class?: string;
}

/**
 * Props for the ComboboxOptions component.
 */
export interface ComboboxOptionsProps {
  /**
   * Whether to keep the options mounted when closed.
   * @default false
   */
  static?: boolean;

  /**
   * Whether to hold focus within the options when navigating with keyboard.
   * @default false
   */
  hold?: boolean;

  /**
   * The element or component the ComboboxOptions should render as.
   * @default 'ul'
   */
  as?: string;

  /**
   * Additional CSS classes to apply to the component.
   */
  class?: string;
}

/**
 * Props for the ComboboxOption component.
 */
export interface ComboboxOptionProps {
  /**
   * The value of the option.
   */
  value: string;

  /**
   * Whether the option is disabled.
   * @default false
   */
  disabled?: boolean;

  /**
   * The element or component the ComboboxOption should render as.
   * @default 'li'
   */
  as?: string;

  /**
   * Additional CSS classes to apply to the component.
   */
  class?: string;
}

/**
 * Props for the ComboboxLabel component.
 */
export interface ComboboxLabelProps {
  /**
   * The element or component the ComboboxLabel should render as.
   * @default 'label'
   */
  as?: string;

  /**
   * Additional CSS classes to apply to the component.
   */
  class?: string;
}

/**
 * Props for the ComboboxGroup component.
 */
export interface ComboboxGroupProps {
  /**
   * The element or component the ComboboxGroup should render as.
   * @default 'div'
   */
  as?: string;

  /**
   * Additional CSS classes to apply to the component.
   */
  class?: string;
}

/**
 * Props for the ComboboxGroupLabel component.
 */
export interface ComboboxGroupLabelProps {
  /**
   * The element or component the ComboboxGroupLabel should render as.
   * @default 'span'
   */
  as?: string;

  /**
   * Additional CSS classes to apply to the component.
   */
  class?: string;
}

/**
 * Props for the ComboboxEmptyState component.
 */
export interface ComboboxEmptyStateProps {
  /**
   * The element or component the ComboboxEmptyState should render as.
   * @default 'div'
   */
  as?: string;

  /**
   * Additional CSS classes to apply to the component.
   */
  class?: string;
}