import type { Config as TailwindConfig } from 'tailwindcss';

export type ChangedContent = { content: string; extension: string }[];

export type DevtoolOptions = {
  port?: number;
  host?: string;
};

export type UserOptions = {
  config?: TailwindConfig | string;
  devtools?: DevtoolOptions;
  entry?: string;
};
