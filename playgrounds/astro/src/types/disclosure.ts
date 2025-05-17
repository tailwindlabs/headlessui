import type { HydrationDirective } from '../core/hydration';

// Props for the main Disclosure component
export interface DisclosureProps {
  /** The element or component the Disclosure should render as */
  as?: string;

  /** Whether the disclosure is initially open */
  open?: boolean;

  /** Whether the disclosure should be static (non-interactive) */
  static?: boolean;

  /** Astro client directive to use for hydration */
  client?: HydrationDirective;

  /** Optional ID for the disclosure element */
  id?: string;

  /** Additional props for the disclosure element */
  [key: string]: any;
}

// Props for the DisclosureButton component
export interface DisclosureButtonProps {
  /** The element or component the DisclosureButton should render as */
  as?: string;
  
  /** Optional ID for the disclosure button element */
  id?: string;

  /** Additional props for the disclosure button element */
  [key: string]: any;
}

// Props for the DisclosurePanel component
export interface DisclosurePanelProps {
  /** The element or component the DisclosurePanel should render as */
  as?: string;
  
  /** Optional ID for the disclosure panel element */
  id?: string;

  /** Additional props for the disclosure panel element */
  [key: string]: any;
}