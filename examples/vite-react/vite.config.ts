import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { TailwindCSSVitePlugin } from 'tailwindcss-vite-plugin';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // This is just an example, in most cases there is no need to customize options
    TailwindCSSVitePlugin({
      // specify the entry option only if you need to use other tailwind directives like @apply.
      entry: './src/App.css',
    }),
  ],
  server: {
    port: 5173,
  },
});
