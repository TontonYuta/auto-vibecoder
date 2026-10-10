const logger = require('../utils/logger');

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

class SelfHealingEngine {
  constructor(page, driver) {
    this.page = page;
    this.driver = driver;
    this.consoleErrors = [];
    this.setupConsoleListener();
  }

  setupConsoleListener() {
    this.page.on('console', (msg) => {
      if (msg.type() === 'error') {
        const text = msg.text();
        if (
          !text.includes('favicon') &&
          !text.includes('analytics') &&
          !text.includes('gtm') &&
          (text.includes('Error') || text.includes('Uncaught') || text.includes('TypeError'))
        ) {
          this.consoleErrors.push(text);
          logger.warn(`Console error caught: ${text.slice(0, 100)}...`);
        }
      }
    });
  }

  async checkAndHeal(maxRetries = 3) {
    let retries = 0;

    while (retries < maxRetries) {
      await this.driver.dismissPopups();

      // 1. Kiểm tra nút "Fix" / "Fix with Gemini"
      const fixBtn = await this.page.$(
        'button:has-text("Fix"), button:has-text("Fix with Gemini"), button:has-text("Fix error"), button[aria-label*="Fix"]'
      );

      if (fixBtn && (await fixBtn.isVisible())) {
        logger.warn('⚠️ Phát hiện nút "Fix"! Đang kích hoạt tự động sửa lỗi...');
        await fixBtn.click();
        await sleep(3000);
        await this.driver.waitForBuild();
        retries++;
        continue;
      }

      // 2. Kiểm tra Error Banner / Toast đỏ
      const errorBanners = await this.page.$$(
        '[role="alert"], .error-banner, .build-error, div:has-text("Error running the code")'
      );
      let foundBanner = false;
      for (const banner of errorBanners) {
        if (await banner.isVisible()) {
          const text = (await banner.innerText()).trim();
          if (
            text.length > 5 &&
            (text.toLowerCase().includes('error') ||
             text.toLowerCase().includes('fail') ||
             text.toLowerCase().includes('crash'))
          ) {
            logger.warn(`⚠️ Bắt được banner lỗi: "${text.slice(0, 100)}..."`);
            logger.info('Tự động gửi prompt khắc phục lỗi vào chat...');
            await this.driver.sendPrompt(`Bản build đang bị lỗi sau: "${text}". Hãy sửa lại toàn bộ mã nguồn để khắc phục triệt để.`);
            await this.driver.waitForBuild();
            retries++;
            foundBanner = true;
            break;
          }
        }
      }
      if (foundBanner) continue;

      // 3. Kiểm tra unhandled Console errors
      if (this.consoleErrors.length > 0) {
        const uniqueErrors = [...new Set(this.consoleErrors)].slice(0, 3);
        logger.warn(`⚠️ Phát hiện ${uniqueErrors.length} lỗi JavaScript ngầm trong Sandbox!`);
        this.consoleErrors = [];
        const fixPrompt = `Khi chạy ứng dụng, console báo lỗi:\n${uniqueErrors.join('\n')}\nHãy kiểm tra và khắc phục lỗi này.`;
        await this.driver.sendPrompt(fixPrompt);
        await this.driver.waitForBuild();
        retries++;
        continue;
      }

      // Không có lỗi
      logger.success('Bản build hoàn toàn khỏe mạnh, không phát hiện lỗi runtime.');
      break;
    }
  }
}

module.exports = SelfHealingEngine;
