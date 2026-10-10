const logger = require('../utils/logger');
const path = require('path');

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

class AIStudioDriver {
  constructor(page, outputDir = 'output') {
    this.page = page;
    this.outputDir = outputDir;
  }

  async dismissPopups() {
    try {
      const dismissBtns = await this.page.$$(
        'button:has-text("No thanks"), button:has-text("Got it"), button[aria-label*="Close"], button:has-text("✕")'
      );
      for (const btn of dismissBtns) {
        if (await btn.isVisible()) {
          await btn.click();
          await sleep(300);
        }
      }
    } catch (e) {}
  }

  async sendPrompt(text) {
    await this.dismissPopups();

    // Nếu đang ở chế độ fullscreen applet, thoát ra để hiển thị ô nhập prompt
    if (this.page.url().includes('fullscreenApplet=true')) {
      try {
        const exitFsBtn = await this.page.$('button[aria-label*="Exit full screen"], button[aria-label*="Full screen"]');
        if (exitFsBtn) {
          await exitFsBtn.click({ force: true });
          await sleep(500);
        }
      } catch (e) {}
    }

    // 1. Tìm ô nhập liệu (Chat box trong Editor hoặc Textarea ở Home)
    const inputSelector = 'textarea[placeholder*="Make changes"], textarea.prompt-textarea, textarea[placeholder*="Describe an app"], div[contenteditable="true"]';
    let inputField = await this.page.$(inputSelector);

    if (!inputField) {
      inputField = await this.page.waitForSelector(inputSelector, { timeout: 15000 });
    }

    logger.info('Đang nhập prompt vào AI Studio...');
    await inputField.focus();
    await inputField.click({ force: true }).catch(() => {});
    await inputField.fill(text);
    await sleep(800);

    // 2. Tìm nút gửi
    const sendBtn = await this.page.$(
      'button[aria-label*="Send"], button.send-button:not(.running), button.build-button, button:has-text("Send"), button:has-text("Build")'
    );

    if (sendBtn && (await sendBtn.isVisible())) {
      logger.info('Nhấn nút gửi...');
      await sendBtn.click({ force: true });
    } else {
      logger.info('Gửi bằng tổ hợp phím Control+Enter...');
      await this.page.keyboard.press('Control+Enter');
    }
  }

  async waitForBuild(maxWaitSec = 300) {
    logger.info('Đang chờ Gemini hoàn tất sinh mã và render preview...');
    let elapsed = 0;
    await sleep(6000); // Đợi build khởi động

    while (elapsed < maxWaitSec) {
      const runningBtn = await this.page.$(
        'button.send-button.running, button:has-text("Stop"), button[aria-label*="Stop"], button[aria-label*="Cancel"]'
      );

      if (!runningBtn) {
        logger.success(`Quá trình sinh mã đã hoàn tất sau ~${elapsed + 6}s!`);
        break;
      }

      await sleep(4000);
      elapsed += 4;
      process.stdout.write(`...đang biên dịch và cập nhật sandbox (${elapsed}s)\r`);
    }

    // Chờ thêm 6 giây cho iframe preview nạp mã mới
    await sleep(6000);
  }

  async captureScreenshot(name) {
    const filePath = path.join(this.outputDir, `${name}.png`);
    await this.page.screenshot({ path: filePath });
    logger.success(`Đã lưu ảnh chụp: ${filePath}`);
    return filePath;
  }

  async capturePreviewScreenshot(name) {
    const filePath = path.join(this.outputDir, `${name}_preview.png`);
    try {
      const previewIframe = await this.page.$('iframe[title="Preview"]:visible, iframe[title="Preview"]');
      if (previewIframe) {
        await previewIframe.screenshot({ path: filePath });
        logger.success(`Đã lưu ảnh chụp Preview: ${filePath}`);
        return filePath;
      }
    } catch (e) {
      logger.warn(`Không thể chụp trực tiếp iframe preview: ${e.message}`);
    }
    return this.captureScreenshot(name);
  }
}

module.exports = AIStudioDriver;
