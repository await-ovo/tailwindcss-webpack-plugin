import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

export const PACKAGE_DIR =
  typeof __dirname !== 'undefined'
    ? __dirname
    : dirname(fileURLToPath(import.meta.url));

export const DEVTOOLS_VIRTUAL_ID = '_tailwind-devtools_.js';
export const DEVTOOLS_POST_PATH = '/_tailwindcss_devtools_update';
export const DEVTOOLS_CLIENT_PATH = join(PACKAGE_DIR, './client/devtools.js');

export const TAILWIND_ENTRY_VIRTUAL_ID = '_tailwind_.css';
export const DEFAULT_TAILWIND_ENTRY_CONTENT = `@tailwind base;\n@tailwind components;\n@tailwind utilities;`;
export const DEFAULT_TAILWIND_CONFIG_FILE = 'tailwind.config.js';
