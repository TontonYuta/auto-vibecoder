const BrowserManager = require('./src/core/browser');
const AIStudioDriver = require('./src/core/driver');
const SelfHealingEngine = require('./src/core/healing');
const logger = require('./src/utils/logger');
const path = require('path');

const NO_SCROLL_PROMPT = `Yêu cầu thiết kế lại bố cục: TOÀN BỘ GIAO DIỆN PHẢI NẰM GỌN TRONG 1 MÀN HÌNH DUY NHẤT (NO SCROLL / 100vh):
1. Khung bao bọc ngoài cùng (Root wrapper):
   - Bắt buộc dùng \`h-screen max-h-screen w-full overflow-hidden flex flex-col justify-between\`.
   - Tuyệt đối KHÔNG xuất hiện thanh cuộn dọc (no vertical scrollbar) hoặc cuộn ngang trên cả máy tính lẫn điện thoại.

2. Header điều hướng:
   - Thu gọn độ cao tinh tế (h-12 hoặc h-14), padding nhỏ gọn, các nút chế độ chơi dạng pill tag thanh thoát.

3. Vùng tính nhẩm trung tâm (Math Arena & Race Track):
   - Chiếm phần không gian flex-1 ở giữa, căn giữa dọc và ngang hoàn hảo.
   - Phép tính số to rõ (text-5xl hoặc text-6xl), ô nhập đáp án glow cyan nổi bật.
   - Đường đua MathBot Duel đặt gọn gàng phía trên phép tính mà không chiếm nhiều diện tích.

4. Bàn phím ảo Numpad:
   - Kích thước các phím được thu gọn vừa vặn (khoảng h-11 đến h-12, phím số to rõ), đặt cố định ở đáy màn hình.
   - Toàn bộ đề bài, ô nhập kết quả và Numpad phải nhìn thấy đầy đủ 100% cùng lúc trong 1 khung hình.`;

async function runNoScrollUpdate() {
  logger.banner('CẬP NHẬT GIAO DIỆN SINGLE-PAGE (NO SCROLL)');

  const browserMgr = new BrowserManager();
  const { browser, page } = await browserMgr.connect();

  const outputDir = path.join(__dirname, 'output');
  const driver = new AIStudioDriver(page, outputDir);
  const healer = new SelfHealingEngine(page, driver);

  logger.info('Đang gửi prompt thiết kế No-Scroll vào AI Studio...');
  await driver.sendPrompt(NO_SCROLL_PROMPT);

  logger.info('Đang đợi Gemini biên dịch giao diện No-Scroll...');
  await driver.waitForBuild();

  logger.info('Kiểm tra và tự động sửa lỗi (Self-Healing)...');
  await healer.checkAndHeal();

  const screenshotPath = await driver.captureScreenshot('mathheads_no_scroll_preview');
  logger.success(`Đã lưu ảnh giao diện No-Scroll mới vào: ${screenshotPath}`);

  await browser.close();
  logger.success('🎉 CẬP NHẬT GIAO DIỆN NO-SCROLL HOÀN TẤT THÀNH CÔNG!');
}

runNoScrollUpdate().catch((err) => {
  logger.error(`Lỗi: ${err.message}`);
  console.error(err);
  process.exit(1);
});
