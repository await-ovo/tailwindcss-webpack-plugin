import { EntryPlugin } from 'webpack';
import {
  ensureAbsolute,
  isString,
  debug,
  DEV_TOOLS_VIRTUAL_ID,
  TAILWIND_ENTRY_VIRTUAL_ID,
} from 'tailwindcss-webpack-plugin-utils';
import {
  COMPILE_ENTRY_PATH,
  CSS_LOADER_PATH,
  DEVTOOLS_ENTRY_PATH,
  DEVTOOLS_LOADER_PATH,
  PLUGIN_NAME,
  TAILWIND_ENTRY_PATH,
} from './constants';
import { ensureService } from './util';
import type { Compiler } from './types';
import type { UserOptions } from 'tailwindcss-webpack-plugin-utils';

export class TailwindCSSWebpackPlugin {
  options;

  constructor(options?: UserOptions) {
    this.options = options ?? {};
  }

  apply(compiler: Compiler) {
    compiler.options.resolve.alias = {
      [DEV_TOOLS_VIRTUAL_ID]: DEVTOOLS_ENTRY_PATH,
      [TAILWIND_ENTRY_VIRTUAL_ID]: ensureAbsolute(
        this.options?.entry ?? TAILWIND_ENTRY_PATH,
      ),
      ...compiler.options.resolve.alias,
    };

    compiler.options.module.rules.unshift({
      enforce: 'pre',
      include: (resource: string) =>
        resource.includes(TAILWIND_ENTRY_VIRTUAL_ID) ||
        (/\.css$/.test(resource) && !/node_modules/.test(resource)),
      loader: CSS_LOADER_PATH,
    });

    compiler.options.module.rules.unshift({
      enforce: 'pre',
      include: (resource: string) => resource.includes(DEV_TOOLS_VIRTUAL_ID),
      loader: DEVTOOLS_LOADER_PATH,
    });

    if (!isString(this.options?.entry)) {
      new EntryPlugin(compiler.context, COMPILE_ENTRY_PATH, {
        name: undefined,
      }).apply(compiler);
    }

    compiler.hooks.invalid.tap(PLUGIN_NAME, file => {
      debug(`[compiler ${compiler.name ?? ''}] invalid hook file ->`, file);
      if (!file) {
        file = 'config-file';
      }

      // ignore entry file change.
      if (file === ensureAbsolute(this.options?.entry ?? TAILWIND_ENTRY_PATH)) {
        return;
      }

      if (!compiler.$tailwind.dirty.has(file)) {
        compiler.$tailwind.dirty.add(file);

        compiler.$tailwind.service.invalidateCssModule();
      }
    });

    compiler.hooks.afterCompile.tap(PLUGIN_NAME, () => {
      compiler.$tailwind.service.clearChangedContent();
    });

    compiler.hooks.beforeCompile.tapPromise(PLUGIN_NAME, async () => {
      debug(`[compiler ${compiler.name ?? ''}] beforeCompiler hook`);
      await ensureService(compiler, this.options);
    });

    compiler.hooks.watchRun.tapPromise(PLUGIN_NAME, async () => {
      debug(`[compiler ${compiler.name ?? ''}] watchRun hook`);
      await ensureService(compiler, this.options);
    });

    compiler.hooks.beforeRun.tapPromise(PLUGIN_NAME, async () => {
      debug(`[compiler ${compiler.name ?? ''}] beforeRun hook`);
      await ensureService(compiler, this.options);
    });

    compiler.hooks.compilation.tap(PLUGIN_NAME, async compilation => {
      debug(`[compiler ${compiler.name ?? ''}] compilation hook`);
      await ensureService(compilation.compiler as Compiler, this.options);
    });

    compiler.hooks.shutdown.tapAsync(PLUGIN_NAME, callback => {
      debug(`[compiler ${compiler.name ?? ''}] shutdown hook`);
      compiler.$tailwind.server.close(callback);
    });
  }
}
