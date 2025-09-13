import React, { useState, useCallback } from 'react';

export interface DragPosition {
  top?: number;
  left?: number;
  right?: number;
  bottom?: number;
}

interface UseDraggableOptions {
  top?: number;
  left?: number;
  right?: number;
  bottom?: number;
}

export const useDraggable = (initialPosition: UseDraggableOptions = {}) => {
  const [position, setPosition] = useState<DragPosition>({
    top: initialPosition.top,
    left: initialPosition.left,
    right: initialPosition.right,
    bottom: initialPosition.bottom,
  });

  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
    e.preventDefault();
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !dragStart) return;

    const deltaX = e.clientX - dragStart.x;
    const deltaY = e.clientY - dragStart.y;

    setPosition(prev => ({
      ...prev,
      top: prev.top !== undefined ? (prev.top + deltaY) : undefined,
      left: prev.left !== undefined ? (prev.left + deltaX) : undefined,
      right: prev.right !== undefined ? (prev.right - deltaX) : undefined,
      bottom: prev.bottom !== undefined ? (prev.bottom - deltaY) : undefined,
    }));

    setDragStart({ x: e.clientX, y: e.clientY });
  }, [isDragging, dragStart]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setDragStart(null);
  }, []);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    setIsDragging(true);
    const touch = e.touches[0];
    setDragStart({ x: touch.clientX, y: touch.clientY });
  }, []);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isDragging || !dragStart) return;

    const touch = e.touches[0];
    const deltaX = touch.clientX - dragStart.x;
    const deltaY = touch.clientY - dragStart.y;

    setPosition(prev => ({
      ...prev,
      top: prev.top !== undefined ? (prev.top + deltaY) : undefined,
      left: prev.left !== undefined ? (prev.left + deltaX) : undefined,
      right: prev.right !== undefined ? (prev.right - deltaX) : undefined,
      bottom: prev.bottom !== undefined ? (prev.bottom - deltaY) : undefined,
    }));

    setDragStart({ x: touch.clientX, y: touch.clientY });
  }, [isDragging, dragStart]);

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
    setDragStart(null);
  }, []);

  // Adicionar event listeners globais quando dragging
  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchmove', handleTouchMove);
      document.addEventListener('touchend', handleTouchEnd);

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleTouchEnd);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp, handleTouchMove, handleTouchEnd]);

  const eventHandlers = {
    onMouseDown: handleMouseDown,
    onTouchStart: handleTouchStart,
  };

  return {
    position,
    eventHandlers,
    isDragging,
  };
};
