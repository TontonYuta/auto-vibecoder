import React, { useState } from 'react';
import { Box, Compass, RotateCcw, Copy, Check } from 'lucide-react';
import { formatNum } from '../../math/analysis';

export const OxyzTab: React.FC = () => {
  // Vector & Point inputs
  const [pointM, setPointM] = useState({ x: 1, y: 2, z: 3 });
  const [vecU, setVecU] = useState({ x: 2, y: -1, z: 2 });
  const [vecV, setVecV] = useState({ x: 0, y: 3, z: 1 });
  // Plane (alpha): Ax + By + Cz + D = 0
  const [plane, setPlane] = useState({ a: 2, b: -2, c: 1, d: -6 });

  const [copied, setCopied] = useState(false);

  // Calculations
  // Cross product [u, v]
  const crossProduct = {
    x: vecU.y * vecV.z - vecU.z * vecV.y,
    y: vecU.z * vecV.x - vecU.x * vecV.z,
    z: vecU.x * vecV.y - vecU.y * vecV.x,
  };

  // Dot product u . v
  const dotProduct = vecU.x * vecV.x + vecU.y * vecV.y + vecU.z * vecV.z;
  const magU = Math.sqrt(vecU.x ** 2 + vecU.y ** 2 + vecU.z ** 2);
  const magV = Math.sqrt(vecV.x ** 2 + vecV.y ** 2 + vecV.z ** 2);
  const cosAngle = magU * magV > 0 ? dotProduct / (magU * magV) : 0;
  const angleDeg = (Math.acos(Math.max(-1, Math.min(1, cosAngle))) * 180) / Math.PI;

  // Distance from M to plane
  const distPlaneNumerator = Math.abs(
    plane.a * pointM.x + plane.b * pointM.y + plane.c * pointM.z + plane.d
  );
  const distPlaneDenominator = Math.sqrt(plane.a ** 2 + plane.b ** 2 + plane.c ** 2);
  const distMToPlane =
    distPlaneDenominator > 0 ? distPlaneNumerator / distPlaneDenominator : 0;

  return (
    <div className="flex-1 h-full grid grid-cols-12 overflow-hidden bg-neutral-950 select-none">
      {/* CỘT TRÁI: Nhập tọa độ */}
      <div className="col-span-12 lg:col-span-5 h-full border-r border-neutral-800 bg-neutral-900 flex flex-col overflow-y-auto">
        <div className="p-3 bg-neutral-950 border-b border-neutral-800">
          <div className="text-xs font-mono text-neutral-300 font-semibold flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5 text-blue-400" />
            <span>HỆ TỌA ĐỘ KHÔNG GIAN OXYZ (TOÁN 12)</span>
          </div>
        </div>

        <div className="p-4 space-y-4 flex-1 overflow-y-auto">
          {/* Điểm M */}
          <div className="p-3 bg-neutral-950 border border-neutral-800 space-y-2">
            <div className="text-xs font-mono text-blue-400 font-semibold">1. ĐIỂM M(x, y, z):</div>
            <div className="grid grid-cols-3 gap-2">
              {(['x', 'y', 'z'] as const).map((axis) => (
                <div key={axis} className="flex flex-col">
                  <label className="text-[11px] font-mono text-neutral-400">{axis}:</label>
                  <input
                    type="number"
                    value={pointM[axis]}
                    onChange={(e) =>
                      setPointM({ ...pointM, [axis]: parseFloat(e.target.value) || 0 })
                    }
                    className="bg-neutral-900 border border-neutral-800 text-center py-1 text-xs font-mono text-white rounded-none focus:outline-none focus:border-blue-500"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Véc-tơ u và v */}
          <div className="p-3 bg-neutral-950 border border-neutral-800 space-y-3">
            <div className="text-xs font-mono text-emerald-400 font-semibold">2. VÉC-TƠ u⃗ VÀ v⃗:</div>
            <div>
              <div className="text-[11px] font-mono text-neutral-400 mb-1">Véc-tơ u⃗:</div>
              <div className="grid grid-cols-3 gap-2">
                {(['x', 'y', 'z'] as const).map((axis) => (
                  <input
                    key={axis}
                    type="number"
                    value={vecU[axis]}
                    onChange={(e) =>
                      setVecU({ ...vecU, [axis]: parseFloat(e.target.value) || 0 })
                    }
                    className="bg-neutral-900 border border-neutral-800 text-center py-1 text-xs font-mono text-white rounded-none focus:outline-none focus:border-blue-500"
                  />
                ))}
              </div>
            </div>

            <div>
              <div className="text-[11px] font-mono text-neutral-400 mb-1">Véc-tơ v⃗:</div>
              <div className="grid grid-cols-3 gap-2">
                {(['x', 'y', 'z'] as const).map((axis) => (
                  <input
                    key={axis}
                    type="number"
                    value={vecV[axis]}
                    onChange={(e) =>
                      setVecV({ ...vecV, [axis]: parseFloat(e.target.value) || 0 })
                    }
                    className="bg-neutral-900 border border-neutral-800 text-center py-1 text-xs font-mono text-white rounded-none focus:outline-none focus:border-blue-500"
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Mặt phẳng (alpha) */}
          <div className="p-3 bg-neutral-950 border border-neutral-800 space-y-2">
            <div className="text-xs font-mono text-amber-400 font-semibold">
              3. MẶT PHẲNG (α): Ax + By + Cz + D = 0
            </div>
            <div className="grid grid-cols-4 gap-1.5">
              {(['a', 'b', 'c', 'd'] as const).map((param) => (
                <div key={param} className="flex flex-col">
                  <label className="text-[11px] font-mono text-neutral-400 text-center">{param.toUpperCase()}:</label>
                  <input
                    type="number"
                    value={plane[param]}
                    onChange={(e) =>
                      setPlane({ ...plane, [param]: parseFloat(e.target.value) || 0 })
                    }
                    className="bg-neutral-900 border border-neutral-800 text-center py-1 text-xs font-mono text-white rounded-none focus:outline-none focus:border-blue-500"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* CỘT PHẢI: Kết quả tính toán & Hình học */}
      <div className="col-span-12 lg:col-span-7 h-full flex flex-col bg-neutral-950 overflow-y-auto">
        <div className="h-10 px-4 bg-neutral-950 border-b border-neutral-800 flex items-center justify-between">
          <div className="text-xs font-mono text-neutral-300 font-semibold flex items-center gap-1.5">
            <Box className="w-3.5 h-3.5 text-blue-400" />
            <span>KẾT QUẢ ĐẠI SỐ HÌNH HỌC OXYZ</span>
          </div>

          <button
            onClick={async () => {
              const text = `TÍNH TOÁN OXYZ (TOÁN 12):
- Điểm M(${pointM.x}, ${pointM.y}, ${pointM.z})
- u⃗ = (${vecU.x}, ${vecU.y}, ${vecU.z}), |u⃗| = ${magU.toFixed(3)}
- v⃗ = (${vecV.x}, ${vecV.y}, ${vecV.z}), |v⃗| = ${magV.toFixed(3)}
- Tích vô hướng u⃗ · v⃗ = ${dotProduct}
- Góc giữa hai véc-tơ: ${angleDeg.toFixed(1)}°
- Tích có hướng [u⃗, v⃗] = (${crossProduct.x}, ${crossProduct.y}, ${crossProduct.z})
- Khoảng cách d(M, (α)) = ${distMToPlane.toFixed(3)}`;
              await navigator.clipboard.writeText(text);
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            }}
            className="px-2.5 py-1 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-200 text-xs font-mono rounded-none flex items-center gap-1 transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Đã sao chép' : 'Sao chép'}</span>
          </button>
        </div>

        <div className="p-4 space-y-4 flex-1 overflow-y-auto">
          {/* Card 1: Vector Operations */}
          <div className="p-3 bg-neutral-900 border border-neutral-800 space-y-2">
            <div className="text-xs font-mono text-emerald-400 font-semibold">
              TÍCH CÓ HƯỚNG & TÍCH VÔ HƯỚNG (TOÁN 12):
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs font-mono">
              <div className="p-2 bg-neutral-950 border border-neutral-800">
                <div className="text-neutral-400">Tích có hướng [u⃗, v⃗]:</div>
                <div className="text-blue-400 font-bold text-sm mt-1">
                  ({crossProduct.x}, {crossProduct.y}, {crossProduct.z})
                </div>
              </div>

              <div className="p-2 bg-neutral-950 border border-neutral-800">
                <div className="text-neutral-400">Tích vô hướng u⃗ · v⃗:</div>
                <div className="text-emerald-400 font-bold text-sm mt-1">
                  {dotProduct} (Góc: {angleDeg.toFixed(1)}°)
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Distance */}
          <div className="p-3 bg-neutral-900 border border-neutral-800 space-y-2">
            <div className="text-xs font-mono text-amber-400 font-semibold">
              KHOẢNG CÁCH TỪ ĐIỂM ĐẾN MẶT PHẲNG:
            </div>
            <div className="p-2.5 bg-neutral-950 border border-neutral-800 text-xs font-mono space-y-1">
              <div className="text-neutral-400">
                d(M, α) = |Ax_M + By_M + Cz_M + D| / √(A² + B² + C²)
              </div>
              <div className="text-lg font-bold text-amber-400 pt-1">
                d(M, α) = {formatNum(distMToPlane)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
