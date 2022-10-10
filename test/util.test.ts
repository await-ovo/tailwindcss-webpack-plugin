import { resolve } from 'path';
import { createServer } from 'http';
import request from 'supertest';
import { expect, test } from 'vitest';
import {
  promiseSingleton,
  isWebTarget,
  loadConfiguration,
  getChangedContent,
  parseRequestBody,
  ensureAbsolute,
  ensureTrailingSlash,
  createService,
} from '../packages/webpack-plugin/src/util';
import type { TailwindConfig } from 'tailwindcss/tailwind-config';

test(`should create singleton promise`, async () => {
  let executeCount = 0;
  const task = promiseSingleton(
    () =>
      new Promise(resolve => {
        setTimeout(() => {
          resolve(++executeCount);
        }, 2000);
      }),
  );

  expect(await task()).toEqual(1);
  expect(await task()).toEqual(1);
  expect(await task()).toEqual(1);
});

test(`should distinguish webpack compile target properly`, () => {
  expect(isWebTarget('web')).toBe(true);
  expect(isWebTarget('electron-renderer')).toBe(true);
  expect(isWebTarget(['last 2 versions'])).toBe(true);
  expect(isWebTarget('node')).toBe(false);
  expect(isWebTarget('node12.18')).toBe(false);
  expect(isWebTarget('nwjs')).toBe(false);
  expect(isWebTarget('node-webkit')).toBe(false);
});

test(`should load tailwind config from cwd correctly`, () => {
  const fixture = resolve(__dirname, './fixtures/load-config');
  const { config, dependencies } = loadConfiguration({}, fixture);

  expect((config.theme as any).name).toEqual('c');

  expect(Array.from(dependencies!)).toEqual([
    resolve(fixture, 'tailwind.config.js'),
    resolve(fixture, 'dep-a.js'),
    resolve(fixture, 'dep-b.js'),
    resolve(fixture, 'dep-c.js'),
  ]);
});

test(`should load tailwind config from specified path`, () => {
  const configPath = resolve(
    __dirname,
    './fixtures/load-config/tailwind.config.js',
  );
  const { config } = loadConfiguration({
    config: configPath,
  });

  expect((config.theme as any).name).toEqual('c');
});

test(`should return the given configuration directly`, () => {
  const { config } = loadConfiguration({
    config: {
      name: 'c',
      theme: {},
    } as TailwindConfig,
  });

  expect(config).toEqual({
    name: 'c',
    theme: {},
  });
});

test(`should scan contents correctly`, () => {
  const fixture = resolve(__dirname, './fixtures/scan-contents');

  const changed = getChangedContent({
    content: {
      files: [`${fixture}/src/**/*.(ts|tsx|js|jsx)`],
    },
    theme: {},
  } as TailwindConfig);

  expect(changed.length).toBe(3);
});

test(`should parse post request body to json`, async () => {
  const server = createServer(async (req, res) => {
    if (req.method === 'POST') {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      const { number } = await parseRequestBody(req);
      res.statusCode = 200;
      res.end(
        JSON.stringify({
          number: number + 1,
        }),
      );
    } else {
      res.statusCode = 200;
      res.end();
    }
  });

  const res = await request(server)
    .post('/test')
    .set('Accept', 'application/json')
    .send(
      JSON.stringify({
        number: 1,
      }),
    );

  expect(res.status).toBe(200);
  expect(res.body.number).toBe(2);
});

test(`should get absolute file path`, () => {
  expect(ensureAbsolute('./a/b')).toEqual(`${process.cwd()}/a/b`);
  expect(ensureAbsolute('/a/b')).toEqual('/a/b');
});

test(`should get path with trailing slash`, () => {
  expect(ensureTrailingSlash('a/b//')).toEqual('a/b/');
  expect(ensureTrailingSlash('a/b')).toEqual('a/b/');
  expect(ensureTrailingSlash('a/.c/d///')).toEqual('a/.c/d/');
});

test(`should init service successfully`, async () => {
  const service = createService({
    config: resolve(__dirname, './fixtures/scan-contents/tailwind.config.js'),
  });

  await service.ensureInit();

  expect(service.context).not.toBe(null);

  expect(Array.from(service.configDependencies).length).toBe(1);

  expect(service.tailwindConfig).not.toBe(null);
});
