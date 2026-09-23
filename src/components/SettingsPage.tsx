import React, { useState } from 'react';
import { ArrowLeft, Check, RotateCcw } from 'lucide-react';
import { DoorLockState } from '../types/faceMachine';
import { playTapTone } from '../utils/audio';

interface SettingsPageProps {
  doorState: DoorLockState;
  onUpdateState: (newState: DoorLockState) => void;
  onResetDefaults: () => void;
  onBack: () => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  doorState,
  onUpdateState,
  onResetDefaults,
  onBack,
}) => {
  const [relockTime, setRelockTime] = useState<number>(doorState.autoRelockSeconds || 5);
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = () => {
    playTapTone();
    onUpdateState({
      ...doorState,
      autoRelockSeconds: relockTime,
    });
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onBack();
    }, 600);
  };

  return (
    <div className="min-h-full flex flex-col bg-slate-50">
      {/* Top Header */}
      <div className="bg-white border-b border-slate-200 px-4 py-3 sticky top-0 z-20 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => {
              playTapTone();
              onBack();
            }}
            className="p-1.5 -ml-1 text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
            aria-label="返回首页"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-base font-semibold text-slate-900">
            系统设置
          </h1>
        </div>

        <button
          type="button"
          onClick={handleSave}
          className="text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 px-3.5 py-1.5 rounded-xl transition-colors flex items-center gap-1"
        >
          {isSaved && <Check className="w-3.5 h-3.5" />}
          <span>{isSaved ? '已保存' : '保存'}</span>
        </button>
      </div>

      <div className="p-4 space-y-4 flex-1">
        {/* Door Auto-Relock Timeout Setting */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="text-sm font-semibold text-slate-900">
            开门后自动关锁等待时长
          </div>
          <p className="text-xs text-slate-500">
            远程或刷脸开锁后，门禁保持开启并在设定的秒数后自动复位关锁。
          </p>

          <div className="grid grid-cols-4 gap-2 pt-1">
            {[3, 5, 8, 10].map((sec) => (
              <button
                key={sec}
                type="button"
                onClick={() => {
                  playTapTone();
                  setRelockTime(sec);
                }}
                className={`py-2 rounded-xl text-xs font-medium transition-all ${
                  relockTime === sec
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {sec} 秒
              </button>
            ))}
          </div>
        </div>

        {/* Data Reset */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="text-sm font-semibold text-slate-900">
            数据管理
          </div>
          <p className="text-xs text-slate-500">
            清空自定义修改并恢复初始演示人员及开门记录。
          </p>

          <div className="pt-2">
            <button
              type="button"
              onClick={() => {
                if (confirm('确认恢复初始人员及开门记录？')) {
                  onResetDefaults();
                  onBack();
                }
              }}
              className="w-full py-2 px-3 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors flex items-center justify-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>恢复默认演示数据</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
