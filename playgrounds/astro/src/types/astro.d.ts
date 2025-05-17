// Declaration file for Astro components
declare module '*.astro' {
  import { AstroComponentFactory } from 'astro/runtime/server/index.js';
  const Component: AstroComponentFactory;
  export default Component;
}