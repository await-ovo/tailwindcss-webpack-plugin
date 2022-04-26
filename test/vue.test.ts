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
      bin: './node_modules/@vue/cli-service/bin/vue-cli-service',
      command: 'serve',
      cwd: resolve(process.cwd(), './examples/vue'),
      port: 5555,
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
      await page.goto('http://localhost:5555');

      let backgroundColor = await page.$eval('#app', el => {
        return window.getComputedStyle(el).backgroundColor;
      });

      expect(backgroundColor).toEqual('rgba(0, 0, 0, 0)');

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
