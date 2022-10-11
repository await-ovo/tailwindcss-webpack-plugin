import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

export const PLUGIN_NAME = 'tailwindcss-webpack-plugin';
export const DEFAULT_DEVTOOLS_PORT = 9999;
export const DEFAULT_DEVTOOLS_HOST = '127.0.0.1';

export const PACKAGE_DIR =
  typeof __dirname !== 'undefined'
    ? __dirname
    : dirname(fileURLToPath(import.meta.url));

export const COMPILE_ENTRY_PATH = join(
  PACKAGE_DIR,
  './templates/_compile-entry_.js',
);

export const TAILWIND_ENTRY_PATH = join(
  PACKAGE_DIR,
  './templates/_tailwind_.css',
);

export const DEVTOOLS_ENTRY_PATH = join(
  PACKAGE_DIR,
  './templates/_tailwind-devtools_.js',
);

export const DEVTOOLS_LOADER_PATH = join(
  PACKAGE_DIR,
  './loaders/devtools-loader.js',
);

export const CSS_LOADER_PATH = join(PACKAGE_DIR, './loaders/css-loader.js');
