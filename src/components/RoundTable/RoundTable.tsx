import React, { memo, useState } from 'react';
import { GripVertical, Trash2, Move } from 'lucide-react';
import type { Table, Guest } from '../../types';
import { useSeatingStore } from '../../store/useSeatingStore';
import { useDragDrop } from '../../hooks/useDragDrop';
import { SeatSlot } from '../SeatSlot/SeatSlot';
import { getTableRadius, calculateSeatPosition } from '../../utils/colors';

interface RoundTableProps {
  table: Table;
  onTableMove: (id: string, x: number, y: number) => void;
}

export const RoundTable: React.FC<RoundTableProps> = memo(({ table, onTableMove }) => {
  const { 
    seats, 
    guests, 
    rules, 
    removeTable, 
    updateTable, 
    checkConflicts, 
    draggingGuestId,
    selectedGuestIds,
    isMultiSelectMode,
    seatSelectedGuests,
    setConflictMessage,
  } = useSeatingStore();
  const { handleTableDragOver } = useDragDrop();
  const [isDraggingTable, setIsDraggingTable] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [dragStartPos, setDragStartPos] = useState({ x: 0, y: 0 });
  const [hasMoved, setHasMoved] = useState(false);

  const tableRadius = getTableRadius(table.capacity);
  const tableSeats = seats.filter(s => s.tableId === table.id);
  const seatedGuests = tableSeats
    .filter(s => s.guestId)
    .map(s => ({
      seat: s,
      guest: guests.find(g => g.id === s.guestId) || null,
    }));

  const hasConflictWithTable = (): boolean => {
    if (!draggingGuestId) return false;
    const conflict = checkConflicts(draggingGuestId, table.id);
    return conflict.hasConflict;
  };

  const tableHasConflict = hasConflictWithTable();
  const canBatchSeat = isMultiSelectMode && selectedGuestIds.length > 0;

  const handleBatchSeat = () => {
    if (!canBatchSeat) return;
    const result = seatSelectedGuests(table.id);
    if (result.hasConflict) {
      setConflictMessage(result.message);
      setTimeout(() => setConflictMessage(null), 2000);
    }
  };

  const handleTableMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.seat-slot')) return;
    e.stopPropagation();
    setIsDraggingTable(true);
    setHasMoved(false);
    setDragStartPos({ x: e.clientX, y: e.clientY });
    setDragOffset({
      x: e.clientX - table.x,
      y: e.clientY - table.y,
    });
  };

  const handleTableMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingTable) return;
    e.stopPropagation();
    
    const moveDistance = Math.sqrt(
      Math.pow(e.clientX - dragStartPos.x, 2) + 
      Math.pow(e.clientY - dragStartPos.y, 2)
    );
    if (moveDistance > 5) {
      setHasMoved(true);
    }
    
    const newX = e.clientX - dragOffset.x;
    const newY = e.clientY - dragOffset.y;
    onTableMove(table.id, newX, newY);
  };

  const handleTableMouseUp = (e: React.MouseEvent) => {
    if (isDraggingTable) {
      setIsDraggingTable(false);
      updateTable(table.id, { x: table.x, y: table.y });
      
      if (!hasMoved && !(e.target as HTMLElement).closest('.seat-slot')) {
        handleBatchSeat();
      }
    }
  };

  const handleRemoveTable = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`确定要删除"${table.name}"吗？`)) {
      removeTable(table.id);
    }
  };

  const seatPositions = tableSeats.map((seat, index) => ({
    seat,
    position: calculateSeatPosition(0, 0, tableRadius, index, table.capacity),
  }));

  return (
    <div
      className="absolute select-none group"
      style={{
        left: table.x,
        top: table.y,
        transform: 'translate(-50%, -50%)',
        cursor: isDraggingTable ? 'grabbing' : (canBatchSeat ? 'pointer' : 'grab'),
        zIndex: isDraggingTable ? 100 : 10,
      }}
      onMouseDown={handleTableMouseDown}
      onMouseMove={handleTableMouseMove}
      onMouseUp={handleTableMouseUp}
      onMouseLeave={handleTableMouseUp}
      onDragOver={handleTableDragOver}
    >
      <div className="absolute -top-12 left-1/2 -translate-x-1/2 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-20">
        <div className="flex items-center gap-1 bg-white px-3 py-1.5 rounded-full shadow-lg border border-stone-200">
          <Move size={14} className="text-stone-500" />
          <span className="text-sm font-medium text-stone-700">{table.name}</span>
          <span className="text-xs text-stone-400">({seatedGuests.length}/{table.capacity})</span>
        </div>
        <button
          onClick={handleRemoveTable}
          className="p-1.5 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg transition-colors"
          title="删除桌位"
        >
          <Trash2 size={14} />
        </button>
      </div>

      <div
        className="relative rounded-full flex items-center justify-center"
        style={{
          width: tableRadius * 2,
          height: tableRadius * 2,
          background: `
            radial-gradient(ellipse at 30% 30%, #8B4513 0%, #5D3A1A 50%, #3E2723 100%)
          `,
          border: canBatchSeat ? '4px dashed #3B82F6' : '6px solid #2D1810',
          boxShadow: `
            inset 0 -10px 30px rgba(0,0,0,0.4),
            inset 0 10px 30px rgba(255,255,255,0.1),
            0 20px 40px rgba(0,0,0,0.3),
            ${tableHasConflict ? '0 0 0 6px rgba(220, 38, 38, 0.4), 0 0 30px rgba(220, 38, 38, 0.3)' : ''}
            ${canBatchSeat ? '0 0 0 6px rgba(59, 130, 246, 0.5), 0 0 30px rgba(59, 130, 246, 0.3)' : ''}
          `,
          transition: 'box-shadow 0.3s ease, border 0.3s ease',
        }}
      >
        <div
          className="absolute rounded-full flex items-center justify-center"
          style={{
            width: tableRadius * 1.2,
            height: tableRadius * 1.2,
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            background: `
              radial-gradient(ellipse at 40% 40%, #F5E6D3 0%, #E8D5B7 60%, #D4B896 100%)
            `,
            boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.1)',
          }}
        >
          <div className="text-center px-4">
            <div className="font-bold text-stone-700 text-lg whitespace-nowrap">{table.name}</div>
            <div className="text-xs text-stone-500 mt-1">
              {table.capacity}人桌 · {seatedGuests.length}/{table.capacity}
            </div>
            {canBatchSeat && (
              <div className="text-xs text-blue-600 mt-1 font-medium animate-pulse">
                👆 点击批量落座
              </div>
            )}
          </div>
        </div>
      </div>

      {seatPositions.map(({ seat, position }) => {
        const guest = guests.find(g => g.id === seat.guestId) || null;
        const conflict = draggingGuestId && !seat.guestId
          ? checkConflicts(draggingGuestId, table.id, seat.positionIndex)
          : { hasConflict: false };

        return (
          <div key={seat.id} className="seat-slot">
            <SeatSlot
              seat={seat}
              guest={guest}
              tableId={table.id}
              position={position}
              hasConflict={conflict.hasConflict}
            />
          </div>
        );
      })}

      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
      >
        <GripVertical size={24} className="text-amber-600" />
      </div>
    </div>
  );
});

RoundTable.displayName = 'RoundTable';
