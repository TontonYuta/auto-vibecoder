import React, { useRef, useState } from 'react';
import { FunctionAnalysisResult } from '../../types';
import { Copy, Check, Download, Code, Sparkles, Sun, Moon } from 'lucide-react';

interface BBTSvgProps {
  analysis: FunctionAnalysisResult;
  theme?: 'dark' | 'light';
  onThemeToggle?: () => void;
}

export function generateLatexTkzTab(analysis: FunctionAnalysisResult): string {
  const pts = analysis.tablePoints;
  const xLabels = pts.map((p) => (p.xLabel === '-\\infty' ? '- \\infty' : p.xLabel === '+\\infty' ? '+ \\infty' : p.xLabel)).join(' , ');

  // Row y'
  const yPrimeParts: string[] = [];
  for (let i = 0; i < pts.length; i++) {
    const pt = pts[i];
    if (i === 0) {
      // after left infinity
      if (pt.yPrimeSignRight) yPrimeParts.push(pt.yPrimeSignRight);
    } else if (i === pts.length - 1) {
      // nothing after right infinity
    } else {
      if (pt.isDiscontinuity) {
        yPrimeParts.push('d');
      } else if (pt.yPrimeVal === 0) {
        yPrimeParts.push('z');
      }
      if (pt.yPrimeSignRight) {
        yPrimeParts.push(pt.yPrimeSignRight);
      }
    }
  }
  const yPrimeStr = yPrimeParts.join(' , ');

  return `% Mã Bảng Biến Thiên LaTeX (yêu cầu gói: \\usepackage{tkz-tab})
\\begin{tikzpicture}
  \\tkzTabInit[lgt=1.5,espcl=2.2]{$x$ / 0.8, $y'$ / 0.8, $y$ / 2.0}
    { ${xLabels} }
  \\tkzTabLine{ ${yPrimeStr} }
  % Thầy cô điều chỉnh mũi tên theo cấu trúc tkzTabVar
\\end{tikzpicture}`;
}

export const BBTSvg: React.FC<BBTSvgProps> = ({ analysis, theme = 'dark', onThemeToggle }) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [copiedSVG, setCopiedSVG] = useState(false);
  const [copiedLatex, setCopiedLatex] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const isLight = theme === 'light';

  // Palette
  const colors = {
    bg: isLight ? '#ffffff' : '#0c0c0e',
    cardBg: isLight ? '#f4f4f5' : '#141418',
    border: isLight ? '#27272a' : '#27272a',
    textMain: isLight ? '#09090b' : '#f4f4f5',
    textMuted: isLight ? '#52525b' : '#a1a1aa',
    arrowUp: isLight ? '#0284c7' : '#38bdf8',
    arrowDown: isLight ? '#dc2626' : '#f87171',
    lineAccent: isLight ? '#18181b' : '#3f3f46',
    doubleBar: isLight ? '#dc2626' : '#ef4444',
  };

  const pts = analysis.tablePoints;
  const numIntervals = Math.max(pts.length - 1, 1);

  // SVG Geometry
  const leftColWidth = 80;
  const colWidth = 140; // width per column interval
  const totalWidth = leftColWidth + numIntervals * colWidth;
  const row1Height = 44; // x row
  const row2Height = 44; // y' row
  const row3Height = 110; // y row (variation arrows)
  const totalHeight = row1Height + row2Height + row3Height;

  // Calculate X coordinate for each table point
  const getX = (index: number) => {
    if (index === 0) return leftColWidth + 24; // left infinity indent
    if (index === pts.length - 1) return totalWidth - 24; // right infinity indent
    // intermediate points distributed evenly
    return leftColWidth + index * colWidth;
  };

  // Copy SVG Code
  const handleCopySVG = async () => {
    if (!svgRef.current) return;
    try {
      const svgString = new XMLSerializer().serializeToString(svgRef.current);
      await navigator.clipboard.writeText(svgString);
      setCopiedSVG(true);
      setTimeout(() => setCopiedSVG(false), 2000);
    } catch (err) {
      console.error(err);
    }
  };

  // Copy LaTeX code
  const handleCopyLatex = async () => {
    try {
      const latex = generateLatexTkzTab(analysis);
      await navigator.clipboard.writeText(latex);
      setCopiedLatex(true);
      setTimeout(() => setCopiedLatex(false), 2000);
    } catch (err) {
      console.error(err);
    }
  };

  // Download high-resolution PNG (2x for Word/PPT)
  const handleDownloadPNG = () => {
    if (!svgRef.current) return;
    setDownloading(true);

    const svgElement = svgRef.current;
    const svgString = new XMLSerializer().serializeToString(svgElement);
    const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const URLObject = window.URL || window.webkitURL || window;
    const blobURL = URLObject.createObjectURL(svgBlob);

    const img = new Image();
    img.onload = () => {
      const scale = 2.5; // High resolution
      const canvas = document.createElement('canvas');
      canvas.width = totalWidth * scale;
      canvas.height = totalHeight * scale;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.scale(scale, scale);
        // Draw background
        ctx.fillStyle = colors.bg;
        ctx.fillRect(0, 0, totalWidth, totalHeight);
        ctx.drawImage(img, 0, 0);

        const pngUrl = canvas.toDataURL('image/png');
        const downloadLink = document.createElement('a');
        downloadLink.download = `Bang_Bien_Thien_${analysis.fnType}_12.png`;
        downloadLink.href = pngUrl;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
      }
      URLObject.revokeObjectURL(blobURL);
      setDownloading(false);
    };
    img.src = blobURL;
  };

  // Y positions inside Row 3 (y)
  const yRowTop = row1Height + row2Height;
  const yTopPos = yRowTop + 24; // top values
  const yBottomPos = yRowTop + row3Height - 20; // bottom values
  const yMidPos = yRowTop + row3Height / 2;

  return (
    <div className="flex flex-col h-full bg-neutral-900 border border-neutral-800 rounded-none overflow-hidden select-none">
      {/* Action bar for teachers */}
      <div className="h-10 px-3 bg-neutral-950/80 border-b border-neutral-800 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 text-neutral-300 font-medium">
          <span className="w-2 h-2 bg-blue-500 rounded-none inline-block"></span>
          <span>BẢNG BIẾN THIÊN VECTOR CHUẨN SGK</span>
          <span className="text-neutral-500 font-mono text-[11px] hidden sm:inline">
            ({analysis.fnType.toUpperCase()})
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {onThemeToggle && (
            <button
              onClick={onThemeToggle}
              title={isLight ? 'Chuyển giao diện tối' : 'Chuyển giao diện sáng (Chuẩn in đề)'}
              className="px-2 py-1 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700/60 rounded-none text-neutral-300 flex items-center gap-1 transition-colors"
            >
              {isLight ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5" />}
              <span className="hidden md:inline">{isLight ? 'Bản Tối' : 'Bản In Sáng'}</span>
            </button>
          )}

          <button
            onClick={handleCopySVG}
            title="Sao chép toàn bộ mã SVG"
            className="px-2.5 py-1 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700/60 rounded-none text-neutral-200 flex items-center gap-1 transition-colors"
          >
            {copiedSVG ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedSVG ? 'Đã chép SVG' : 'Chép SVG'}</span>
          </button>

          <button
            onClick={handleCopyLatex}
            title="Sao chép mã TikZ LaTeX (tkz-tab)"
            className="px-2.5 py-1 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700/60 rounded-none text-neutral-200 flex items-center gap-1 transition-colors"
          >
            {copiedLatex ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Code className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{copiedLatex ? 'Đã chép LaTeX' : 'Mã LaTeX'}</span>
          </button>

          <button
            onClick={handleDownloadPNG}
            disabled={downloading}
            title="Tải ảnh PNG sắc nét (Word / PowerPoint)"
            className="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-none flex items-center gap-1 transition-colors font-medium"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{downloading ? 'Đang tạo...' : 'Tải PNG'}</span>
          </button>
        </div>
      </div>

      {/* SVG Canvas Area with scroll */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden p-4 flex items-center justify-center bg-neutral-950/40">
        <div className="p-2 border border-neutral-800 shadow-xl bg-neutral-950">
          <svg
            ref={svgRef}
            width={totalWidth}
            height={totalHeight}
            viewBox={`0 0 ${totalWidth} ${totalHeight}`}
            xmlns="http://www.w3.org/2000/svg"
            className="block font-mono"
            style={{
              fontFamily: "'JetBrains Mono', 'Inter', monospace",
              background: colors.bg,
            }}
          >
            <defs>
              {/* Marker Arrow for Upward (Blue/Cyan) */}
              <marker
                id="arrow-up"
                viewBox="0 0 10 10"
                refX="7"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto-start-reverse"
              >
                <path d="M 0 1 L 9 5 L 0 9 z" fill={colors.arrowUp} />
              </marker>

              {/* Marker Arrow for Downward (Red/Amber) */}
              <marker
                id="arrow-down"
                viewBox="0 0 10 10"
                refX="7"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto-start-reverse"
              >
                <path d="M 0 1 L 9 5 L 0 9 z" fill={colors.arrowDown} />
              </marker>
            </defs>

            {/* Background rectangle */}
            <rect width={totalWidth} height={totalHeight} fill={colors.bg} />

            {/* Outer crisp border */}
            <rect
              x="0.5"
              y="0.5"
              width={totalWidth - 1}
              height={totalHeight - 1}
              fill="none"
              stroke={colors.border}
              strokeWidth="1"
            />

            {/* Horizontal dividers */}
            {/* Row 1 / 2 divider */}
            <line
              x1="0"
              y1={row1Height}
              x2={totalWidth}
              y2={row1Height}
              stroke={colors.border}
              strokeWidth="1"
            />
            {/* Row 2 / 3 divider */}
            <line
              x1="0"
              y1={row1Height + row2Height}
              x2={totalWidth}
              y2={row1Height + row2Height}
              stroke={colors.border}
              strokeWidth="1"
            />

            {/* Vertical header divider */}
            <line
              x1={leftColWidth}
              y1="0"
              x2={leftColWidth}
              y2={totalHeight}
              stroke={colors.border}
              strokeWidth="1"
            />

            {/* Left Header Labels */}
            {/* x */}
            <text
              x={leftColWidth / 2}
              y={row1Height / 2 + 5}
              textAnchor="middle"
              fill={colors.textMain}
              fontSize="16"
              fontWeight="600"
              fontStyle="italic"
            >
              x
            </text>

            {/* y' */}
            <text
              x={leftColWidth / 2}
              y={row1Height + row2Height / 2 + 5}
              textAnchor="middle"
              fill={colors.textMain}
              fontSize="16"
              fontWeight="600"
              fontStyle="italic"
            >
              y'
            </text>

            {/* y */}
            <text
              x={leftColWidth / 2}
              y={row1Height + row2Height + row3Height / 2 + 6}
              textAnchor="middle"
              fill={colors.textMain}
              fontSize="16"
              fontWeight="600"
              fontStyle="italic"
            >
              y
            </text>

            {/* DÒNG 1: x values */}
            {pts.map((pt, i) => {
              const xPos = getX(i);
              return (
                <text
                  key={`x-${i}`}
                  x={xPos}
                  y={row1Height / 2 + 5}
                  textAnchor="middle"
                  fill={colors.textMain}
                  fontSize="14"
                  fontWeight="500"
                >
                  {pt.xLabel === '-\\infty' ? '-∞' : pt.xLabel === '+\\infty' ? '+∞' : pt.xLabel}
                </text>
              );
            })}

            {/* DÒNG 2: y' values, zeroes, signs, double bars */}
            {pts.map((pt, i) => {
              const xPos = getX(i);

              if (pt.isDiscontinuity) {
                // Vertical Double bar in y' and y!
                return (
                  <g key={`disc-${i}`}>
                    {/* Double line in y' row */}
                    <line
                      x1={xPos - 2.5}
                      y1={row1Height}
                      x2={xPos - 2.5}
                      y2={row1Height + row2Height}
                      stroke={colors.doubleBar}
                      strokeWidth="1.2"
                    />
                    <line
                      x1={xPos + 2.5}
                      y1={row1Height}
                      x2={xPos + 2.5}
                      y2={row1Height + row2Height}
                      stroke={colors.doubleBar}
                      strokeWidth="1.2"
                    />
                    {/* Double line continues down through y row */}
                    <line
                      x1={xPos - 2.5}
                      y1={row1Height + row2Height}
                      x2={xPos - 2.5}
                      y2={totalHeight}
                      stroke={colors.doubleBar}
                      strokeWidth="1.2"
                    />
                    <line
                      x1={xPos + 2.5}
                      y1={row1Height + row2Height}
                      x2={xPos + 2.5}
                      y2={totalHeight}
                      stroke={colors.doubleBar}
                      strokeWidth="1.2"
                    />
                  </g>
                );
              }

              if (pt.yPrimeVal === 0) {
                return (
                  <text
                    key={`zero-${i}`}
                    x={xPos}
                    y={row1Height + row2Height / 2 + 5}
                    textAnchor="middle"
                    fill={colors.textMain}
                    fontSize="14"
                    fontWeight="500"
                  >
                    0
                  </text>
                );
              }
              return null;
            })}

            {/* DÒNG 2: y' Signs (+ or -) between points */}
            {pts.slice(0, -1).map((pt, i) => {
              const xLeft = getX(i);
              const xRight = getX(i + 1);
              const midX = (xLeft + xRight) / 2;
              const sign = pt.yPrimeSignRight || '+';

              return (
                <text
                  key={`sign-${i}`}
                  x={midX}
                  y={row1Height + row2Height / 2 + 5}
                  textAnchor="middle"
                  fill={sign === '+' ? colors.arrowUp : colors.arrowDown}
                  fontSize="16"
                  fontWeight="600"
                >
                  {sign}
                </text>
              );
            })}

            {/* DÒNG 3: Mũi tên biến thiên & Nhãn giá trị y */}
            {/* Vẽ theo từng đoạn giữa 2 mốc liên tiếp */}
            {pts.slice(0, -1).map((ptCurrent, i) => {
              const ptNext = pts[i + 1];
              const x1 = getX(i);
              const x2 = getX(i + 1);
              const sign = ptCurrent.yPrimeSignRight;
              const isRising = sign === '+';

              // Tọa độ y của mút trái và mút phải
              let yStart: number;
              let yEnd: number;
              let labelStart = ptCurrent.yLabel;
              let labelEnd = ptNext.yLabel;

              // Xử lý điểm gián đoạn
              if (ptCurrent.isDiscontinuity) {
                labelStart = ptCurrent.yRightLabel || ptCurrent.yLabel;
              }
              if (ptNext.isDiscontinuity) {
                labelEnd = ptNext.yLeftLabel || ptNext.yLabel;
              }

              // Xác định độ cao mũi tên dựa trên tính tăng/giảm
              if (isRising) {
                // Đi lên: đáy -> đỉnh
                yStart = yBottomPos;
                yEnd = yTopPos;
              } else {
                // Đi xuống: đỉnh -> đáy
                yStart = yTopPos;
                yEnd = yBottomPos;
              }

              // Khoảng cách an toàn để không đè vào chữ
              const padX1 = ptCurrent.isDiscontinuity ? 14 : 20;
              const padX2 = ptNext.isDiscontinuity ? 14 : 20;
              const arrowX1 = x1 + padX1;
              const arrowX2 = x2 - padX2;
              const arrowY1 = isRising ? yStart - 4 : yStart + 4;
              const arrowY2 = isRising ? yEnd + 8 : yEnd - 8;

              return (
                <g key={`arrow-seg-${i}`}>
                  {/* Arrow path */}
                  <line
                    x1={arrowX1}
                    y1={arrowY1}
                    x2={arrowX2}
                    y2={arrowY2}
                    stroke={isRising ? colors.arrowUp : colors.arrowDown}
                    strokeWidth="1.6"
                    markerEnd={isRising ? 'url(#arrow-up)' : 'url(#arrow-down)'}
                  />

                  {/* Nhãn giá trị tại điểm mút trái nếu chưa render */}
                  {i === 0 && (
                    <text
                      x={x1}
                      y={isRising ? yBottomPos + 5 : yTopPos + 5}
                      textAnchor="middle"
                      fill={colors.textMain}
                      fontSize="13"
                      fontWeight="600"
                    >
                      {labelStart === '-\\infty' ? '-∞' : labelStart === '+\\infty' ? '+∞' : labelStart}
                    </text>
                  )}

                  {/* Nếu mút trái là điểm gián đoạn, vẽ nhãn bên phải vạch đôi */}
                  {ptCurrent.isDiscontinuity && (
                    <text
                      x={x1 + 16}
                      y={isRising ? yBottomPos + 5 : yTopPos + 5}
                      textAnchor="start"
                      fill={colors.textMain}
                      fontSize="13"
                      fontWeight="600"
                    >
                      {labelStart === '-\\infty' ? '-∞' : labelStart === '+\\infty' ? '+∞' : labelStart}
                    </text>
                  )}

                  {/* Nhãn giá trị tại điểm mút phải */}
                  {ptNext.isDiscontinuity ? (
                    /* Bên trái vạch đôi */
                    <text
                      x={x2 - 16}
                      y={isRising ? yTopPos + 5 : yBottomPos + 5}
                      textAnchor="end"
                      fill={colors.textMain}
                      fontSize="13"
                      fontWeight="600"
                    >
                      {labelEnd === '-\\infty' ? '-∞' : labelEnd === '+\\infty' ? '+∞' : labelEnd}
                    </text>
                  ) : (
                    /* Điểm thông thường hoặc vô cực phải */
                    <text
                      x={x2}
                      y={isRising ? yTopPos + 5 : yBottomPos + 5}
                      textAnchor="middle"
                      fill={colors.textMain}
                      fontSize="13"
                      fontWeight="600"
                    >
                      {labelEnd === '-\\infty' ? '-∞' : labelEnd === '+\\infty' ? '+∞' : labelEnd}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* Footer info note */}
      <div className="h-7 px-3 bg-neutral-950 border-t border-neutral-800/80 flex items-center justify-between text-[11px] text-neutral-400">
        <div>
          <span>Quy chuẩn SGK Toán 12 Mới (CT GDPT 2018)</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-0.5 bg-sky-400 inline-block"></span> Đồng biến (Mũi tên lên)
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-0.5 bg-rose-400 inline-block"></span> Nghịch biến (Mũi tên xuống)
          </span>
          <span className="flex items-center gap-1">
            <span className="text-red-500 font-bold">||</span> Điểm gián đoạn
          </span>
        </div>
      </div>
    </div>
  );
};
