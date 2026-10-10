import React, { useState, useMemo } from 'react';
import { TabId, FunctionType, CubicParams, Rational11Params, Rational21Params } from './types';
import { analyzeCubic, analyzeRational11, analyzeRational21 } from './math/analysis';
import { Header } from './components/Header';
import { AnalysisLeftPanel } from './components/analysis/AnalysisLeftPanel';
import { AnalysisRightPanel } from './components/analysis/AnalysisRightPanel';
import { GroupedStatsTab } from './components/tabs/GroupedStatsTab';
import { ProbabilityTreeTab } from './components/tabs/ProbabilityTreeTab';
import { OxyzTab } from './components/tabs/OxyzTab';

export default function App() {
  // Active Tab
  const [activeTab, setActiveTab] = useState<TabId>('analysis');

  // Zoom Screen-share / Fullscreen mode
  const [isZoomMode, setIsZoomMode] = useState<boolean>(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);

  // Math Function State (Module 1)
  const [fnType, setFnType] = useState<FunctionType>('cubic');

  // Cubic params: y = ax^3 + bx^2 + cx + d
  const [cubicParams, setCubicParams] = useState<CubicParams>({
    a: 1,
    b: -3,
    c: 0,
    d: 2,
  });

  // Rational 1/1 params: y = (ax + b) / (cx + d)
  const [r11Params, setR11Params] = useState<Rational11Params>({
    a: 2,
    b: -1,
    c: 1,
    d: 1,
  });

  // Rational 2/1 params: y = (ax^2 + bx + c) / (px + q)
  const [r21Params, setR21Params] = useState<Rational21Params>({
    a: 1,
    b: -1,
    c: 1,
    p: 1,
    q: -1,
  });

  // Analytical Solver Engine
  const analysis = useMemo(() => {
    try {
      if (fnType === 'cubic') {
        return analyzeCubic(cubicParams);
      } else if (fnType === 'rational11') {
        return analyzeRational11(r11Params);
      } else {
        return analyzeRational21(r21Params);
      }
    } catch (e: any) {
      // Fallback safe analysis
      return analyzeCubic({ a: 1, b: 0, c: 0, d: 0 });
    }
  }, [fnType, cubicParams, r11Params, r21Params]);

  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col bg-neutral-950 text-neutral-100 font-sans selection:bg-blue-600 selection:text-white">
      {/* 1. Top Navbar (h-12 border-b border-neutral-800) */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isZoomMode={isZoomMode}
        setIsZoomMode={setIsZoomMode}
      />

      {/* 2. Main Workspace Split-pane */}
      <main className="flex-1 overflow-hidden flex">
        {/* TAB 1: BẢNG BIẾN THIÊN & ĐỒ THỊ */}
        {activeTab === 'analysis' && (
          <div className="flex-1 h-full flex flex-col md:flex-row overflow-hidden">
            {/* Cột trái: Panel tham số nhập liệu & Khảo sát chi tiết */}
            {isSidebarOpen && (
              <div className="w-full md:w-[380px] lg:w-[420px] shrink-0 h-full overflow-hidden">
                <AnalysisLeftPanel
                  fnType={fnType}
                  setFnType={setFnType}
                  cubicParams={cubicParams}
                  setCubicParams={setCubicParams}
                  r11Params={r11Params}
                  setR11Params={setR11Params}
                  r21Params={r21Params}
                  setR21Params={setR21Params}
                  analysis={analysis}
                />
              </div>
            )}

            {/* Cột phải: Vùng bảng vẽ / Canvas trực quan (BBT Vector & Đồ thị 2D) */}
            <div className="flex-1 h-full overflow-hidden relative">
              {/* Toggle Sidebar Button for Zoom Presentation */}
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                title={isSidebarOpen ? 'Thu gọn thanh tham số' : 'Mở thanh tham số'}
                className="absolute top-1 left-1 z-20 px-2 py-0.5 bg-neutral-900/90 hover:bg-neutral-800 border border-neutral-700/80 text-[11px] font-mono text-neutral-300 rounded-none shadow-sm transition-colors"
              >
                {isSidebarOpen ? '◀ Thu gọn' : '▶ Tham số'}
              </button>

              <AnalysisRightPanel analysis={analysis} />
            </div>
          </div>
        )}

        {/* TAB 2: THỐNG KÊ GHÉP NHÓM (CHUẨN SGK 12) */}
        {activeTab === 'stats' && <GroupedStatsTab />}

        {/* TAB 3: XÁC SUẤT SƠ ĐỒ CÂY */}
        {activeTab === 'probability' && <ProbabilityTreeTab />}

        {/* TAB 4: KHÔNG GIAN OXYZ 3D */}
        {activeTab === 'oxyz' && <OxyzTab />}
      </main>
    </div>
  );
}
