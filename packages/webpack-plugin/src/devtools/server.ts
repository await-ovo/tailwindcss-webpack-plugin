import http from 'http';
import { getPort } from 'get-port-please';
import {
  promiseSingleton,
  debug,
  createDevtoolsMiddleware,
} from 'tailwindcss-webpack-plugin-utils';
import { DEFAULT_DEVTOOLS_HOST, DEFAULT_DEVTOOLS_PORT } from '../constants';
import type { Compiler } from '../types';
import type { UserOptions } from 'tailwindcss-webpack-plugin-utils';

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
      const devtoolsMiddleware = createDevtoolsMiddleware(
        compiler.$tailwind.service,
      );

      devtoolsMiddleware(req, res);
    });

    this.server.on('error', err => {
      debug(`[devtools-server]: listen err`, err);
      throw err;
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

            process.on('exit', () => {
              this.close();
            });

            resolve({
              port: this.port,
              host: this.host,
            });
          });
        }
      }),
  );

  async ensureStart() {
    debug(`[devtools-server]: ensure start server`);
    return this._ensureStart();
  }

  // eslint-disable-next-line no-unused-vars
  close(callback?: (err?: Error) => void) {
    if (this._listen) {
      debug(`[devtools-server]: close`);
      this.server.close(err => callback?.(err));
    } else {
      callback?.();
    }
  }
}
