import React, { useState } from 'react';
import {
  Plus,
  Undo2,
  Redo2,
  Download,
  Settings,
  Trash2,
  Table,
} from 'lucide-react';
import type { TableCapacity } from '../../types';
import { TABLE_CAPACITY_OPTIONS } from '../../types';
import { useSeatingStore } from '../../store/useSeatingStore';
import { exportToPNG } from '../../utils/exportPNG';

interface ToolbarProps {
  onOpenRules: () => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({ onOpenRules }) => {
  const {
    addTable,
    undo,
    redo,
    canUndo,
    canRedo,
    tables,
    clearAll,
    guests,
  } = useSeatingStore();

  const [showTableMenu, setShowTableMenu] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const handleAddTable = (capacity: TableCapacity) => {
    const existingCount = tables.length;
    const tableNames = ['主桌', '二桌', '三桌', '四桌', '五桌', '六桌'];
    const name = tableNames[existingCount] || `${existingCount + 1}桌`;

    const offsetX = (existingCount % 3) * 400;
    const offsetY = Math.floor(existingCount / 3) * 350;

    addTable({
      name,
      capacity,
      x: 400 + offsetX,
      y: 350 + offsetY,
    });
    setShowTableMenu(false);
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await exportToPNG('seating-canvas');
    } catch (error) {
      console.error('导出失败:', error);
      alert('导出失败，请重试');
    } finally {
      setIsExporting(false);
    }
  };

  const handleClearAll = () => {
    if (confirm('确定要清空所有数据吗？此操作不可恢复。')) {
      clearAll();
    }
  };

  return (
    <div className="h-16 bg-gradient-to-r from-red-700 via-red-600 to-red-700 text-white flex items-center justify-between px-6 shadow-xl border-b-4 border-amber-500">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 mr-4">
          <span className="text-3xl">🏮</span>
          <div>
            <h1 className="font-bold text-lg leading-tight" style={{ fontFamily: 'serif' }}>
              年夜饭座位编排器
            </h1>
            <p className="text-xs text-red-200">阖家团圆 · 有序就坐</p>
          </div>
        </div>

        <div className="h-8 w-px bg-red-400/50 mx-2" />

        <div className="relative">
          <button
            onClick={() => setShowTableMenu(!showTableMenu)}
            className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 rounded-lg font-medium transition-all shadow-md hover:shadow-lg"
          >
            <Plus size={18} />
            <Table size={18} />
            添加桌位
          </button>

          {showTableMenu && (
            <div className="absolute top-full left-0 mt-2 bg-white rounded-lg shadow-2xl border border-stone-200 py-2 z-50 min-w-[140px]">
              {TABLE_CAPACITY_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleAddTable(option.value)}
                  className="w-full px-4 py-2 text-left text-stone-700 hover:bg-amber-50 hover:text-amber-700 transition-colors flex items-center gap-2"
                >
                  <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-xs font-bold">
                    {option.value}
                  </span>
                  {option.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={undo}
          disabled={!canUndo}
          className={`p-2.5 rounded-lg transition-all ${
            canUndo
              ? 'bg-white/20 hover:bg-white/30 cursor-pointer'
              : 'bg-white/5 cursor-not-allowed opacity-50'
          }`}
          title="撤销 (Ctrl+Z)"
        >
          <Undo2 size={18} />
        </button>

        <button
          onClick={redo}
          disabled={!canRedo}
          className={`p-2.5 rounded-lg transition-all ${
            canRedo
              ? 'bg-white/20 hover:bg-white/30 cursor-pointer'
              : 'bg-white/5 cursor-not-allowed opacity-50'
          }`}
          title="重做 (Ctrl+Y)"
        >
          <Redo2 size={18} />
        </button>

        <div className="h-6 w-px bg-white/20 mx-1" />

        <button
          onClick={onOpenRules}
          className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg font-medium transition-all"
          title="冲突规则配置"
        >
          <Settings size={18} />
          规则配置
        </button>

        <button
          onClick={handleExport}
          disabled={isExporting || tables.length === 0}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
            isExporting || tables.length === 0
              ? 'bg-stone-400 cursor-not-allowed'
              : 'bg-amber-500 hover:bg-amber-400 shadow-md hover:shadow-lg'
          }`}
          title="导出座位图"
        >
          <Download size={18} />
          {isExporting ? '导出中...' : '导出PNG'}
        </button>

        {(guests.length > 0 || tables.length > 0) && (
          <>
            <div className="h-6 w-px bg-white/20 mx-1" />
            <button
              onClick={handleClearAll}
              className="p-2.5 bg-white/10 hover:bg-red-500 rounded-lg transition-all"
              title="清空所有数据"
            >
              <Trash2 size={18} />
            </button>
          </>
        )}
      </div>
    </div>
  );
};
