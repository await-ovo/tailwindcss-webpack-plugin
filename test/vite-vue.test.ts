import { resolve } from 'path';
import { afterAll, beforeAll, describe, expect, test } from 'vitest';
import puppeteer from 'puppeteer';
import { killApp, runDev, sleep } from './test-util';
import type { Browser, Page } from 'puppeteer';
import type { ChildProcess } from 'child_process';

describe('vite-vue should dev successfully', async () => {
  let browser: Browser;
  let page: Page;
  let app: ChildProcess;

  beforeAll(async () => {
    app = (await runDev({
      bin: './node_modules/vite/bin/vite.js',
      command: 'serve',
      cwd: resolve(process.cwd(), './examples/vite-vue'),
      port: 5174,
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
      await page.goto('http://localhost:5174');

      let backgroundColor = await page.$eval('#app', el => {
        return window.getComputedStyle(el).backgroundColor;
      });

      let cardColor = await page.$eval(
        '.card',
        el => window.getComputedStyle(el).backgroundColor,
      );

      expect(backgroundColor).toEqual('rgb(251, 207, 232)');

      expect(cardColor).toEqual('rgb(254, 202, 202)');

      await page.$eval('#app', el => (el.className += ' bg-yellow-500'));

      await sleep();

      backgroundColor = await page.$eval('#app', el => {
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
