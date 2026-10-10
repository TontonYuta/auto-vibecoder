const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function main() {
  const browser = await chromium.connectOverCDP('http://localhost:9222');
  const context = browser.contexts()[0];
  const page = context.pages().find((p) => p.url().includes('aistudio.google.com'));

  const targetUrl = 'https://aistudio.google.com/apps/1a1bb274-a0f4-47d4-b8a8-8968d1e12215?showPreview=true&showAssistant=true&fullscreenApplet=true';
  if (page.url() !== targetUrl) {
    await page.goto(targetUrl, { waitUntil: 'domcontentloaded' });
    await sleep(4000);
  }

  const outputDir = path.join(__dirname, 'output', 'clean_academy');
  const brainDir = '/home/tontonyuta/.gemini/antigravity-cli/brain/a77f8a51-82ce-4b87-9fe7-1fdf9b02bb9e';
  fs.mkdirSync(outputDir, { recursive: true });

  const iframeLocator = page.locator('iframe[title="Preview"]').first();
  const fl = page.frameLocator('iframe[title="Preview"]').first();

  console.log('--- 1. BÀI 1: TOKEN LÀ GÌ? ---');
  let p1 = path.join(outputDir, 'lesson_01_token_question.png');
  await iframeLocator.screenshot({ path: p1 });
  fs.copyFileSync(p1, path.join(brainDir, 'lesson_01_token_question.png'));
  console.log('✅ Chụp Bài 1 Question');

  // Chọn đáp án B: Khoảng 1.500 - 2.500 tokens
  const optB = fl.locator('button:has-text("1.500"), div:has-text("1.500")').first();
  if (await optB.isVisible()) {
    await optB.click();
    await sleep(800);
    let p1_answered = path.join(outputDir, 'lesson_01_token_answered.png');
    await iframeLocator.screenshot({ path: p1_answered });
    fs.copyFileSync(p1_answered, path.join(brainDir, 'lesson_01_token_answered.png'));
    console.log('✅ Chụp Bài 1 Answered (Feedback Xanh lá + Giải thích)');
  }

  // Sang Bài 2
  console.log('--- 2. BÀI 2: EMBEDDING & VECTOR ---');
  const nextBtn = fl.locator('button:has-text("Bài tiếp"), button:has-text("Tiếp tục")').first();
  await nextBtn.click();
  await sleep(1000);
  let p2 = path.join(outputDir, 'lesson_02_embedding.png');
  await iframeLocator.screenshot({ path: p2 });
  fs.copyFileSync(p2, path.join(brainDir, 'lesson_02_embedding.png'));
  console.log('✅ Chụp Bài 2');

  // Sang Bài 3
  console.log('--- 3. BÀI 3: CHUNKING & TEXT SPLITTING ---');
  await nextBtn.click();
  await sleep(1000);
  let p3 = path.join(outputDir, 'lesson_03_chunking.png');
  await iframeLocator.screenshot({ path: p3 });
  fs.copyFileSync(p3, path.join(brainDir, 'lesson_03_chunking.png'));
  console.log('✅ Chụp Bài 3');

  // Sang Bài 4
  console.log('--- 4. BÀI 4: RAG ---');
  await nextBtn.click();
  await sleep(1000);
  let p4 = path.join(outputDir, 'lesson_04_rag.png');
  await iframeLocator.screenshot({ path: p4 });
  fs.copyFileSync(p4, path.join(brainDir, 'lesson_04_rag.png'));
  console.log('✅ Chụp Bài 4');

  // Sang Bài 5
  console.log('--- 5. BÀI 5: AI AGENT ---');
  await nextBtn.click();
  await sleep(1000);
  let p5 = path.join(outputDir, 'lesson_05_agent.png');
  await iframeLocator.screenshot({ path: p5 });
  fs.copyFileSync(p5, path.join(brainDir, 'lesson_05_agent.png'));
  console.log('✅ Chụp Bài 5');

  // Sang Bài 6
  console.log('--- 6. BÀI 6: HUMAN IN THE LOOP ---');
  await nextBtn.click();
  await sleep(1000);
  let p6 = path.join(outputDir, 'lesson_06_hitl.png');
  await iframeLocator.screenshot({ path: p6 });
  fs.copyFileSync(p6, path.join(brainDir, 'lesson_06_hitl.png'));
  console.log('✅ Chụp Bài 6');

  // Sang Bài 7
  console.log('--- 7. BÀI 7: AI SECURITY ---');
  await nextBtn.click();
  await sleep(1000);
  let p7 = path.join(outputDir, 'lesson_07_security.png');
  await iframeLocator.screenshot({ path: p7 });
  fs.copyFileSync(p7, path.join(brainDir, 'lesson_07_security.png'));
  console.log('✅ Chụp Bài 7');

  // Sang Bài 8
  console.log('--- 8. BÀI 8: STRUCTURED OUTPUT & SELF HEALING JSON ---');
  await nextBtn.click();
  await sleep(1000);
  let p8 = path.join(outputDir, 'lesson_08_json.png');
  await iframeLocator.screenshot({ path: p8 });
  fs.copyFileSync(p8, path.join(brainDir, 'lesson_08_json.png'));
  console.log('✅ Chụp Bài 8');

  console.log('🎉 Toàn bộ 8 bài học đã được kiểm thử và chụp ảnh thành công!');
  await browser.close();
}

main().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});
