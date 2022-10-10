import { resolve, extname, isAbsolute } from 'path';
import { existsSync, readFileSync } from 'fs';
import createDebugger from 'debug';
import tailwind from 'tailwindcss/lib/processTailwindFeatures';
import getModuleDependencies from 'tailwindcss/lib/lib/getModuleDependencies';
import resolveConfig from 'tailwindcss/resolveConfig';
import normalizePath from 'normalize-path';
import fastGlob from 'fast-glob';
import {
  DEFAULT_TAILWIND_CONFIG_FILE,
  DEFAULT_TAILWIND_ENTRY_CONTENT,
} from './constants';
import type { PluginCreator } from 'postcss';
import type { IncomingMessage } from 'http';
import type { ChangedContent, UserOptions } from './types';
import type { Config as TailwindConfig } from 'tailwindcss';

export * from './constants';
export * from './types';

export const debug = createDebugger('tailwindcss-design-in-devtools');

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

export const isDev = () => process.env.NODE_ENV === 'development';

export const isString = (v: unknown): v is string => typeof v === 'string';

export const isObject = (v: unknown): v is object =>
  Object.prototype.toString.call(v) === '[object Object]';

export const parseRequestBody = (req: IncomingMessage) =>
  new Promise<any>((resolve, reject) => {
    let data = '';
    req.on('data', chunk => (data += chunk));
    req.on('end', () => {
      try {
        const json = JSON.parse(data);
        resolve(json);
      } catch (err) {
        reject(err);
      }
    });
    req.on('error', err => reject(err));
  });

export const ensureAbsolute = (file: string, root: string = process.cwd()) =>
  isAbsolute(file) ? file : resolve(root, file);

export const ensureTrailingSlash = (s?: string) =>
  isString(s) ? (s.endsWith('/') ? s.replace(/\/*$/, '/') : `${s}/`) : s;

// load tailwindcss configuration
export const loadConfiguration = (
  options: UserOptions,
  root: string = process.cwd(),
): { config: TailwindConfig; dependencies?: Set<string> } => {
  let configPath = resolve(root, DEFAULT_TAILWIND_CONFIG_FILE);

  let dependencies: Set<string> | undefined = undefined;

  if (options?.config) {
    if (isString(options.config)) {
      configPath = options.config;
    } else {
      return { config: options.config };
    }
  }

  let config = resolveConfig(existsSync(configPath) ? require(configPath) : {});

  if (existsSync(configPath)) {
    const deps = getModuleDependencies(configPath).map(({ file }) => file);
    dependencies = new Set(deps);
  }

  return {
    config,
    dependencies,
  };
};

export const getChangedContent = (config: TailwindConfig): ChangedContent => {
  let changedContent: ChangedContent = [];

  const globs = (config.content! as { files: string[] }).files
    .filter(file => isString(file))
    .map(glob => normalizePath(glob));

  changedContent = fastGlob.sync(globs).map(file => ({
    content: readFileSync(file, 'utf8'),
    extension: extname(file).slice(1),
  }));

  const rawContents = (config.content as any)!.files.filter(
    (file: any) => isObject(file) && file !== null,
  );

  for (let { raw: content, extension = 'html' } of rawContents) {
    changedContent.push({
      content,
      extension,
    });
  }

  debug(`[service]: getChangedContent ->`, changedContent.length);

  return changedContent;
};

export class BaseTailwindService {
  _context: any = null;

  _tailwindConfig: TailwindConfig | null = null;

  configDependencies = new Set<string>();

  changedContent: ChangedContent = [];

  options: UserOptions;

  constructor(options: UserOptions) {
    this.options = options;
  }

  get context() {
    return this._context;
  }

  get tailwindConfig() {
    return this._tailwindConfig;
  }

  async transformCSS(source: string) {
    const service = this;

    const tailwindPlugin: PluginCreator<void> = () => ({
      postcssPlugin: 'tailwindcss',
      Once(root, { result }) {
        tailwind(({ createContext }: { createContext: any }) => {
          return () => {
            if (service._context !== null) {
              service._context.changedContent = service.changedContent;
              return service._context;
            }
            service._context = createContext(
              service._tailwindConfig,
              service.changedContent,
            );
            return service.context;
          };
        })(root, result);
      },
    });

    tailwindPlugin.postcss = true;

    const processor = (await import('postcss')).default([tailwindPlugin]);

    return processor.process(source, { from: undefined });
  }

  updateChangedContent(changed: ChangedContent) {
    debug(`[service]: update changed content: `, changed.length);
    this.changedContent!.push(...changed);
  }

  clearChangedContent() {
    this.changedContent = [];
  }

  getCompletions() {
    const classes = this._context
      .getClassList()
      .map((className: string) => `.${className}{}`)
      .join(' ');

    return `
        const style = document.createElement('style');
        style.setAttribute('type', 'text/css');
        style.innerHTML = ${JSON.stringify(classes)};
        const head = document.getElementsByTagName('head')[0];
        head.prepend(style);
    `;
  }

  ensureInit = promiseSingleton(async () => {
    debug(`[service]: ensure init service`);

    const { config, dependencies } = loadConfiguration(this.options);

    this._tailwindConfig = config;

    if (dependencies?.size) {
      for (const dependency of dependencies) {
        this.configDependencies.add(dependency);
      }
    }

    this.changedContent = getChangedContent(this._tailwindConfig);

    if (this._context === null) {
      await this.transformCSS(DEFAULT_TAILWIND_ENTRY_CONTENT);
    }
  });

  async refresh() {
    debug('[service]: refresh');
    this.configDependencies.clear();
    this.changedContent = [];
    this._tailwindConfig = null;
    const { config, dependencies } = loadConfiguration(this.options);

    this._tailwindConfig = config;

    if (dependencies?.size) {
      for (const dependency of dependencies) {
        this.configDependencies.add(dependency);
      }
    }

    this.changedContent = getChangedContent(this._tailwindConfig);
  }

  invalidateCssModule() {
    // empty
  }
}
