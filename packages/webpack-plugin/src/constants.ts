export const PLUGIN_NAME = 'tailwindcss-webpack-plugin';
export const DEFAULT_DEVTOOLS_PORT = 9999;
export const DEFAULT_DEVTOOLS_HOST = '127.0.0.1';
export const DEVTOOLS_POST_PATH = '/_tailwindcss_devtools_update';
export const DEV_TOOLS_VIRTUAL_ID = '_tailwind-devtools_.js';
export const TAILWIND_ENTRY_VIRTUAL_ID = '_tailwind_.css';
export const DEFAULT_TAILWIND_ENTRY_CONTENT = `@tailwind base;\n@tailwind components;\n@tailwind utilities;`;
export const DEFAULT_TAILWIND_CONFIG_FILE = 'tailwind.config.js';

export const COMPILE_ENTRY_PATH = new URL(
  './templates/_compile-entry_.js',
  import.meta.url,
).pathname;

export const TAILWIND_ENTRY_PATH = new URL(
  './templates/_tailwind_.css',
  import.meta.url,
).pathname;

export const DEVTOOLS_ENTRY_PATH = new URL(
  './templates/_tailwind-devtools_.js',
  import.meta.url,
).pathname;

export const DEVTOOLS_LOADER_PATH = new URL(
  './loaders/devtools-loader.js',
  import.meta.url,
).pathname;

export const CSS_LOADER_PATH = new URL(
  './loaders/css-loader.js',
  import.meta.url,
).pathname;
