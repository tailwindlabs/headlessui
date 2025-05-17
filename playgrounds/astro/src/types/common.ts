import type { HTMLAttributes } from 'astro/types';

/**
 * Base component props with common HTML attributes support
 */
export interface BaseProps extends HTMLAttributes<'div'> {
  as?: string | object;
  id?: string;
}

/**
 * Common hydration directive options
 */
export interface HydrationProps {
  client?: 'visible' | 'idle' | 'load' | 'media' | 'only';
  clientParams?: string; // For client:media="(max-width: 600px)" or client:only="vue"
}