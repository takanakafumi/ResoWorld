"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import styles from "./atlas.module.css";

export type UseLensZoomPanOptions = {
  initialZoom?: number;
  minZoom?: number;
  maxZoom?: number;
  zoomStep?: number;
};

export function useLensZoomPan(options: UseLensZoomPanOptions = {}) {
  const {
    initialZoom = 1,
    minZoom = 0.4,
    maxZoom = 3,
    zoomStep = 0.2,
  } = options;

  const [zoom, setZoom] = useState(initialZoom);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const viewportRef = useRef<HTMLDivElement>(null);

  const isPointerDownRef = useRef(false);
  const panStartRef = useRef<{
    startX: number;
    startY: number;
    panX: number;
    panY: number;
    hasMoved: boolean;
  }>({
    startX: 0,
    startY: 0,
    panX: 0,
    panY: 0,
    hasMoved: false,
  });

  const handleZoom = useCallback(
    (delta: number) => {
      setZoom((prev) =>
        Math.min(maxZoom, Math.max(minZoom, Number((prev + delta).toFixed(2)))),
      );
    },
    [minZoom, maxZoom],
  );

  const handleResetZoom = useCallback(() => {
    setZoom(initialZoom);
    setPan({ x: 0, y: 0 });
  }, [initialZoom]);

  // Mouse wheel / trackpad pinch zoom
  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const factor = e.deltaY < 0 ? zoomStep : -zoomStep;
      setZoom((prev) =>
        Math.min(maxZoom, Math.max(minZoom, Number((prev + factor).toFixed(2)))),
      );
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      el.removeEventListener("wheel", onWheel);
    };
  }, [zoomStep, minZoom, maxZoom]);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (e.button !== 0) return;
    if ((e.target as HTMLElement).closest?.("button")) return;

    isPointerDownRef.current = true;
    panStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      panX: pan.x,
      panY: pan.y,
      hasMoved: false,
    };
  }, [pan.x, pan.y]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isPointerDownRef.current) return;
    const dx = e.clientX - panStartRef.current.startX;
    const dy = e.clientY - panStartRef.current.startY;
    const dist = Math.hypot(dx, dy);

    if (dist > 4) {
      if (!panStartRef.current.hasMoved) {
        panStartRef.current.hasMoved = true;
        setIsPanning(true);
        try {
          (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
        } catch {
          // pointer capture fallback
        }
      }
      setPan({
        x: panStartRef.current.panX + dx,
        y: panStartRef.current.panY + dy,
      });
    }
  }, []);

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    if (isPointerDownRef.current) {
      isPointerDownRef.current = false;
      if (isPanning) {
        setIsPanning(false);
        try {
          (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
        } catch {
          // pointer capture release fallback
        }
      }
      window.setTimeout(() => {
        panStartRef.current.hasMoved = false;
      }, 60);
    }
  }, [isPanning]);

  const isClickSuppressed = useCallback(() => {
    return panStartRef.current.hasMoved;
  }, []);

  return {
    zoom,
    pan,
    isPanning,
    viewportRef,
    handleZoom,
    handleResetZoom,
    pointerHandlers: {
      onPointerDown: handlePointerDown,
      onPointerMove: handlePointerMove,
      onPointerUp: handlePointerUp,
    },
    isClickSuppressed,
  };
}

export function LensZoomControls({
  zoom,
  onZoom,
  onReset,
}: {
  zoom: number;
  onZoom: (delta: number) => void;
  onReset: () => void;
}) {
  return (
    <div className={styles.lensZoomControls}>
      <button
        type="button"
        onClick={() => onZoom(-0.2)}
        aria-label="縮小"
      >
        −
      </button>
      <span>{Math.round(zoom * 100)}%</span>
      <button
        type="button"
        onClick={() => onZoom(0.2)}
        aria-label="拡大"
      >
        +
      </button>
      <button
        type="button"
        onClick={onReset}
        aria-label="リセット"
        style={{ fontSize: 11, marginLeft: 2 }}
      >
        ↺
      </button>
    </div>
  );
}
