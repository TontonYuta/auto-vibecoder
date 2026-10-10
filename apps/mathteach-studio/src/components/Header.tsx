import React from 'react';
import { TabId } from '../types';
import {
  TrendingUp,
  BarChart3,
  GitFork,
  Box,
  Maximize2,
  Minimize2,
  Video,
  Layers,
  Sparkles,
} from 'lucide-react';

interface HeaderProps {
  activeTab: TabId;
  setActiveTab: (tab: TabId) => void;
  isZoomMode: boolean;
  setIsZoomMode: React.Dispatch<React.SetStateAction<boolean>>;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  isZoomMode,
  setIsZoomMode,
}) => {
  const tabs = [
    {
      id: 'analysis' as TabId,
      name: 'Bảng Biến Thiên & Đồ Thị',
      icon: TrendingUp,
      badge: 'CTM 12',
    },
    {
      id: 'stats' as TabId,
      name: 'Thống Kê Ghép Nhóm',
      icon: BarChart3,
      badge: 'SGK Mới',
    },
    {
      id: 'probability' as TabId,
      name: 'Xác Suất Sơ Đồ Cây',
      icon: GitFork,
      badge: 'Bayes',
    },
    {
      id: 'oxyz' as TabId,
      name: 'Không Gian Oxyz 3D',
      icon: Box,
      badge: 'Hình 12',
    },
  ];

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsZoomMode(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
      setIsZoomMode(false);
    }
  };

  return (
    <header className="h-12 border-b border-neutral-800 bg-neutral-950 flex items-center justify-between px-3 shrink-0 select-none z-30">
      {/* Brand logo & title */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-blue-600 text-white font-mono font-bold text-xs flex items-center justify-center rounded-none shadow-sm">
            12
          </div>
          <div className="flex flex-col">
            <span className="font-mono font-bold text-xs tracking-wider text-neutral-100 uppercase">
              MathTeach Studio
            </span>
          </div>
        </div>

        <div className="hidden sm:flex items-center text-[10px] font-mono text-neutral-500 bg-neutral-900 px-1.5 py-0.5 border border-neutral-800">
          <span>CT GDPT 2018</span>
        </div>
      </div>

      {/* Flat Navigation Tabs */}
      <div className="flex items-center gap-1 bg-neutral-900 p-0.5 border border-neutral-800 h-8">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`h-7 px-2.5 text-xs font-mono transition-colors border flex items-center gap-1.5 ${
                isActive
                  ? 'bg-neutral-950 text-white border-neutral-700 font-semibold shadow-xs'
                  : 'text-neutral-400 border-transparent hover:text-neutral-200 hover:bg-neutral-800/60'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-blue-400' : 'text-neutral-500'}`} />
              <span className="hidden md:inline">{tab.name}</span>
              <span className="md:hidden">
                {tab.id === 'analysis'
                  ? 'BBT & Đồ Thị'
                  : tab.id === 'stats'
                  ? 'Thống Kê'
                  : tab.id === 'probability'
                  ? 'Xác Suất'
                  : 'Oxyz'}
              </span>
            </button>
          );
        })}
      </div>

      {/* Actions: Zoom teaching mode / Fullscreen */}
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => setIsZoomMode(!isZoomMode)}
          title="Chế độ Giảng dạy Zoom / Meet (Ẩn viền thừa, phóng to tối đa)"
          className={`h-7 px-2 border text-xs font-mono flex items-center gap-1.5 transition-colors ${
            isZoomMode
              ? 'bg-amber-500/20 text-amber-300 border-amber-600/60'
              : 'bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border-neutral-800'
          }`}
        >
          <Video className="w-3.5 h-3.5 text-blue-400" />
          <span className="hidden lg:inline">{isZoomMode ? 'Thoát Zoom Mode' : 'Chế Độ Giảng Dạy'}</span>
        </button>

        <button
          onClick={toggleFullscreen}
          title="Toàn màn hình"
          className="h-7 w-7 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-400 hover:text-white flex items-center justify-center transition-colors"
        >
          {isZoomMode ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
        </button>
      </div>
    </header>
  );
};
