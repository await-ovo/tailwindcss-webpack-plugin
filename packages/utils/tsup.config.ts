import { defineConfig } from 'tsup';

const entry = ['./src/index.ts', './src/client/devtools.ts'];

export default defineConfig({
  entry: [...entry],
  // outExtension({ format }) {
  //   return {
  //     js: `.${format}.js`,
  //   };
  // },
  splitting: false,
  sourcemap: false,
  dts: {
    entry: entry,
  },
  clean: true,
  format: ['cjs', 'esm'],
});
