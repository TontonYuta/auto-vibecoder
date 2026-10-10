const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function captureAllDetailViews() {
  const outputDir = path.join(__dirname, 'output', 'mathteach');
  const brainDir = '/home/tontonyuta/.gemini/antigravity-cli/brain/6dba95e9-66e6-4702-9c45-2bf4530b77e1';

  const browser = await chromium.connectOverCDP('http://localhost:9222');
  const context = browser.contexts()[0];
  const page = context.pages().find((p) => p.url().includes('aistudio.google.com'));

  const iframeEl = page.locator('iframe[title="Preview"]').first();
  const fl = page.frameLocator('iframe[title="Preview"]').first();

  async function snap(name) {
    const outPath = path.join(outputDir, `${name}.png`);
    const brainPath = path.join(brainDir, `${name}.png`);
    await iframeEl.screenshot({ path: outPath });
    fs.copyFileSync(outPath, brainPath);
    console.log(`📸 Đã lưu ảnh: ${name}.png`);
  }

  // 1. Chuyển Tab 2: Thống Kê và mở Lời Giải Chi Tiết (steps)
  console.log('1. Chuyển sang Tab 2 và xem Lời Giải Chi Tiết...');
  const navTab2 = fl.locator('header .flex.items-center.gap-1 button').nth(1);
  await navTab2.click();
  await sleep(1500);

  const stepsBtn = fl.locator('button:has-text("Lời Giải Chi Tiết")');
  await stepsBtn.waitFor({ state: 'visible', timeout: 5000 });
  await stepsBtn.click();
  await sleep(1500);
  await snap('mathteach_tab2_step_by_step_solution');

  // 2. Chuyển Tab 3: Xác Suất Sơ Đồ Cây & Bấm preset bài kiểm tra linh kiện
  console.log('2. Chuyển sang Tab 3 và kiểm tra bài toán Linh kiện SGK Cánh Diều...');
  const navTab3 = fl.locator('header .flex.items-center.gap-1 button').nth(2);
  await navTab3.click();
  await sleep(1500);

  // Click preset thứ 2: Kiểm định linh kiện
  const presetBtn = fl.locator('button:has-text("Kiểm Định Linh Kiện"), button:has-text("linh kiện")').first();
  if (await presetBtn.count() > 0) {
    await presetBtn.click();
    await sleep(1000);
  }
  await snap('mathteach_tab3_bayes_linh_kien');

  // 3. Chuyển Tab 4: Không Gian Oxyz 3D & Preset SGK Cánh Diều
  console.log('3. Chuyển sang Tab 4 và kiểm tra tương tác 3D...');
  const navTab4 = fl.locator('header .flex.items-center.gap-1 button').nth(3);
  await navTab4.click();
  await sleep(1500);

  const oxyzPreset = fl.locator('button:has-text("Mặt phẳng tiếp xúc"), button:has-text("Cánh Diều")').first();
  if (await oxyzPreset.count() > 0) {
    await oxyzPreset.click();
    await sleep(1000);
  }
  await snap('mathteach_tab4_oxyz_sphere_plane');

  console.log('🎉 Hoàn tất chụp ảnh chi tiết các tính năng sâu!');
  await browser.close();
}

captureAllDetailViews().catch((e) => {
  console.error('Lỗi:', e);
  process.exit(1);
});
