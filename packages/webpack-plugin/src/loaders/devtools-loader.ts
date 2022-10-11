import {
  isDev,
  debug,
  transformDevtoolsClient,
} from 'tailwindcss-webpack-plugin-utils';
import { isWebTarget } from '../util';
import type webpack from 'webpack';
import type { Compiler } from '../types';

export default async function devtoolsLoader(
  this: webpack.LoaderContext<string>,
  source: string,
): Promise<void> {
  const callback = this.async()!;

  if (!this._compiler) {
    callback(null, source);
    return;
  }

  this.cacheable(false);

  if (isWebTarget(this._compiler.options.target) && isDev()) {
    const { port, host } = await (
      this._compiler as Compiler
    ).$tailwind.server.ensureStart();

    const client = await transformDevtoolsClient(
      (this._compiler as Compiler).$tailwind.service,
      `http://${host}:${port}`,
    );

    debug(`[devtools-loader]: backend server started`);

    callback(null, client);
  } else {
    // returns the empty string if it is not in dev environment or if the compile target is not web, e.g. SSR.
    callback(null, '');
  }
}
