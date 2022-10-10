import { utimesSync } from 'fs';
import {
  BaseTailwindService,
  debug,
  ensureAbsolute,
} from 'tailwindcss-webpack-plugin-utils';
import { DevtoolsServer } from './devtools/server';
import { TAILWIND_ENTRY_PATH } from './constants';
import type { Compiler } from './types';
import type { UserOptions } from 'tailwindcss-webpack-plugin-utils';

// create singleton promise.
export const promiseSingleton = <T>(fn: () => Promise<T>) => {
  let promise: Promise<T> | undefined;
  return function wrappedPromise() {
    if (!promise) {
      promise = fn();
    }
    return promise;
  };
};

export const isWebTarget = (target: Compiler['options']['target']) => {
  let isWeb = true;

  const _isWebTarget = (checked: string) =>
    !checked.includes('node') &&
    !checked.includes('electron-preload') &&
    !checked.includes('electron-main') &&
    !checked.includes('nwjs');

  if (typeof target === 'string') {
    isWeb = _isWebTarget(target);
  } else if (Array.isArray(target)) {
    target.forEach(checked => {
      if (!_isWebTarget(checked)) {
        isWeb = false;
        return;
      }
    });
  }

  return isWeb;
};

class Service extends BaseTailwindService {
  constructor(options: UserOptions) {
    super(options);
  }

  invalidateCssModule() {
    debug(
      `invalidate virtual module ${this.options.entry ?? TAILWIND_ENTRY_PATH}`,
    );
    // invalidate tailwind entry file.
    const fullPath = ensureAbsolute(this.options.entry ?? TAILWIND_ENTRY_PATH);
    const timestamp = Date.now();
    utimesSync(fullPath, timestamp, timestamp);
  }
}

export { Service };

export const ensureService = async (
  compiler: Compiler,
  options: UserOptions,
) => {
  if (compiler.$tailwind) {
    return;
  }

  debug(`ensure compiler.$tailwind options -> `, options);

  compiler.$tailwind = {
    dirty: new Set<string>(),
    server: new DevtoolsServer(options, compiler),
    service: new Service(options),
  };
};
