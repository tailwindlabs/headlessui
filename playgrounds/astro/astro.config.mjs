import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const headlessuiAstroPath = path.resolve(__dirname, '../../packages/@headlessui-astro');

// https://astro.build/config
export default defineConfig({
  integrations: [tailwind()],
  // Allow local package usage - always use src for development
  vite: {
    resolve: {
      alias: {
        '@headlessui-astro': path.resolve(headlessuiAstroPath, 'src')
      }
    }
  }
});