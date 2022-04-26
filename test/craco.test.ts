import { resolve } from 'path';
import { afterAll, beforeAll, describe, expect, test } from 'vitest';
import puppeteer from 'puppeteer';
import { killApp, runDev, sleep } from './test-util';
import type { Browser, Page } from 'puppeteer';
import type { ChildProcess } from 'child_process';

describe('create-react-app should dev successfully', async () => {
  let browser: Browser;
  let page: Page;
  let app: ChildProcess;

  beforeAll(async () => {
    app = (await runDev({
      bin: './node_modules/@craco/craco/bin/craco.js',
      command: 'start',
      cwd: resolve(process.cwd(), './examples/craco'),
      port: 3333,
    })) as ChildProcess;
    browser = await puppeteer.launch({
      headless: true,
    });
    page = await browser.newPage();
  });

  afterAll(async () => {
    killApp(app.pid!);
    await browser.close();
  });

  test('should apply change class names', async () => {
    try {
      await page.goto('http://localhost:3333');

      let backgroundColor = await page.$eval('header', el => {
        return window.getComputedStyle(el).backgroundColor;
      });

      expect(backgroundColor).toEqual('rgb(254, 226, 226)');

      await page.$eval('header', el => (el.className += ' bg-yellow-500'));

      await sleep();

      backgroundColor = await page.$eval('header', el => {
        return window.getComputedStyle(el).backgroundColor;
      });

      expect(backgroundColor).toEqual('rgb(234, 179, 8)');
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
      expect(e).toBeUndefined();
    }
  });
});
