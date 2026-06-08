import React, { useState, useRef, useCallback } from 'react';
import { RotateCcw } from 'lucide-react';
import type { Table } from '../../types';
import { useSeatingStore } from '../../store/useSeatingStore';
import { useCanvasPan } from '../../hooks/useCanvasPan';
import { RoundTable } from '../RoundTable/RoundTable';

export const Canvas: React.FC = () => {
  const { tables, updateTable, clearSelection, conflictMessage } = useSeatingStore();
  const { pan, isPanning, handleMouseDown, handleMouseMove, handleMouseUp, handleWheel, resetPan } = useCanvasPan();
  const [tablePositions, setTablePositions] = useState<Map<string, { x: number; y: number }>>(new Map());
  const canvasRef = useRef<HTMLDivElement>(null);

  const handleTableMove = useCallback((id: string, x: number, y: number) => {
    setTablePositions(prev => {
      const newMap = new Map(prev);
      newMap.set(id, { x, y });
      return newMap;
    });
  }, []);

  const handleTableMoveEnd = useCallback((id: string) => {
    const pos = tablePositions.get(id);
    if (pos) {
      updateTable(id, { x: pos.x, y: pos.y });
    }
  }, [tablePositions, updateTable]);

  const getTablePosition = (table: Table) => {
    const cached = tablePositions.get(table.id);
    return cached || { x: table.x, y: table.y };
  };

  const handleCanvasClick = () => {
    clearSelection();
  };

  const handleCanvasMouseUp = () => {
    handleMouseUp();
    tablePositions.forEach((_, id) => handleTableMoveEnd(id));
    setTablePositions(new Map());
  };

  return (
    <div className="flex-1 relative overflow-hidden bg-stone-100">
      {conflictMessage && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 animate-bounce">
          <div className="bg-red-600 text-white px-6 py-3 rounded-lg shadow-2xl font-bold border-2 border-red-400">
            {conflictMessage}
          </div>
        </div>
      )}

      <div className="absolute top-4 right-4 z-40 flex gap-2">
        <button
          onClick={resetPan}
          className="p-2 bg-white/80 hover:bg-white rounded-lg shadow-lg border border-stone-200 transition-colors"
          title="重置视图"
        >
          <RotateCcw size={18} className="text-stone-600" />
        </button>
      </div>

      <div className="absolute bottom-4 left-4 z-40 bg-white/80 px-3 py-2 rounded-lg shadow-lg border border-stone-200 text-xs text-stone-600">
        <p>🖱️ Alt+拖拽 或 中键拖动 平移画布</p>
        <p>🔍 Ctrl+滚轮 缩放画布 ({Math.round(pan.scale * 100)}%)</p>
      </div>

      <div
        id="seating-canvas"
        ref={canvasRef}
        className="w-full h-full relative"
        style={{
          cursor: isPanning ? 'grabbing' : 'default',
          backgroundImage: `
            radial-gradient(circle at 20% 80%, rgba(196, 30, 58, 0.05) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(212, 175, 55, 0.05) 0%, transparent 50%),
            repeating-linear-gradient(0deg, transparent, transparent 30px, rgba(139, 69, 19, 0.03) 30px, rgba(139, 69, 19, 0.03) 31px),
            repeating-linear-gradient(90deg, transparent, transparent 30px, rgba(139, 69, 19, 0.03) 30px, rgba(139, 69, 19, 0.03) 31px)
          `,
          backgroundColor: '#FAFAF0',
        }}
        onClick={handleCanvasClick}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleCanvasMouseUp}
        onMouseLeave={handleCanvasMouseUp}
        onWheel={handleWheel}
      >
        <div
          className="absolute inset-0 will-change-transform contain-strict"
          style={{
            transform: `translate3d(${pan.x}px, ${pan.y}px, 0) scale(${pan.scale})`,
            transformOrigin: 'center center',
          }}
        >
          {tables.length === 0 ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-stone-400">
                <div className="text-6xl mb-4">🏮</div>
                <p className="text-xl font-medium">点击上方"添加桌位"开始编排</p>
                <p className="text-sm mt-2">或先在左侧添加宾客</p>
              </div>
            </div>
          ) : (
            tables.map((table) => {
              const pos = getTablePosition(table);
              return (
                <RoundTable
                  key={table.id}
                  table={{ ...table, x: pos.x, y: pos.y }}
                  onTableMove={handleTableMove}
                />
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
