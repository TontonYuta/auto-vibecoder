const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function verifyAllTabs() {
  const outputDir = path.join(__dirname, 'output', 'mathteach');
  const brainDir = '/home/tontonyuta/.gemini/antigravity-cli/brain/6dba95e9-66e6-4702-9c45-2bf4530b77e1';
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  console.log('⚡ Kết nối Chrome DevTools CDP để kiểm thử chi tiết 4 Module...');
  const browser = await chromium.connectOverCDP('http://localhost:9222');
  const context = browser.contexts()[0];
  const page = context.pages().find((p) => p.url().includes('aistudio.google.com'));

  if (!page) {
    console.error('Không tìm thấy trang Google AI Studio!');
    await browser.close();
    return;
  }

  // Tắt popup khảo sát nếu có
  try {
    const noThanksBtn = await page.$('button:has-text("No thanks"), button[aria-label*="Close"]');
    if (noThanksBtn && await noThanksBtn.isVisible()) {
      await noThanksBtn.click();
      await sleep(500);
    }
  } catch (e) {}

  const iframeEl = page.locator('iframe[title="Preview"]').first();
  const fl = page.frameLocator('iframe[title="Preview"]').first();

  // Hàm chụp ảnh iframe lưu vào cả output và brain artifacts
  async function snap(name) {
    const outPath = path.join(outputDir, `${name}.png`);
    const brainPath = path.join(brainDir, `${name}.png`);
    await iframeEl.screenshot({ path: outPath });
    fs.copyFileSync(outPath, brainPath);
    console.log(`📸 Đã lưu ảnh: ${name}.png`);
  }

  // ==========================================
  // 1. KIỂM THỬ TAB 1: BẬC 2/1 CÓ TIỆM CẬN XIÊN
  // ==========================================
  console.log('\n--- [MODULE 1]: GIẢI TÍCH 12 - HÀM BẬC 2/1 CÓ TIỆM CẬN XIÊN ---');
  await fl.locator('button:has-text("Bậc 2 / 1 (TCX)")').click();
  await sleep(1000);
  await fl.locator('button:has-text("Bậc 2/1: Tiệm cận xiên chuẩn (SGK 12 mới)")').click();
  await sleep(1500);
  await snap('mathteach_tab1_tcx');

  // ==========================================
  // 2. KIỂM THỬ TAB 2: THỐNG KÊ GHÉP NHÓM & LỜI GIẢI
  // ==========================================
  console.log('\n--- [MODULE 2]: THỐNG KÊ MẪU SỐ LIỆU GHÉP NHÓM TOÁN 12 CTM ---');
  await fl.locator('button:has-text("Thống Kê Ghép Nhóm")').click();
  await sleep(2000);

  // Thử bấm các nút ví dụ hoặc lời giải chi tiết nếu có
  const buttonsTab2 = await fl.locator('button').allInnerTexts();
  console.log('Các nút ở Tab 2:', buttonsTab2.filter(b => b.trim().length > 0));

  await snap('mathteach_tab2_statistics');

  // ==========================================
  // 3. KIỂM THỬ TAB 3: XÁC SUẤT SƠ ĐỒ CÂY & BAYES
  // ==========================================
  console.log('\n--- [MODULE 3]: XÁC SUẤT CÓ ĐIỀU KIỆN & SƠ ĐỒ CÂY BAYES ---');
  await fl.locator('button:has-text("Xác Suất Sơ Đồ Cây")').click();
  await sleep(2000);

  const buttonsTab3 = await fl.locator('button').allInnerTexts();
  console.log('Các nút ở Tab 3:', buttonsTab3.filter(b => b.trim().length > 0));

  await snap('mathteach_tab3_probability');

  // ==========================================
  // 4. KIỂM THỬ TAB 4: HÌNH HỌC KHÔNG GIAN OXYZ 3D
  // ==========================================
  console.log('\n--- [MODULE 4]: HÌNH HỌC KHÔNG GIAN OXYZ 3D ---');
  await fl.locator('button:has-text("Không Gian Oxyz 3D")').click();
  await sleep(2500);

  const buttonsTab4 = await fl.locator('button').allInnerTexts();
  console.log('Các nút ở Tab 4:', buttonsTab4.filter(b => b.trim().length > 0));

  await snap('mathteach_tab4_oxyz3d');

  console.log('\n TOÀN BỘ KIỂM THỬ 4 TAB HOÀN TẤT THÀNH CÔNG!');
  await browser.close();
}

verifyAllTabs().catch((err) => {
  console.error('❌ Lỗi kiểm thử:', err);
  process.exit(1);
});
