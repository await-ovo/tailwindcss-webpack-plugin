import type { Result } from 'postcss';
import type webpack from 'webpack';
import type { Config as TailwindConfig } from 'tailwindcss';
import type { DevtoolsServer } from '../devtools/server';

export type ChangedContent = { content: string; extension: string }[];

export type Service = {
  tailwindConfig: TailwindConfig | null;
  context: any;
  configDependencies: Set<string>;
  transformCSS: (source: string) => Promise<Result>;
  updateChangedContent: (changed: ChangedContent) => void;
  clearChangedContent: () => void;
  getCompletions: () => string;
  ensureInit: () => void;
  invalidateCssModule: () => void;
  refresh: () => void;
};

export type Compiler = {
  $tailwind: {
    dirty: Set<string>;
    server: DevtoolsServer;
    service: Service;
  };
} & webpack.Compiler;

export type DevtoolOptions = {
  port?: number;
  host?: string;
};

export type UserOptions = {
  config?: TailwindConfig | string;
  devtools?: DevtoolOptions;
  entry?: string;
};
