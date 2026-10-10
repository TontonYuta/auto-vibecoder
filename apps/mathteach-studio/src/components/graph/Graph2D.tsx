import React, { useRef, useState, useMemo, useEffect } from 'react';
import { FunctionAnalysisResult } from '../../types';
import { ZoomIn, ZoomOut, RotateCcw, Crosshair, Camera, Eye, EyeOff } from 'lucide-react';
import { formatNum } from '../../math/analysis';

interface Graph2DProps {
  analysis: FunctionAnalysisResult;
}

export const Graph2D: React.FC<Graph2DProps> = ({ analysis }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [dimensions, setDimensions] = useState({ width: 700, height: 500 });

  // Graph viewing window
  const [scale, setScale] = useState<number>(36); // pixels per unit
  const [originOffset, setOriginOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Inspector probe
  const [probeX, setProbeX] = useState<number>(1);
  const [showTangent, setShowTangent] = useState(true);
  const [showGrid, setShowGrid] = useState(true);
  const [showSpecialPoints, setShowSpecialPoints] = useState(true);

  // Resize observer
  useEffect(() => {
    if (!containerRef.current) return;
    const updateSize = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth || 700,
          height: containerRef.current.clientHeight || 500,
        });
      }
    };
    updateSize();
    const observer = new ResizeObserver(updateSize);
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const originX = dimensions.width / 2 + originOffset.x;
  const originY = dimensions.height / 2 + originOffset.y;

  // Coordinate transforms
  const toScreenX = (mathX: number) => originX + mathX * scale;
  const toScreenY = (mathY: number) => originY - mathY * scale;
  const toMathX = (screenX: number) => (screenX - originX) / scale;
  const toMathY = (screenY: number) => (originY - screenY) / scale;

  // View bounds in math coordinates
  const mathXMin = toMathX(0);
  const mathXMax = toMathX(dimensions.width);
  const mathYMin = toMathY(dimensions.height);
  const mathYMax = toMathY(0);

  // Mouse drag handlers for panning
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - originOffset.x, y: e.clientY - originOffset.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setOriginOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  // Reset View
  const handleReset = () => {
    setScale(36);
    setOriginOffset({ x: 0, y: 0 });
    setProbeX(1);
  };

  // Generate curve path(s)
  const curvePaths = useMemo(() => {
    const paths: string[] = [];
    const stepPx = 1.5;
    const totalSteps = Math.ceil(dimensions.width / stepPx);
    const vertAsymptote = analysis.asymptotes.vertical;

    let currentPath = '';
    let isDrawing = false;

    for (let i = 0; i <= totalSteps; i++) {
      const scrX = i * stepPx;
      const mX = toMathX(scrX);

      // Check proximity to vertical asymptote
      if (vertAsymptote !== undefined && Math.abs(mX - vertAsymptote) < 0.08) {
        if (isDrawing && currentPath) {
          paths.push(currentPath);
          currentPath = '';
          isDrawing = false;
        }
        continue;
      }

      const mY = analysis.evaluate(mX);
      if (mY === null || isNaN(mY) || !isFinite(mY)) {
        if (isDrawing && currentPath) {
          paths.push(currentPath);
          currentPath = '';
          isDrawing = false;
        }
        continue;
      }

      const scrY = toScreenY(mY);

      // Clip bounds check with margin
      if (scrY < -200 || scrY > dimensions.height + 200) {
        if (isDrawing && currentPath) {
          paths.push(currentPath);
          currentPath = '';
          isDrawing = false;
        }
        continue;
      }

      if (!isDrawing) {
        currentPath = `M ${scrX.toFixed(1)} ${scrY.toFixed(1)}`;
        isDrawing = true;
      } else {
        currentPath += ` L ${scrX.toFixed(1)} ${scrY.toFixed(1)}`;
      }
    }

    if (currentPath) paths.push(currentPath);
    return paths;
  }, [analysis, dimensions.width, dimensions.height, scale, originOffset]);

  // Tangent line calculations at probeX
  const probeY = analysis.evaluate(probeX);
  const probeSlope = analysis.evaluateDerivative(probeX);

  const tangentPoints = useMemo(() => {
    if (probeY === null || probeSlope === null || isNaN(probeSlope)) return null;
    const deltaX = 4;
    const x1 = probeX - deltaX;
    const y1 = probeY - probeSlope * deltaX;
    const x2 = probeX + deltaX;
    const y2 = probeY + probeSlope * deltaX;
    return {
      sx1: toScreenX(x1),
      sy1: toScreenY(y1),
      sx2: toScreenX(x2),
      sy2: toScreenY(y2),
      tangentEq: `y = ${formatNum(probeSlope)}x ${probeY - probeSlope * probeX >= 0 ? '+' : '-'} ${formatNum(Math.abs(probeY - probeSlope * probeX))}`,
    };
  }, [probeX, probeY, probeSlope, scale, originOffset]);

  // Slant asymptote line
  const slantLine = useMemo(() => {
    if (!analysis.asymptotes.slant) return null;
    const { m, n } = analysis.asymptotes.slant;
    const x1 = mathXMin;
    const y1 = m * x1 + n;
    const x2 = mathXMax;
    const y2 = m * x2 + n;
    return {
      sx1: toScreenX(x1),
      sy1: toScreenY(y1),
      sx2: toScreenX(x2),
      sy2: toScreenY(y2),
      label: `TCX: y = ${formatNum(m)}x ${n >= 0 ? '+' : '-'} ${formatNum(Math.abs(n))}`,
    };
  }, [analysis.asymptotes.slant, mathXMin, mathXMax, scale, originOffset]);

  // Download graph PNG
  const handleDownloadGraph = () => {
    const svgElem = containerRef.current?.querySelector('svg');
    if (!svgElem) return;

    const svgString = new XMLSerializer().serializeToString(svgElem);
    const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const URLObject = window.URL || window.webkitURL || window;
    const blobURL = URLObject.createObjectURL(svgBlob);

    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = dimensions.width * 2;
      canvas.height = dimensions.height * 2;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.scale(2, 2);
        ctx.fillStyle = '#09090b';
        ctx.fillRect(0, 0, dimensions.width, dimensions.height);
        ctx.drawImage(img, 0, 0);

        const a = document.createElement('a');
        a.download = `Do_Thi_Ham_So_${analysis.fnType}.png`;
        a.href = canvas.toDataURL('image/png');
        a.click();
      }
      URLObject.revokeObjectURL(blobURL);
    };
    img.src = blobURL;
  };

  // Generate grid lines
  const gridTicksX = useMemo(() => {
    const ticks: number[] = [];
    const min = Math.floor(mathXMin);
    const max = Math.ceil(mathXMax);
    for (let v = min; v <= max; v++) {
      ticks.push(v);
    }
    return ticks;
  }, [mathXMin, mathXMax]);

  const gridTicksY = useMemo(() => {
    const ticks: number[] = [];
    const min = Math.floor(mathYMin);
    const max = Math.ceil(mathYMax);
    for (let v = min; v <= max; v++) {
      ticks.push(v);
    }
    return ticks;
  }, [mathYMin, mathYMax]);

  return (
    <div className="flex flex-col h-full bg-neutral-900 border border-neutral-800 rounded-none overflow-hidden relative select-none">
      {/* Top Toolbar */}
      <div className="h-10 px-3 bg-neutral-950/90 border-b border-neutral-800 flex items-center justify-between text-xs z-10">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-neutral-300 font-medium">
            <span className="w-2 h-2 bg-emerald-500 rounded-none inline-block"></span>
            <span>ĐỒ THỊ HÀM SỐ 2D TRỰC QUAN</span>
          </div>

          <div className="hidden lg:flex items-center gap-1 text-[11px] text-neutral-400 font-mono bg-neutral-900 px-2 py-0.5 border border-neutral-800">
            <span>{analysis.plainEquation}</span>
          </div>
        </div>

        {/* Graph controls */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setShowGrid(!showGrid)}
            title="Bật/Tắt lưới toạ độ"
            className={`px-2 py-1 border rounded-none text-xs flex items-center gap-1 transition-colors ${
              showGrid
                ? 'bg-neutral-800 border-neutral-700 text-neutral-200'
                : 'bg-neutral-950 border-neutral-800 text-neutral-500'
            }`}
          >
            {showGrid ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">Lưới</span>
          </button>

          <button
            onClick={() => setShowTangent(!showTangent)}
            title="Bật/Tắt tiếp tuyến động"
            className={`px-2 py-1 border rounded-none text-xs flex items-center gap-1 transition-colors ${
              showTangent
                ? 'bg-neutral-800 border-neutral-700 text-neutral-200'
                : 'bg-neutral-950 border-neutral-800 text-neutral-500'
            }`}
          >
            <Crosshair className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Tiếp Tuyến</span>
          </button>

          <div className="flex items-center border border-neutral-800 bg-neutral-950">
            <button
              onClick={() => setScale((s) => Math.max(16, s - 6))}
              title="Thu nhỏ"
              className="p-1.5 hover:bg-neutral-800 text-neutral-300 transition-colors"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[11px] font-mono px-2 text-neutral-400 border-x border-neutral-800">
              {Math.round((scale / 36) * 100)}%
            </span>
            <button
              onClick={() => setScale((s) => Math.min(100, s + 6))}
              title="Phóng to"
              className="p-1.5 hover:bg-neutral-800 text-neutral-300 transition-colors"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            onClick={handleReset}
            title="Đặt lại khung nhìn gốc"
            className="p-1.5 bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 rounded-none text-neutral-300 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={handleDownloadGraph}
            title="Tải ảnh đồ thị PNG"
            className="px-2.5 py-1 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 rounded-none text-neutral-200 flex items-center gap-1 transition-colors"
          >
            <Camera className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Tải Ảnh</span>
          </button>
        </div>
      </div>

      {/* Main Graph SVG Area */}
      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className="flex-1 bg-neutral-950 relative overflow-hidden cursor-crosshair"
      >
        <svg
          width={dimensions.width}
          height={dimensions.height}
          viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
          className="w-full h-full block font-mono"
        >
          <defs>
            <marker
              id="axis-arrow"
              viewBox="0 0 10 10"
              refX="6"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#a1a1aa" />
            </marker>
          </defs>

          {/* Grid lines */}
          {showGrid && (
            <g stroke="#18181b" strokeWidth="1">
              {gridTicksX.map((tick) => {
                const sx = toScreenX(tick);
                return <line key={`gx-${tick}`} x1={sx} y1={0} x2={sx} y2={dimensions.height} />;
              })}
              {gridTicksY.map((tick) => {
                const sy = toScreenY(tick);
                return <line key={`gy-${tick}`} x1={0} y1={sy} x2={dimensions.width} y2={sy} />;
              })}
            </g>
          )}

          {/* Axes: Ox, Oy */}
          {/* Ox */}
          <line
            x1={0}
            y1={originY}
            x2={dimensions.width}
            y2={originY}
            stroke="#52525b"
            strokeWidth="1.5"
            markerEnd="url(#axis-arrow)"
          />
          <text
            x={dimensions.width - 15}
            y={originY - 8}
            fill="#d4d4d8"
            fontSize="12"
            fontWeight="600"
          >
            x
          </text>

          {/* Oy */}
          <line
            x1={originX}
            y1={dimensions.height}
            x2={originX}
            y2={0}
            stroke="#52525b"
            strokeWidth="1.5"
            markerEnd="url(#axis-arrow)"
          />
          <text
            x={originX + 10}
            y={15}
            fill="#d4d4d8"
            fontSize="12"
            fontWeight="600"
          >
            y
          </text>

          {/* Origin label O */}
          <text
            x={originX - 14}
            y={originY + 16}
            fill="#a1a1aa"
            fontSize="11"
            fontWeight="500"
          >
            O
          </text>

          {/* Ticks & Numbers */}
          {gridTicksX
            .filter((t) => t !== 0 && t % 1 === 0)
            .map((tick) => {
              const sx = toScreenX(tick);
              if (sx < 20 || sx > dimensions.width - 20) return null;
              return (
                <g key={`tx-${tick}`}>
                  <line x1={sx} y1={originY - 3} x2={sx} y2={originY + 3} stroke="#71717a" strokeWidth="1" />
                  <text
                    x={sx}
                    y={originY + 14}
                    textAnchor="middle"
                    fill="#71717a"
                    fontSize="10"
                  >
                    {tick}
                  </text>
                </g>
              );
            })}

          {gridTicksY
            .filter((t) => t !== 0 && t % 1 === 0)
            .map((tick) => {
              const sy = toScreenY(tick);
              if (sy < 20 || sy > dimensions.height - 20) return null;
              return (
                <g key={`ty-${tick}`}>
                  <line x1={originX - 3} y1={sy} x2={originX + 3} y2={sy} stroke="#71717a" strokeWidth="1" />
                  <text
                    x={originX - 8}
                    y={sy + 3}
                    textAnchor="end"
                    fill="#71717a"
                    fontSize="10"
                  >
                    {tick}
                  </text>
                </g>
              );
            })}

          {/* TIỆM CẬN ĐỨNG (Vertical Asymptote): x = x0 */}
          {analysis.asymptotes.vertical !== undefined && (
            <g>
              <line
                x1={toScreenX(analysis.asymptotes.vertical)}
                y1={0}
                x2={toScreenX(analysis.asymptotes.vertical)}
                y2={dimensions.height}
                stroke="#f59e0b"
                strokeWidth="1.5"
                strokeDasharray="5 4"
              />
              <text
                x={toScreenX(analysis.asymptotes.vertical) + 6}
                y={30}
                fill="#fbbf24"
                fontSize="11"
                fontWeight="500"
              >
                TCĐ: x = {formatNum(analysis.asymptotes.vertical)}
              </text>
            </g>
          )}

          {/* TIỆM CẬN NGANG (Horizontal Asymptote): y = y0 */}
          {analysis.asymptotes.horizontal !== undefined && (
            <g>
              <line
                x1={0}
                y1={toScreenY(analysis.asymptotes.horizontal)}
                x2={dimensions.width}
                y2={toScreenY(analysis.asymptotes.horizontal)}
                stroke="#10b981"
                strokeWidth="1.5"
                strokeDasharray="5 4"
              />
              <text
                x={dimensions.width - 120}
                y={toScreenY(analysis.asymptotes.horizontal) - 6}
                fill="#34d399"
                fontSize="11"
                fontWeight="500"
              >
                TCN: y = {formatNum(analysis.asymptotes.horizontal)}
              </text>
            </g>
          )}

          {/* TIỆM CẬN XIÊN (Slant Asymptote): y = mx + n */}
          {slantLine && (
            <g>
              <line
                x1={slantLine.sx1}
                y1={slantLine.sy1}
                x2={slantLine.sx2}
                y2={slantLine.sy2}
                stroke="#10b981"
                strokeWidth="1.5"
                strokeDasharray="6 4"
              />
              <text
                x={Math.min(dimensions.width - 150, Math.max(30, toScreenX(1)))}
                y={Math.min(dimensions.height - 20, Math.max(40, toScreenY(analysis.asymptotes.slant!.m * 1 + analysis.asymptotes.slant!.n) - 10))}
                fill="#34d399"
                fontSize="11"
                fontWeight="500"
              >
                {slantLine.label}
              </text>
            </g>
          )}

          {/* Đường cong đồ thị (Function curve) */}
          {curvePaths.map((dStr, idx) => (
            <path
              key={`curve-${idx}`}
              d={dStr}
              fill="none"
              stroke="#3b82f6"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ))}

          {/* Các điểm cực trị (Critical Points) */}
          {showSpecialPoints &&
            analysis.criticalPoints.map((cp, idx) => {
              const sx = toScreenX(cp.x);
              const sy = toScreenY(cp.y);
              const isMax = cp.type === 'max';
              return (
                <g key={`cp-${idx}`}>
                  {/* Point dot */}
                  <circle
                    cx={sx}
                    cy={sy}
                    r="4.5"
                    fill={isMax ? '#38bdf8' : '#f87171'}
                    stroke="#09090b"
                    strokeWidth="1.5"
                  />
                  {/* Coordinate projection dashed lines to axes */}
                  <line x1={sx} y1={sy} x2={sx} y2={originY} stroke="#3f3f46" strokeWidth="0.8" strokeDasharray="3 3" />
                  <line x1={sx} y1={sy} x2={originX} y2={sy} stroke="#3f3f46" strokeWidth="0.8" strokeDasharray="3 3" />
                  {/* Label */}
                  <text
                    x={sx + 8}
                    y={isMax ? sy - 8 : sy + 16}
                    fill={isMax ? '#7dd3fc' : '#fca5a5'}
                    fontSize="11"
                    fontWeight="600"
                  >
                    {cp.label} ({formatNum(cp.x)}, {formatNum(cp.y)})
                  </text>
                </g>
              );
            })}

          {/* Tâm đối xứng / Điểm uốn */}
          {showSpecialPoints && analysis.symmetryCenter && (
            <g>
              <circle
                cx={toScreenX(analysis.symmetryCenter.x)}
                cy={toScreenY(analysis.symmetryCenter.y)}
                r="4"
                fill="#a855f7"
                stroke="#09090b"
                strokeWidth="1.5"
              />
              <text
                x={toScreenX(analysis.symmetryCenter.x) + 8}
                y={toScreenY(analysis.symmetryCenter.y) - 6}
                fill="#c084fc"
                fontSize="11"
                fontWeight="500"
              >
                I({formatNum(analysis.symmetryCenter.x)}, {formatNum(analysis.symmetryCenter.y)})
              </text>
            </g>
          )}

          {/* TIẾP TUYẾN ĐỘNG (Interactive Tangent Line) */}
          {showTangent && tangentPoints && (
            <g>
              <line
                x1={tangentPoints.sx1}
                y1={tangentPoints.sy1}
                x2={tangentPoints.sx2}
                y2={tangentPoints.sy2}
                stroke="#eab308"
                strokeWidth="1.2"
                strokeDasharray="4 2"
              />
              {/* Probe Point M */}
              <circle
                cx={toScreenX(probeX)}
                cy={toScreenY(probeY!)}
                r="5"
                fill="#eab308"
                stroke="#09090b"
                strokeWidth="2"
              />
              <text
                x={toScreenX(probeX) + 8}
                y={toScreenY(probeY!) - 10}
                fill="#fde047"
                fontSize="11"
                fontWeight="600"
              >
                M({formatNum(probeX)}, {formatNum(probeY!)})
              </text>
            </g>
          )}
        </svg>

        {/* Floating Probe info overlay */}
        {showTangent && probeY !== null && probeSlope !== null && (
          <div className="absolute top-3 left-3 bg-neutral-900/90 backdrop-blur-sm border border-neutral-800 p-2 text-xs font-mono text-neutral-200 pointer-events-none shadow-lg">
            <div className="flex items-center gap-2 text-amber-400 font-semibold mb-1">
              <span>ĐIỂM TIẾP XÚC M:</span>
              <span>({formatNum(probeX)}, {formatNum(probeY)})</span>
            </div>
            <div className="text-[11px] text-neutral-300">
              Hệ số góc: <span className="text-emerald-400 font-bold">k = y'({formatNum(probeX)}) = {formatNum(probeSlope)}</span>
            </div>
            <div className="text-[11px] text-neutral-400 mt-0.5">
              PT tiếp tuyến: <span className="text-neutral-100">{tangentPoints?.tangentEq}</span>
            </div>
          </div>
        )}

        {/* Legend */}
        <div className="absolute bottom-2 right-2 bg-neutral-900/90 border border-neutral-800 p-2 text-[10px] text-neutral-300 flex flex-col gap-1 pointer-events-none">
          <div className="flex items-center gap-2">
            <span className="w-3 h-0.5 bg-blue-500 inline-block"></span>
            <span>Đồ thị hàm số y = f(x)</span>
          </div>
          {analysis.asymptotes.vertical !== undefined && (
            <div className="flex items-center gap-2">
              <span className="w-3 h-0.5 bg-amber-500 border-b border-dashed inline-block"></span>
              <span>Tiệm cận đứng (TCĐ)</span>
            </div>
          )}
          {(analysis.asymptotes.horizontal !== undefined || analysis.asymptotes.slant !== undefined) && (
            <div className="flex items-center gap-2">
              <span className="w-3 h-0.5 bg-emerald-500 border-b border-dashed inline-block"></span>
              <span>{analysis.asymptotes.slant ? 'Tiệm cận xiên (TCX)' : 'Tiệm cận ngang (TCN)'}</span>
            </div>
          )}
          {showTangent && (
            <div className="flex items-center gap-2">
              <span className="w-3 h-0.5 bg-yellow-400 border-b border-dashed inline-block"></span>
              <span>Tiếp tuyến tại điểm M</span>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Slider for probe point */}
      <div className="h-9 px-4 bg-neutral-950 border-t border-neutral-800 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 text-neutral-400">
          <span className="text-[11px] font-mono">Dò điểm tiếp tuyến M(x):</span>
          <input
            type="range"
            min={-5}
            max={5}
            step={0.1}
            value={probeX}
            onChange={(e) => setProbeX(parseFloat(e.target.value))}
            className="w-36 h-1 bg-neutral-800 rounded-none appearance-none cursor-pointer accent-blue-500"
          />
          <span className="text-neutral-200 font-mono w-10 text-right">{probeX.toFixed(1)}</span>
        </div>

        <div className="text-[11px] text-neutral-500 hidden sm:inline">
          Kéo thả chuột trên đồ thị để di chuyển khung nhìn (Pan)
        </div>
      </div>
    </div>
  );
};
