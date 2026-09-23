import React, { useState, useEffect } from 'react';
import { Lock, Unlock, History } from 'lucide-react';
import { DoorLockState } from '../types/faceMachine';
import { playUnlockChime, playLockChime, playTapTone } from '../utils/audio';
import { appendAccessLog } from '../services/storage';

interface RemoteUnlockCardProps {
  doorState: DoorLockState;
  onStateChange: (newState: DoorLockState) => void;
  onViewLogs: () => void;
}

export const RemoteUnlockCard: React.FC<RemoteUnlockCardProps> = ({
  doorState,
  onStateChange,
  onViewLogs,
}) => {
  const [countdown, setCountdown] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            playLockChime();
            onStateChange({ ...doorState, isLocked: true, isUnlocking: false });
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [countdown, doorState, onStateChange]);

  const handleUnlockClick = () => {
    if (isProcessing) return;
    if (!doorState.isLocked) {
      // Manual lock if currently unlocked
      playLockChime();
      setCountdown(0);
      onStateChange({ ...doorState, isLocked: true, isUnlocking: false });
      return;
    }

    setIsProcessing(true);
    playTapTone();

    setTimeout(() => {
      setIsProcessing(false);
      playUnlockChime();

      onStateChange({
        ...doorState,
        isLocked: false,
        isUnlocking: false,
      });

      appendAccessLog({
        type: 'remote',
        personnelName: '远程开门',
        userType: 'admin',
        success: true,
      });

      setCountdown(doorState.autoRelockSeconds || 5);
    }, 450);
  };

  return (
    <div className="bg-slate-900 text-white p-6 rounded-2xl border border-slate-800 shadow-sm relative overflow-hidden">
      {/* Top row: Status & View Logs Entry */}
      <div className="flex items-center justify-between">
        <div className="text-xs text-slate-400 font-medium">
          门禁状态：
          <span className={doorState.isLocked ? 'text-slate-200' : 'text-teal-400 font-semibold'}>
            {doorState.isLocked ? '已锁定' : '已开锁'}
          </span>
        </div>

        <button
          type="button"
          onClick={onViewLogs}
          className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-white bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700 transition-colors"
        >
          <History className="w-3.5 h-3.5 text-slate-400" />
          <span>开门记录</span>
        </button>
      </div>

      {/* Main Tactile Unlock Button */}
      <div className="py-7 flex flex-col items-center justify-center">
        <button
          type="button"
          onClick={handleUnlockClick}
          disabled={isProcessing}
          aria-label={doorState.isLocked ? '点击开门' : '点击关锁'}
          className={`w-32 h-32 rounded-full flex flex-col items-center justify-center transition-all duration-200 active:scale-95 shadow-md ${
            doorState.isLocked
              ? 'bg-teal-700 hover:bg-teal-600 text-white shadow-teal-950/40'
              : 'bg-slate-800 text-teal-400 border-2 border-teal-500/80'
          } ${isProcessing ? 'opacity-75 cursor-wait' : ''}`}
        >
          {doorState.isLocked ? (
            <Unlock className="w-9 h-9 mb-1" />
          ) : (
            <Lock className="w-9 h-9 mb-1 text-teal-400" />
          )}
          <span className="text-sm font-semibold tracking-wide">
            {isProcessing ? '正在开门...' : doorState.isLocked ? '点击开门' : '已开锁'}
          </span>
        </button>

        {/* Status text / Auto-relock countdown */}
        <div className="mt-3.5 text-center h-5">
          {countdown > 0 ? (
            <div className="text-xs text-slate-400 tabular-nums">
              门已开启，将在 <span className="text-teal-400 font-medium">{countdown}</span> 秒后自动关锁
            </div>
          ) : doorState.isLocked ? (
            <div className="text-xs text-slate-400">
              点击上方按钮执行远程开门
            </div>
          ) : (
            <div className="text-xs text-slate-400">
              门禁开启中
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
