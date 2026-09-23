import React from 'react';
import { Smartphone, Monitor } from 'lucide-react';

interface MiniProgramPhoneFrameProps {
  isMobileFrameMode: boolean;
  onToggleFrameMode: () => void;
  children: React.ReactNode;
}

export const MiniProgramPhoneFrame: React.FC<MiniProgramPhoneFrameProps> = ({
  isMobileFrameMode,
  onToggleFrameMode,
  children,
}) => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-start py-4 px-2 sm:px-6">
      {/* Viewport switch toolbar */}
      <div className="w-full max-w-md flex items-center justify-between py-2 px-3 mb-3 bg-slate-900 border border-slate-800 rounded-2xl text-xs">
        <span className="text-slate-300 font-medium">
          智能家居人脸门禁
        </span>

        <button
          type="button"
          onClick={onToggleFrameMode}
          className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
          title={isMobileFrameMode ? '切换为自适应宽屏' : '切换为小程序真机视口'}
        >
          {isMobileFrameMode ? (
            <>
              <Monitor className="w-3.5 h-3.5 text-slate-300" />
              <span>自适应宽屏</span>
            </>
          ) : (
            <>
              <Smartphone className="w-3.5 h-3.5 text-slate-300" />
              <span>手机真机视口</span>
            </>
          )}
        </button>
      </div>

      {/* Frame Container */}
      <main className="w-full flex justify-center items-start">
        {isMobileFrameMode ? (
          <div className="relative w-full max-w-[410px] bg-slate-900 rounded-[44px] p-2.5 shadow-2xl border-4 border-slate-800 transition-all duration-300">
            {/* Top pill/earpiece */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 w-24 h-4 bg-black rounded-full z-40 flex items-center justify-center">
              <span className="w-2 h-2 rounded-full bg-slate-800" />
            </div>

            {/* Inner Mobile Screen Content */}
            <div className="w-full bg-slate-50 rounded-[34px] overflow-hidden flex flex-col min-h-[760px] max-h-[840px] relative shadow-inner">
              <div className="flex-1 overflow-y-auto overscroll-contain">
                {children}
              </div>

              {/* Home Indicator */}
              <div className="w-full bg-white pt-2 pb-2.5 flex justify-center items-center border-t border-slate-100 shrink-0">
                <div className="w-28 h-1 bg-slate-300 rounded-full" />
              </div>
            </div>
          </div>
        ) : (
          <div className="w-full max-w-2xl bg-slate-50 text-slate-800 rounded-2xl shadow-xl overflow-hidden border border-slate-800">
            {children}
          </div>
        )}
      </main>
    </div>
  );
};
