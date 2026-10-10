import React, { useState } from 'react';
import { FunctionAnalysisResult } from '../../types';
import { BBTSvg } from '../bbt/BBTSvg';
import { Graph2D } from '../graph/Graph2D';
import { Columns2, Image, TrendingUp, Sun, Moon } from 'lucide-react';

interface AnalysisRightPanelProps {
  analysis: FunctionAnalysisResult;
}

export const AnalysisRightPanel: React.FC<AnalysisRightPanelProps> = ({ analysis }) => {
  // Visualizer mode: 'split' (Cả hai song song) | 'bbt' (Chỉ BBT) | 'graph' (Chỉ Đồ thị)
  const [visualMode, setVisualMode] = useState<'split' | 'bbt' | 'graph'>('split');
  const [bbtTheme, setBbtTheme] = useState<'dark' | 'light'>('dark');

  return (
    <div className="flex-1 h-full flex flex-col bg-neutral-950 overflow-hidden select-none">
      {/* Top Selector Bar for Right Visualizer */}
      <div className="h-9 px-3 bg-neutral-950 border-b border-neutral-800 flex items-center justify-between text-xs font-mono">
        <div className="flex items-center gap-1 bg-neutral-900 p-0.5 border border-neutral-800">
          <button
            onClick={() => setVisualMode('split')}
            className={`px-2 py-0.5 transition-colors border ${
              visualMode === 'split'
                ? 'bg-neutral-950 text-neutral-100 border-neutral-700 font-semibold'
                : 'text-neutral-400 border-transparent hover:text-neutral-200'
            }`}
          >
            <span className="flex items-center gap-1">
              <Columns2 className="w-3.5 h-3.5 text-blue-400" />
              <span>Xem Song Song</span>
            </span>
          </button>

          <button
            onClick={() => setVisualMode('bbt')}
            className={`px-2 py-0.5 transition-colors border ${
              visualMode === 'bbt'
                ? 'bg-neutral-950 text-neutral-100 border-neutral-700 font-semibold'
                : 'text-neutral-400 border-transparent hover:text-neutral-200'
            }`}
          >
            <span className="flex items-center gap-1">
              <Image className="w-3.5 h-3.5 text-emerald-400" />
              <span>Chỉ Bảng Biến Thiên</span>
            </span>
          </button>

          <button
            onClick={() => setVisualMode('graph')}
            className={`px-2 py-0.5 transition-colors border ${
              visualMode === 'graph'
                ? 'bg-neutral-950 text-neutral-100 border-neutral-700 font-semibold'
                : 'text-neutral-400 border-transparent hover:text-neutral-200'
            }`}
          >
            <span className="flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
              <span>Chỉ Đồ Thị 2D</span>
            </span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setBbtTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
            title="Đổi màu Bảng Biến Thiên (Tối: Zoom / Sáng: In đề Word)"
            className="px-2 py-0.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 text-[11px] flex items-center gap-1 transition-colors"
          >
            {bbtTheme === 'dark' ? <Moon className="w-3 h-3 text-sky-400" /> : <Sun className="w-3 h-3 text-amber-400" />}
            <span className="hidden sm:inline">Theme BBT: {bbtTheme === 'dark' ? 'Studio Tối' : 'In Sáng'}</span>
          </button>
        </div>
      </div>

      {/* Main Canvas Area */}
      <div className="flex-1 overflow-hidden">
        {visualMode === 'split' ? (
          <div className="h-full grid grid-rows-2 gap-1 bg-neutral-950 p-1">
            <div className="h-full overflow-hidden border border-neutral-800">
              <BBTSvg
                analysis={analysis}
                theme={bbtTheme}
                onThemeToggle={() => setBbtTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
              />
            </div>
            <div className="h-full overflow-hidden border border-neutral-800">
              <Graph2D analysis={analysis} />
            </div>
          </div>
        ) : visualMode === 'bbt' ? (
          <div className="h-full p-1 bg-neutral-950">
            <BBTSvg
              analysis={analysis}
              theme={bbtTheme}
              onThemeToggle={() => setBbtTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
            />
          </div>
        ) : (
          <div className="h-full p-1 bg-neutral-950">
            <Graph2D analysis={analysis} />
          </div>
        )}
      </div>
    </div>
  );
};
