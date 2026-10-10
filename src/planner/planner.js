const fs = require('fs');
const yaml = require('yaml');
const logger = require('../utils/logger');

class RecipePlanner {
  /**
   * Tải và parse file spec YAML
   */
  static loadSpec(filePath) {
    if (!fs.existsSync(filePath)) {
      throw new Error(`Không tìm thấy file spec tại: ${filePath}`);
    }

    const content = fs.readFileSync(filePath, 'utf8');
    const parsed = yaml.parse(content);

    if (!parsed.stages || !Array.isArray(parsed.stages)) {
      throw new Error('File spec không hợp lệ: Thiếu mảng `stages`.');
    }

    logger.info(`Đã nạp công thức: "${parsed.title || parsed.name}" (${parsed.stages.length} giai đoạn)`);
    return parsed;
  }

  /**
   * Tạo kế hoạch 4 bước tự động từ một ý tưởng thô
   */
  static createPlanFromIdea(ideaText) {
    return {
      name: 'generated-app',
      title: ideaText.slice(0, 40) + '...',
      stages: [
        {
          id: 'v1-foundation',
          title: 'V1: Giao diện nền tảng & Layout',
          prompt: `Tạo một ứng dụng web: "${ideaText}". Giai đoạn 1: Dựng bộ khung layout Tailwind CSS hoàn chỉnh, dark theme hiện đại, các component cơ bản và luồng nhập xuất dữ liệu ban đầu.`
        },
        {
          id: 'v2-core-loop',
          title: 'V2: Tính năng cốt lõi & Tương tác người dùng',
          prompt: `Tiếp tục hoàn thiện ứng dụng: Bổ sung logic tương tác chính, xử lý sự kiện người dùng, tính điểm/trạng thái và phản hồi tức thì khi thao tác.`
        },
        {
          id: 'v3-visual-juice',
          title: 'V3: Hiệu ứng chuyển động & Âm thanh',
          prompt: `Nâng cấp trải nghiệm người dùng: Thêm hiệu ứng hoạt họa mượt mà, âm thanh Web Audio API sinh động và các micro-interactions lôi cuốn.`
        },
        {
          id: 'v4-polish-storage',
          title: 'V4: Tinh chỉnh Responsive & Lưu trữ LocalStorage',
          prompt: `Giai đoạn cuối: Lưu trữ dữ liệu vào LocalStorage, căn chỉnh responsive hoàn hảo trên mọi kích thước màn hình (kể cả mobile 375px) và tối ưu độ thẩm mỹ.`
        }
      ]
    };
  }
}

module.exports = RecipePlanner;
