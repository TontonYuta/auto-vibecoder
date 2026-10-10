const { chromium } = require('playwright');
const http = require('http');
const { spawn } = require('child_process');
const path = require('path');
const os = require('os');
const logger = require('../utils/logger');

class BrowserManager {
  constructor(port = 9222) {
    this.port = port;
    this.endpoint = `http://localhost:${port}`;
  }

  /**
   * Kiểm tra xem cổng CDP 9222 đã hoạt động chưa
   */
  async isPortOpen() {
    return new Promise((resolve) => {
      const req = http.get(`${this.endpoint}/json/version`, (res) => {
        resolve(res.statusCode === 200);
      });
      req.on('error', () => resolve(false));
      req.setTimeout(1500, () => {
        req.destroy();
        resolve(false);
      });
    });
  }

  /**
   * Tự động khởi chạy Chrome với cổng CDP nếu chưa mở
   */
  async ensureChrome() {
    const isOpen = await this.isPortOpen();
    if (isOpen) {
      logger.success(`Phát hiện Chrome đang chạy sẵn trên cổng ${this.port}`);
      return;
    }

    logger.info(`Cổng ${this.port} chưa mở. Đang khởi chạy Google Chrome với Remote Debugging...`);
    const userDataDir = path.join(os.homedir(), '.config', 'google-chrome-ai-studio');
    
    const chromeProcess = spawn('google-chrome', [
      `--remote-debugging-port=${this.port}`,
      `--user-data-dir=${userDataDir}`,
      'https://aistudio.google.com/apps'
    ], {
      detached: true,
      stdio: 'ignore'
    });

    chromeProcess.unref();

    // Chờ tối đa 15s cho port 9222 sẵn sàng
    let attempts = 0;
    while (attempts < 15) {
      await new Promise((r) => setTimeout(r, 1000));
      if (await this.isPortOpen()) {
        logger.success(`Google Chrome đã sẵn sàng trên cổng ${this.port}!`);
        return;
      }
      attempts++;
    }

    throw new Error(`Không thể khởi chạy hoặc kết nối tới Chrome trên cổng ${this.port} sau 15 giây.`);
  }

  /**
   * Kết nối Playwright vào Chrome CDP
   */
  async connect() {
    await this.ensureChrome();
    logger.info(`Đang kết nối Playwright tới ${this.endpoint}...`);
    const browser = await chromium.connectOverCDP(this.endpoint);
    const context = browser.contexts()[0];
    
    // Tìm tab AI Studio đang mở
    let page = context.pages().find((p) => p.url().includes('aistudio.google.com'));
    if (!page) {
      logger.info('Mở tab mới đến https://aistudio.google.com/apps...');
      page = await context.newPage();
      await page.goto('https://aistudio.google.com/apps', { waitUntil: 'domcontentloaded' });
    }

    return { browser, context, page };
  }
}

module.exports = BrowserManager;
