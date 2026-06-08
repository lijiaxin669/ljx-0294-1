import React, { useState } from 'react';
import { Plus, Users, ChefHat, Search } from 'lucide-react';
import type { Seniority } from '../../types';
import { SENIORITY_LABELS } from '../../types';
import { useSeatingStore } from '../../store/useSeatingStore';
import { GuestCard } from '../GuestCard/GuestCard';

const SENIORITY_FILTERS: (Seniority | 'all')[] = ['all', 'elder', 'peer', 'junior'];

export const GuestSidebar: React.FC = () => {
  const { guests, addGuest, getUnseatedGuests, initMockData } = useSeatingStore();
  const [filter, setFilter] = useState<Seniority | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newGuest, setNewGuest] = useState({
    name: '',
    seniority: 'peer' as Seniority,
    dietaryNote: '',
  });

  const unseatedGuests = getUnseatedGuests();
  const seatedCount = guests.length - unseatedGuests.length;

  const filteredGuests = unseatedGuests.filter(guest => {
    const matchesFilter = filter === 'all' || guest.seniority === filter;
    const matchesSearch = guest.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         guest.dietaryNote.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleAddGuest = () => {
    if (!newGuest.name.trim()) return;
    addGuest(newGuest);
    setNewGuest({ name: '', seniority: 'peer', dietaryNote: '' });
    setShowAddForm(false);
  };

  const handleInitMock = () => {
    if (guests.length === 0) {
      initMockData();
    }
  };

  return (
    <div className="w-80 bg-gradient-to-b from-stone-50 to-amber-50 border-r-2 border-amber-200 flex flex-col h-full">
      <div className="p-4 border-b border-amber-200 bg-gradient-to-r from-red-700 to-red-600 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users size={20} />
            <h2 className="font-bold text-lg">宾客名单</h2>
          </div>
          <div className="text-sm opacity-80">
            {seatedCount}/{guests.length} 已入座
          </div>
        </div>
      </div>

      <div className="p-3 border-b border-amber-200 bg-amber-50/50">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={16} />
          <input
            type="text"
            placeholder="搜索宾客姓名或忌口..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-amber-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent bg-white"
          />
        </div>

        <div className="flex gap-1 mt-3">
          {SENIORITY_FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`
                flex-1 px-2 py-1.5 text-xs rounded-md transition-all
                ${filter === f
                  ? 'bg-red-600 text-white shadow-md'
                  : 'bg-white text-stone-600 hover:bg-amber-100 border border-amber-200'
                }
              `}
            >
              {f === 'all' ? '全部' : SENIORITY_LABELS[f]}
            </button>
          ))}
        </div>
      </div>

      <div className="p-3 space-y-2">
        <button
          onClick={() => setShowAddForm(true)}
          className="w-full py-2.5 px-4 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-lg font-medium hover:from-amber-600 hover:to-amber-700 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
        >
          <Plus size={18} />
          添加宾客
        </button>

        {guests.length === 0 && (
          <button
            onClick={handleInitMock}
            className="w-full py-2.5 px-4 bg-gradient-to-r from-stone-500 to-stone-600 text-white rounded-lg font-medium hover:from-stone-600 hover:to-stone-700 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
          >
            <ChefHat size={18} />
            载入示例数据
          </button>
        )}
      </div>

      {showAddForm && (
        <div className="p-3 mx-3 mb-3 bg-white rounded-lg border-2 border-amber-300 shadow-lg">
          <input
            type="text"
            placeholder="姓名"
            value={newGuest.name}
            onChange={(e) => setNewGuest({ ...newGuest, name: e.target.value })}
            className="w-full px-3 py-2 mb-2 border border-stone-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
            autoFocus
          />
          <select
            value={newGuest.seniority}
            onChange={(e) => setNewGuest({ ...newGuest, seniority: e.target.value as Seniority })}
            className="w-full px-3 py-2 mb-2 border border-stone-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
          >
            <option value="elder">长辈</option>
            <option value="peer">平辈</option>
            <option value="junior">晚辈</option>
          </select>
          <input
            type="text"
            placeholder="忌口备注（如：海鲜过敏、素食）"
            value={newGuest.dietaryNote}
            onChange={(e) => setNewGuest({ ...newGuest, dietaryNote: e.target.value })}
            className="w-full px-3 py-2 mb-3 border border-stone-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
          />
          <div className="flex gap-2">
            <button
              onClick={handleAddGuest}
              className="flex-1 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700 transition-colors"
            >
              添加
            </button>
            <button
              onClick={() => setShowAddForm(false)}
              className="flex-1 py-2 bg-stone-200 text-stone-700 rounded-md text-sm font-medium hover:bg-stone-300 transition-colors"
            >
              取消
            </button>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {filteredGuests.length === 0 ? (
          <div className="text-center py-8 text-stone-400">
            <Users size={40} className="mx-auto mb-2 opacity-50" />
            <p className="text-sm">
              {guests.length === 0 ? '暂无宾客，请添加' : '所有宾客已入座'}
            </p>
          </div>
        ) : (
          filteredGuests.map((guest) => (
            <GuestCard key={guest.id} guest={guest} />
          ))
        )}
      </div>

      <div className="p-3 border-t border-amber-200 bg-amber-50 text-xs text-stone-500">
        <p>💡 拖拽宾客卡片到座位上即可落座</p>
        <p className="mt-1">⌨️ Ctrl+Z 撤销 | Ctrl+Y 重做</p>
      </div>
    </div>
  );
};
