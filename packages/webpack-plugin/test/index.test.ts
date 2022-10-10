import { expect, test } from 'vitest';
import { isWebTarget } from '../src/util';

test(`should distinguish webpack compile target properly`, () => {
  expect(isWebTarget('web')).toBe(true);
  expect(isWebTarget('electron-renderer')).toBe(true);
  expect(isWebTarget(['last 2 versions'])).toBe(true);
  expect(isWebTarget('node')).toBe(false);
  expect(isWebTarget('node12.18')).toBe(false);
  expect(isWebTarget('nwjs')).toBe(false);
  expect(isWebTarget('node-webkit')).toBe(false);
});
