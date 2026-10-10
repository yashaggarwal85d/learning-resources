import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import mdx from '@astrojs/mdx';
import tailwindcss from '@tailwindcss/vite';

// GitHub Pages serves the site under /learning-resources/.
export default defineConfig({
  site: 'https://yashaggarwal85d.github.io',
  base: '/learning-resources',
  trailingSlash: 'ignore',
  output: 'static',
  integrations: [react(), mdx()],
  vite: { plugins: [tailwindcss()] },
});
