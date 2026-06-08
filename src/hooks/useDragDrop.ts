import { useCallback, useRef } from 'react';
import { useSeatingStore } from '../store/useSeatingStore';

interface DragState {
  isDragging: boolean;
  guestId: string | null;
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
}

export const useDragDrop = () => {
  const {
    seatGuest,
    unseatGuest,
    setDraggingGuest,
    setHoveredSeat,
    setConflictMessage,
    checkConflicts,
    draggingGuestId,
  } = useSeatingStore();

  const dragState = useRef<DragState>({
    isDragging: false,
    guestId: null,
    startX: 0,
    startY: 0,
    currentX: 0,
    currentY: 0,
  });

  const handleDragStart = useCallback((e: React.DragEvent, guestId: string) => {
    dragState.current = {
      isDragging: true,
      guestId,
      startX: e.clientX,
      startY: e.clientY,
      currentX: e.clientX,
      currentY: e.clientY,
    };
    setDraggingGuest(guestId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', guestId);
  }, [setDraggingGuest]);

  const handleDragEnd = useCallback(() => {
    dragState.current.isDragging = false;
    dragState.current.guestId = null;
    setDraggingGuest(null);
    setHoveredSeat(null);
  }, [setDraggingGuest, setHoveredSeat]);

  const handleDragOver = useCallback((e: React.DragEvent, seatId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setHoveredSeat(seatId);
  }, [setHoveredSeat]);

  const handleDragLeave = useCallback(() => {
    setHoveredSeat(null);
    setConflictMessage(null);
  }, [setHoveredSeat, setConflictMessage]);

  const handleDrop = useCallback((e: React.DragEvent, tableId: string, positionIndex: number) => {
    e.preventDefault();
    const guestId = e.dataTransfer.getData('text/plain');
    
    if (!guestId) return;

    const conflict = checkConflicts(guestId, tableId, positionIndex);
    
    if (conflict.hasConflict) {
      setConflictMessage(conflict.message);
      setTimeout(() => setConflictMessage(null), 2000);
      handleDragEnd();
      return;
    }

    const result = seatGuest(guestId, tableId, positionIndex);
    
    if (result.hasConflict) {
      setTimeout(() => setConflictMessage(null), 2000);
    }
    
    handleDragEnd();
  }, [seatGuest, checkConflicts, setConflictMessage, handleDragEnd]);

  const handleTableDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  return {
    handleDragStart,
    handleDragEnd,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleTableDragOver,
    draggingGuestId,
  };
};
