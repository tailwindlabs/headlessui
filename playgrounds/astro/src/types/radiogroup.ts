import type { BaseProps, HydrationProps } from './common';

/**
 * RadioGroup component props
 */
export interface RadioGroupProps extends BaseProps, HydrationProps {
  /**
   * The currently selected radio option's value (controlled mode)
   */
  value?: any;

  /**
   * The default value for the radio group
   */
  defaultValue?: any;

  /**
   * Callback when the selected radio option changes
   */
  onChange?: (value: any) => void;

  /**
   * Whether the radio group is disabled
   */
  disabled?: boolean;

  /**
   * Additional HTML name attribute for radio inputs (useful for forms)
   */
  name?: string;
}

/**
 * RadioGroupLabel component props
 */
export interface RadioGroupLabelProps extends BaseProps {
  /**
   * Specify whether to use an HTML label element (true) or a generic element with aria-label (false)
   */
  asLabel?: boolean;
}

/**
 * RadioGroupOption component props
 */
export interface RadioGroupOptionProps extends BaseProps {
  /**
   * The value of this radio option
   */
  value: any;

  /**
   * Whether this radio option is disabled
   */
  disabled?: boolean;

  /**
   * Additional class names to apply when this option is checked
   */
  checkedClass?: string;

  /**
   * Additional class names to apply when this option is unchecked
   */
  uncheckedClass?: string;
}

/**
 * RadioGroupDescription component props
 */
export interface RadioGroupDescriptionProps extends BaseProps {}