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
      bin: './node_modules/next/dist/bin/next',
      command: 'dev',
      cwd: resolve(process.cwd(), './examples/next.js'),
      port: 4444,
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
      await page.goto('http://localhost:4444');

      let backgroundColor = await page.$eval('#__next div', el => {
        return window.getComputedStyle(el).backgroundColor;
      });

      expect(backgroundColor).toEqual('rgb(219, 234, 254)');

      await page.$eval('#__next div', el => (el.className += ' bg-yellow-500'));

      await sleep();

      backgroundColor = await page.$eval('#__next div', el => {
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
