const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const STAGES = [
  {
    id: 'stage_1_shell_and_calculus',
    title: 'Giai đoạn 1: Khung Minimalist + Bảng Biến Thiên SVG & Đồ Thị 12',
    isInitial: true,
    prompt: `Xây dựng ứng dụng web trợ giảng toán học trực tuyến chuyên nghiệp cho giáo viên Toán 12: "MathTeach Studio 12".
Ứng dụng sẽ được đóng gói thành Extension phục vụ dạy học online trên Zoom/Meet.

QUY TẮC THIẾT KẾ (DESIGN SYSTEM BẮT BUỘC):
- Phong cách: Tối giản, hiện đại, lấy cảm hứng từ Linear, Vercel, Raycast.
- KHÔNG dùng phong cách "AI slop" màu mè, KHÔNG dùng gradient cầu vồng, KHÔNG bo tròn dạng pill/bong bóng (Tất cả card, button, input phải có góc vuông vắn hoặc bo góc siêu nhỏ: rounded-none hoặc rounded-sm).
- Viền: 1px border sắc nét rõ ràng (border border-neutral-800).
- Màu sắc: Nền đen sâu (bg-neutral-950 hoặc #09090b), panel bề mặt (bg-neutral-900), chữ trắng ngà (text-neutral-100/200), màu nhấn đơn sắc phẳng: Electric Blue (#2563eb) hoặc Emerald (#10b981).
- Font chữ: Inter cho chữ thường, JetBrains Mono cho số liệu và biểu thức toán học.
- Bố cục: Viewport-locked 100vh (h-screen overflow-hidden), thanh công cụ trên cùng h-12 viền sắc nét, chia 2 cột Split-pane: Cột trái (Panel tham số nhập liệu), Cột phải (Vùng bảng vẽ/Canvas trực quan).

TÍNH NĂNG GIAI ĐOẠN 1:
1. Thanh điều hướng Tab phẳng:
   - [Bảng Biến Thiên & Đồ Thị] (Đang kích hoạt)
   - [Thống Kê Ghép Nhóm]
   - [Xác Suất Sơ Đồ Cây]
   - [Không Gian Oxyz 3D]
2. Module Bảng Biến Thiên (BBT) & Đồ Thị Giải Tích 12 CTM:
   - Hỗ trợ 3 dạng hàm số trọng tâm Toán 12:
     + Hàm bậc ba: y = ax^3 + bx^2 + cx + d
     + Hàm phân thức bậc 1 / bậc 1: y = (ax+b)/(cx+d)
     + Hàm phân thức bậc 2 / bậc 1: y = (ax^2+bx+c)/(px+q) (Có Tiệm cận xiên - kiến thức trọng tâm SGK 12 mới).
   - Tự động tính: Tập xác định, đạo hàm y', nghiệm y'=0, toạ độ cực trị, tiệm cận đứng, tiệm cận ngang, tiệm cận xiên.
   - Bảng biến thiên SVG chuẩn mực SGK Toán Việt Nam: Vẽ bảng vector sắc nét với dòng x, dòng y', dòng y, mũi tên đi lên/xuống, dấu gạch đôi ||, dấu +/- và các giá trị cực trị/vô cực.
   - Vẽ đồ thị hàm số phẳng đồng bộ, có tiệm cận nét đứt.
   - Nút chức năng giáo viên: [Sao chép SVG] và [Tải ảnh PNG] để dán trực tiếp vào PowerPoint / Word khi dạy học.`
  },
  {
    id: 'stage_2_statistics_quartiles',
    title: 'Giai đoạn 2: Thống Kê Mẫu Số Liệu Ghép Nhóm Toán 12 CTM',
    isInitial: false,
    prompt: `Hoàn thiện Tab [Thống Kê Ghép Nhóm] theo đúng chuẩn Sách Giáo Khoa Toán 12 Chương trình mới:
1. Bảng nhập dữ liệu mẫu số liệu ghép nhóm:
   - Cho phép nhập các nửa khoảng [a_i; a_{i+1}) và tần số tương ứng m_i.
   - Hỗ trợ thêm/xóa dòng nhanh, có nút "Dữ liệu mẫu SGK" để giáo viên nạp nhanh bài giảng.
   - Tự động tính cột Giá trị đại diện c_i và Tần số tích lũy cf_i.

2. Bộ tính toán thống kê tự động:
   - Cỡ mẫu n, Số trung bình x̄, Mốt M_o, Trung vị M_e.
   - Tứ phân vị thứ nhất Q_1, Tứ phân vị thứ ba Q_3.
   - Khoảng tứ phân vị Δ_Q = Q_3 - Q_1.
   - Phương sai s^2 và Độ lệch chuẩn s.

3. Tab "Lời giải chi tiết từng bước" (Dành cho trình chiếu giảng dạy):
   - Trình bày sư phạm chuẩn xác từng bước: Xác định nhóm chứa Q_1, nêu công thức Q_1 = u_m + ((n/4 - C)/n_m)*h, thay số cụ thể và ra đáp số.
   - Hiển thị công thức toán học định dạng rõ ràng, vuông vức, tương phản cao trên nền tối.`
  },
  {
    id: 'stage_3_conditional_probability_tree',
    title: 'Giai đoạn 3: Xác Suất Có Điều Kiện & Sơ Đồ Cây 2 Tầng',
    isInitial: false,
    prompt: `Hoàn thiện Tab [Xác Suất Sơ Đồ Cây] phục vụ chuyên đề Xác suất có điều kiện Toán 12 CTM:
1. Bộ tạo Sơ đồ cây phân nhánh (Tree Diagram) 2 tầng bằng SVG kỹ thuật:
   - Tầng 1: Biến cố A và biến cố đối Ā với xác suất P(A), P(Ā).
   - Tầng 2: Các biến cố có điều kiện: B|A, B̄|A và B|Ā, B̄|Ā kèm xác suất nhánh.
   - Nhánh cây vẽ bằng đường nét kỹ thuật thẳng, sắc nét (không bo tròn, không hiệu ứng mờ).
   - Cho phép chỉnh sửa trực tiếp giá trị xác suất và tên biến cố.

2. Bộ tính toán xác suất tự động:
   - Công thức xác suất toàn phần: P(B) = P(A)*P(B|A) + P(Ā)*P(B|Ā).
   - Công thức Bayes: P(A|B) = (P(A)*P(B|A)) / P(B).
   - Nút nạp nhanh các bài toán thực tế SGK 12: "Bài toán xét nghiệm bệnh hiếm", "Bài toán kiểm tra chất lượng linh kiện", "Bài toán xạ thủ".`
  },
  {
    id: 'stage_4_3d_geometry_oxyz',
    title: 'Giai đoạn 4: Không Gian Oxyz 3D & Công Cụ Trợ Giảng Extension',
    isInitial: false,
    prompt: `Hoàn thiện Tab [Không Gian Oxyz 3D] và Bộ công cụ trợ giảng Extension:
1. Không gian toạ độ Oxyz 3D tương tác:
   - Hệ trục toạ độ vuông góc Oxyz với các trục Ox (đỏ), Oy (xanh lá), Oz (xanh dương), kèm lưới phẳng Oxy.
   - Hỗ trợ xoay góc nhìn 3D 360 độ trực quan bằng chuột kéo thả.
   - Biểu diễn điểm M(x, y, z) với các đoạn đứt nét vuông góc chiếu lên 3 trục và các mặt phẳng toạ độ.
   - Vẽ mặt phẳng (α): Ax + By + Cz + D = 0 dưới dạng mặt lưới toạ độ trong không gian.
   - Vẽ mặt cầu (S): (x-a)^2 + (y-b)^2 + (z-c)^2 = R^2 và đường thẳng (d) qua điểm M có VTCP u.

2. Tối ưu cho Extension & Dạy Online:
   - Thanh công cụ Presenter: Nút phóng to toàn màn hình, nút "Copy ảnh bài học" nhanh để dán thẳng vào OneNote / Word.
   - Phím tắt: Bấm số 1, 2, 3, 4 để chuyển tức thì giữa các phân môn khi đang dạy trên Zoom/Meet.
   - Giữ nguyên triết lý thiết kế: Vuông vức, sắc sảo, không gradient, không AI slop.`
  }
];

class AutoMathTeachPipeline {
  constructor() {
    this.outputDir = path.join(__dirname, 'output', 'mathteach');
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
  }

  async run() {
    console.log('\n======================================================');
    console.log('⚡ KHỞI ĐỘNG PIPELINE TỰ ĐỘNG XÂY DỰNG MATHTEACH STUDIO 12');
    console.log('======================================================\n');

    const browser = await chromium.connectOverCDP('http://localhost:9222');
    const context = browser.contexts()[0];
    let page = context.pages().find((p) => p.url().includes('aistudio.google.com'));

    if (!page) {
      page = await context.newPage();
      await page.goto('https://aistudio.google.com/apps', { waitUntil: 'domcontentloaded' });
    }

    for (let i = 0; i < STAGES.length; i++) {
      const stage = STAGES[i];
      console.log(`\n------------------------------------------------------`);
      console.log(`🚀 [BƯỚC ${i + 1}/${STAGES.length}]: ${stage.title}`);
      console.log(`------------------------------------------------------`);

      if (stage.isInitial) {
        // Đảm bảo đang ở trang chủ apps để tạo ứng dụng mới
        if (!page.url().endsWith('/apps') && !page.url().includes('/apps?')) {
          console.log('Chuyển hướng về https://aistudio.google.com/apps để tạo app mới...');
          await page.goto('https://aistudio.google.com/apps', { waitUntil: 'domcontentloaded' });
          await sleep(3000);
        }

        console.log('✍️ Đang nhập prompt khởi tạo (Giai đoạn 1)...');
        const initialInput = await page.waitForSelector('textarea.prompt-textarea, textarea[placeholder*="Describe an app"]');
        await initialInput.click();
        await initialInput.fill(stage.prompt);
        await sleep(1000);

        console.log(' Bấm nút Build...');
        const buildBtn = await page.$('button.build-button, button:has-text("Build")');
        if (buildBtn && await buildBtn.isVisible()) {
          await buildBtn.click();
        } else {
          await page.keyboard.press('Control+Enter');
        }
      } else {
        // Giai đoạn nâng cấp qua thanh chat của App Editor
        console.log(`✍️ Đang nhập prompt nâng cấp [${stage.title}] vào chat...`);
        const chatInput = await page.waitForSelector('textarea[placeholder*="Make changes"], div[contenteditable="true"]', { timeout: 20000 });
        await chatInput.click();
        await chatInput.fill(stage.prompt);
        await sleep(1000);

        console.log(' Bấm nút gửi...');
        const sendBtn = await page.$('button.send-button:not(.running), button[aria-label*="Send"]');
        if (sendBtn && await sendBtn.isVisible()) {
          await sendBtn.click();
        } else {
          await page.keyboard.press('Control+Enter');
        }
      }

      // Theo dõi build
      await this.waitForBuild(page);

      // Tự sửa lỗi (Self-Healing)
      await this.selfHeal(page);

      // Chụp ảnh kết quả giai đoạn
      const snapPath = path.join(this.outputDir, `${stage.id}.png`);
      await page.screenshot({ path: snapPath });
      console.log(`📸 Đã lưu ảnh kiểm tra: ${snapPath}`);

      await sleep(4000);
    }

    console.log('\n🎉 ======================================================');
    console.log('🏆 TOÀN BỘ 4 GIAI ĐOẠN MATHTEACH STUDIO 12 ĐÃ HOÀN TẤT!');
    console.log('======================================================\n');
    await browser.close();
  }

  async dismissPopups(page) {
    try {
      const closeBtns = await page.$$('button:has-text("No thanks"), button:has-text("Got it"), button[aria-label*="Close"], button:has-text("✕")');
      for (const btn of closeBtns) {
        if (await btn.isVisible()) {
          await btn.click();
          await sleep(300);
        }
      }
    } catch (e) {}
  }

  async waitForBuild(page, maxWaitSec = 360) {
    console.log('⏳ Đang theo dõi tiến trình sinh mã của Gemini...');
    let elapsed = 0;
    await sleep(6000);

    while (elapsed < maxWaitSec) {
      const runningBtn = await page.$('button.send-button.running, button:has-text("Stop"), button[aria-label*="Stop"], button[aria-label*="Cancel"]');
      if (!runningBtn) {
        console.log(`\n Hoàn tất sinh mã sau ~${elapsed + 6}s!`);
        break;
      }
      await sleep(5000);
      elapsed += 5;
      process.stdout.write(`...đang biên dịch và dựng Sandbox (${elapsed}s)\r`);
    }

    // Chờ iframe preview nạp hoàn toàn
    console.log('⏳ Đang đợi Live Preview nạp giao diện mới...');
    await sleep(8000);
  }

  async selfHeal(page, maxTries = 3) {
    let tries = 0;
    while (tries < maxTries) {
      await this.dismissPopups(page);

      // 1. Kiểm tra nút Fix
      const fixBtn = await page.$('button:has-text("Fix"), button:has-text("Fix with Gemini"), button[aria-label*="Fix"]');
      if (fixBtn && await fixBtn.isVisible()) {
        console.log('⚠️ Phát hiện lỗi! Bấm nút "Fix" để tự động sửa...');
        await fixBtn.click();
        await sleep(3000);
        await this.waitForBuild(page);
        tries++;
        continue;
      }

      // 2. Kiểm tra banner lỗi
      const errorBanners = await page.$$('[role="alert"], .error-banner, div:has-text("Error running the code")');
      let foundError = false;
      for (const banner of errorBanners) {
        if (await banner.isVisible()) {
          const text = (await banner.innerText()).trim();
          if (text.length > 5 && (text.toLowerCase().includes('error') || text.toLowerCase().includes('fail'))) {
            console.log(`⚠️ Bắt được lỗi: "${text.slice(0, 100)}..." -> Đang gửi lệnh vá...`);
            const chatInput = await page.$('textarea[placeholder*="Make changes"]');
            if (chatInput) {
              await chatInput.fill(`Bản build đang bị lỗi sau: "${text}". Hãy sửa lại toàn bộ mã nguồn.`);
              const sendBtn = await page.$('button.send-button:not(.running)');
              if (sendBtn) await sendBtn.click();
              await this.waitForBuild(page);
              foundError = true;
              tries++;
              break;
            }
          }
        }
      }
      if (foundError) continue;

      console.log(' Bản build hoàn toàn khỏe mạnh, không có lỗi!');
      break;
    }
  }
}

const pipeline = new AutoMathTeachPipeline();
pipeline.run().catch((err) => {
  console.error('❌ Lỗi Pipeline:', err);
  process.exit(1);
});
