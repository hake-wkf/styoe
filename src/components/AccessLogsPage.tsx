import React, { useState, useMemo } from 'react';
import { ArrowLeft, Search, Calendar, RotateCcw } from 'lucide-react';
import { AccessLog } from '../types/faceMachine';
import { playTapTone } from '../utils/audio';

interface AccessLogsPageProps {
  logs: AccessLog[];
  onBack: () => void;
}

export const AccessLogsPage: React.FC<AccessLogsPageProps> = ({ logs, onBack }) => {
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [timeRange, setTimeRange] = useState<'all' | 'today' | 'yesterday' | 'week'>('all');
  const [keyword, setKeyword] = useState<string>('');

  const todayStr = useMemo(() => new Date().toISOString().slice(0, 10), []);

  const yesterdayStr = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return d.toISOString().slice(0, 10);
  }, []);

  const sevenDaysAgoStr = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return d.toISOString().slice(0, 10);
  }, []);

  // Filter logs based on date and keyword
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      // Date query
      if (selectedDate) {
        if (log.date !== selectedDate) return false;
      } else if (timeRange === 'today') {
        if (log.date !== todayStr) return false;
      } else if (timeRange === 'yesterday') {
        if (log.date !== yesterdayStr) return false;
      } else if (timeRange === 'week') {
        if (log.date < sevenDaysAgoStr) return false;
      }

      // Keyword query
      if (keyword.trim()) {
        const match =
          log.personnelName.includes(keyword.trim()) ||
          log.timestamp.includes(keyword.trim()) ||
          (log.type === 'remote' ? '远程开门' : '人脸').includes(keyword.trim());
        if (!match) return false;
      }

      return true;
    });
  }, [logs, selectedDate, timeRange, keyword, todayStr, yesterdayStr, sevenDaysAgoStr]);

  const handleQuickRange = (range: 'all' | 'today' | 'yesterday' | 'week') => {
    playTapTone();
    setTimeRange(range);
    setSelectedDate('');
  };

  const handleDateChange = (date: string) => {
    playTapTone();
    setSelectedDate(date);
    setTimeRange('all');
  };

  const handleReset = () => {
    playTapTone();
    setSelectedDate('');
    setTimeRange('all');
    setKeyword('');
  };

  return (
    <div className="min-h-full flex flex-col bg-slate-50">
      {/* Top Page Header */}
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
            开门记录
          </h1>
        </div>

        {(selectedDate || timeRange !== 'all' || keyword) && (
          <button
            type="button"
            onClick={handleReset}
            className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>重置筛选</span>
          </button>
        )}
      </div>

      <div className="p-4 space-y-3 flex-1">
        {/* Time Query Section */}
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between text-xs font-medium text-slate-700">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-slate-600" />
              <span>按时间查询</span>
            </span>
            <span className="text-slate-400 tabular-nums">
              共查询到 {filteredLogs.length} 条
            </span>
          </div>

          {/* Quick Time Range Tabs */}
          <div className="grid grid-cols-4 gap-1.5">
            {[
              { id: 'all', label: '全部时间' },
              { id: 'today', label: '今天' },
              { id: 'yesterday', label: '昨天' },
              { id: 'week', label: '近7天' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleQuickRange(tab.id as 'all' | 'today' | 'yesterday' | 'week')}
                className={`py-1.5 text-xs font-medium rounded-xl transition-all ${
                  timeRange === tab.id && !selectedDate
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Specific Date Picker Input */}
          <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
            <span className="text-xs text-slate-500 shrink-0">指定具体日期：</span>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => handleDateChange(e.target.value)}
              className="flex-1 px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-900"
            />
          </div>

          {/* Keyword Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="搜索人员姓名或开锁方式"
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-1 focus:ring-slate-900 placeholder:text-slate-400"
            />
          </div>
        </div>

        {/* Logs List Content */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs divide-y divide-slate-100 overflow-hidden">
          {filteredLogs.length === 0 ? (
            <div className="py-16 text-center text-xs text-slate-400">
              所选时间范围内暂无开门记录
            </div>
          ) : (
            filteredLogs.map((log) => (
              <div key={log.id} className="p-3.5 flex items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-slate-900 truncate">
                      {log.personnelName}
                    </span>
                    <span className="text-xs text-slate-500 font-normal">
                      ({log.type === 'remote' ? '远程开门' : '人脸识别开门'})
                    </span>
                  </div>

                  <div className="text-xs text-slate-500 mt-1 tabular-nums">
                    {log.timestamp}
                  </div>
                </div>

                <div className="text-xs text-slate-600 font-medium shrink-0">
                  开门成功
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
