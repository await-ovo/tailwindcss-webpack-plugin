import type webpack from 'webpack';
import type { DevtoolsServer } from '../devtools/server';
import type { Service } from '../util';

export type Compiler = {
  $tailwind: {
    dirty: Set<string>;
    server: DevtoolsServer;
    service: Service;
  };
} & webpack.Compiler;
