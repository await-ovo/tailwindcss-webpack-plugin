import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['./test/**/*.{test,spec}.{js,jsx,ts,tsx}'],
    testTimeout: 100000,
  },
});
