import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { TailwindCSSVitePlugin } from 'tailwindcss-vite-plugin';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue(), TailwindCSSVitePlugin()],
  server: {
    port: 5174,
  },
});
