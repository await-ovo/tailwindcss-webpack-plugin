import { resolve, extname, isAbsolute } from 'path';
import { existsSync, readFileSync, utimesSync } from 'fs';
import createDebugger from 'debug';
import tailwind from 'tailwindcss/lib/processTailwindFeatures';
import getModuleDependencies from 'tailwindcss/lib/lib/getModuleDependencies';
import resolveConfig from 'tailwindcss/resolveConfig';
import normalizePath from 'normalize-path';
import fastGlob from 'fast-glob';
import { DevtoolsServer } from './devtools/server';
import {
  DEFAULT_TAILWIND_CONFIG_FILE,
  DEFAULT_TAILWIND_ENTRY_CONTENT,
  PLUGIN_NAME,
  TAILWIND_ENTRY_PATH,
} from './constants';
import type { PluginCreator } from 'postcss';
import type { IncomingMessage } from 'http';
import type { ChangedContent, Compiler, Service, UserOptions } from './types';
import type { TailwindConfig } from 'tailwindcss/tailwind-config';

export const debug = createDebugger(PLUGIN_NAME);

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

export const isDev = () => process.env.NODE_ENV === 'development';

export const isString = (v: unknown): v is string => typeof v === 'string';

export const isObject = (v: unknown): v is object =>
  Object.prototype.toString.call(v) === '[object Object]';

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

export const createService = (options: UserOptions): Service => {
  let context: any = null;

  let configDependencies = new Set<string>();

  let tailwindConfig: TailwindConfig | null = null;

  let changedContent: ChangedContent = [];

  const transformCSS = async (source: string) => {
    const tailwindPlugin: PluginCreator<void> = () => ({
      postcssPlugin: 'tailwindcss',
      Once(root, { result }) {
        tailwind(({ createContext }: { createContext: any }) => {
          return () => {
            if (context !== null) {
              context.changedContent = changedContent;
              return context;
            }
            context = createContext(tailwindConfig, changedContent);
            return context;
          };
        })(root, result);
      },
    });

    tailwindPlugin.postcss = true;

    const processor = (await import('postcss')).default([tailwindPlugin]);

    return processor.process(source, { from: undefined });
  };

  const updateChangedContent = (changed: ChangedContent) => {
    debug(`[service]: update chaned content: `, changed.length);
    changedContent!.push(...changed);
  };

  const clearChangedContent = () => (changedContent = []);

  const getCompletions = () => {
    const classes = context
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
  };

  // ensure init context.
  const ensureInit = promiseSingleton(async () => {
    debug(`[service]: ensure init service`);

    const { config, dependencies } = loadConfiguration(options);

    tailwindConfig = config;

    if (dependencies?.size) {
      for (const dependency of dependencies) {
        configDependencies.add(dependency);
      }
    }

    changedContent = getChangedContent(tailwindConfig);

    if (context === null) {
      await transformCSS(DEFAULT_TAILWIND_ENTRY_CONTENT);
    }
  });

  const invalidateCssModule = () => {
    debug(`invalidate virtual module ${options.entry ?? TAILWIND_ENTRY_PATH}`);
    // invalidate tailwind entry file.
    const fullPath = ensureAbsolute(options.entry ?? TAILWIND_ENTRY_PATH);
    const timestamp = Date.now();
    utimesSync(fullPath, timestamp, timestamp);
  };

  const refresh = async () => {
    debug('[service]: refresh');
    configDependencies.clear();
    changedContent = [];
    tailwindConfig = null;
    const { config, dependencies } = loadConfiguration(options);

    tailwindConfig = config;

    if (dependencies?.size) {
      for (const dependency of dependencies) {
        configDependencies.add(dependency);
      }
    }

    changedContent = getChangedContent(tailwindConfig);
  };

  return {
    get context() {
      return context;
    },
    get tailwindConfig() {
      return tailwindConfig;
    },
    configDependencies,
    transformCSS,
    updateChangedContent,
    clearChangedContent,
    getCompletions,
    ensureInit,
    invalidateCssModule,
    refresh,
  };
};

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
    service: createService(options),
  };
};

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
