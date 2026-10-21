"use client";

import { useCallback, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";

export type PanelAnchorOrigin = "top-left" | "top-right" | "bottom-right" | "bottom-left";

export type ClampedOffsetOptions = {
  dx: number;
  dy: number;
  initialOffsetX: number;
  initialOffsetY: number;
  anchorOrigin?: PanelAnchorOrigin;
  viewportWidth?: number;
  viewportHeight?: number;
  margin?: number;
  minVisible?: number;
};

/**
 * Calculates a bounded translate3d offset so that a floating panel stays
 * securely within the viewport boundaries during dragging.
 */
export function calculateClampedPanelOffset({
  dx,
  dy,
  initialOffsetX,
  initialOffsetY,
  anchorOrigin = "top-right",
  viewportWidth = 1200,
  viewportHeight = 800,
  margin = 20,
  minVisible = 100,
}: ClampedOffsetOptions): { x: number; y: number } {
  const nextX = initialOffsetX + dx;
  const nextY = initialOffsetY + dy;

  let clampedX: number;
  if (anchorOrigin === "top-left" || anchorOrigin === "bottom-left") {
    // Left-anchored: moving left is negative, capped at -margin (won't slide off left edge)
    // Moving right is positive, capped at viewportWidth - minVisible
    clampedX = Math.max(-margin, Math.min(viewportWidth - minVisible, nextX));
  } else {
    // Right-anchored: moving right is positive, capped at margin (won't slide off right edge)
    // Moving left is negative, capped at -(viewportWidth - minVisible)
    clampedX = Math.max(-(viewportWidth - minVisible), Math.min(margin, nextX));
  }

  let clampedY: number;
  if (anchorOrigin === "top-left" || anchorOrigin === "top-right") {
    // Top-anchored: moving up is negative, capped at -margin (won't slide off top edge)
    // Moving down is positive, capped at viewportHeight - minVisible
    clampedY = Math.max(-margin, Math.min(viewportHeight - minVisible, nextY));
  } else {
    // Bottom-anchored: moving down is positive, capped at margin (won't slide off bottom edge)
    // Moving up is negative, capped at -(viewportHeight - minVisible) (won't slide off top edge)
    clampedY = Math.max(-(viewportHeight - minVisible), Math.min(margin, nextY));
  }

  return { x: clampedX, y: clampedY };
}

export type UseDraggablePanelOptions = {
  anchorOrigin?: PanelAnchorOrigin;
  margin?: number;
  minVisible?: number;
};

export type UseDraggablePanelReturn = {
  offset: { x: number; y: number };
  isDragging: boolean;
  dragHandleProps: {
    onPointerDown: (e: ReactPointerEvent<HTMLElement>) => void;
    onPointerMove: (e: ReactPointerEvent<HTMLElement>) => void;
    onPointerUp: (e: ReactPointerEvent<HTMLElement>) => void;
    onPointerCancel: (e: ReactPointerEvent<HTMLElement>) => void;
    "data-dragging": boolean;
  };
  panelStyle: {
    transform: string;
  };
  resetOffset: () => void;
};

/**
 * Declarative hook for making floating map panels draggable by their title/handle.
 */
export function useDraggablePanel({
  anchorOrigin = "top-right",
  margin = 20,
  minVisible = 100,
}: UseDraggablePanelOptions = {}): UseDraggablePanelReturn {
  const [offset, setOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    initialOffsetX: number;
    initialOffsetY: number;
    viewportWidth: number;
    viewportHeight: number;
  } | null>(null);

  const handlePointerDown = useCallback((e: ReactPointerEvent<HTMLElement>) => {
    // Primary button only
    if (e.button !== 0) return;

    // Do not initiate drag if user interacted with buttons, links, or inputs
    const target = e.target as HTMLElement;
    if (target.closest("button") || target.closest("a") || target.closest("input") || target.closest("select")) {
      return;
    }

    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {}

    const panelEl = (e.currentTarget.closest("aside") ||
      e.currentTarget.closest("[class*='Rail']") ||
      e.currentTarget.closest("[class*='Info']") ||
      e.currentTarget.parentElement) as HTMLElement | null;

    const containerEl = panelEl?.offsetParent as HTMLElement | null;
    const viewportWidth = containerEl?.clientWidth ?? (typeof window !== "undefined" ? window.innerWidth : 1200);
    const viewportHeight = containerEl?.clientHeight ?? (typeof window !== "undefined" ? window.innerHeight : 800);

    dragStartRef.current = {
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      initialOffsetX: offset.x,
      initialOffsetY: offset.y,
      viewportWidth,
      viewportHeight,
    };
    setIsDragging(true);
  }, [offset]);

  const handlePointerMove = useCallback((e: ReactPointerEvent<HTMLElement>) => {
    if (!dragStartRef.current || dragStartRef.current.pointerId !== e.pointerId) return;

    const dx = e.clientX - dragStartRef.current.startX;
    const dy = e.clientY - dragStartRef.current.startY;

    const clamped = calculateClampedPanelOffset({
      dx,
      dy,
      initialOffsetX: dragStartRef.current.initialOffsetX,
      initialOffsetY: dragStartRef.current.initialOffsetY,
      anchorOrigin,
      viewportWidth: dragStartRef.current.viewportWidth,
      viewportHeight: dragStartRef.current.viewportHeight,
      margin,
      minVisible,
    });

    setOffset(clamped);
  }, [anchorOrigin, margin, minVisible]);

  const handlePointerUp = useCallback((e: ReactPointerEvent<HTMLElement>) => {
    if (dragStartRef.current && dragStartRef.current.pointerId === e.pointerId) {
      dragStartRef.current = null;
      setIsDragging(false);
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {}
    }
  }, []);

  const resetOffset = useCallback(() => {
    setOffset((prev) => (prev.x === 0 && prev.y === 0 ? prev : { x: 0, y: 0 }));
  }, []);

  const dragHandleProps = useMemo(
    () => ({
      onPointerDown: handlePointerDown,
      onPointerMove: handlePointerMove,
      onPointerUp: handlePointerUp,
      onPointerCancel: handlePointerUp,
      "data-dragging": isDragging,
    }),
    [handlePointerDown, handlePointerMove, handlePointerUp, isDragging],
  );

  const panelStyle = useMemo(
    () => ({
      transform: `translate3d(${offset.x}px, ${offset.y}px, 0)`,
    }),
    [offset.x, offset.y],
  );

  return useMemo(
    () => ({
      offset,
      isDragging,
      dragHandleProps,
      panelStyle,
      resetOffset,
    }),
    [offset, isDragging, dragHandleProps, panelStyle, resetOffset],
  );
}
