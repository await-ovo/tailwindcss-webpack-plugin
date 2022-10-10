import { readFileSync } from 'fs';
import { isDev, isWebTarget, debug } from '../util';
import { DEVTOOLS_POST_PATH } from '../constants';
import type webpack from 'webpack';
import type { Compiler } from '../types';

const DEVTOOLS_CLIENT_PATH = new URL('../devtools/client.js', import.meta.url);

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
    await (this._compiler as Compiler).$tailwind.service.ensureInit();

    const { port, host } = await (
      this._compiler as Compiler
    ).$tailwind.server.ensureStart();

    debug(`[devtools-loader]: backend server started`);

    const clientContent = readFileSync(DEVTOOLS_CLIENT_PATH, 'utf-8')
      .replace('__POST_PATH__', `http://${host}:${port}${DEVTOOLS_POST_PATH}`)
      .replace('__CONFIG_VIEWER_PATH__', `http://${host}:${port}`);

    const completions = (
      this._compiler as Compiler
    ).$tailwind.service.getCompletions();

    debug(`[devtools-loader]: completions generated`);

    callback(null, `${clientContent}\n${completions}`);
  } else {
    // returns the empty string if it is not in dev environment or if the compile target is not web, e.g. SSR.
    callback(null, '');
  }
}
