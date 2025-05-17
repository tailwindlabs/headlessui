import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

// https://astro.build/config
export default defineConfig({
  integrations: [tailwind()],
  // Allow local package usage
  vite: {
    resolve: {
      alias: {
        '@headlessui/astro': '/Users/d/Projects/opensource/headlessui/packages/@headlessui-astro/src'
      }
    }
  }
});