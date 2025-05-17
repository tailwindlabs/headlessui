import type { HydrationDirective } from '../utils/hydration';

// Props for the main Listbox component
export interface ListboxProps {
  /** The element or component the Listbox should render as */
  as?: string;

  /** The selected value(s) in the listbox */
  value?: any;

  /** Callback for when the selection changes */
  onChange?: (value: any) => void;

  /** Whether multiple items can be selected */
  multiple?: boolean;

  /** Whether the listbox is disabled */
  disabled?: boolean;

  /** Astro client directive to use for hydration */
  client?: HydrationDirective;

  /** Optional ID for the listbox element */
  id?: string;

  /** Additional props for the listbox element */
  [key: string]: any;
}

// Props for the ListboxButton component
export interface ListboxButtonProps {
  /** The element or component the ListboxButton should render as */
  as?: string;
  
  /** Optional ID for the listbox button element */
  id?: string;

  /** Additional props for the listbox button element */
  [key: string]: any;
}

// Props for the ListboxOptions component
export interface ListboxOptionsProps {
  /** The element or component the ListboxOptions should render as */
  as?: string;
  
  /** Optional ID for the listbox options element */
  id?: string;
  
  /** Whether the options list is static (always rendered) */
  static?: boolean;

  /** Additional props for the listbox options element */
  [key: string]: any;
}

// Props for the ListboxOption component
export interface ListboxOptionProps {
  /** The element or component the ListboxOption should render as */
  as?: string;
  
  /** Optional ID for the listbox option element */
  id?: string;
  
  /** The value associated with this option */
  value: any;
  
  /** Whether the option is disabled */
  disabled?: boolean;

  /** Additional props for the listbox option element */
  [key: string]: any;
}

// Props for the ListboxLabel component
export interface ListboxLabelProps {
  /** The element or component the ListboxLabel should render as */
  as?: string;
  
  /** Optional ID for the listbox label element */
  id?: string;

  /** Additional props for the listbox label element */
  [key: string]: any;
}