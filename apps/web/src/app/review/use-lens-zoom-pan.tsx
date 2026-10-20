"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import styles from "./atlas.module.css";

export type UseLensZoomPanOptions = {
  initialZoom?: number;
  minZoom?: number;
  maxZoom?: number;
  zoomStep?: number;
};

// Helper to convert screen client coordinates into SVG viewBox coordinate space
function getSvgPoint(
  viewportEl: HTMLElement | null,
  clientX: number,
  clientY: number,
): { x: number; y: number; ratioX: number; ratioY: number } {
  if (!viewportEl) return { x: 320, y: 200, ratioX: 1, ratioY: 1 };
  const svg = viewportEl.querySelector("svg");
  if (!svg) {
    const rect = viewportEl.getBoundingClientRect();
    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
      ratioX: 1,
      ratioY: 1,
    };
  }

  try {
    const ctm = svg.getScreenCTM();
    if (ctm) {
      const pt = svg.createSVGPoint();
      pt.x = clientX;
      pt.y = clientY;
      const svgP = pt.matrixTransform(ctm.inverse());
      const rect = svg.getBoundingClientRect();
      const viewBoxW = svg.viewBox?.baseVal?.width || rect.width || 1;
      const viewBoxH = svg.viewBox?.baseVal?.height || rect.height || 1;
      return {
        x: svgP.x,
        y: svgP.y,
        ratioX: viewBoxW / (rect.width || 1),
        ratioY: viewBoxH / (rect.height || 1),
      };
    }
  } catch {
    // Fallback if SVG matrix inversion is unavailable
  }

  const rect = svg.getBoundingClientRect();
  const viewBoxW = svg.viewBox?.baseVal?.width || rect.width || 1;
  const viewBoxH = svg.viewBox?.baseVal?.height || rect.height || 1;
  const ratioX = viewBoxW / (rect.width || 1);
  const ratioY = viewBoxH / (rect.height || 1);

  return {
    x: (clientX - rect.left) * ratioX,
    y: (clientY - rect.top) * ratioY,
    ratioX,
    ratioY,
  };
}

export function useLensZoomPan(options: UseLensZoomPanOptions = {}) {
  const {
    initialZoom = 1,
    minZoom = 0.4,
    maxZoom = 3.5,
  } = options;

  const [zoom, setZoom] = useState(initialZoom);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [isCentering, setIsCentering] = useState(false);
  const viewportRef = useRef<HTMLDivElement>(null);
  const centeringTimerRef = useRef<number | null>(null);

  const zoomRef = useRef(zoom);
  zoomRef.current = zoom;
  const panRef = useRef(pan);
  panRef.current = pan;

  const isPointerDownRef = useRef(false);
  const panStartRef = useRef<{
    startX: number;
    startY: number;
    panX: number;
    panY: number;
    ratioX: number;
    ratioY: number;
    hasMoved: boolean;
  }>({
    startX: 0,
    startY: 0,
    panX: 0,
    panY: 0,
    ratioX: 1,
    ratioY: 1,
    hasMoved: false,
  });

  // Core zoom function centered on SVG coordinate point (anchorX, anchorY)
  // Keeps the exact content point under (anchorX, anchorY) invariant
  const zoomToPoint = useCallback(
    (anchorX: number, anchorY: number, factor: number) => {
      const currentZoom = zoomRef.current;
      const currentPan = panRef.current;

      const nextZoom = Math.min(
        maxZoom,
        Math.max(minZoom, Number((currentZoom * factor).toFixed(3))),
      );
      if (nextZoom === currentZoom) return;

      const scaleRatio = nextZoom / currentZoom;
      const nextPanX = anchorX - (anchorX - currentPan.x) * scaleRatio;
      const nextPanY = anchorY - (anchorY - currentPan.y) * scaleRatio;

      setZoom(nextZoom);
      setPan({ x: nextPanX, y: nextPanY });
    },
    [minZoom, maxZoom],
  );

  const handleZoom = useCallback(
    (delta: number) => {
      const el = viewportRef.current;
      const rect = el?.getBoundingClientRect();
      const centerX = rect ? rect.left + rect.width / 2 : 300;
      const centerY = rect ? rect.top + rect.height / 2 : 200;
      const pt = getSvgPoint(el, centerX, centerY);
      const factor = delta > 0 ? 1.2 : 1 / 1.2;
      zoomToPoint(pt.x, pt.y, factor);
    },
    [zoomToPoint],
  );

  const handleResetZoom = useCallback(() => {
    if (centeringTimerRef.current) {
      window.clearTimeout(centeringTimerRef.current);
    }
    setIsCentering(true);
    setZoom(initialZoom);
    setPan({ x: 0, y: 0 });
    centeringTimerRef.current = window.setTimeout(() => {
      setIsCentering(false);
      centeringTimerRef.current = null;
    }, 450);
  }, [initialZoom]);

  const centerOn = useCallback(
    (targetX: number, targetY: number, targetZoom?: number) => {
      const el = viewportRef.current;
      const svg = el?.querySelector("svg");
      const viewBoxW = svg?.viewBox?.baseVal?.width || 640;
      const viewBoxH = svg?.viewBox?.baseVal?.height || 400;
      const cx = viewBoxW / 2;
      const cy = viewBoxH / 2;

      const nextZoom =
        targetZoom !== undefined
          ? targetZoom
          : Math.min(maxZoom, Math.max(zoomRef.current, 1.0));
      const nextPanX = cx - targetX * nextZoom;
      const nextPanY = cy - targetY * nextZoom;

      if (centeringTimerRef.current) {
        window.clearTimeout(centeringTimerRef.current);
      }
      setIsCentering(true);
      setZoom(nextZoom);
      setPan({ x: nextPanX, y: nextPanY });

      centeringTimerRef.current = window.setTimeout(() => {
        setIsCentering(false);
        centeringTimerRef.current = null;
      }, 450);
    },
    [maxZoom],
  );

  useEffect(() => {
    return () => {
      if (centeringTimerRef.current) {
        window.clearTimeout(centeringTimerRef.current);
      }
    };
  }, []);

  // Mouse wheel / trackpad pinch zoom centered on mouse cursor position (identical to MapLibre)
  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const pt = getSvgPoint(el, e.clientX, e.clientY);

      // Wheel up (negative deltaY) zooms in, wheel down (positive deltaY) zooms out
      const factor = e.deltaY < 0 ? 1.15 : 1 / 1.15;
      zoomToPoint(pt.x, pt.y, factor);
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      el.removeEventListener("wheel", onWheel);
    };
  }, [zoomToPoint]);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (e.button !== 0) return;
    if ((e.target as HTMLElement).closest?.("button")) return;

    const el = viewportRef.current;
    const pt = getSvgPoint(el, e.clientX, e.clientY);

    isPointerDownRef.current = true;
    panStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      panX: panRef.current.x,
      panY: panRef.current.y,
      ratioX: pt.ratioX,
      ratioY: pt.ratioY,
      hasMoved: false,
    };
  }, []);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isPointerDownRef.current) return;
    const clientDx = e.clientX - panStartRef.current.startX;
    const clientDy = e.clientY - panStartRef.current.startY;
    const dist = Math.hypot(clientDx, clientDy);

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
      const dx = clientDx * panStartRef.current.ratioX;
      const dy = clientDy * panStartRef.current.ratioY;
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

  // Double click on viewport to zoom in towards cursor or reset if already zoomed in
  const handleDoubleClick = useCallback(
    (e: React.MouseEvent) => {
      if ((e.target as HTMLElement).closest?.("button")) return;
      const el = viewportRef.current;
      if (!el) return;
      const pt = getSvgPoint(el, e.clientX, e.clientY);

      if (zoomRef.current > 1.4) {
        handleResetZoom();
      } else {
        zoomToPoint(pt.x, pt.y, 1.5);
      }
    },
    [handleResetZoom, zoomToPoint],
  );

  const isClickSuppressed = useCallback(() => {
    return panStartRef.current.hasMoved;
  }, []);

  return {
    zoom,
    pan,
    isPanning,
    isCentering,
    viewportRef,
    handleZoom,
    handleResetZoom,
    centerOn,
    zoomToPoint,
    pointerHandlers: {
      onPointerDown: handlePointerDown,
      onPointerMove: handlePointerMove,
      onPointerUp: handlePointerUp,
      onPointerCancel: handlePointerUp,
      onDoubleClick: handleDoubleClick,
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
