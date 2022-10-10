import { defineConfig } from 'tsup';

const entry = ['./src/index.ts'];

export default defineConfig({
  entry: [...entry],
  splitting: false,
  sourcemap: false,
  dts: {
    entry: entry,
  },
  clean: true,
  format: ['cjs', 'esm'],
});
