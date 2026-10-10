const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function main() {
  const browser = await chromium.connectOverCDP('http://localhost:9222');
  const context = browser.contexts()[0];
  const page = context.pages().find((p) => p.url().includes('aistudio.google.com'));

  // Đảm bảo mở app ở chế độ fullscreenApplet để canvas rộng tối đa
  const targetUrl = 'https://aistudio.google.com/apps/1a1bb274-a0f4-47d4-b8a8-8968d1e12215?showPreview=true&showAssistant=true&fullscreenApplet=true';
  if (page.url() !== targetUrl) {
    await page.goto(targetUrl, { waitUntil: 'domcontentloaded' });
    await sleep(4000);
  }

  const outputDir = path.join(__dirname, 'output', 'ai_studio');
  const brainDir = '/home/tontonyuta/.gemini/antigravity-cli/brain/a77f8a51-82ce-4b87-9fe7-1fdf9b02bb9e';
  fs.mkdirSync(outputDir, { recursive: true });

  const iframeLocator = page.locator('iframe[title="Preview"]').first();
  const fl = page.frameLocator('iframe[title="Preview"]').first();

  console.log('--- 1. TAB 1: RAG & VECTOR 2D CANVAS ---');
  await fl.locator('button:has-text("RAG & Vector 2D")').first().click();
  await sleep(1000);
  let p1 = path.join(outputDir, '01_rag_vector_2d.png');
  await iframeLocator.screenshot({ path: p1 });
  fs.copyFileSync(p1, path.join(brainDir, '01_rag_vector_2d.png'));
  console.log('✅ Chụp Tab 1 (2D Scatter Plot & Top-K Cosine)');

  // Chuyển sang subtab RRF
  const rrfBtn = fl.locator('button:has-text("Dung Hợp RRF"), button:has-text("RRF")').first();
  if (await rrfBtn.isVisible()) {
    await rrfBtn.click();
    await sleep(1000);
    let p1_rrf = path.join(outputDir, '01_rag_rrf_fusion.png');
    await iframeLocator.screenshot({ path: p1_rrf });
    fs.copyFileSync(p1_rrf, path.join(brainDir, '01_rag_rrf_fusion.png'));
    console.log('✅ Chụp Tab 1 (Reciprocal Rank Fusion)');
  }

  console.log('--- 2. TAB 2: LANGGRAPH SIMULATOR & HITL GATE ---');
  await fl.locator('button:has-text("LangGraph Simulator")').first().click();
  await sleep(1000);
  let p2_init = path.join(outputDir, '02_langgraph_overview.png');
  await iframeLocator.screenshot({ path: p2_init });
  fs.copyFileSync(p2_init, path.join(brainDir, '02_langgraph_overview.png'));
  console.log('✅ Chụp Tab 2 (LangGraph Overview)');

  // Chọn khoản lớn và chạy để dừng ở Breakpoint
  const largeBtn = fl.locator('button:has-text("Khoản Lớn"), button:has-text("25.0M")').first();
  if (await largeBtn.isVisible()) {
    await largeBtn.click();
    await sleep(500);
  }
  const autoBtn = fl.locator('button:has-text("Chạy Auto")').first();
  if (await autoBtn.isVisible()) {
    await autoBtn.click();
    await sleep(3500); // Đợi chạy đến cổng duyệt
    let p2_hitl = path.join(outputDir, '02_langgraph_hitl_breakpoint.png');
    await iframeLocator.screenshot({ path: p2_hitl });
    fs.copyFileSync(p2_hitl, path.join(brainDir, '02_langgraph_hitl_breakpoint.png'));
    console.log('✅ Chụp Tab 2 (Human-in-the-Loop Breakpoint)');

    // Phê duyệt để đóng modal và tiếp tục luồng
    const approveBtn = fl.locator('button:has-text("ĐỒNG Ý"), button:has-text("Approved")').first();
    if (await approveBtn.isVisible()) {
      await approveBtn.click();
      await sleep(2000);
      let p2_done = path.join(outputDir, '02_langgraph_completed.png');
      await iframeLocator.screenshot({ path: p2_done });
      fs.copyFileSync(p2_done, path.join(brainDir, '02_langgraph_completed.png'));
      console.log('✅ Chụp Tab 2 (LangGraph Completed Workflow)');
    }
  }

  console.log('--- 3. TAB 3: SEMANTIC CACHE & FINOPS SPEEDOMETER ---');
  await fl.locator('button:has-text("Semantic Cache & Cost")').first().click();
  await sleep(1000);
  // Gửi một truy vấn cache hit
  const sendCacheBtn = fl.locator('button:has-text("Gửi truy vấn vào Semantic Cache")').first();
  if (await sendCacheBtn.isVisible()) {
    await sendCacheBtn.click();
    await sleep(800);
  }
  let p3 = path.join(outputDir, '03_semantic_cache_cost.png');
  await iframeLocator.screenshot({ path: p3 });
  fs.copyFileSync(p3, path.join(brainDir, '03_semantic_cache_cost.png'));
  console.log('✅ Chụp Tab 3 (Semantic Cache & Latency Waterfall)');

  console.log('--- 4. TAB 4: AI SECURITY GUARDRAILS & FIREWALL ---');
  await fl.locator('button:has-text("AI Security Firewall")').first().click();
  await sleep(1000);
  // Chọn Prompt Leak & Canary
  const canaryBtn = fl.locator('button:has-text("Prompt Leak & Canary Extraction")').first();
  if (await canaryBtn.isVisible()) {
    await canaryBtn.click();
    await sleep(800);
  }
  let p4 = path.join(outputDir, '04_ai_security_firewall.png');
  await iframeLocator.screenshot({ path: p4 });
  fs.copyFileSync(p4, path.join(brainDir, '04_ai_security_firewall.png'));
  console.log('✅ Chụp Tab 4 (AI Security Firewall & Token Risk Inspector)');

  console.log('--- 5. TAB 5: SELF-HEALING JSON LAB ---');
  await fl.locator('button:has-text("Self-Healing JSON Lab")').first().click();
  await sleep(1000);
  const fenceBtn = fl.locator('button:has-text("Markdown Fences + Trailing Commas")').first();
  if (await fenceBtn.isVisible()) {
    await fenceBtn.click();
    await sleep(800);
  }
  let p5 = path.join(outputDir, '05_self_healing_json.png');
  await iframeLocator.screenshot({ path: p5 });
  fs.copyFileSync(p5, path.join(brainDir, '05_self_healing_json.png'));
  console.log('✅ Chụp Tab 5 (Self-Healing JSON AST Pipeline)');

  console.log('🎉 Toàn bộ ảnh đã được chụp và lưu vào artifact directory!');
  await browser.close();
}

main().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});
