const { chromium } = require('playwright');

async function closeAndCheck() {
  const browser = await chromium.connectOverCDP('http://localhost:9222');
  const context = browser.contexts()[0];
  const page = context.pages().find((p) => p.url().includes('aistudio.google.com/apps'));

  const frameElement = await page.$('iframe');
  const frame = await frameElement.contentFrame();

  if (frame) {
    const closeBtn = await frame.$('button:has-text("Đóng")');
    if (closeBtn) {
      console.log(' Đang click "Đóng" modal...');
      await closeBtn.click();
      await page.waitForTimeout(1500);
    }
  }

  // Chụp ảnh giao diện sau khi đóng modal
  const outPath = '/home/tontonyuta/auto-vibecoder/output/no_scroll_arena.png';
  await page.screenshot({ path: outPath });
  console.log('📸 Đã lưu ảnh: ' + outPath);

  await browser.close();
}

closeAndCheck().catch(console.error);
