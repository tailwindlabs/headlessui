/**
 * Helper for component hydration directives.
 * This helps with standardizing what client directives we use.
 */

export type HydrationDirective = 'load' | 'visible' | 'idle' | 'media' | 'only';

export function getHydrationAttr(directive: HydrationDirective, param?: string): string {
  if (param) {
    return `client:${directive}="${param}"`;
  }
  return `client:${directive}`;
}

// Default hydration strategy: Hydrate when visible
export const DEFAULT_HYDRATION = 'visible' as const;

// Eager hydration strategy: Hydrate immediately on page load
export const EAGER_HYDRATION = 'load' as const;

// Media query hydration strategy: Hydrate based on media query
export const MEDIA_HYDRATION = 'media' as const;

// Idle hydration strategy: Hydrate during browser idle time
export const IDLE_HYDRATION = 'idle' as const;

/**
 * Helper to determine appropriate hydration directive based on component type
 * 
 * @param componentType The type of component (e.g., 'dialog', 'menu')
 * @param isEager Whether to use eager hydration
 * @returns The appropriate hydration directive
 */
export function getComponentHydration(
  componentType: 'dialog' | 'menu' | 'listbox' | 'disclosure' | 'switch' | 'tabs', 
  isEager: boolean = false
): HydrationDirective {
  // Components that should always be eagerly hydrated regardless of isEager flag
  const alwaysEagerComponents = ['dialog'];
  
  if (isEager || alwaysEagerComponents.includes(componentType)) {
    return EAGER_HYDRATION;
  }
  
  return DEFAULT_HYDRATION;
}