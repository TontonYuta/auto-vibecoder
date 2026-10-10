import React, { useState, useMemo } from 'react';
import {
  Table,
  Plus,
  Trash2,
  Copy,
  Check,
  Calculator,
  BookOpen,
  BarChart3,
  Sparkles,
  Presentation,
  ArrowRight,
} from 'lucide-react';
import { formatNum } from '../../math/analysis';

export interface GroupBin {
  id: string;
  start: number;
  end: number;
  count: number;
}

export const GroupedStatsTab: React.FC = () => {
  // Mode toggle: 'dashboard' (Tổng quan & Biểu đồ) or 'steps' (Lời giải chi tiết từng bước cho trình chiếu)
  const [viewMode, setViewMode] = useState<'dashboard' | 'steps'>('dashboard');

  // Initial data: bài tập mẫu chuẩn SGK Toán 12
  const [bins, setBins] = useState<GroupBin[]>([
    { id: '1', start: 40, end: 50, count: 6 },
    { id: '2', start: 50, end: 60, count: 12 },
    { id: '3', start: 60, end: 70, count: 20 },
    { id: '4', start: 70, end: 80, count: 14 },
    { id: '5', start: 80, end: 90, count: 8 },
  ]);

  const [copied, setCopied] = useState(false);
  const [copiedSteps, setCopiedSteps] = useState(false);

  // Danh mục dữ liệu mẫu SGK phong phú
  const sampleDatasets = [
    {
      name: 'SGK Kết Nối Tri Thức - Bài 7 (Thời gian giải bài toán)',
      data: [
        { id: '1', start: 10, end: 15, count: 4 },
        { id: '2', start: 15, end: 20, count: 12 },
        { id: '3', start: 20, end: 25, count: 18 },
        { id: '4', start: 25, end: 30, count: 10 },
        { id: '5', start: 30, end: 35, count: 6 },
      ],
    },
    {
      name: 'SGK Cánh Diều - Bài 2 (Điểm thi khảo sát Toán 12)',
      data: [
        { id: '1', start: 4, end: 5, count: 5 },
        { id: '2', start: 5, end: 6, count: 10 },
        { id: '3', start: 6, end: 7, count: 15 },
        { id: '4', start: 7, end: 8, count: 12 },
        { id: '5', start: 8, end: 9, count: 6 },
        { id: '6', start: 9, end: 10, count: 2 },
      ],
    },
    {
      name: 'SGK Chân Trời Sáng Tạo (Cự ly chạy của học sinh - mét)',
      data: [
        { id: '1', start: 20, end: 40, count: 8 },
        { id: '2', start: 40, end: 60, count: 16 },
        { id: '3', start: 60, end: 80, count: 24 },
        { id: '4', start: 80, end: 100, count: 12 },
      ],
    },
    {
      name: 'Đề Tham Khảo Bộ GD&ĐT 2025 (Doanh thu cửa hàng - triệu đồng)',
      data: [
        { id: '1', start: 10, end: 20, count: 5 },
        { id: '2', start: 20, end: 30, count: 15 },
        { id: '3', start: 30, end: 40, count: 25 },
        { id: '4', start: 40, end: 50, count: 10 },
        { id: '5', start: 50, end: 60, count: 5 },
      ],
    },
  ];

  // Statistical calculations based on SGK Toán 12 Mới
  const stats = useMemo(() => {
    const n = bins.reduce((sum, b) => sum + b.count, 0);
    if (n === 0) return null;

    let cumulative = 0;
    const tableData = bins.map((b, idx) => {
      const mid = (b.start + b.end) / 2;
      const h = b.end - b.start;
      const prevCum = cumulative;
      cumulative += b.count;
      return {
        ...b,
        index: idx + 1,
        mid, // c_i: giá trị đại diện
        h, // độ dài khoảng
        cf: cumulative, // cf_i: tần số tích luỹ
        prevCum, // C = cf_{i-1}
        mc: b.count * mid, // m_i * c_i
        mc2: b.count * mid * mid, // m_i * c_i^2
      };
    });

    // 1. Số trung bình: x̄ = (1/n) * Σ(m_i * c_i)
    const sumMC = tableData.reduce((s, row) => s + row.mc, 0);
    const mean = sumMC / n;

    // 2. Phương sai s^2 và Độ lệch chuẩn s
    const sumMC2 = tableData.reduce((s, row) => s + row.mc2, 0);
    const variance = sumMC2 / n - Math.pow(mean, 2);
    const stdDev = Math.sqrt(Math.max(0, variance));

    // 3. Tứ phân vị thứ nhất Q_1 (vị trí n / 4)
    const targetQ1 = n / 4;
    const q1Row = tableData.find((r) => r.cf >= targetQ1) || tableData[0];
    const q1GroupIdx = q1Row.index;
    const u_m1 = q1Row.start;
    const h1 = q1Row.h;
    const m_m1 = q1Row.count;
    const C1 = q1Row.prevCum;
    const q1Val = m_m1 > 0 ? u_m1 + ((targetQ1 - C1) / m_m1) * h1 : u_m1;

    // 4. Trung vị M_e (Tứ phân vị thứ hai Q_2) (vị trí n / 2)
    const targetQ2 = n / 2;
    const q2Row = tableData.find((r) => r.cf >= targetQ2) || tableData[0];
    const q2GroupIdx = q2Row.index;
    const u_p = q2Row.start;
    const h2 = q2Row.h;
    const m_p = q2Row.count;
    const C2 = q2Row.prevCum;
    const q2Val = m_p > 0 ? u_p + ((targetQ2 - C2) / m_p) * h2 : u_p;

    // 5. Tứ phân vị thứ ba Q_3 (vị trí 3n / 4)
    const targetQ3 = (3 * n) / 4;
    const q3Row = tableData.find((r) => r.cf >= targetQ3) || tableData[tableData.length - 1];
    const q3GroupIdx = q3Row.index;
    const u_q = q3Row.start;
    const h3 = q3Row.h;
    const m_q = q3Row.count;
    const C3 = q3Row.prevCum;
    const q3Val = m_q > 0 ? u_q + ((targetQ3 - C3) / m_q) * h3 : u_q;

    // 6. Khoảng tứ phân vị: Δ_Q = Q_3 - Q_1
    const iqr = q3Val - q1Val;

    // 7. Khoảng biến thiên: R = a_k - a_1
    const range = bins[bins.length - 1].end - bins[0].start;

    // 8. Mốt M_o: Nhóm có tần số lớn nhất m_j
    let maxIdx = 0;
    for (let i = 1; i < tableData.length; i++) {
      if (tableData[i].count > tableData[maxIdx].count) {
        maxIdx = i;
      }
    }
    const modeRow = tableData[maxIdx];
    const modeGroupIdx = modeRow.index;
    const u_j = modeRow.start;
    const h_mode = modeRow.h;
    const m_j = modeRow.count;
    const m_prev = maxIdx > 0 ? tableData[maxIdx - 1].count : 0;
    const m_next = maxIdx < tableData.length - 1 ? tableData[maxIdx + 1].count : 0;

    const delta1 = m_j - m_prev;
    const delta2 = m_j - m_next;
    const modeVal =
      delta1 + delta2 > 0 ? u_j + (delta1 / (delta1 + delta2)) * h_mode : modeRow.mid;

    return {
      n,
      mean,
      sumMC,
      sumMC2,
      variance,
      stdDev,
      tableData,
      range,
      iqr,
      // Q1 details
      q1: {
        val: q1Val,
        target: targetQ1,
        row: q1Row,
        groupIdx: q1GroupIdx,
        u_m: u_m1,
        h: h1,
        m_m: m_m1,
        C: C1,
      },
      // Q2 / Me details
      q2: {
        val: q2Val,
        target: targetQ2,
        row: q2Row,
        groupIdx: q2GroupIdx,
        u_p,
        h: h2,
        m_p,
        C: C2,
      },
      // Q3 details
      q3: {
        val: q3Val,
        target: targetQ3,
        row: q3Row,
        groupIdx: q3GroupIdx,
        u_q,
        h: h3,
        m_q,
        C: C3,
      },
      // Mode details
      mode: {
        val: modeVal,
        row: modeRow,
        groupIdx: modeGroupIdx,
        u_j,
        h: h_mode,
        m_j,
        m_prev,
        m_next,
        delta1,
        delta2,
      },
    };
  }, [bins]);

  // Thêm nhóm mới nối tiếp khoảng trước
  const handleAddBin = () => {
    const last = bins[bins.length - 1];
    const step = last ? last.end - last.start : 10;
    const nextStart = last ? last.end : 0;
    setBins([
      ...bins,
      {
        id: Date.now().toString(),
        start: nextStart,
        end: nextStart + step,
        count: 5,
      },
    ]);
  };

  const handleRemoveBin = (id: string) => {
    if (bins.length <= 2) return;
    setBins(bins.filter((b) => b.id !== id));
  };

  // Copy tóm tắt kết quả
  const handleCopySummary = async () => {
    if (!stats) return;
    const text = `CÁC SỐ ĐẶC TRƯNG MẪU SỐ LIỆU GHÉP NHÓM (TOÁN 12):
- Cỡ mẫu: n = ${stats.n}
- Số trung bình: x̄ = ${formatNum(stats.mean)}
- Trung vị (Q2 / Me): Me = ${formatNum(stats.q2.val)}
- Tứ phân vị thứ nhất: Q1 = ${formatNum(stats.q1.val)}
- Tứ phân vị thứ ba: Q3 = ${formatNum(stats.q3.val)}
- Khoảng tứ phân vị: ΔQ = ${formatNum(stats.iqr)}
- Mốt: Mo = ${formatNum(stats.mode.val)}
- Khoảng biến thiên: R = ${stats.range}
- Phương sai: s² = ${formatNum(stats.variance)}
- Độ lệch chuẩn: s = ${formatNum(stats.stdDev)}`;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Copy toàn bộ lời giải chi tiết SGK dạng Text
  const handleCopySteps = async () => {
    if (!stats) return;
    const text = `LỜI GIẢI CHI TIẾT THEO CHUẨN SGK TOÁN 12:

1. BẢNG TẦN SỐ VÀ GIÁ TRỊ ĐẠI DIỆN:
${stats.tableData
  .map(
    (r) =>
      `Nhóm [${r.start}; ${r.end}): Giá trị đại diện c_${r.index} = ${r.mid}, Tần số m_${r.index} = ${r.count}, Tần số tích lũy cf_${r.index} = ${r.cf}`
  )
  .join('\n')}
Tổng cỡ mẫu: n = ${stats.n}

2. SỐ TRUNG BÌNH:
x̄ = (1/n) * Σ(m_i * c_i)
  = (1/${stats.n}) * ${stats.sumMC} = ${formatNum(stats.mean)}

3. TỨ PHÂN VỊ THỨ NHẤT Q1:
- Ta có n/4 = ${stats.n}/4 = ${stats.q1.target}.
- Nhóm đầu tiên có tần số tích luỹ ≥ ${stats.q1.target} là nhóm ${stats.q1.groupIdx}: [${stats.q1.row.start}; ${stats.q1.row.end}).
- Áp dụng công thức: Q1 = u_m + ((n/4 - C) / m_m) * h
  = ${stats.q1.u_m} + ((${stats.q1.target} - ${stats.q1.C}) / ${stats.q1.m_m}) * ${stats.q1.h}
  = ${formatNum(stats.q1.val)}

4. TRUNG VỊ Me (Q2):
- Ta có n/2 = ${stats.n}/2 = ${stats.q2.target}.
- Nhóm đầu tiên có tần số tích luỹ ≥ ${stats.q2.target} là nhóm ${stats.q2.groupIdx}: [${stats.q2.row.start}; ${stats.q2.row.end}).
- Áp dụng công thức: Me = u_p + ((n/2 - C) / m_p) * h
  = ${stats.q2.u_p} + ((${stats.q2.target} - ${stats.q2.C}) / ${stats.q2.m_p}) * ${stats.q2.h}
  = ${formatNum(stats.q2.val)}

5. TỨ PHÂN VỊ THỨ BA Q3:
- Ta có 3n/4 = 3*${stats.n}/4 = ${stats.q3.target}.
- Nhóm đầu tiên có tần số tích luỹ ≥ ${stats.q3.target} là nhóm ${stats.q3.groupIdx}: [${stats.q3.row.start}; ${stats.q3.row.end}).
- Áp dụng công thức: Q3 = u_q + ((3n/4 - C) / m_q) * h
  = ${stats.q3.u_q} + ((${stats.q3.target} - ${stats.q3.C}) / ${stats.q3.m_q}) * ${stats.q3.h}
  = ${formatNum(stats.q3.val)}

6. KHOẢNG TỨ PHÂN VỊ:
ΔQ = Q3 - Q1 = ${formatNum(stats.q3.val)} - ${formatNum(stats.q1.val)} = ${formatNum(stats.iqr)}

7. MỐT Mo:
- Nhóm có tần số lớn nhất (${stats.mode.m_j}) là nhóm ${stats.mode.groupIdx}: [${stats.mode.row.start}; ${stats.mode.row.end}).
- Ta có: m_j - m_{j-1} = ${stats.mode.delta1}, m_j - m_{j+1} = ${stats.mode.delta2}.
- Áp dụng công thức: Mo = u_j + [(m_j - m_{j-1}) / ((m_j - m_{j-1}) + (m_j - m_{j+1}))] * h
  = ${stats.mode.u_j} + [${stats.mode.delta1} / (${stats.mode.delta1} + ${stats.mode.delta2})] * ${stats.mode.h}
  = ${formatNum(stats.mode.val)}

8. PHƯƠNG SAI VÀ ĐỘ LỆCH CHUẨN:
- Phương sai: s² = (1/n) * Σ(m_i * c_i²) - (x̄)² = ${formatNum(stats.variance)}
- Độ lệch chuẩn: s = √s² = ${formatNum(stats.stdDev)}`;
    await navigator.clipboard.writeText(text);
    setCopiedSteps(true);
    setTimeout(() => setCopiedSteps(false), 2000);
  };

  // Histogram dimensions
  const histWidth = 580;
  const histHeight = 220;
  const maxFreq = Math.max(...bins.map((b) => b.count), 1);

  return (
    <div className="flex-1 h-full grid grid-cols-12 overflow-hidden bg-neutral-950 select-none">
      {/* CỘT TRÁI: Bảng nhập dữ liệu mẫu số liệu ghép nhóm [a_i; a_{i+1}) và m_i */}
      <div className="col-span-12 lg:col-span-5 h-full border-r border-neutral-800 bg-neutral-900 flex flex-col overflow-hidden">
        {/* Header trái */}
        <div className="h-10 px-3 bg-neutral-950 border-b border-neutral-800 flex items-center justify-between">
          <div className="text-xs font-mono text-neutral-300 font-semibold flex items-center gap-1.5">
            <Table className="w-3.5 h-3.5 text-blue-400" />
            <span>BẢNG DỮ LIỆU GHÉP NHÓM [a_i; a_i+1)</span>
          </div>

          <button
            onClick={handleAddBin}
            className="px-2 py-1 bg-blue-600 hover:bg-blue-500 text-white text-xs font-mono rounded-none flex items-center gap-1 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Thêm nhóm</span>
          </button>
        </div>

        {/* Nút nạp nhanh dữ liệu mẫu SGK */}
        <div className="p-2.5 bg-neutral-950/70 border-b border-neutral-800">
          <div className="text-[11px] font-mono text-neutral-400 mb-1.5 flex items-center gap-1">
            <BookOpen className="w-3 h-3 text-emerald-400" />
            <span>Dữ liệu mẫu SGK Toán 12 Mới:</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {sampleDatasets.map((ds, idx) => (
              <button
                key={idx}
                onClick={() => setBins(ds.data)}
                className="text-[11px] px-2 py-1 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 hover:border-neutral-700 text-neutral-300 transition-colors font-mono"
              >
                {ds.name.split(' (')[0]}
              </button>
            ))}
          </div>
        </div>

        {/* Danh sách nhập khoảng [a_i; a_{i+1}) và tần số m_i */}
        <div className="p-3 space-y-1.5 flex-1 overflow-y-auto">
          <div className="grid grid-cols-12 gap-1 text-[11px] font-mono text-neutral-400 px-1 pb-1 border-b border-neutral-800/60">
            <span className="col-span-1 text-center">#</span>
            <span className="col-span-6">Nửa khoảng [a_i; a_i+1)</span>
            <span className="col-span-4 text-center">Tần số m_i</span>
            <span className="col-span-1 text-right">Xoá</span>
          </div>

          {bins.map((bin, idx) => (
            <div
              key={bin.id}
              className="grid grid-cols-12 gap-1.5 items-center p-1.5 bg-neutral-950 border border-neutral-800 hover:border-neutral-700 transition-colors"
            >
              <div className="col-span-1 text-[11px] font-mono text-neutral-500 text-center">
                {idx + 1}
              </div>

              <div className="col-span-6 flex items-center gap-1 text-xs font-mono">
                <span className="text-neutral-500">[</span>
                <input
                  type="number"
                  value={bin.start}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value) || 0;
                    setBins(bins.map((b) => (b.id === bin.id ? { ...b, start: val } : b)));
                  }}
                  className="w-14 bg-neutral-900 border border-neutral-800 text-center text-neutral-100 py-1 text-xs font-mono rounded-none focus:outline-none focus:border-blue-500"
                />
                <span className="text-neutral-500">;</span>
                <input
                  type="number"
                  value={bin.end}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value) || 0;
                    setBins(bins.map((b) => (b.id === bin.id ? { ...b, end: val } : b)));
                  }}
                  className="w-14 bg-neutral-900 border border-neutral-800 text-center text-neutral-100 py-1 text-xs font-mono rounded-none focus:outline-none focus:border-blue-500"
                />
                <span className="text-neutral-500">)</span>
              </div>

              <div className="col-span-4 flex justify-center">
                <input
                  type="number"
                  min="0"
                  value={bin.count}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10) || 0;
                    setBins(bins.map((b) => (b.id === bin.id ? { ...b, count: val } : b)));
                  }}
                  className="w-20 bg-neutral-900 border border-neutral-800 text-center text-blue-400 font-bold py-1 text-xs font-mono rounded-none focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="col-span-1 flex justify-end">
                <button
                  disabled={bins.length <= 2}
                  onClick={() => handleRemoveBin(bin.id)}
                  title="Xoá nhóm này"
                  className="p-1 text-neutral-500 hover:text-rose-400 disabled:opacity-20 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Tự động tính cột Giá trị đại diện c_i và Tần số tích luỹ cf_i */}
        {stats && (
          <div className="p-3 border-t border-neutral-800 bg-neutral-950">
            <div className="text-[11px] font-mono text-neutral-400 mb-1.5 flex items-center justify-between">
              <span>BẢNG TỰ ĐỘNG TÍNH c_i VÀ cf_i:</span>
              <span className="text-blue-400 font-bold">Cỡ mẫu n = {stats.n}</span>
            </div>
            <div className="overflow-x-auto max-h-44 overflow-y-auto">
              <table className="w-full text-[11px] font-mono border-collapse border border-neutral-800 text-neutral-300">
                <thead>
                  <tr className="bg-neutral-900 text-neutral-400 text-center">
                    <th className="p-1 border border-neutral-800">Nhóm</th>
                    <th className="p-1 border border-neutral-800">Khoảng</th>
                    <th className="p-1 border border-neutral-800 text-emerald-400">c_i (Đại diện)</th>
                    <th className="p-1 border border-neutral-800 text-blue-400">m_i (Tần số)</th>
                    <th className="p-1 border border-neutral-800 text-sky-400">cf_i (Tích luỹ)</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.tableData.map((row) => (
                    <tr key={row.id} className="text-center hover:bg-neutral-900/60">
                      <td className="p-1 border border-neutral-800 text-neutral-500">#{row.index}</td>
                      <td className="p-1 border border-neutral-800">[{row.start}; {row.end})</td>
                      <td className="p-1 border border-neutral-800 text-emerald-300 font-semibold">{row.mid}</td>
                      <td className="p-1 border border-neutral-800 text-blue-400 font-bold">{row.count}</td>
                      <td className="p-1 border border-neutral-800 text-sky-300">{row.cf}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* CỘT PHẢI: Dashboard & Tab "Lời giải chi tiết từng bước" cho trình chiếu */}
      <div className="col-span-12 lg:col-span-7 h-full flex flex-col bg-neutral-950 overflow-hidden">
        {/* Navigation Tab Header trên cột phải */}
        <div className="h-10 px-3 bg-neutral-950 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-1 bg-neutral-900 p-0.5 border border-neutral-800">
            <button
              onClick={() => setViewMode('dashboard')}
              className={`px-3 py-1 text-xs font-mono transition-colors border ${
                viewMode === 'dashboard'
                  ? 'bg-neutral-950 text-neutral-100 border-neutral-700 font-semibold'
                  : 'text-neutral-400 border-transparent hover:text-neutral-200'
              }`}
            >
              <span className="flex items-center gap-1.5">
                <BarChart3 className="w-3.5 h-3.5 text-blue-400" />
                <span>Số Đặc Trưng & Biểu Đồ</span>
              </span>
            </button>

            <button
              onClick={() => setViewMode('steps')}
              className={`px-3 py-1 text-xs font-mono transition-colors border ${
                viewMode === 'steps'
                  ? 'bg-blue-600 text-white border-blue-500 font-semibold'
                  : 'text-neutral-400 border-transparent hover:text-neutral-200'
              }`}
            >
              <span className="flex items-center gap-1.5">
                <Presentation className="w-3.5 h-3.5 text-amber-300" />
                <span>Lời Giải Chi Tiết SGK (Trình Chiếu)</span>
              </span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {viewMode === 'steps' ? (
              <button
                onClick={handleCopySteps}
                className="px-2.5 py-1 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700/80 text-neutral-200 text-xs font-mono rounded-none flex items-center gap-1 transition-colors"
              >
                {copiedSteps ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedSteps ? 'Đã sao chép' : 'Sao chép Lời Giải'}</span>
              </button>
            ) : (
              <button
                onClick={handleCopySummary}
                className="px-2.5 py-1 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700/80 text-neutral-200 text-xs font-mono rounded-none flex items-center gap-1 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Đã sao chép' : 'Sao chép kết quả'}</span>
              </button>
            )}
          </div>
        </div>

        {/* NỘI DUNG CHÍNH CỘT PHẢI */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {stats ? (
            viewMode === 'dashboard' ? (
              /* VIEW 1: DASHBOARD SỐ ĐẶC TRƯNG & HISTOGRAM */
              <>
                {/* 1. Bộ tính toán thống kê tự động: Cỡ mẫu, x̄, Mo, Me, Q1, Q3, ΔQ, s^2, s */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  <div className="p-3 bg-neutral-900 border border-neutral-800">
                    <div className="text-[10px] text-neutral-400 font-mono">CỠ MẪU (n)</div>
                    <div className="text-xl font-mono font-bold text-white mt-0.5">n = {stats.n}</div>
                  </div>

                  <div className="p-3 bg-neutral-900 border border-neutral-800">
                    <div className="text-[10px] text-neutral-400 font-mono">SỐ TRUNG BÌNH (x̄)</div>
                    <div className="text-xl font-mono font-bold text-blue-400 mt-0.5">
                      {formatNum(stats.mean)}
                    </div>
                  </div>

                  <div className="p-3 bg-neutral-900 border border-neutral-800">
                    <div className="text-[10px] text-neutral-400 font-mono">TRUNG VỊ (Me / Q2)</div>
                    <div className="text-xl font-mono font-bold text-emerald-400 mt-0.5">
                      {formatNum(stats.q2.val)}
                    </div>
                  </div>

                  <div className="p-3 bg-neutral-900 border border-neutral-800">
                    <div className="text-[10px] text-neutral-400 font-mono">MỐT (Mo)</div>
                    <div className="text-xl font-mono font-bold text-amber-400 mt-0.5">
                      {formatNum(stats.mode.val)}
                    </div>
                  </div>
                </div>

                {/* Hàng 2: Tứ phân vị & Độ phân tán */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  <div className="p-3 bg-neutral-900 border border-neutral-800">
                    <div className="text-[10px] text-neutral-400 font-mono">TỨ PHÂN VỊ THỨ NHẤT Q1</div>
                    <div className="text-lg font-mono font-bold text-sky-400 mt-0.5">
                      {formatNum(stats.q1.val)}
                    </div>
                    <div className="text-[10px] text-neutral-500 font-mono">Vị trí: n/4 = {stats.q1.target}</div>
                  </div>

                  <div className="p-3 bg-neutral-900 border border-neutral-800">
                    <div className="text-[10px] text-neutral-400 font-mono">TỨ PHÂN VỊ THỨ BA Q3</div>
                    <div className="text-lg font-mono font-bold text-purple-400 mt-0.5">
                      {formatNum(stats.q3.val)}
                    </div>
                    <div className="text-[10px] text-neutral-500 font-mono">Vị trí: 3n/4 = {stats.q3.target}</div>
                  </div>

                  <div className="p-3 bg-neutral-900 border border-neutral-800">
                    <div className="text-[10px] text-neutral-400 font-mono">KHOẢNG TỨ PHÂN VỊ (ΔQ)</div>
                    <div className="text-lg font-mono font-bold text-rose-400 mt-0.5">
                      {formatNum(stats.iqr)}
                    </div>
                    <div className="text-[10px] text-neutral-500 font-mono">ΔQ = Q3 - Q1</div>
                  </div>

                  <div className="p-3 bg-neutral-900 border border-neutral-800">
                    <div className="text-[10px] text-neutral-400 font-mono">ĐỘ LỆCH CHUẨN (s)</div>
                    <div className="text-lg font-mono font-bold text-emerald-400 mt-0.5">
                      {formatNum(stats.stdDev)}
                    </div>
                    <div className="text-[10px] text-neutral-500 font-mono">
                      Phương sai s² = {formatNum(stats.variance)}
                    </div>
                  </div>
                </div>

                {/* Biểu đồ Histogram */}
                <div className="p-4 bg-neutral-900 border border-neutral-800">
                  <div className="text-xs font-mono text-neutral-300 font-semibold mb-2 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <BarChart3 className="w-3.5 h-3.5 text-blue-400" />
                      <span>BIỂU ĐỒ TẦN SỐ GHÉP NHÓM (HISTOGRAM)</span>
                    </span>
                    <span className="text-[11px] text-neutral-500 font-mono">Trục đứng: Tần số m_i</span>
                  </div>

                  <div className="w-full overflow-x-auto flex justify-center py-2">
                    <svg
                      width={histWidth}
                      height={histHeight}
                      className="font-mono bg-neutral-950 border border-neutral-800 p-2"
                    >
                      {/* Trục toạ độ */}
                      <line
                        x1="45"
                        y1={histHeight - 35}
                        x2={histWidth - 20}
                        y2={histHeight - 35}
                        stroke="#52525b"
                        strokeWidth="1.2"
                      />
                      <line
                        x1="45"
                        y1="20"
                        x2="45"
                        y2={histHeight - 35}
                        stroke="#52525b"
                        strokeWidth="1.2"
                      />

                      {/* Các cột Histogram */}
                      {bins.map((bin, i) => {
                        const barCount = bins.length;
                        const availableWidth = histWidth - 75;
                        const bWidth = availableWidth / barCount;
                        const bx = 50 + i * bWidth;
                        const bHeight = (bin.count / maxFreq) * (histHeight - 75);
                        const by = histHeight - 35 - bHeight;

                        return (
                          <g key={i}>
                            <rect
                              x={bx}
                              y={by}
                              width={bWidth - 2}
                              height={bHeight}
                              fill="#2563eb"
                              opacity="0.9"
                              stroke="#3b82f6"
                              strokeWidth="1"
                            />
                            {/* Tần số m_i */}
                            <text
                              x={bx + (bWidth - 2) / 2}
                              y={by - 6}
                              textAnchor="middle"
                              fill="#93c5fd"
                              fontSize="11"
                              fontWeight="bold"
                            >
                              {bin.count}
                            </text>
                            {/* Nhãn khoảng */}
                            <text
                              x={bx + (bWidth - 2) / 2}
                              y={histHeight - 14}
                              textAnchor="middle"
                              fill="#a1a1aa"
                              fontSize="10"
                            >
                              [{bin.start}; {bin.end})
                            </text>
                          </g>
                        );
                      })}
                    </svg>
                  </div>
                </div>
              </>
            ) : (
              /* VIEW 2: LỜI GIẢI CHI TIẾT TỪNG BƯỚC (DÀNH CHO TRÌNH CHIẾU GIẢNG DẠY) */
              <div className="space-y-4">
                {/* Banner giáo viên */}
                <div className="p-3 bg-blue-950/40 border border-blue-900/60 flex items-center justify-between text-xs font-mono">
                  <div className="flex items-center gap-2 text-blue-300">
                    <Presentation className="w-4 h-4 text-amber-400" />
                    <span className="font-semibold">BÀI GIẢNG SƯ PHẠM: TỪNG BƯỚC TÍNH TOÁN THEO SGK TOÁN 12 MỚI</span>
                  </div>
                  <span className="text-neutral-400 text-[11px]">Độ nét cao cho Zoom / Meet / Máy chiếu</span>
                </div>

                {/* BƯỚC 1: XÁC ĐỊNH SỐ TRUNG BÌNH */}
                <div className="p-4 bg-neutral-900 border border-neutral-800 space-y-2">
                  <div className="text-xs font-mono font-bold text-neutral-200 flex items-center gap-2">
                    <span className="px-1.5 py-0.5 bg-blue-600 text-white text-[11px]">BƯỚC 1</span>
                    <span>TÍNH SỐ TRUNG BÌNH (x̄)</span>
                  </div>

                  <div className="p-3 bg-neutral-950 border border-neutral-800 space-y-2 text-xs font-mono text-neutral-300">
                    <div>
                      • Cỡ mẫu của mẫu số liệu ghép nhóm là: <span className="text-blue-400 font-bold">n = {stats.n}</span>.
                    </div>
                    <div>
                      • Công thức SGK: <span className="text-emerald-400">x̄ = (1/n) · ∑(m_i · c_i)</span>
                    </div>
                    <div className="p-2 bg-neutral-900 border border-neutral-800 text-neutral-100">
                      x̄ = (1/{stats.n}) · [ {stats.tableData.map((r) => `${r.count}·${r.mid}`).join(' + ')} ]
                      <div className="mt-1 text-emerald-400 font-bold">
                        = {stats.sumMC} / {stats.n} = {formatNum(stats.mean)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* BƯỚC 2: TỨ PHÂN VỊ THỨ NHẤT Q1 */}
                <div className="p-4 bg-neutral-900 border border-neutral-800 space-y-2">
                  <div className="text-xs font-mono font-bold text-neutral-200 flex items-center gap-2">
                    <span className="px-1.5 py-0.5 bg-sky-600 text-white text-[11px]">BƯỚC 2</span>
                    <span>TÌM TỨ PHÂN VỊ THỨ NHẤT Q₁</span>
                  </div>

                  <div className="p-3 bg-neutral-950 border border-neutral-800 space-y-2.5 text-xs font-mono text-neutral-300">
                    <div>
                      • Vị trí tứ phân vị thứ nhất: <span className="text-sky-400 font-bold">n / 4 = {stats.n} / 4 = {stats.q1.target}</span>.
                    </div>

                    <div className="p-2 bg-neutral-900 border border-neutral-800">
                      Nhóm đầu tiên có tần số tích lũy <span className="text-sky-300 font-semibold">cf_i ≥ {stats.q1.target}</span> là nhóm thứ {stats.q1.groupIdx}:{' '}
                      <span className="text-amber-300 font-bold">[{stats.q1.row.start}; {stats.q1.row.end})</span>.
                    </div>

                    <div className="space-y-1 text-[11px] text-neutral-400">
                      <div>Trong đó các đại lượng cụ thể:</div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-1.5 text-neutral-200">
                        <div className="p-1 bg-neutral-900 border border-neutral-800">
                          u_m = <span className="text-sky-400 font-bold">{stats.q1.u_m}</span> (đầu mút trái)
                        </div>
                        <div className="p-1 bg-neutral-900 border border-neutral-800">
                          h = <span className="text-purple-400 font-bold">{stats.q1.h}</span> (độ dài nhóm)
                        </div>
                        <div className="p-1 bg-neutral-900 border border-neutral-800">
                          m_m = <span className="text-amber-400 font-bold">{stats.q1.m_m}</span> (tần số nhóm)
                        </div>
                        <div className="p-1 bg-neutral-900 border border-neutral-800">
                          C = <span className="text-emerald-400 font-bold">{stats.q1.C}</span> (cf nhóm trước)
                        </div>
                      </div>
                    </div>

                    {/* Công thức và thay số chuẩn SGK */}
                    <div className="p-2.5 bg-neutral-900 border border-sky-900/50 text-neutral-100 space-y-1">
                      <div className="text-sky-300 font-semibold">
                        Công thức SGK: Q₁ = u_m + [ (n/4 - C) / m_m ] · h
                      </div>
                      <div className="text-neutral-300">
                        Thay số: Q₁ = {stats.q1.u_m} + [ ({stats.q1.target} - {stats.q1.C}) / {stats.q1.m_m} ] · {stats.q1.h}
                      </div>
                      <div className="text-base text-sky-400 font-bold pt-1 border-t border-neutral-800">
                        ⇒ Q₁ = {formatNum(stats.q1.val)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* BƯỚC 3: TRUNG VỊ Me (Q2) */}
                <div className="p-4 bg-neutral-900 border border-neutral-800 space-y-2">
                  <div className="text-xs font-mono font-bold text-neutral-200 flex items-center gap-2">
                    <span className="px-1.5 py-0.5 bg-emerald-600 text-white text-[11px]">BƯỚC 3</span>
                    <span>TÌM TRUNG VỊ M_e (TỨ PHÂN VỊ THỨ HAI Q₂)</span>
                  </div>

                  <div className="p-3 bg-neutral-950 border border-neutral-800 space-y-2.5 text-xs font-mono text-neutral-300">
                    <div>
                      • Vị trí trung vị: <span className="text-emerald-400 font-bold">n / 2 = {stats.n} / 2 = {stats.q2.target}</span>.
                    </div>

                    <div className="p-2 bg-neutral-900 border border-neutral-800">
                      Nhóm đầu tiên có tần số tích lũy <span className="text-emerald-300 font-semibold">cf_i ≥ {stats.q2.target}</span> là nhóm thứ {stats.q2.groupIdx}:{' '}
                      <span className="text-amber-300 font-bold">[{stats.q2.row.start}; {stats.q2.row.end})</span>.
                    </div>

                    <div className="space-y-1 text-[11px] text-neutral-400">
                      <div>Trong đó các đại lượng cụ thể:</div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-1.5 text-neutral-200">
                        <div className="p-1 bg-neutral-900 border border-neutral-800">
                          u_p = <span className="text-emerald-400 font-bold">{stats.q2.u_p}</span> (đầu mút trái)
                        </div>
                        <div className="p-1 bg-neutral-900 border border-neutral-800">
                          h = <span className="text-purple-400 font-bold">{stats.q2.h}</span> (độ dài nhóm)
                        </div>
                        <div className="p-1 bg-neutral-900 border border-neutral-800">
                          m_p = <span className="text-amber-400 font-bold">{stats.q2.m_p}</span> (tần số nhóm)
                        </div>
                        <div className="p-1 bg-neutral-900 border border-neutral-800">
                          C = <span className="text-emerald-400 font-bold">{stats.q2.C}</span> (cf nhóm trước)
                        </div>
                      </div>
                    </div>

                    <div className="p-2.5 bg-neutral-900 border border-emerald-900/50 text-neutral-100 space-y-1">
                      <div className="text-emerald-300 font-semibold">
                        Công thức SGK: M_e = u_p + [ (n/2 - C) / m_p ] · h
                      </div>
                      <div className="text-neutral-300">
                        Thay số: M_e = {stats.q2.u_p} + [ ({stats.q2.target} - {stats.q2.C}) / {stats.q2.m_p} ] · {stats.q2.h}
                      </div>
                      <div className="text-base text-emerald-400 font-bold pt-1 border-t border-neutral-800">
                        ⇒ M_e = Q₂ = {formatNum(stats.q2.val)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* BƯỚC 4: TỨ PHÂN VỊ THỨ BA Q3 */}
                <div className="p-4 bg-neutral-900 border border-neutral-800 space-y-2">
                  <div className="text-xs font-mono font-bold text-neutral-200 flex items-center gap-2">
                    <span className="px-1.5 py-0.5 bg-purple-600 text-white text-[11px]">BƯỚC 4</span>
                    <span>TÌM TỨ PHÂN VỊ THỨ BA Q₃</span>
                  </div>

                  <div className="p-3 bg-neutral-950 border border-neutral-800 space-y-2.5 text-xs font-mono text-neutral-300">
                    <div>
                      • Vị trí tứ phân vị thứ ba: <span className="text-purple-400 font-bold">3n / 4 = 3·{stats.n} / 4 = {stats.q3.target}</span>.
                    </div>

                    <div className="p-2 bg-neutral-900 border border-neutral-800">
                      Nhóm đầu tiên có tần số tích lũy <span className="text-purple-300 font-semibold">cf_i ≥ {stats.q3.target}</span> là nhóm thứ {stats.q3.groupIdx}:{' '}
                      <span className="text-amber-300 font-bold">[{stats.q3.row.start}; {stats.q3.row.end})</span>.
                    </div>

                    <div className="space-y-1 text-[11px] text-neutral-400">
                      <div>Trong đó các đại lượng cụ thể:</div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-1.5 text-neutral-200">
                        <div className="p-1 bg-neutral-900 border border-neutral-800">
                          u_q = <span className="text-purple-400 font-bold">{stats.q3.u_q}</span> (đầu mút trái)
                        </div>
                        <div className="p-1 bg-neutral-900 border border-neutral-800">
                          h = <span className="text-purple-400 font-bold">{stats.q3.h}</span> (độ dài nhóm)
                        </div>
                        <div className="p-1 bg-neutral-900 border border-neutral-800">
                          m_q = <span className="text-amber-400 font-bold">{stats.q3.m_q}</span> (tần số nhóm)
                        </div>
                        <div className="p-1 bg-neutral-900 border border-neutral-800">
                          C = <span className="text-emerald-400 font-bold">{stats.q3.C}</span> (cf nhóm trước)
                        </div>
                      </div>
                    </div>

                    <div className="p-2.5 bg-neutral-900 border border-purple-900/50 text-neutral-100 space-y-1">
                      <div className="text-purple-300 font-semibold">
                        Công thức SGK: Q₃ = u_q + [ (3n/4 - C) / m_q ] · h
                      </div>
                      <div className="text-neutral-300">
                        Thay số: Q₃ = {stats.q3.u_q} + [ ({stats.q3.target} - {stats.q3.C}) / {stats.q3.m_q} ] · {stats.q3.h}
                      </div>
                      <div className="text-base text-purple-400 font-bold pt-1 border-t border-neutral-800">
                        ⇒ Q₃ = {formatNum(stats.q3.val)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* BƯỚC 5: KHOẢNG TỨ PHÂN VỊ ΔQ */}
                <div className="p-4 bg-neutral-900 border border-neutral-800 space-y-2">
                  <div className="text-xs font-mono font-bold text-neutral-200 flex items-center gap-2">
                    <span className="px-1.5 py-0.5 bg-rose-600 text-white text-[11px]">BƯỚC 5</span>
                    <span>TÍNH KHOẢNG TỨ PHÂN VỊ (Δ_Q)</span>
                  </div>

                  <div className="p-3 bg-neutral-950 border border-neutral-800 space-y-1 text-xs font-mono text-neutral-300">
                    <div>
                      • Công thức: <span className="text-rose-400">Δ_Q = Q₃ - Q₁</span>
                    </div>
                    <div className="text-neutral-100">
                      • Thay số: Δ_Q = {formatNum(stats.q3.val)} - {formatNum(stats.q1.val)} ={' '}
                      <span className="text-rose-400 font-bold text-sm">{formatNum(stats.iqr)}</span>
                    </div>
                  </div>
                </div>

                {/* BƯỚC 6: TÌM MỐT Mo */}
                <div className="p-4 bg-neutral-900 border border-neutral-800 space-y-2">
                  <div className="text-xs font-mono font-bold text-neutral-200 flex items-center gap-2">
                    <span className="px-1.5 py-0.5 bg-amber-600 text-white text-[11px]">BƯỚC 6</span>
                    <span>TÌM MỐT (M_o)</span>
                  </div>

                  <div className="p-3 bg-neutral-950 border border-neutral-800 space-y-2 text-xs font-mono text-neutral-300">
                    <div>
                      • Nhóm có tần số lớn nhất (<span className="text-amber-400 font-bold">{stats.mode.m_j}</span>) là nhóm thứ {stats.mode.groupIdx}:{' '}
                      <span className="text-white font-bold">[{stats.mode.row.start}; {stats.mode.row.end})</span>.
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px] text-neutral-300">
                      <div className="p-1.5 bg-neutral-900 border border-neutral-800">
                        m_j - m_j-1 = {stats.mode.m_j} - {stats.mode.m_prev} ={' '}
                        <span className="text-amber-400 font-bold">{stats.mode.delta1}</span>
                      </div>
                      <div className="p-1.5 bg-neutral-900 border border-neutral-800">
                        m_j - m_j+1 = {stats.mode.m_j} - {stats.mode.m_next} ={' '}
                        <span className="text-amber-400 font-bold">{stats.mode.delta2}</span>
                      </div>
                    </div>

                    <div className="p-2.5 bg-neutral-900 border border-amber-900/50 text-neutral-100 space-y-1">
                      <div className="text-amber-300 font-semibold">
                        Công thức SGK: M_o = u_j + [ (m_j - m_j-1) / ((m_j - m_j-1) + (m_j - m_j+1)) ] · h
                      </div>
                      <div className="text-neutral-300">
                        Thay số: M_o = {stats.mode.u_j} + [ {stats.mode.delta1} / ({stats.mode.delta1} + {stats.mode.delta2}) ] · {stats.mode.h}
                      </div>
                      <div className="text-base text-amber-400 font-bold pt-1 border-t border-neutral-800">
                        ⇒ M_o = {formatNum(stats.mode.val)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* BƯỚC 7: PHƯƠNG SAI VÀ ĐỘ LỆCH CHUẨN */}
                <div className="p-4 bg-neutral-900 border border-neutral-800 space-y-2">
                  <div className="text-xs font-mono font-bold text-neutral-200 flex items-center gap-2">
                    <span className="px-1.5 py-0.5 bg-emerald-600 text-white text-[11px]">BƯỚC 7</span>
                    <span>TÍNH PHƯƠNG SAI (s²) VÀ ĐỘ LỆCH CHUẨN (s)</span>
                  </div>

                  <div className="p-3 bg-neutral-950 border border-neutral-800 space-y-2 text-xs font-mono text-neutral-300">
                    <div>
                      • Công thức phương sai: <span className="text-emerald-400">s² = (1/n)·∑(m_i · c_i²) - (x̄)²</span>
                    </div>
                    <div className="p-2 bg-neutral-900 border border-neutral-800 text-neutral-100">
                      s² = ({stats.sumMC2} / {stats.n}) - ({formatNum(stats.mean)})² ={' '}
                      <span className="text-emerald-400 font-bold">{formatNum(stats.variance)}</span>
                    </div>

                    <div className="pt-1">
                      • Độ lệch chuẩn: <span className="text-purple-400">s = √s²</span> = √{formatNum(stats.variance)} ={' '}
                      <span className="text-purple-400 font-bold text-sm">{formatNum(stats.stdDev)}</span>
                    </div>
                  </div>
                </div>
              </div>
            )
          ) : null}
        </div>
      </div>
    </div>
  );
};
