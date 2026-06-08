import React, { memo } from 'react';
import type { Seat, Guest } from '../../types';
import { SENIORITY_LABELS } from '../../types';
import { useSeatingStore } from '../../store/useSeatingStore';
import { useDragDrop } from '../../hooks/useDragDrop';

interface SeatSlotProps {
  seat: Seat;
  guest: Guest | null;
  tableId: string;
  position: { x: number; y: number };
  hasConflict: boolean;
}

export const SeatSlot: React.FC<SeatSlotProps> = memo(({
  seat,
  guest,
  tableId,
  position,
  hasConflict,
}) => {
  const { hoveredSeatId, unseatGuest, checkConflicts, draggingGuestId, setConflictMessage } = useSeatingStore();
  const { handleDragOver, handleDragLeave, handleDrop, handleDragStart, handleDragEnd } = useDragDrop();

  const isHovered = hoveredSeatId === seat.id;
  const isDraggingThis = guest && draggingGuestId === guest.id;

  const handleLocalDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const guestId = e.dataTransfer.getData('text/plain');
    
    if (!guestId) return;

    if (seat.guestId && seat.guestId !== guestId) {
      setConflictMessage('❌ 该座位已有宾客，请选择空座位');
      setTimeout(() => setConflictMessage(null), 2000);
      return;
    }

    handleDrop(e, tableId, seat.positionIndex);
  };

  const handleDoubleClick = () => {
    if (guest) {
      unseatGuest(guest.id);
    }
  };

  const handleSeatDragStart = (e: React.DragEvent) => {
    if (guest) {
      handleDragStart(e, guest.id);
    }
  };

  const liveConflict = draggingGuestId && !seat.guestId 
    ? checkConflicts(draggingGuestId, tableId, seat.positionIndex)
    : { hasConflict: false };

  const showConflict = hasConflict || liveConflict.hasConflict;

  return (
    <div
      className="absolute"
      style={{
        left: position.x,
        top: position.y,
        transform: 'translate(-50%, -50%)',
      }}
    >
      <div
        draggable={!!guest}
        onDragStart={handleSeatDragStart}
        onDragEnd={handleDragEnd}
        onDragOver={(e) => handleDragOver(e, seat.id)}
        onDragLeave={handleDragLeave}
        onDrop={handleLocalDrop}
        onDoubleClick={handleDoubleClick}
        className={`
          relative rounded-full flex items-center justify-center
          transition-all duration-200 cursor-pointer
          ${guest ? 'draggable cursor-grab active:cursor-grabbing' : ''}
          ${isDraggingThis ? 'opacity-40 scale-90' : ''}
          will-change-transform
        `}
        style={{
          width: 56,
          height: 56,
          border: `3px solid ${showConflict ? '#DC2626' : isHovered ? '#F59E0B' : guest ? '#D97706' : '#A8A29E'}`,
          backgroundColor: guest ? guest.avatarColor : (isHovered ? '#FEF3C7' : '#FAFAF0'),
          boxShadow: showConflict
            ? '0 0 0 4px rgba(220, 38, 38, 0.3), 0 0 20px rgba(220, 38, 38, 0.5)'
            : isHovered
              ? '0 0 0 4px rgba(245, 158, 11, 0.3), 0 4px 12px rgba(0,0,0,0.15)'
              : guest
                ? '0 2px 8px rgba(0,0,0,0.2)'
                : '0 1px 3px rgba(0,0,0,0.1)',
          animation: showConflict ? 'shake 0.5s ease-in-out' : undefined,
        }}
      >
        {guest ? (
          <div className="flex flex-col items-center justify-center text-white">
            <span className="font-bold text-sm leading-none">{guest.name.charAt(0)}</span>
          </div>
        ) : (
          <span className="text-stone-400 text-xs font-medium">空</span>
        )}

        {guest && (
          <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap">
            <div className="bg-white px-2 py-0.5 rounded text-xs font-medium shadow-md border border-stone-200 max-w-[80px] overflow-hidden text-ellipsis">
              {guest.name}
            </div>
            <div className="text-[10px] text-center mt-0.5 text-stone-500">
              {SENIORITY_LABELS[guest.seniority]}
            </div>
          </div>
        )}

        {isHovered && !guest && (
          <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-amber-500 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-20 shadow-lg">
            拖放到此落座
          </div>
        )}

        {showConflict && (
          <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-red-600 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-20 shadow-lg animate-pulse">
            ❌ 冲突
          </div>
        )}
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-3px); }
          75% { transform: translateX(3px); }
        }
      `}</style>
    </div>
  );
});

SeatSlot.displayName = 'SeatSlot';
