import type { UserOptions as BaseUserOptions } from 'tailwindcss-webpack-plugin-utils';

export type UserOptions = Omit<BaseUserOptions, 'devtools'>;
