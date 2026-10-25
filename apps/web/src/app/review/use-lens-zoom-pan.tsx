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

/**
 * Pure invariant formula for zooming & panning around an anchor point (e.g. 2-finger touch midpoint).
 * Guarantees that the content point under anchor (anchorX, anchorY) remains stationary as zoom scales,
 * and tracks any translation delta (midDx, midDy) simultaneously.
 */
export function calculatePinchZoomPan({
  currentZoom,
  currentPan,
  anchorX,
  anchorY,
  scaleFactor,
  minZoom = 0.35,
  maxZoom = 4.0,
  midDx = 0,
  midDy = 0,
}: {
  currentZoom: number;
  currentPan: { x: number; y: number };
  anchorX: number;
  anchorY: number;
  scaleFactor: number;
  minZoom?: number;
  maxZoom?: number;
  midDx?: number;
  midDy?: number;
}): { zoom: number; pan: { x: number; y: number } } {
  const nextZoom = Math.min(
    maxZoom,
    Math.max(minZoom, Number((currentZoom * scaleFactor).toFixed(4))),
  );
  const effectiveScale = nextZoom / currentZoom;
  const nextPanX = anchorX - effectiveScale * (anchorX - currentPan.x) + midDx;
  const nextPanY = anchorY - effectiveScale * (anchorY - currentPan.y) + midDy;
  return {
    zoom: nextZoom,
    pan: { x: nextPanX, y: nextPanY },
  };
}

export function calculateCenterOnPan({
  targetX,
  targetY,
  targetZoom,
  viewBoxW = 640,
  viewBoxH = 400,
}: {
  targetX: number;
  targetY: number;
  targetZoom: number;
  viewBoxW?: number;
  viewBoxH?: number;
}): { x: number; y: number } {
  const cx = viewBoxW / 2;
  const cy = viewBoxH / 2;
  return {
    x: cx - targetX * targetZoom,
    y: cy - targetY * targetZoom,
  };
}

export function calculateInertiaStep({
  vx,
  vy,
  friction = 0.92,
  minSpeed = 0.2,
}: {
  vx: number;
  vy: number;
  friction?: number;
  minSpeed?: number;
}): { nextVx: number; nextVy: number; isStopped: boolean } {
  const nextVx = vx * friction;
  const nextVy = vy * friction;
  const speed = Math.hypot(nextVx, nextVy);
  return {
    nextVx,
    nextVy,
    isStopped: speed < minSpeed,
  };
}

export function evaluateDragDelta({
  dx,
  dy,
  threshold = 6,
}: {
  dx: number;
  dy: number;
  threshold?: number;
}): { isDrag: boolean; dist: number } {
  const dist = Math.hypot(dx, dy);
  return {
    isDrag: dist > threshold,
    dist,
  };
}

export function useLensZoomPan(options: UseLensZoomPanOptions = {}) {
  const {
    initialZoom = 1,
    minZoom = 0.35,
    maxZoom = 4.0,
  } = options;

  const [zoom, setZoom] = useState(initialZoom);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [isCentering, setIsCentering] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const viewportRef = useRef<HTMLDivElement>(null);
  const centeringTimerRef = useRef<number | null>(null);

  const zoomRef = useRef(zoom);
  zoomRef.current = zoom;
  const panRef = useRef(pan);
  panRef.current = pan;

  // Active multi-touch pointers (pointerId -> { clientX, clientY })
  const activePointersRef = useRef<Map<number, { clientX: number; clientY: number }>>(new Map());

  // Pinch gesture tracking
  const pinchStateRef = useRef<{
    lastDist: number;
    lastMidScreen: { x: number; y: number };
  } | null>(null);

  // Single-drag / pan tracking
  const dragStartRef = useRef<{
    lastScreen: { x: number; y: number };
    totalMoved: number;
    hasMoved: boolean;
  }>({
    lastScreen: { x: 0, y: 0 },
    totalMoved: 0,
    hasMoved: false,
  });

  // Velocity tracking for momentum flick scrolling
  const velocityHistoryRef = useRef<Array<{ x: number; y: number; t: number }>>([]);
  const momentumRafIdRef = useRef<number | null>(null);

  // Double-tap tracking for mobile
  const lastTapRef = useRef<{ time: number; x: number; y: number } | null>(null);

  const cancelMomentum = useCallback(() => {
    if (momentumRafIdRef.current !== null) {
      window.cancelAnimationFrame(momentumRafIdRef.current);
      momentumRafIdRef.current = null;
    }
  }, []);

  // Core zoom function centered on SVG coordinate point (anchorX, anchorY)
  // Keeps the exact content point under (anchorX, anchorY) invariant
  const zoomToPoint = useCallback(
    (anchorX: number, anchorY: number, factor: number) => {
      const next = calculatePinchZoomPan({
        currentZoom: zoomRef.current,
        currentPan: panRef.current,
        anchorX,
        anchorY,
        scaleFactor: factor,
        minZoom,
        maxZoom,
      });
      if (
        next.zoom === zoomRef.current &&
        next.pan.x === panRef.current.x &&
        next.pan.y === panRef.current.y
      ) {
        return;
      }
      setZoom(next.zoom);
      setPan(next.pan);
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
      const factor = delta > 0 ? 1.25 : 1 / 1.25;
      zoomToPoint(pt.x, pt.y, factor);
    },
    [zoomToPoint],
  );

  const handleResetZoom = useCallback(() => {
    cancelMomentum();
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
  }, [initialZoom, cancelMomentum]);

  const toggleExpand = useCallback(() => {
    setIsExpanded((prev) => !prev);
  }, []);

  const centerOn = useCallback(
    (targetX: number, targetY: number, targetZoom?: number) => {
      cancelMomentum();
      const el = viewportRef.current;
      const svg = el?.querySelector("svg");
      const viewBoxW = svg?.viewBox?.baseVal?.width || 640;
      const viewBoxH = svg?.viewBox?.baseVal?.height || 400;

      const nextZoom =
        targetZoom !== undefined
          ? targetZoom
          : Math.min(maxZoom, Math.max(zoomRef.current, 1.0));
      const nextPan = calculateCenterOnPan({
        targetX,
        targetY,
        targetZoom: nextZoom,
        viewBoxW,
        viewBoxH,
      });

      if (centeringTimerRef.current) {
        window.clearTimeout(centeringTimerRef.current);
      }
      setIsCentering(true);
      setZoom(nextZoom);
      setPan(nextPan);

      centeringTimerRef.current = window.setTimeout(() => {
        setIsCentering(false);
        centeringTimerRef.current = null;
      }, 450);
    },
    [maxZoom, cancelMomentum],
  );

  // Momentum coasting animation on finger release
  const startMomentum = useCallback(
    (initialVx: number, initialVy: number) => {
      cancelMomentum();
      let vx = Math.min(45, Math.max(-45, initialVx));
      let vy = Math.min(45, Math.max(-45, initialVy));

      const step = () => {
        const nextStep = calculateInertiaStep({ vx, vy });
        vx = nextStep.nextVx;
        vy = nextStep.nextVy;
        if (nextStep.isStopped) {
          momentumRafIdRef.current = null;
          return;
        }
        setPan((prev) => ({ x: prev.x + vx, y: prev.y + vy }));
        momentumRafIdRef.current = window.requestAnimationFrame(step);
      };
      momentumRafIdRef.current = window.requestAnimationFrame(step);
    },
    [cancelMomentum],
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (centeringTimerRef.current) {
        window.clearTimeout(centeringTimerRef.current);
      }
      cancelMomentum();
    };
  }, [cancelMomentum]);

  // Listen for Escape key to exit expanded/fullscreen mode
  useEffect(() => {
    if (!isExpanded) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsExpanded(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isExpanded]);

  // Mouse wheel / trackpad pinch zoom centered on mouse cursor position (MapLibre equivalent)
  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      cancelMomentum();
      const pt = getSvgPoint(el, e.clientX, e.clientY);

      // Wheel up (negative deltaY) zooms in, wheel down (positive deltaY) zooms out
      const factor = e.deltaY < 0 ? 1.15 : 1 / 1.15;
      zoomToPoint(pt.x, pt.y, factor);
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      el.removeEventListener("wheel", onWheel);
    };
  }, [zoomToPoint, cancelMomentum]);

  // Unified Pointer Down (Multi-touch Map-like handling)
  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    if ((e.target as HTMLElement).closest?.("button")) return;

    cancelMomentum();

    const el = viewportRef.current;
    if (!el) return;

    activePointersRef.current.set(e.pointerId, { clientX: e.clientX, clientY: e.clientY });
    const pointerCount = activePointersRef.current.size;

    if (pointerCount === 1) {
      dragStartRef.current = {
        lastScreen: { x: e.clientX, y: e.clientY },
        totalMoved: 0,
        hasMoved: false,
      };
      velocityHistoryRef.current = [{ x: e.clientX, y: e.clientY, t: performance.now() }];
      pinchStateRef.current = null;
    } else if (pointerCount === 2) {
      // Transition immediately into 2-finger pinch mode with zero jump
      const [p1, p2] = Array.from(activePointersRef.current.values());
      const dist = Math.hypot(p1.clientX - p2.clientX, p1.clientY - p2.clientY);
      const midX = (p1.clientX + p2.clientX) / 2;
      const midY = (p1.clientY + p2.clientY) / 2;

      pinchStateRef.current = {
        lastDist: dist,
        lastMidScreen: { x: midX, y: midY },
      };
      dragStartRef.current.hasMoved = true;
      setIsPanning(true);
      try {
        (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
      } catch {
        // capture fallback
      }
    }
  }, [cancelMomentum]);

  // Unified Pointer Move (1-finger pan & 2-finger pinch-zoom simultaneous)
  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!activePointersRef.current.has(e.pointerId)) return;
    activePointersRef.current.set(e.pointerId, { clientX: e.clientX, clientY: e.clientY });

    const el = viewportRef.current;
    if (!el) return;

    const pointerCount = activePointersRef.current.size;

    if (pointerCount === 1) {
      // Single pointer drag / pan
      const clientDx = e.clientX - dragStartRef.current.lastScreen.x;
      const clientDy = e.clientY - dragStartRef.current.lastScreen.y;
      const dist = Math.hypot(clientDx, clientDy);
      dragStartRef.current.totalMoved += dist;
      dragStartRef.current.lastScreen = { x: e.clientX, y: e.clientY };

      if (dragStartRef.current.totalMoved > 6) {
        if (!dragStartRef.current.hasMoved) {
          dragStartRef.current.hasMoved = true;
          setIsPanning(true);
          try {
            (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
          } catch {
            // capture fallback
          }
        }

        const svgPt = getSvgPoint(el, e.clientX, e.clientY);
        const panDx = clientDx * svgPt.ratioX;
        const panDy = clientDy * svgPt.ratioY;

        setPan((prev) => ({
          x: prev.x + panDx,
          y: prev.y + panDy,
        }));

        // Record velocity for momentum
        const now = performance.now();
        velocityHistoryRef.current.push({ x: e.clientX, y: e.clientY, t: now });
        if (velocityHistoryRef.current.length > 8) {
          velocityHistoryRef.current.shift();
        }
      }
    } else if (pointerCount === 2) {
      // Two-pointer pinch & pan simultaneous (MapLibre experience)
      dragStartRef.current.totalMoved += 12;
      dragStartRef.current.hasMoved = true;
      if (!isPanning) setIsPanning(true);

      const [p1, p2] = Array.from(activePointersRef.current.values());
      const currentDist = Math.hypot(p1.clientX - p2.clientX, p1.clientY - p2.clientY);
      const midX = (p1.clientX + p2.clientX) / 2;
      const midY = (p1.clientY + p2.clientY) / 2;

      if (pinchStateRef.current && pinchStateRef.current.lastDist > 1) {
        const scaleFactor = currentDist / pinchStateRef.current.lastDist;
        const midSvg = getSvgPoint(el, midX, midY);
        const midDx = (midX - pinchStateRef.current.lastMidScreen.x) * midSvg.ratioX;
        const midDy = (midY - pinchStateRef.current.lastMidScreen.y) * midSvg.ratioY;

        const next = calculatePinchZoomPan({
          currentZoom: zoomRef.current,
          currentPan: panRef.current,
          anchorX: midSvg.x,
          anchorY: midSvg.y,
          scaleFactor,
          minZoom,
          maxZoom,
          midDx,
          midDy,
        });

        setZoom(next.zoom);
        setPan(next.pan);

        pinchStateRef.current.lastDist = currentDist;
        pinchStateRef.current.lastMidScreen = { x: midX, y: midY };
      }
    }
  }, [isPanning, maxZoom, minZoom]);

  // Unified Pointer Up / Cancel
  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    activePointersRef.current.delete(e.pointerId);

    try {
      if ((e.currentTarget as HTMLElement).hasPointerCapture?.(e.pointerId)) {
        (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
      }
    } catch {
      // release fallback
    }

    const remainingPointers = activePointersRef.current.size;

    if (remainingPointers === 1) {
      // 1 finger lifted, 1 remaining: smoothly continue single-finger pan without jumping
      const remaining = activePointersRef.current.values().next().value;
      if (remaining) {
        dragStartRef.current.lastScreen = { x: remaining.clientX, y: remaining.clientY };
      }
      pinchStateRef.current = null;
    } else if (remainingPointers === 0) {
      // All fingers lifted
      pinchStateRef.current = null;
      setIsPanning(false);

      const el = viewportRef.current;
      const now = performance.now();
      const wasTouch = e.pointerType === "touch";

      // Touch Double-Tap to Zoom In / Reset
      if (wasTouch && dragStartRef.current.totalMoved < 10) {
        if (
          lastTapRef.current &&
          now - lastTapRef.current.time < 320 &&
          Math.hypot(e.clientX - lastTapRef.current.x, e.clientY - lastTapRef.current.y) < 28
        ) {
          lastTapRef.current = null;
          dragStartRef.current.hasMoved = true;
          if (el) {
            const pt = getSvgPoint(el, e.clientX, e.clientY);
            if (zoomRef.current > 1.6) {
              handleResetZoom();
            } else {
              zoomToPoint(pt.x, pt.y, 1.6);
            }
          }
          return;
        } else {
          lastTapRef.current = { time: now, x: e.clientX, y: e.clientY };
        }
      }

      // Momentum trigger on finger flick
      if (dragStartRef.current.totalMoved > 10 && el) {
        const history = velocityHistoryRef.current;
        if (history.length >= 2) {
          const oldest = history[0];
          const latest = history[history.length - 1];
          const dt = latest.t - oldest.t;
          if (dt > 12 && dt < 140) {
            const svgPt = getSvgPoint(el, latest.x, latest.y);
            const vx = ((latest.x - oldest.x) / dt) * svgPt.ratioX * 16;
            const vy = ((latest.y - oldest.y) / dt) * svgPt.ratioY * 16;
            const speed = Math.hypot(vx, vy);
            if (speed > 1.0) {
              startMomentum(vx, vy);
            }
          }
        }
      }

      // Suppress pending click if moved
      if (dragStartRef.current.hasMoved) {
        window.setTimeout(() => {
          dragStartRef.current.hasMoved = false;
          dragStartRef.current.totalMoved = 0;
        }, 80);
      } else {
        dragStartRef.current.hasMoved = false;
        dragStartRef.current.totalMoved = 0;
      }
    }
  }, [handleResetZoom, startMomentum, zoomToPoint]);

  // Double click for mouse devices
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
    return dragStartRef.current.hasMoved;
  }, []);

  return {
    zoom,
    pan,
    isPanning,
    isCentering,
    isExpanded,
    toggleExpand,
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
  isExpanded,
  onToggleExpand,
}: {
  zoom: number;
  onZoom: (delta: number) => void;
  onReset: () => void;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
}) {
  return (
    <div className={styles.lensZoomControls}>
      <button
        type="button"
        onClick={() => onZoom(-0.2)}
        aria-label="縮小"
        title="縮小"
      >
        −
      </button>
      <span>{Math.round(zoom * 100)}%</span>
      <button
        type="button"
        onClick={() => onZoom(0.2)}
        aria-label="拡大"
        title="拡大"
      >
        +
      </button>
      <button
        type="button"
        onClick={onReset}
        aria-label="初期表示に戻す"
        title="リセット"
        style={{ fontSize: 11, marginLeft: 2 }}
      >
        ↺
      </button>
      {onToggleExpand ? (
        <button
          type="button"
          onClick={onToggleExpand}
          aria-label={isExpanded ? "全画面を閉じる" : "全画面・拡大表示"}
          title={isExpanded ? "閉じる" : "全画面"}
          style={{
            fontSize: 12,
            borderLeft: "1px solid rgba(255, 255, 255, 0.2)",
            paddingLeft: 6,
            marginLeft: 2,
            color: isExpanded ? "var(--gold)" : "var(--ink)",
          }}
        >
          {isExpanded ? "✕" : "⛶"}
        </button>
      ) : null}
    </div>
  );
}
