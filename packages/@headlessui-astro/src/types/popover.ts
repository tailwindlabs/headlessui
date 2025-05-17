import type { BaseProps, HydrationProps } from './common';

/**
 * Props for the Popover component
 */
export interface PopoverProps extends BaseProps, HydrationProps {
  /**
   * Whether the popover is open or not
   */
  open?: boolean;
}

/**
 * Props for the PopoverButton component
 */
export interface PopoverButtonProps extends BaseProps {
  /**
   * Callback when the button is clicked
   */
  onClick?: (event: MouseEvent) => void;

  /**
   * The type of button element
   * @default 'button'
   */
  type?: 'button' | 'submit' | 'reset';

  /**
   * Whether the button is disabled
   */
  disabled?: boolean;
}

/**
 * Props for the PopoverPanel component
 */
export interface PopoverPanelProps extends BaseProps {
  /**
   * The focus option for the panel
   * @default 'first'
   */
  focus?: 'first' | 'previous' | 'manual';

  /**
   * Whether to remove the panel from the DOM when closed
   * @default true
   */
  unmount?: boolean;

  /**
   * Callback when the panel is opened
   */
  onOpen?: () => void;

  /**
   * Callback when the panel is closed
   */
  onClose?: () => void;
}

/**
 * Props for the PopoverGroup component
 */
export interface PopoverGroupProps extends BaseProps {
  /**
   * Whether to automatically close an open popover when another one is opened
   * @default true
   */
  autoClose?: boolean;
}