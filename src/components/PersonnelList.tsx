import React, { useState, useMemo } from 'react';
import { 
  Users, 
  Search, 
  Trash2, 
  Edit3, 
  CheckSquare, 
  Square, 
  Plus
} from 'lucide-react';
import { Personnel, UserType } from '../types/faceMachine';
import { playTapTone } from '../utils/audio';

interface PersonnelListProps {
  personnelList: Personnel[];
  onAdd: () => void;
  onEdit: (personnel: Personnel) => void;
  onDeleteMultiple: (ids: string[]) => void;
}

export const PersonnelList: React.FC<PersonnelListProps> = ({
  personnelList,
  onAdd,
  onEdit,
  onDeleteMultiple,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | UserType>('all');
  const [isBatchMode, setIsBatchMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [deleteConfirmDialog, setDeleteConfirmDialog] = useState<{
    isOpen: boolean;
    ids: string[];
    names: string[];
  }>({
    isOpen: false,
    ids: [],
    names: [],
  });

  const filteredList = useMemo(() => {
    return personnelList.filter((item) => {
      const matchQuery =
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.id.includes(searchTerm);
      const matchType = filterType === 'all' || item.userType === filterType;
      return matchQuery && matchType;
    });
  }, [personnelList, searchTerm, filterType]);

  const toggleSelect = (id: string) => {
    playTapTone();
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    playTapTone();
    if (selectedIds.length === filteredList.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredList.map((p) => p.id));
    }
  };

  const handleTriggerBatchDelete = () => {
    if (selectedIds.length === 0) return;
    playTapTone();
    const names = personnelList
      .filter((p) => selectedIds.includes(p.id))
      .map((p) => p.name);
    
    setDeleteConfirmDialog({
      isOpen: true,
      ids: selectedIds,
      names,
    });
  };

  const handleTriggerSingleDelete = (p: Personnel) => {
    playTapTone();
    setDeleteConfirmDialog({
      isOpen: true,
      ids: [p.id],
      names: [p.name],
    });
  };

  const handleConfirmDelete = () => {
    onDeleteMultiple(deleteConfirmDialog.ids);
    setSelectedIds((prev) => prev.filter((id) => !deleteConfirmDialog.ids.includes(id)));
    setDeleteConfirmDialog({ isOpen: false, ids: [], names: [] });
  };

  return (
    <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">
            人员与人脸库
          </h2>
          <span className="text-xs text-slate-500 tabular-nums">
            共 {personnelList.length} 人
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => {
              playTapTone();
              setIsBatchMode(!isBatchMode);
              if (isBatchMode) setSelectedIds([]);
            }}
            className={`text-xs px-2.5 py-1.5 rounded-lg font-medium transition-colors ${
              isBatchMode
                ? 'bg-slate-800 text-white'
                : 'text-slate-600 bg-slate-100 hover:bg-slate-200'
            }`}
          >
            {isBatchMode ? '完成' : '批量管理'}
          </button>

          <button
            type="button"
            onClick={() => {
              playTapTone();
              onAdd();
            }}
            className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-medium transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>录入人脸</span>
          </button>
        </div>
      </div>

      {/* Search and User Type Filter */}
      <div className="mt-3 space-y-2">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="搜索人员姓名"
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-slate-900 text-slate-800 placeholder:text-slate-400"
          />
        </div>

        {/* User Type Filter Tabs */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs">
          <button
            type="button"
            onClick={() => {
              playTapTone();
              setFilterType('all');
            }}
            className={`flex-1 py-1 rounded-lg font-medium transition-all ${
              filterType === 'all'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            全部
          </button>
          <button
            type="button"
            onClick={() => {
              playTapTone();
              setFilterType('regular');
            }}
            className={`flex-1 py-1 rounded-lg font-medium transition-all ${
              filterType === 'regular'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            普通用户
          </button>
          <button
            type="button"
            onClick={() => {
              playTapTone();
              setFilterType('admin');
            }}
            className={`flex-1 py-1 rounded-lg font-medium transition-all ${
              filterType === 'admin'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            管理员用户
          </button>
        </div>
      </div>

      {/* Batch Operations Bar */}
      {isBatchMode && (
        <div className="mt-3 p-2.5 bg-slate-100 rounded-xl flex items-center justify-between text-xs animate-fade-in">
          <button
            type="button"
            onClick={handleSelectAll}
            className="flex items-center gap-1.5 text-slate-700 font-medium"
          >
            {selectedIds.length === filteredList.length && filteredList.length > 0 ? (
              <CheckSquare className="w-4 h-4 text-slate-900" />
            ) : (
              <Square className="w-4 h-4 text-slate-400" />
            )}
            <span>全选 ({selectedIds.length}/{filteredList.length})</span>
          </button>

          <button
            type="button"
            onClick={handleTriggerBatchDelete}
            disabled={selectedIds.length === 0}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg font-medium transition-colors ${
              selectedIds.length > 0
                ? 'bg-slate-900 text-white hover:bg-slate-800'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>删除已选人员</span>
          </button>
        </div>
      )}

      {/* Personnel List */}
      <div className="mt-2 divide-y divide-slate-100">
        {filteredList.length === 0 ? (
          <div className="py-10 text-center text-xs text-slate-400">
            暂无人员信息
          </div>
        ) : (
          filteredList.map((person) => {
            const isSelected = selectedIds.includes(person.id);
            return (
              <div
                key={person.id}
                className={`py-3 flex items-center justify-between gap-3 transition-colors rounded-xl px-1 ${
                  isSelected ? 'bg-slate-50' : 'hover:bg-slate-50/60'
                }`}
              >
                {/* Batch checkbox */}
                {isBatchMode && (
                  <button
                    type="button"
                    onClick={() => toggleSelect(person.id)}
                    className="p-1 text-slate-400 hover:text-slate-900"
                    aria-label={`选择 ${person.name}`}
                  >
                    {isSelected ? (
                      <CheckSquare className="w-4 h-4 text-slate-900" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-400" />
                    )}
                  </button>
                )}

                {/* Face Image */}
                <div className="w-11 h-11 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                  <img
                    src={person.faceImage}
                    alt={person.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Name & User Type (NO SCORE, NO ID clutter) */}
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-slate-900 truncate">
                    {person.name}
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    {person.userType === 'admin' ? '管理员用户' : '普通用户'}
                  </div>
                </div>

                {/* Row Actions */}
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      playTapTone();
                      onEdit(person);
                    }}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                    title="修改"
                    aria-label={`修改 ${person.name}`}
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleTriggerSingleDelete(person)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                    title="删除"
                    aria-label={`删除 ${person.name}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmDialog.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl max-w-xs w-full p-5 shadow-xl border border-slate-200 animate-scale-in">
            <h3 className="text-sm font-semibold text-slate-900">
              确认删除以下人员？
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              删除后人脸机将清除相应的人脸特征数据。
            </p>

            <div className="mt-3 p-2.5 bg-slate-50 rounded-xl border border-slate-100 max-h-32 overflow-y-auto text-xs text-slate-700 space-y-1">
              {deleteConfirmDialog.names.map((name, i) => (
                <div key={i} className="truncate">· {name}</div>
              ))}
            </div>

            <div className="mt-4 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmDialog({ isOpen: false, ids: [], names: [] })}
                className="px-3.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-1.5 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors"
              >
                确认删除
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
