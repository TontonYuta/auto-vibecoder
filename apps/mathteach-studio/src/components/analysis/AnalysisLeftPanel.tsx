import React from 'react';
import { FunctionType, CubicParams, Rational11Params, Rational21Params, FunctionAnalysisResult } from '../../types';
import { BookOpen, Calculator, Compass, ChevronRight, Layers, HelpCircle } from 'lucide-react';
import { formatNum } from '../../math/analysis';

interface AnalysisLeftPanelProps {
  fnType: FunctionType;
  setFnType: (t: FunctionType) => void;
  cubicParams: CubicParams;
  setCubicParams: React.Dispatch<React.SetStateAction<CubicParams>>;
  r11Params: Rational11Params;
  setR11Params: React.Dispatch<React.SetStateAction<Rational11Params>>;
  r21Params: Rational21Params;
  setR21Params: React.Dispatch<React.SetStateAction<Rational21Params>>;
  analysis: FunctionAnalysisResult;
}

export const AnalysisLeftPanel: React.FC<AnalysisLeftPanelProps> = ({
  fnType,
  setFnType,
  cubicParams,
  setCubicParams,
  r11Params,
  setR11Params,
  r21Params,
  setR21Params,
  analysis,
}) => {
  // Presets
  const presets = [
    {
      name: 'Bậc 3: 2 Cực trị (SGK)',
      type: 'cubic' as FunctionType,
      apply: () => {
        setFnType('cubic');
        setCubicParams({ a: 1, b: -3, c: 0, d: 2 });
      },
    },
    {
      name: 'Bậc 3: a < 0 (Đề thi)',
      type: 'cubic' as FunctionType,
      apply: () => {
        setFnType('cubic');
        setCubicParams({ a: -1, b: 0, c: 3, d: -1 });
      },
    },
    {
      name: 'Bậc 1/1: Đồng biến',
      type: 'rational11' as FunctionType,
      apply: () => {
        setFnType('rational11');
        setR11Params({ a: 2, b: -1, c: 1, d: 1 });
      },
    },
    {
      name: 'Bậc 1/1: Nghịch biến',
      type: 'rational11' as FunctionType,
      apply: () => {
        setFnType('rational11');
        setR11Params({ a: 1, b: 2, c: 1, d: -1 });
      },
    },
    {
      name: 'Bậc 2/1: Tiệm cận xiên chuẩn (SGK 12 mới)',
      type: 'rational21' as FunctionType,
      apply: () => {
        setFnType('rational21');
        setR21Params({ a: 1, b: -1, c: 1, p: 1, q: -1 });
      },
    },
    {
      name: 'Bậc 2/1: TCX hệ số góc 2',
      type: 'rational21' as FunctionType,
      apply: () => {
        setFnType('rational21');
        setR21Params({ a: 2, b: 1, c: -3, p: 1, q: -2 });
      },
    },
  ];

  return (
    <div className="flex flex-col h-full bg-neutral-900 border-r border-neutral-800 text-neutral-200 select-none overflow-y-auto">
      {/* 1. Header & Function Selector Tabs */}
      <div className="p-3 border-b border-neutral-800 bg-neutral-950">
        <div className="text-[11px] font-mono text-neutral-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-blue-400" />
          <span>Dạng Hàm Số Khảo Sát (Toán 12)</span>
        </div>

        <div className="grid grid-cols-3 gap-1 bg-neutral-900 p-1 border border-neutral-800">
          <button
            onClick={() => setFnType('cubic')}
            className={`py-1.5 px-1 text-center text-xs font-mono transition-colors border ${
              fnType === 'cubic'
                ? 'bg-blue-600 text-white border-blue-500 font-semibold'
                : 'text-neutral-400 border-transparent hover:text-neutral-200 hover:bg-neutral-800'
            }`}
          >
            Bậc 3
          </button>

          <button
            onClick={() => setFnType('rational11')}
            className={`py-1.5 px-1 text-center text-xs font-mono transition-colors border ${
              fnType === 'rational11'
                ? 'bg-blue-600 text-white border-blue-500 font-semibold'
                : 'text-neutral-400 border-transparent hover:text-neutral-200 hover:bg-neutral-800'
            }`}
          >
            Bậc 1 / 1
          </button>

          <button
            onClick={() => setFnType('rational21')}
            className={`py-1.5 px-1 text-center text-xs font-mono transition-colors border ${
              fnType === 'rational21'
                ? 'bg-blue-600 text-white border-blue-500 font-semibold'
                : 'text-neutral-400 border-transparent hover:text-neutral-200 hover:bg-neutral-800'
            }`}
          >
            Bậc 2 / 1 (TCX)
          </button>
        </div>
      </div>

      {/* 2. Quick Presets Bar */}
      <div className="p-3 border-b border-neutral-800 bg-neutral-950/60">
        <div className="text-[11px] font-mono text-neutral-400 mb-1.5 flex items-center justify-between">
          <span>Ví Dụ Mẫu & Đề Thi THPT:</span>
        </div>
        <div className="flex flex-wrap gap-1">
          {presets.map((preset, idx) => (
            <button
              key={idx}
              onClick={preset.apply}
              className="text-[11px] px-2 py-1 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 hover:border-neutral-700 text-neutral-300 text-left transition-colors font-mono"
            >
              {preset.name}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Coefficient Parameter Inputs */}
      <div className="p-4 border-b border-neutral-800 bg-neutral-900">
        <div className="text-xs font-mono text-neutral-300 font-semibold mb-3 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Calculator className="w-3.5 h-3.5 text-emerald-400" />
            <span>NHẬP THAM SỐ HÀM SỐ</span>
          </span>
          <span className="text-[11px] text-blue-400 font-mono bg-blue-950/50 px-2 py-0.5 border border-blue-800/60">
            {analysis.plainEquation}
          </span>
        </div>

        {/* CUBIC INPUTS */}
        {fnType === 'cubic' && (
          <div className="grid grid-cols-4 gap-2">
            {(['a', 'b', 'c', 'd'] as (keyof CubicParams)[]).map((param) => (
              <div key={param} className="flex flex-col">
                <label className="text-[11px] font-mono text-neutral-400 mb-1 flex items-center justify-between">
                  <span>Hệ số {param}:</span>
                  {param === 'a' && <span className="text-rose-400 text-[10px]">≠ 0</span>}
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={cubicParams[param]}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value) || 0;
                    setCubicParams((prev) => ({ ...prev, [param]: val }));
                  }}
                  className="bg-neutral-950 border border-neutral-800 focus:border-blue-500 focus:outline-none px-2 py-1.5 text-xs font-mono text-white text-center rounded-none"
                />
              </div>
            ))}
          </div>
        )}

        {/* RATIONAL 1/1 INPUTS */}
        {fnType === 'rational11' && (
          <div className="space-y-2">
            <div className="text-[11px] text-neutral-400 font-mono">
              Tử số: <span className="text-neutral-200">ax + b</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex flex-col">
                <label className="text-[11px] font-mono text-neutral-400 mb-1">Hệ số a:</label>
                <input
                  type="number"
                  step="0.5"
                  value={r11Params.a}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value) || 0;
                    setR11Params((prev) => ({ ...prev, a: val }));
                  }}
                  className="bg-neutral-950 border border-neutral-800 focus:border-blue-500 focus:outline-none px-2 py-1.5 text-xs font-mono text-white text-center rounded-none"
                />
              </div>
              <div className="flex flex-col">
                <label className="text-[11px] font-mono text-neutral-400 mb-1">Hệ số b:</label>
                <input
                  type="number"
                  step="0.5"
                  value={r11Params.b}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value) || 0;
                    setR11Params((prev) => ({ ...prev, b: val }));
                  }}
                  className="bg-neutral-950 border border-neutral-800 focus:border-blue-500 focus:outline-none px-2 py-1.5 text-xs font-mono text-white text-center rounded-none"
                />
              </div>
            </div>

            <div className="text-[11px] text-neutral-400 font-mono pt-1">
              Mẫu số: <span className="text-neutral-200">cx + d</span> <span className="text-rose-400 text-[10px]">(c ≠ 0)</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex flex-col">
                <label className="text-[11px] font-mono text-neutral-400 mb-1">Hệ số c:</label>
                <input
                  type="number"
                  step="0.5"
                  value={r11Params.c}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value) || 0;
                    setR11Params((prev) => ({ ...prev, c: val }));
                  }}
                  className="bg-neutral-950 border border-neutral-800 focus:border-blue-500 focus:outline-none px-2 py-1.5 text-xs font-mono text-white text-center rounded-none"
                />
              </div>
              <div className="flex flex-col">
                <label className="text-[11px] font-mono text-neutral-400 mb-1">Hệ số d:</label>
                <input
                  type="number"
                  step="0.5"
                  value={r11Params.d}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value) || 0;
                    setR11Params((prev) => ({ ...prev, d: val }));
                  }}
                  className="bg-neutral-950 border border-neutral-800 focus:border-blue-500 focus:outline-none px-2 py-1.5 text-xs font-mono text-white text-center rounded-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* RATIONAL 2/1 INPUTS */}
        {fnType === 'rational21' && (
          <div className="space-y-2">
            <div className="text-[11px] text-neutral-400 font-mono">
              Tử số: <span className="text-neutral-200">ax² + bx + c</span> <span className="text-rose-400 text-[10px]">(a ≠ 0)</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {(['a', 'b', 'c'] as (keyof Rational21Params)[]).map((param) => (
                <div key={param} className="flex flex-col">
                  <label className="text-[11px] font-mono text-neutral-400 mb-1">Hệ số {param}:</label>
                  <input
                    type="number"
                    step="0.5"
                    value={r21Params[param]}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value) || 0;
                      setR21Params((prev) => ({ ...prev, [param]: val }));
                    }}
                    className="bg-neutral-950 border border-neutral-800 focus:border-blue-500 focus:outline-none px-2 py-1.5 text-xs font-mono text-white text-center rounded-none"
                  />
                </div>
              ))}
            </div>

            <div className="text-[11px] text-neutral-400 font-mono pt-1">
              Mẫu số: <span className="text-neutral-200">px + q</span> <span className="text-rose-400 text-[10px]">(p ≠ 0)</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {(['p', 'q'] as (keyof Rational21Params)[]).map((param) => (
                <div key={param} className="flex flex-col">
                  <label className="text-[11px] font-mono text-neutral-400 mb-1">Hệ số {param}:</label>
                  <input
                    type="number"
                    step="0.5"
                    value={r21Params[param]}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value) || 0;
                      setR21Params((prev) => ({ ...prev, [param]: val }));
                    }}
                    className="bg-neutral-950 border border-neutral-800 focus:border-blue-500 focus:outline-none px-2 py-1.5 text-xs font-mono text-white text-center rounded-none"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 4. Khảo Sát Chi Tiết Chuẩn SGK (Step-by-step Math Analysis) */}
      <div className="p-4 space-y-4 flex-1">
        <div className="text-xs font-mono text-neutral-300 font-semibold flex items-center gap-1.5">
          <BookOpen className="w-3.5 h-3.5 text-blue-400" />
          <span>TIẾN TRÌNH KHẢO SÁT CHUẨN SGK</span>
        </div>

        {/* BƯỚC 1: TẬP XÁC ĐỊNH */}
        <div className="p-2.5 bg-neutral-950 border border-neutral-800">
          <div className="text-[11px] font-semibold text-neutral-400 mb-1 flex items-center gap-1">
            <span className="text-blue-400">1.</span> TẬP XÁC ĐỊNH
          </div>
          <div className="text-xs font-mono text-neutral-200">
            {analysis.domain.replace('\\mathcal{D} = ', 'D = ').replace('\\mathbb{R}', 'ℝ').replace('\\setminus \\{', ' \\ {').replace('\\}', '}')}
          </div>
        </div>

        {/* BƯỚC 2: SỰ BIẾN THIÊN */}
        <div className="p-2.5 bg-neutral-950 border border-neutral-800 space-y-2">
          <div className="text-[11px] font-semibold text-neutral-400 flex items-center gap-1">
            <span className="text-blue-400">2.</span> SỰ BIẾN THIÊN (ĐẠO HÀM Y')
          </div>

          <div className="text-xs font-mono text-neutral-200 bg-neutral-900 p-2 border border-neutral-800/80">
            {analysis.derivativeLatex.replace('\\frac', '').replace('\\', '')}
          </div>

          {/* Nghiệm đạo hàm y' = 0 */}
          <div className="text-xs font-mono text-neutral-300">
            {analysis.derivativeRoots.length > 0 ? (
              <div>
                <span className="text-neutral-400">y' = 0 ⇔ </span>
                <span className="text-emerald-400">
                  {analysis.derivativeRoots.map((r, i) => `x_${i + 1} = ${formatNum(r)}`).join(' ; ')}
                </span>
              </div>
            ) : (
              <div className="text-neutral-400">
                {fnType === 'rational11' ? (
                  <span>y' không triệt tiêu trên từng khoảng xác định.</span>
                ) : (
                  <span>Phương trình y' = 0 vô nghiệm thực.</span>
                )}
              </div>
            )}
          </div>

          {/* Cực trị */}
          <div className="pt-1 border-t border-neutral-800/60">
            <div className="text-[11px] text-neutral-400 mb-1">Cực trị hàm số:</div>
            {analysis.criticalPoints.length > 0 ? (
              <div className="space-y-1">
                {analysis.criticalPoints.map((cp, idx) => (
                  <div key={idx} className="text-xs font-mono flex items-center justify-between text-neutral-200">
                    <span className={cp.type === 'max' ? 'text-sky-400' : 'text-rose-400'}>
                      • Điểm {cp.label}:
                    </span>
                    <span className="text-neutral-100">
                      ({formatNum(cp.x)}, {formatNum(cp.y)})
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-xs text-neutral-500 font-mono italic">
                Hàm số không có điểm cực trị.
              </div>
            )}
          </div>

          {/* Khoảng đồng biến / nghịch biến */}
          <div className="pt-1 border-t border-neutral-800/60 space-y-1 text-xs font-mono">
            {analysis.intervals.increasing.length > 0 && (
              <div className="text-sky-300">
                <span className="text-neutral-400">Đồng biến trên: </span>
                {analysis.intervals.increasing.join(' và ')}
              </div>
            )}
            {analysis.intervals.decreasing.length > 0 && (
              <div className="text-rose-300">
                <span className="text-neutral-400">Nghịch biến trên: </span>
                {analysis.intervals.decreasing.join(' và ')}
              </div>
            )}
          </div>
        </div>

        {/* BƯỚC 3: CÁC ĐƯỜNG TIỆM CẬN (TRỌNG TÂM SGK 12 MỚI) */}
        <div className="p-2.5 bg-neutral-950 border border-neutral-800 space-y-2">
          <div className="text-[11px] font-semibold text-neutral-400 flex items-center gap-1">
            <span className="text-blue-400">3.</span> TIỆM CẬN (KIẾN THỨC MỚI SGK 12)
          </div>

          {analysis.asymptotes.vertical !== undefined ||
          analysis.asymptotes.horizontal !== undefined ||
          analysis.asymptotes.slant !== undefined ? (
            <div className="space-y-2 text-xs font-mono">
              {/* TC Đứng */}
              {analysis.asymptotes.vertical !== undefined && (
                <div className="flex items-center justify-between p-1.5 bg-neutral-900 border border-amber-900/40 text-amber-300">
                  <span>Tiệm cận đứng (TCĐ):</span>
                  <span className="font-bold">x = {formatNum(analysis.asymptotes.vertical)}</span>
                </div>
              )}

              {/* TC Ngang */}
              {analysis.asymptotes.horizontal !== undefined && (
                <div className="flex items-center justify-between p-1.5 bg-neutral-900 border border-emerald-900/40 text-emerald-300">
                  <span>Tiệm cận ngang (TCN):</span>
                  <span className="font-bold">y = {formatNum(analysis.asymptotes.horizontal)}</span>
                </div>
              )}

              {/* TC Xiên (Trọng tâm SGK 12) */}
              {analysis.asymptotes.slant && (
                <div className="p-2 bg-neutral-900 border border-emerald-900/40 space-y-1">
                  <div className="flex items-center justify-between text-emerald-300">
                    <span>Tiệm cận xiên (TCX):</span>
                    <span className="font-bold">
                      y = {formatNum(analysis.asymptotes.slant.m)}x{' '}
                      {analysis.asymptotes.slant.n >= 0 ? '+' : '-'} {formatNum(Math.abs(analysis.asymptotes.slant.n))}
                    </span>
                  </div>

                  {/* Phép chia đa thức giải thích cho giáo viên dạy */}
                  {analysis.polynomialDivisionSteps && (
                    <div className="text-[11px] text-neutral-400 pt-1 border-t border-neutral-800">
                      <div>Phân tích phép chia:</div>
                      <div className="text-neutral-200 mt-0.5">
                        {analysis.polynomialDivisionSteps.formula.replace('\\frac', '').replace('{', '(').replace('}{', ') / (').replace('}', ')')}
                      </div>
                      <div className="text-[10px] text-neutral-500 mt-0.5">
                        Vì lim [y - ({analysis.polynomialDivisionSteps.quotient})] = 0 khi x → ±∞
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="text-xs text-neutral-500 font-mono italic">
              Đồ thị hàm số không có đường tiệm cận.
            </div>
          )}
        </div>

        {/* BƯỚC 4: TÂM ĐỐI XỨNG & ĐIỂM ĐẶC BIỆT */}
        {analysis.symmetryCenter && (
          <div className="p-2.5 bg-neutral-950 border border-neutral-800 space-y-1">
            <div className="text-[11px] font-semibold text-neutral-400 flex items-center gap-1">
              <span className="text-blue-400">4.</span> TÂM ĐỐI XỨNG & ĐIỂM UỐN
            </div>
            <div className="text-xs font-mono text-purple-300 flex items-center justify-between">
              <span>{analysis.symmetryCenter.label}:</span>
              <span className="font-bold">
                I({formatNum(analysis.symmetryCenter.x)}, {formatNum(analysis.symmetryCenter.y)})
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
