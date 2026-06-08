import React, { memo } from 'react';
import { X, Check } from 'lucide-react';
import type { Guest } from '../../types';
import { SENIORITY_LABELS, SENIORITY_COLORS } from '../../types';
import { useSeatingStore } from '../../store/useSeatingStore';
import { useDragDrop } from '../../hooks/useDragDrop';

interface GuestCardProps {
  guest: Guest;
  isSelected?: boolean;
  compact?: boolean;
  showRemove?: boolean;
}

export const GuestCard: React.FC<GuestCardProps> = memo(({
  guest,
  isSelected = false,
  compact = false,
  showRemove = true,
}) => {
  const { selectGuest, removeGuest, isGuestSeated, isMultiSelectMode } = useSeatingStore();
  const { handleDragStart, handleDragEnd, draggingGuestId } = useDragDrop();

  const isDragging = draggingGuestId === guest.id;
  const isSeated = isGuestSeated(guest.id);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    selectGuest(guest.id, e.ctrlKey || e.metaKey);
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    removeGuest(guest.id);
  };

  return (
    <div
      draggable={!isMultiSelectMode}
      onDragStart={(e) => !isMultiSelectMode && handleDragStart(e, guest.id)}
      onDragEnd={handleDragEnd}
      onClick={handleClick}
      className={`
        relative group ${isMultiSelectMode ? 'cursor-pointer' : 'cursor-grab active:cursor-grabbing'}
        bg-gradient-to-br from-stone-50 to-amber-50
        border-2 rounded-lg p-3 transition-all duration-200
        hover:shadow-lg hover:-translate-y-0.5
        ${isDragging ? 'opacity-50 rotate-[-2deg] scale-105' : ''}
        ${isSelected ? 'border-blue-500 ring-2 ring-blue-300 bg-blue-50/50' : 'border-amber-200'}
        ${isSeated ? 'opacity-60' : ''}
        ${compact ? 'p-2 text-sm' : 'p-3'}
        will-change-transform
        select-none
      `}
      style={{
        boxShadow: isDragging
          ? '0 10px 40px rgba(0,0,0,0.2)'
          : isSelected
            ? '0 4px 12px rgba(59, 130, 246, 0.2)'
            : '0 2px 8px rgba(139, 69, 19, 0.1)',
      }}
    >
      {isMultiSelectMode && (
        <div
          className={`
            absolute top-2 left-2 w-5 h-5 rounded border-2 flex items-center justify-center
            transition-all duration-200 z-10
            ${isSelected 
              ? 'bg-blue-500 border-blue-500 text-white' 
              : 'bg-white border-stone-300 hover:border-blue-400'
            }
          `}
        >
          {isSelected && <Check size={12} />}
        </div>
      )}

      {showRemove && (
        <button
          onClick={handleRemove}
          className="
            absolute -top-2 -right-2 w-5 h-5
            bg-red-500 hover:bg-red-600 text-white
            rounded-full opacity-0 group-hover:opacity-100
            transition-opacity duration-200 flex items-center justify-center
            text-xs z-10
          "
        >
          <X size={12} />
        </button>
      )}

      <div className="flex items-center gap-3">
        <div
          className="flex-shrink-0 rounded-full flex items-center justify-center text-white font-bold shadow-inner"
          style={{
            width: compact ? 32 : 40,
            height: compact ? 32 : 40,
            backgroundColor: guest.avatarColor,
            backgroundImage: `radial-gradient(circle at 30% 30%, ${guest.avatarColor}dd, ${guest.avatarColor})`,
          }}
        >
          {guest.name.charAt(0)}
        </div>

        <div className="flex-1 min-w-0">
          <div className="font-semibold text-stone-800 truncate flex items-center gap-2">
            {guest.name}
            {isSeated && (
              <span className="text-xs text-stone-400">✓ 已入座</span>
            )}
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className={`text-xs px-2 py-0.5 rounded-full ${SENIORITY_COLORS[guest.seniority]}`}>
              {SENIORITY_LABELS[guest.seniority]}
            </span>
          </div>
          {!compact && guest.dietaryNote && (
            <div className="text-xs text-stone-500 mt-1 truncate" title={guest.dietaryNote}>
              🥢 {guest.dietaryNote}
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

GuestCard.displayName = 'GuestCard';
