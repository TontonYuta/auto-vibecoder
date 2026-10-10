const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

(async () => {
  const browser = await chromium.connectOverCDP('http://localhost:9222');
  const page = browser.contexts()[0].pages().find((p) => p.url().includes('aistudio.google.com'));

  const files = await page.evaluate(() => {
    if (window.monaco && window.monaco.editor) {
      return window.monaco.editor.getModels().map((m) => ({
        uri: m.uri.toString(),
        content: m.getValue(),
      }));
    }
    return [];
  });

  const appDir = path.join(__dirname, 'apps', 'mathteach-studio');
  for (const f of files) {
    const relPath = f.uri.replace('file:///', '');
    const fullPath = path.join(appDir, relPath);
    const dir = path.dirname(fullPath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(fullPath, f.content, 'utf8');
    console.log('Saved:', relPath);
  }

  // Back to Preview
  const previewBtn = await page.$('button:has-text("Preview")');
  if (previewBtn) await previewBtn.click();

  await browser.close();
})();
