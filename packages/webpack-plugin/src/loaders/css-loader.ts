import { extname } from 'path';
import { readFileSync } from 'fs';
import { isDev, debug } from 'tailwindcss-webpack-plugin-utils';
import type webpack from 'webpack';
import type { Compiler } from '../types';

export default async function CssLoader(
  this: webpack.LoaderContext<string>,
  source: string,
) {
  this.cacheable(false);

  debug(`[css-loader]: transform ${this.resourcePath} start`);

  const callback = this.async()!;

  const { service, dirty } = (this._compiler as Compiler).$tailwind;

  await service.ensureInit();

  if (dirty.size && isDev()) {
    const { configFiles, files } = Array.from(dirty).reduce<{
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

    dirty.clear();
  }

  try {
    const result = await service.transformCSS(source);

    debug(`[css-loader]: transform ${this.resourcePath} success`);

    callback(null, result.css);
  } catch (err) {
    debug(`[css-loader]: transform ${this.resourcePath} err: \n${err}`);
    callback(err as Error, `${source}\n/* Error: ${err}*/`);
  }
}
