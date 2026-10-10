import React, { useState } from 'react';
import { GitFork, Calculator, Copy, Check, Sparkles, BookOpen } from 'lucide-react';
import { formatNum } from '../../math/analysis';

export const ProbabilityTreeTab: React.FC = () => {
  // Event labels and probabilities
  const [eventAName, setEventAName] = useState('Mắc bệnh (A)');
  const [eventNotAName, setEventNotAName] = useState('Không mắc bệnh (A̅)');
  const [eventBName, setEventBName] = useState('Xét nghiệm Dương tính (+)');
  const [eventNotBName, setEventNotBName] = useState('Xét nghiệm Âm tính (-)');

  const [pA, setPA] = useState(0.02); // P(A) = 2%
  const [pBGivenA, setPBGivenA] = useState(0.95); // P(B|A) = 95%
  const [pBGivenNotA, setPBGivenNotA] = useState(0.05); // P(B|A̅) = 5%

  const [copied, setCopied] = useState(false);

  // Computed probabilities
  const pNotA = Math.max(0, Math.min(1, 1 - pA));
  const pNotBGivenA = Math.max(0, Math.min(1, 1 - pBGivenA));
  const pNotBGivenNotA = Math.max(0, Math.min(1, 1 - pBGivenNotA));

  // Joint probabilities (Leaves)
  const pA_and_B = pA * pBGivenA;
  const pA_and_NotB = pA * pNotBGivenA;
  const pNotA_and_B = pNotA * pBGivenNotA;
  const pNotA_and_NotB = pNotA * pNotBGivenNotA;

  // Law of Total Probability for B
  const pB = pA_and_B + pNotA_and_B;

  // Bayes' Formula: P(A|B)
  const pAGivenB = pB > 0 ? pA_and_B / pB : 0;

  // Presets
  const presets = [
    {
      name: 'Xét Nghiệm Y Tế (SGK Kết Nối)',
      a: 'Nhiễm virus (A)',
      notA: 'Khỏe mạnh (A̅)',
      b: 'Dương tính (+)',
      notB: 'Âm tính (-)',
      pA: 0.02,
      pBGivenA: 0.95,
      pBGivenNotA: 0.04,
    },
    {
      name: 'Kiểm Định Linh Kiện Nhà Máy (SGK Cánh Diều)',
      a: 'Máy 1 sản xuất (A)',
      notA: 'Máy 2 sản xuất (A̅)',
      b: 'Phế phẩm (B)',
      notB: 'Chính phẩm (B̅)',
      pA: 0.6,
      pBGivenA: 0.03,
      pBGivenNotA: 0.05,
    },
  ];

  const handleCopy = async () => {
    const text = `BÀI TOÁN XÁC SUẤT TOÀN PHẦN VÀ CÔNG THỨC BAYES (TOÁN 12):
- P(A) = ${pA.toFixed(4)}, P(A̅) = ${pNotA.toFixed(4)}
- P(B|A) = ${pBGivenA.toFixed(4)}, P(B|A̅) = ${pBGivenNotA.toFixed(4)}
1. Xác suất toàn phần P(B):
   P(B) = P(A)·P(B|A) + P(A̅)·P(B|A̅)
        = ${pA.toFixed(4)} · ${pBGivenA.toFixed(4)} + ${pNotA.toFixed(4)} · ${pBGivenNotA.toFixed(4)}
        = ${(pB * 100).toFixed(3)}% (${pB.toFixed(5)})
2. Công thức Bayes P(A|B):
   P(A|B) = [P(A)·P(B|A)] / P(B)
          = ${pA_and_B.toFixed(5)} / ${pB.toFixed(5)}
          = ${(pAGivenB * 100).toFixed(2)}% (${pAGivenB.toFixed(4)})`;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex-1 h-full grid grid-cols-12 overflow-hidden bg-neutral-950 select-none">
      {/* CỘT TRÁI: Nhập tham số & Presets */}
      <div className="col-span-12 lg:col-span-4 h-full border-r border-neutral-800 bg-neutral-900 flex flex-col overflow-y-auto">
        <div className="p-3 bg-neutral-950 border-b border-neutral-800">
          <div className="text-xs font-mono text-neutral-300 font-semibold flex items-center gap-1.5">
            <GitFork className="w-3.5 h-3.5 text-blue-400" />
            <span>THAM SỐ BIẾN CỐ & XÁC SUẤT</span>
          </div>
        </div>

        {/* Presets */}
        <div className="p-2.5 bg-neutral-950/60 border-b border-neutral-800 flex items-center gap-1.5 overflow-x-auto">
          <span className="text-[11px] text-neutral-400 font-mono whitespace-nowrap">Ví dụ:</span>
          {presets.map((pr, i) => (
            <button
              key={i}
              onClick={() => {
                setEventAName(pr.a);
                setEventNotAName(pr.notA);
                setEventBName(pr.b);
                setEventNotBName(pr.notB);
                setPA(pr.pA);
                setPBGivenA(pr.pBGivenA);
                setPBGivenNotA(pr.pBGivenNotA);
              }}
              className="px-2 py-1 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-[11px] font-mono text-neutral-300 whitespace-nowrap transition-colors"
            >
              {pr.name}
            </button>
          ))}
        </div>

        {/* Form Inputs */}
        <div className="p-4 space-y-4 flex-1 overflow-y-auto">
          {/* Nhánh 1: A vs Not A */}
          <div className="p-3 bg-neutral-950 border border-neutral-800 space-y-2">
            <div className="text-xs font-mono text-blue-400 font-semibold">1. BIẾN CỐ GỐC A VÀ A̅:</div>
            <div>
              <label className="text-[11px] font-mono text-neutral-400">Tên biến cố A:</label>
              <input
                type="text"
                value={eventAName}
                onChange={(e) => setEventAName(e.target.value)}
                className="w-full bg-neutral-900 border border-neutral-800 text-xs font-mono px-2 py-1 text-white mt-1 rounded-none focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <div className="flex justify-between text-[11px] font-mono text-neutral-400">
                <span>Xác suất P(A):</span>
                <span className="text-blue-400 font-bold">{(pA * 100).toFixed(1)}%</span>
              </div>
              <input
                type="range"
                min="0.01"
                max="0.99"
                step="0.01"
                value={pA}
                onChange={(e) => setPA(parseFloat(e.target.value))}
                className="w-full h-1 bg-neutral-800 accent-blue-500 rounded-none cursor-pointer mt-1"
              />
            </div>
          </div>

          {/* Nhánh 2: B|A */}
          <div className="p-3 bg-neutral-950 border border-neutral-800 space-y-2">
            <div className="text-xs font-mono text-emerald-400 font-semibold">2. XÁC SUẤT CÓ ĐIỀU KIỆN (KHI A XẢY RA):</div>
            <div>
              <label className="text-[11px] font-mono text-neutral-400">Tên biến cố B:</label>
              <input
                type="text"
                value={eventBName}
                onChange={(e) => setEventBName(e.target.value)}
                className="w-full bg-neutral-900 border border-neutral-800 text-xs font-mono px-2 py-1 text-white mt-1 rounded-none focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <div className="flex justify-between text-[11px] font-mono text-neutral-400">
                <span>P(B | A):</span>
                <span className="text-emerald-400 font-bold">{(pBGivenA * 100).toFixed(1)}%</span>
              </div>
              <input
                type="range"
                min="0.01"
                max="0.99"
                step="0.01"
                value={pBGivenA}
                onChange={(e) => setPBGivenA(parseFloat(e.target.value))}
                className="w-full h-1 bg-neutral-800 accent-emerald-500 rounded-none cursor-pointer mt-1"
              />
            </div>
          </div>

          {/* Nhánh 3: B|Not A */}
          <div className="p-3 bg-neutral-950 border border-neutral-800 space-y-2">
            <div className="text-xs font-mono text-amber-400 font-semibold">3. XÁC SUẤT CÓ ĐIỀU KIỆN (KHI A̅ XẢY RA):</div>
            <div>
              <div className="flex justify-between text-[11px] font-mono text-neutral-400">
                <span>P(B | A̅):</span>
                <span className="text-amber-400 font-bold">{(pBGivenNotA * 100).toFixed(1)}%</span>
              </div>
              <input
                type="range"
                min="0.01"
                max="0.99"
                step="0.01"
                value={pBGivenNotA}
                onChange={(e) => setPBGivenNotA(parseFloat(e.target.value))}
                className="w-full h-1 bg-neutral-800 accent-amber-500 rounded-none cursor-pointer mt-1"
              />
            </div>
          </div>
        </div>
      </div>

      {/* CỘT PHẢI: Sơ đồ cây SVG & Công thức Bayes */}
      <div className="col-span-12 lg:col-span-8 h-full flex flex-col bg-neutral-950 overflow-y-auto">
        <div className="h-10 px-4 bg-neutral-950 border-b border-neutral-800 flex items-center justify-between">
          <div className="text-xs font-mono text-neutral-300 font-semibold flex items-center gap-1.5">
            <Calculator className="w-3.5 h-3.5 text-blue-400" />
            <span>SƠ ĐỒ HÌNH CÂY VECTOR (TREE DIAGRAM TOÁN 12)</span>
          </div>

          <button
            onClick={handleCopy}
            className="px-2.5 py-1 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-200 text-xs font-mono rounded-none flex items-center gap-1 transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Đã sao chép' : 'Sao chép lời giải'}</span>
          </button>
        </div>

        <div className="p-4 space-y-4 flex-1 overflow-y-auto">
          {/* Vector Tree SVG */}
          <div className="p-3 bg-neutral-900 border border-neutral-800 flex justify-center overflow-x-auto">
            <svg
              width="680"
              height="300"
              className="font-mono bg-neutral-950 border border-neutral-800 p-2 block"
            >
              {/* Root */}
              <circle cx="50" cy="150" r="6" fill="#3b82f6" />
              <text x="50" y="175" textAnchor="middle" fill="#93c5fd" fontSize="11" fontWeight="bold">
                Gốc Ω
              </text>

              {/* Branch 1 to A (Top) */}
              <line x1="56" y1="148" x2="230" y2="75" stroke="#3b82f6" strokeWidth="1.8" />
              <text x="135" y="100" fill="#93c5fd" fontSize="11" fontWeight="bold">
                {(pA * 100).toFixed(1)}%
              </text>

              {/* Node A */}
              <circle cx="230" cy="75" r="5" fill="#3b82f6" />
              <text x="242" y="70" fill="#ffffff" fontSize="12" fontWeight="bold">
                A ({eventAName.slice(0, 16)})
              </text>

              {/* Branch 1 to Not A (Bottom) */}
              <line x1="56" y1="152" x2="230" y2="225" stroke="#71717a" strokeWidth="1.8" />
              <text x="135" y="200" fill="#a1a1aa" fontSize="11" fontWeight="bold">
                {(pNotA * 100).toFixed(1)}%
              </text>

              {/* Node Not A */}
              <circle cx="230" cy="225" r="5" fill="#71717a" />
              <text x="242" y="220" fill="#d4d4d8" fontSize="12" fontWeight="bold">
                A̅ ({eventNotAName.slice(0, 16)})
              </text>

              {/* Sub-branches from A */}
              {/* A -> B */}
              <line x1="235" y1="72" x2="440" y2="40" stroke="#10b981" strokeWidth="1.5" />
              <text x="325" y="48" fill="#34d399" fontSize="11">
                {(pBGivenA * 100).toFixed(1)}%
              </text>
              <circle cx="440" cy="40" r="4" fill="#10b981" />
              <text x="450" y="44" fill="#6ee7b7" fontSize="11">
                B ({eventBName.slice(0, 12)})
              </text>
              <text x="590" y="44" fill="#93c5fd" fontSize="11" fontWeight="bold">
                = {(pA_and_B * 100).toFixed(2)}%
              </text>

              {/* A -> Not B */}
              <line x1="235" y1="78" x2="440" y2="105" stroke="#71717a" strokeWidth="1.5" />
              <text x="325" y="100" fill="#a1a1aa" fontSize="11">
                {(pNotBGivenA * 100).toFixed(1)}%
              </text>
              <circle cx="440" cy="105" r="4" fill="#71717a" />
              <text x="450" y="109" fill="#a1a1aa" fontSize="11">
                B̅ ({eventNotBName.slice(0, 12)})
              </text>
              <text x="590" y="109" fill="#a1a1aa" fontSize="11">
                = {(pA_and_NotB * 100).toFixed(2)}%
              </text>

              {/* Sub-branches from Not A */}
              {/* Not A -> B */}
              <line x1="235" y1="222" x2="440" y2="190" stroke="#f59e0b" strokeWidth="1.5" />
              <text x="325" y="198" fill="#fbbf24" fontSize="11">
                {(pBGivenNotA * 100).toFixed(1)}%
              </text>
              <circle cx="440" cy="190" r="4" fill="#f59e0b" />
              <text x="450" y="194" fill="#fde047" fontSize="11">
                B ({eventBName.slice(0, 12)})
              </text>
              <text x="590" y="194" fill="#fde047" fontSize="11" fontWeight="bold">
                = {(pNotA_and_B * 100).toFixed(2)}%
              </text>

              {/* Not A -> Not B */}
              <line x1="235" y1="228" x2="440" y2="260" stroke="#71717a" strokeWidth="1.5" />
              <text x="325" y="252" fill="#a1a1aa" fontSize="11">
                {(pNotBGivenNotA * 100).toFixed(1)}%
              </text>
              <circle cx="440" cy="260" r="4" fill="#71717a" />
              <text x="450" y="264" fill="#a1a1aa" fontSize="11">
                B̅ ({eventNotBName.slice(0, 12)})
              </text>
              <text x="590" y="264" fill="#a1a1aa" fontSize="11">
                = {(pNotA_and_NotB * 100).toFixed(2)}%
              </text>
            </svg>
          </div>

          {/* Cards: Total Probability & Bayes Formula */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Total probability */}
            <div className="p-3 bg-neutral-900 border border-neutral-800 space-y-2">
              <div className="text-[11px] font-mono text-neutral-400 font-semibold">
                1. CÔNG THỨC XÁC SUẤT TOÀN PHẦN P(B)
              </div>
              <div className="text-xl font-mono font-bold text-blue-400">
                P(B) = {(pB * 100).toFixed(3)}%
              </div>
              <div className="text-xs font-mono text-neutral-300 bg-neutral-950 p-2 border border-neutral-800">
                P(B) = P(A)·P(B|A) + P(A̅)·P(B|A̅)
                <div className="text-neutral-400 mt-1">
                  = {(pA_and_B).toFixed(4)} + {(pNotA_and_B).toFixed(4)}
                </div>
              </div>
            </div>

            {/* Bayes Formula */}
            <div className="p-3 bg-neutral-900 border border-neutral-800 space-y-2">
              <div className="text-[11px] font-mono text-neutral-400 font-semibold">
                2. CÔNG THỨC BAYES P(A | B)
              </div>
              <div className="text-xl font-mono font-bold text-emerald-400">
                P(A | B) = {(pAGivenB * 100).toFixed(2)}%
              </div>
              <div className="text-xs font-mono text-neutral-300 bg-neutral-950 p-2 border border-neutral-800">
                P(A | B) = [P(A)·P(B|A)] / P(B)
                <div className="text-neutral-400 mt-1">
                  = {pA_and_B.toFixed(4)} / {pB.toFixed(4)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
