import puppeteer, { type Browser, type LaunchOptions } from 'puppeteer-core';

let browserInstance: Browser | null = null;

const DEFAULT_ENDPOINT = 'ws://localhost:9222';
const LAUNCH_OPTIONS: LaunchOptions = {
  headless: true,
  args: [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-dev-shm-usage',
    '--disable-accelerated-2d-canvas',
    '--disable-gpu',
  ],
};

async function launchBrowser(): Promise<Browser> {
  const endpoint = process.env.PRINTER_ENDPOINT ?? DEFAULT_ENDPOINT;

  if (endpoint.startsWith('ws://') || endpoint.startsWith('wss://')) {
    return puppeteer.connect({
      browserWSEndpoint: endpoint,
      defaultViewport: { width: 794, height: 1123 },
    });
  }

  return puppeteer.launch({
    ...LAUNCH_OPTIONS,
    executablePath: endpoint,
    defaultViewport: { width: 794, height: 1123 },
  });
}

export async function getBrowser(): Promise<Browser> {
  if (!browserInstance || !browserInstance.connected) {
    browserInstance = await launchBrowser();
  }
  return browserInstance;
}

export async function closeBrowser(): Promise<void> {
  if (browserInstance && browserInstance.connected) {
    await browserInstance.close();
    browserInstance = null;
  }
}
