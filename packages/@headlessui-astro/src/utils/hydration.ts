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

export const DEFAULT_HYDRATION = 'visible' as const;