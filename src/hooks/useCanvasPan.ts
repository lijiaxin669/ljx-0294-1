import { useState, useCallback, useRef } from 'react';

interface PanState {
  x: number;
  y: number;
  scale: number;
}

export const useCanvasPan = (initialScale: number = 1) => {
  const [pan, setPan] = useState<PanState>({ x: 0, y: 0, scale: initialScale });
  const [isPanning, setIsPanning] = useState(false);
  const panStart = useRef({ x: 0, y: 0, panX: 0, panY: 0 });

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 1 && !e.altKey) return;
    e.preventDefault();
    setIsPanning(true);
    panStart.current = {
      x: e.clientX,
      y: e.clientY,
      panX: pan.x,
      panY: pan.y,
    };
  }, [pan.x, pan.y]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isPanning) return;
    const dx = e.clientX - panStart.current.x;
    const dy = e.clientY - panStart.current.y;
    setPan(prev => ({
      ...prev,
      x: panStart.current.panX + dx,
      y: panStart.current.panY + dy,
    }));
  }, [isPanning]);

  const handleMouseUp = useCallback(() => {
    setIsPanning(false);
  }, []);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (!e.ctrlKey && !e.metaKey) return;
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setPan(prev => ({
      ...prev,
      scale: Math.max(0.3, Math.min(2, prev.scale * delta)),
    }));
  }, []);

  const resetPan = useCallback(() => {
    setPan({ x: 0, y: 0, scale: initialScale });
  }, [initialScale]);

  return {
    pan,
    isPanning,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleWheel,
    resetPan,
  };
};
