import http from 'http';
import { utimesSync } from 'fs';
import { getPort } from 'get-port-please';
import createServer from 'tailwind-config-viewer/server';
import {
  DEFAULT_DEVTOOLS_HOST,
  DEFAULT_DEVTOOLS_PORT,
  DEVTOOLS_POST_PATH,
} from 'src/constants';
import {
  ensureAbsolute,
  parseRequestBody,
  promiseSingleton,
  debug,
  ensureTrailingSlash,
} from 'src/util';
import type { UserOptions, Compiler } from 'src/types';

export class DevtoolsServer {
  host: string;
  port: number;
  server: http.Server;
  service: Compiler['$tailwind'];
  _listen: boolean;

  constructor(options: UserOptions, compiler: Compiler) {
    this.host = options.devtools?.host ?? DEFAULT_DEVTOOLS_HOST;
    this.port = options.devtools?.port ?? DEFAULT_DEVTOOLS_PORT;
    this.server = http.createServer(async (req, res) => {
      const { url, method } = req;
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
      if (url === DEVTOOLS_POST_PATH) {
        if (method === 'POST') {
          try {
            const { type, data: changed } = await parseRequestBody(req);

            if (type === 'add-classes' && changed?.length) {
              compiler.$tailwind.service.updateChangedContent([
                {
                  content: `<div class="${changed.join(' ')}"></div>`,
                  extension: 'html',
                },
              ]);
              compiler.$tailwind.service.invalidateCssModule();
            }

            res.statusCode = 200;
            res.end();
          } catch (err) {
            debug('[devtools-server] error: ', err);
            res.statusCode = 500;
            res.end(`Internal Server Error ${err}`);
          }
        } else {
          // CORS preflight request
          res.statusCode = 200;
          res.end();
        }
      } else {
        const configViewerMiddleware = createServer({
          tailwindConfigProvider: () =>
            compiler.$tailwind.service.tailwindConfig,
        }).asMiddleware();
        configViewerMiddleware(req, res);
      }
    });

    this.service = compiler.$tailwind;

    this._listen = false;
  }

  _ensureStart = promiseSingleton(
    () =>
      new Promise<{
        port: number;
        host: string;
      }>(async resolve => {
        this.port = await getPort(this.port);
        if (!this._listen) {
          this.server.listen(this.port, this.host, () => {
            this._listen = true;
            debug(`[devtools-server]: listen at ${this.host}:${this.port}`);
            resolve({
              port: this.port,
              host: this.host,
            });
          });
        }
      }),
  );

  async ensureStart() {
    return this._ensureStart();
  }

  close(callback: (err?: Error) => void) {
    if (this._listen) {
      debug(`[devtools-server]: close`);
      this.server.close(err => callback(err));
    } else {
      callback();
    }
  }
}
