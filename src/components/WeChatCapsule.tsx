import React from 'react';
import { Settings } from 'lucide-react';
import { playTapTone } from '../utils/audio';

interface WeChatCapsuleProps {
  title: string;
  onOpenSettings: () => void;
}

export const WeChatCapsule: React.FC<WeChatCapsuleProps> = ({
  title,
  onOpenSettings,
}) => {
  return (
    <div className="w-full bg-slate-900 text-white select-none sticky top-0 z-30 shadow-xs">
      {/* Top Phone Status Bar */}
      <div className="flex items-center justify-between px-5 pt-2 pb-1 text-xs text-slate-400 font-medium">
        <span>09:41</span>
        <div className="flex items-center gap-1.5 text-slate-400">
          <span className="text-[10px] tabular-nums">5G</span>
          <span className="text-[10px] tabular-nums">100%</span>
        </div>
      </div>

      {/* Header Bar with Title and Right Setting Button */}
      <div className="flex items-center justify-between px-4 py-3">
        <h1 className="text-base font-semibold text-white tracking-tight truncate">
          {title}
        </h1>

        {/* Right Action: Settings Button (Requirement 3: 右上角添加设置按钮, 点击进入设置) */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              playTapTone();
              onOpenSettings();
            }}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors"
            title="点击进入设置"
          >
            <Settings className="w-3.5 h-3.5 text-slate-300" />
            <span>设置</span>
          </button>
        </div>
      </div>
    </div>
  );
};
