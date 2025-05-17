import type { BaseProps, HydrationProps } from './common';

/**
 * TabGroup component props
 */
export interface TabGroupProps extends BaseProps, HydrationProps {
  /**
   * Whether keyboard navigation should be manual (requires Tab key)
   * or automatic (the component responds to arrow keys immediately)
   */
  manual?: boolean;

  /**
   * The default selected tab index
   */
  defaultIndex?: number;

  /**
   * The currently selected tab index (controlled mode)
   */
  selectedIndex?: number;

  /**
   * Whether the component is vertical
   */
  vertical?: boolean;

  /**
   * Callback when the selected tab changes
   */
  onChange?: (index: number) => void;
}

/**
 * TabList component props
 */
export interface TabListProps extends BaseProps {
  /**
   * Additional class names to apply to tabs when active
   */
  activeClass?: string;

  /**
   * Additional class names to apply to tabs when inactive
   */
  inactiveClass?: string;
}

/**
 * Tab component props
 */
export interface TabProps extends BaseProps {
  /**
   * Whether the tab is disabled
   */
  disabled?: boolean;

  /**
   * Value for the tab, used when selected
   */
  value?: any;
}

/**
 * TabPanels component props
 */
export interface TabPanelsProps extends BaseProps {}

/**
 * TabPanel component props
 */
export interface TabPanelProps extends BaseProps {}