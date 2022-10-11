import {
  BaseTailwindService,
  TAILWIND_ENTRY_VIRTUAL_ID,
  debug,
} from 'tailwindcss-webpack-plugin-utils';
import { ViteDevServer } from 'vite';
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

  invalidateCssModule(server: ViteDevServer) {
    // empty
    const { moduleGraph, ws } = server;

    const tailwindEntryModule = moduleGraph.getModuleById(
      TAILWIND_ENTRY_VIRTUAL_ID,
    );

    const timestamp = +Date.now();

    debug('invalidate css module: ', typeof moduleGraph);

    if (tailwindEntryModule) {
      moduleGraph.invalidateModule(tailwindEntryModule);

      const ownerPath = `${/@id/}${
        tailwindEntryModule.id || tailwindEntryModule.file!
      }`;

      ws.send({
        type: 'update',
        updates: [
          {
            acceptedPath: ownerPath,
            path: ownerPath,
            timestamp,
            type: 'js-update',
          },
        ],
      });
    }
  }
}
