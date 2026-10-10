#!/usr/bin/env node

const path = require('path');
const BrowserManager = require('../src/core/browser');
const AIStudioDriver = require('../src/core/driver');
const SelfHealingEngine = require('../src/core/healing');
const RecipePlanner = require('../src/planner/planner');
const logger = require('../src/utils/logger');

async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'run';

  logger.banner();

  if (command === 'check') {
    const browserMgr = new BrowserManager();
    const open = await browserMgr.isPortOpen();
    if (open) {
      logger.success('Cổng Chrome CDP (9222) đang hoạt động bình thường!');
    } else {
      logger.warn('Cổng 9222 chưa mở. Bạn có thể chạy "npm run chrome:debug" để mở Chrome.');
    }
    process.exit(0);
  }

  let specPath = args[1] || path.join(__dirname, '..', 'specs', 'mathheads.yaml');
  let plan;

  if (command === 'idea') {
    const idea = args.slice(1).join(' ') || 'Một game phản xạ tính toán vui nhộn';
    plan = RecipePlanner.createPlanFromIdea(idea);
  } else {
    // Run spec
    plan = RecipePlanner.loadSpec(specPath);
  }

  logger.banner(plan.title);

  // 1. Kết nối Browser
  const browserMgr = new BrowserManager();
  const { browser, page } = await browserMgr.connect();

  const outputDir = path.join(__dirname, '..', 'output');
  const driver = new AIStudioDriver(page, outputDir);
  const healer = new SelfHealingEngine(page, driver);

  // 2. Chạy từng giai đoạn (Stages)
  for (let i = 0; i < plan.stages.length; i++) {
    const stage = plan.stages[i];
    logger.step(i + 1, plan.stages.length, stage.title);

    // Gửi prompt
    await driver.sendPrompt(stage.prompt);

    // Chờ build
    await driver.waitForBuild();

    // Tự động kiểm tra và vá lỗi
    await healer.checkAndHeal();

    // Chụp ảnh lưu tiến độ
    await driver.captureScreenshot(`stage_${i + 1}_${stage.id}`);
  }

  logger.divider();
  logger.success('🎉 TOÀN BỘ CÔNG THỨC VIBECODE ĐÃ ĐƯỢC THI CÔNG HOÀN TẤT!');
  logger.info('Bạn có thể mở cửa sổ Chrome để trải nghiệm ứng dụng ngay lập tức.');
  await browser.close();
}

main().catch((err) => {
  logger.error(`Lỗi thực thi: ${err.message}`);
  console.error(err);
  process.exit(1);
});
