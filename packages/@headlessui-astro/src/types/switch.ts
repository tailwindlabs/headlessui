import type { BaseProps, HydrationProps } from './common';

/**
 * Switch component props
 */
export interface SwitchProps extends BaseProps, HydrationProps {
  /**
   * The checked state of the switch
   */
  checked?: boolean;

  /**
   * The default checked state of the switch (uncontrolled mode)
   */
  defaultChecked?: boolean;

  /**
   * Callback function called when the switch state changes
   */
  onChange?: (checked: boolean) => void;

  /**
   * Whether the switch is disabled
   */
  disabled?: boolean;

  /**
   * Additional class names to apply when the switch is checked
   */
  checkedClass?: string;

  /**
   * Additional class names to apply when the switch is not checked
   */
  uncheckedClass?: string;
}

/**
 * SwitchGroup component props
 */
export interface SwitchGroupProps extends BaseProps {}

/**
 * SwitchLabel component props
 */
export interface SwitchLabelProps extends BaseProps {
  /**
   * Whether the label is passive (doesn't toggle the switch when clicked)
   */
  passive?: boolean;

  /**
   * Specify whether to use an HTML label element (true) or a generic element with aria-label (false)
   */
  asLabel?: boolean;
}

/**
 * SwitchDescription component props
 */
export interface SwitchDescriptionProps extends BaseProps {}