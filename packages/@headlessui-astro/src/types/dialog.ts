import type { BaseProps, HydrationProps } from './common';

export interface DialogProps extends BaseProps, HydrationProps {
  /**
   * Whether the dialog is open or not
   */
  open?: boolean;

  /**
   * The static prop allows you to control whether the Dialog component
   * is always rendered or if it should be conditionally rendered when it's open
   */
  static?: boolean;

  /**
   * Event handler for when the user closes the dialog
   */
  onClose?: (value: boolean) => void;

  /**
   * The element to focus when the dialog opens
   */
  initialFocus?: HTMLElement;
}

export interface DialogPanelProps extends BaseProps {
  /**
   * Whether to focus on the panel when dialog opens
   */
  focus?: boolean;
}

export interface DialogTitleProps extends BaseProps {
  /**
   * The ID of the title element
   */
  id?: string;
}

export interface DialogDescriptionProps extends BaseProps {
  /**
   * The ID of the description element
   */
  id?: string;
}