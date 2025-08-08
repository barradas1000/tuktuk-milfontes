import { useRef, useState } from "react";
import type React from "react";

export type DragPosition = { top: number; left?: number; right?: number };

export function useDraggable(initial: DragPosition = { top: 16, right: 16 }) {
  const [position, setPosition] = useState<DragPosition>(initial);
  const dragging = useRef(false);
  const offset = useRef({ x: 0, y: 0 });

  const onMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    dragging.current = true;
    const el = e.currentTarget;
    const rect = el.getBoundingClientRect();
    offset.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  };

  const onMouseMove = (e: MouseEvent) => {
    if (!dragging.current) return;
    const width = window.innerWidth;
    const height = window.innerHeight;
    const card = document.getElementById("draggable-distance-card");
    if (!card) return;
    const cardRect = card.getBoundingClientRect();
    let left = e.clientX - offset.current.x;
    let top = e.clientY - offset.current.y;
    left = Math.max(0, Math.min(left, width - cardRect.width));
    top = Math.max(0, Math.min(top, height - cardRect.height));
    setPosition({ left, top });
  };

  const onMouseUp = () => {
    dragging.current = false;
    document.removeEventListener("mousemove", onMouseMove);
    document.removeEventListener("mouseup", onMouseUp);
  };

  const onTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    dragging.current = true;
    const el = e.currentTarget;
    const rect = el.getBoundingClientRect();
    const touch = e.touches[0];
    offset.current = {
      x: touch.clientX - rect.left,
      y: touch.clientY - rect.top,
    };
    document.addEventListener("touchmove", onTouchMove);
    document.addEventListener("touchend", onTouchEnd);
  };

  const onTouchMove = (e: TouchEvent) => {
    if (!dragging.current) return;
    const width = window.innerWidth;
    const height = window.innerHeight;
    const card = document.getElementById("draggable-distance-card");
    if (!card) return;
    const cardRect = card.getBoundingClientRect();
    let left = e.touches[0].clientX - offset.current.x;
    let top = e.touches[0].clientY - offset.current.y;
    left = Math.max(0, Math.min(left, width - cardRect.width));
    top = Math.max(0, Math.min(top, height - cardRect.height));
    setPosition({ left, top });
  };

  const onTouchEnd = () => {
    dragging.current = false;
    document.removeEventListener("touchmove", onTouchMove);
    document.removeEventListener("touchend", onTouchEnd);
  };

  const reset = () => setPosition(initial);

  return {
    position,
    eventHandlers: {
      onMouseDown,
      onTouchStart,
    },
    reset,
  } as const;
}
