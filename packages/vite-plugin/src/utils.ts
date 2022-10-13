import {
  BaseTailwindService,
  TAILWIND_ENTRY_VIRTUAL_ID,
  debug,
  ensureAbsolute,
} from 'tailwindcss-webpack-plugin-utils';
import { UpdatePayload, ViteDevServer } from 'vite';
import type { UserOptions } from './types';

export class Service extends BaseTailwindService {
  _init = false;

  constructor(options?: UserOptions) {
    super(options);
  }

  async ensureInit() {
    if (!this._init) {
      await super.ensureInit();
      this._init = true;
    }
  }

  invalidateCssModule({
    server,
    options,
  }: {
    server: ViteDevServer;
    options?: UserOptions;
  }) {
    // empty
    const { moduleGraph, ws } = server;

    const tailwindEntryModule = options?.entry
      ? Array.from(
          moduleGraph.getModulesByFile(ensureAbsolute(options.entry))!,
        )[0]
      : moduleGraph.getModuleById(TAILWIND_ENTRY_VIRTUAL_ID);

    const timestamp = +Date.now();

    debug('invalidate css module: ', tailwindEntryModule, options?.entry);

    if (tailwindEntryModule) {
      moduleGraph.invalidateModule(tailwindEntryModule);

      const ownerPath = options?.entry
        ? tailwindEntryModule.url
        : `/@id/${tailwindEntryModule.id || tailwindEntryModule.file!}`;

      const update: UpdatePayload = {
        type: 'update',
        updates: [
          {
            acceptedPath: ownerPath,
            path: ownerPath,
            timestamp,
            type: 'js-update',
          },
        ],
      };

      debug(`hmr send update payload `, update);

      ws.send(update);
    }
  }
}
