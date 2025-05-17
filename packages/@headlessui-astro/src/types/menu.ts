import type { BaseProps, HydrationProps } from './common';

export interface MenuProps extends BaseProps, HydrationProps {
  /**
   * Whether the menu is open or not
   */
  open?: boolean;
}

export interface MenuButtonProps extends BaseProps {
  /**
   * Whether the button is disabled or not
   */
  disabled?: boolean;
}

export interface MenuItemsProps extends BaseProps {
  /**
   * The static prop allows you to control whether the MenuItems component
   * is always rendered or if it should be conditionally rendered when the menu is open
   */
  static?: boolean;
}

export interface MenuItemProps extends BaseProps {
  /**
   * Whether the item is disabled or not
   */
  disabled?: boolean;

  /**
   * The value associated with the menu item
   */
  value?: unknown;
}

/**
 * Props for the MenuSection component
 */
export interface MenuSectionProps extends BaseProps {
  /**
   * Custom section label, for accessibility purposes
   */
  label?: string;
}

/**
 * Props for the MenuHeading component
 */
export interface MenuHeadingProps extends BaseProps {
  /**
   * Visually hidden, only for screen readers
   */
  visuallyHidden?: boolean;
}

/**
 * Props for the MenuSeparator component
 */
export interface MenuSeparatorProps extends BaseProps {
  /**
   * Label for accessibility purposes (usually not displayed visually)
   */
  label?: string;
}