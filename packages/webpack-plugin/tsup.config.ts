import { defineConfig } from 'tsup';

const entry = [
  './src/index.ts',
  './src/loaders/css-loader.ts',
  './src/loaders/devtools-loader.ts',
];

const templates = [
  './src/templates/_tailwind_.css',
  './src/templates/_tailwind-devtools_.js',
  './src/templates/_compile-entry_.js',
];

export default defineConfig({
  entry: [...entry, ...templates],
  splitting: false,
  sourcemap: false,
  dts: {
    entry: entry,
  },
  clean: true,
  format: ['cjs', 'esm'],
  external: ['_tailwind-devtools_.js', '_tailwind_.css'],
});
