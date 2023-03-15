import { readFileSync } from 'fs';
import { extname } from 'path';
import {
  DEVTOOLS_POST_PATH,
  debug,
  createDevtoolsMiddleware,
  DEVTOOLS_VIRTUAL_ID,
  TAILWIND_ENTRY_VIRTUAL_ID,
  isDev,
  transformDevtoolsClient,
  isString,
} from 'tailwindcss-webpack-plugin-utils';
import { createFilter, Plugin, ViteDevServer } from 'vite';
import {
  CONFIG_VIEWER_PATH,
  PLUGIN_NAME,
  VIRTUAL_COMPILE_ENTRY_ID,
} from './constants';
import { Service } from './utils';
import type { UserOptions } from './types';

export const TailwindCSSVitePlugin = (options?: UserOptions): Plugin => {
  let server: ViteDevServer;
  let mode: string;

  const service = new Service(options);

  const dirtyFiles = new Set<string>();

  const transformCSSFilter = createFilter(
    // include
    [TAILWIND_ENTRY_VIRTUAL_ID, /\.css$/],
    // exclude
    [/\/node_modules\//],
  );

  return {
    name: PLUGIN_NAME,
    config(_, env) {
      mode = env.mode;
    },
    configureServer(_server) {
      server = _server;

      const devtoolsMiddleware = createDevtoolsMiddleware(service, {
        configViewerPath: CONFIG_VIEWER_PATH,
        server,
        userOptions: options,
      });

      server.middlewares.use(async (req, res, next) => {
        const { url } = req;

        await service.ensureInit();

        if (DEVTOOLS_POST_PATH === url || url?.startsWith(CONFIG_VIEWER_PATH)) {
          if (url === CONFIG_VIEWER_PATH) {
            res.writeHead(301, { Location: `${CONFIG_VIEWER_PATH}/` });
            return res.end();
          }

          devtoolsMiddleware(req, res);
        } else {
          next();
        }
      });
    },
    transformIndexHtml: {
      enforce: 'pre',
      transform(html) {
        return {
          html,
          tags: isString(options?.entry)
            ? []
            : [
                {
                  tag: 'script',
                  attrs: {
                    type: 'module',
                    src: `/${VIRTUAL_COMPILE_ENTRY_ID}`,
                  },
                  injectTo: 'head',
                },
              ],
        };
      },
    },
    resolveId(id) {
      if (id === `/${VIRTUAL_COMPILE_ENTRY_ID}`) {
        return `\0${VIRTUAL_COMPILE_ENTRY_ID}`;
      }

      return id;
    },
    load(id, options) {
      if (id === `\0${VIRTUAL_COMPILE_ENTRY_ID}`) {
        return [
          `/** inject tailwindcss @tailwind directives and devtools **/`,
          `import '_tailwind_.css'`,
          `import '_tailwind-devtools_.js'`,
        ].join('\n');
      }

      if (id === `${DEVTOOLS_VIRTUAL_ID}`) {
        debug(
          `load devtools ${DEVTOOLS_VIRTUAL_ID}`,
          options?.ssr,
          isDev(mode),
          typeof server,
        );
        if (!options?.ssr && isDev(mode) && server) {
          return transformDevtoolsClient(service, '', CONFIG_VIEWER_PATH);
        } else {
          return '';
        }
      }

      if (id === `${TAILWIND_ENTRY_VIRTUAL_ID}`) {
        debug(`load tailwind entry ${TAILWIND_ENTRY_VIRTUAL_ID}`);
        return [
          `@tailwind base;`,
          `@tailwind components;`,
          `@tailwind utilities;`,
        ].join('\n');
      }
    },
    transform: {
      order: 'pre',
      async handler(code, id) {
        if (!transformCSSFilter(id)) {
          return code;
        }

        await service.ensureInit();

        if (dirtyFiles.size && isDev(mode)) {
          const { configFiles, files } = Array.from(dirtyFiles).reduce<{
            configFiles: string[];
            files: string[];
          }>(
            (map, file) => {
              file === 'config-file' || service.configDependencies.has(file)
                ? map.configFiles.push(file)
                : map.files.push(file);
              return map;
            },
            {
              configFiles: [],
              files: [],
            },
          );

          if (configFiles.length) {
            await service.refresh();
          } else {
            service.updateChangedContent(
              files.map(file => {
                return {
                  content: readFileSync(file, 'utf8'),
                  extension: extname(file).slice(1),
                };
              }),
            );
          }

          dirtyFiles.clear();
        }

        try {
          const result = await service.transformCSS(code);

          debug(`transform ${id} success`);

          return {
            code: result.css,
          };
        } catch (err) {
          debug(`transform ${id} err: \n${err}`);
          throw err;
        }
      },
    },
    handleHotUpdate(ctx) {
      let { file } = ctx;

      if (file === service.configPath) {
        debug(`tailwindcss config file changed.`);
        file = 'config-file';
      }

      if (!dirtyFiles.has(file)) {
        dirtyFiles.add(file);
        service.invalidateCssModule({ server, options });
      }
    },
  };
};
