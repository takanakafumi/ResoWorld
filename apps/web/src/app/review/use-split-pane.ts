"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";

export type SplitPreset = "map-wide" | "balanced" | "panel-wide";

export const SPLIT_PRESETS: Record<SplitPreset, number> = {
  "map-wide": 65,
  balanced: 50,
  "panel-wide": 35,
};

const STORAGE_KEY_SPLIT_PERCENT = "resoworld:split-pane:map-percent";
const STORAGE_KEY_COLLAPSED = "resoworld:split-pane:is-collapsed";

export type CalculateClampedOptions = {
  containerWidth: number;
  pointerX: number;
  minLeftPx?: number;
  minRightPx?: number;
};

/**
 * Calculates a clamped percentage for the left (map) pane based on pointer X and container width.
 */
export function calculateClampedSplitPercent({
  containerWidth,
  pointerX,
  minLeftPx = 320,
  minRightPx = 320,
}: CalculateClampedOptions): number {
  if (containerWidth <= 0 || !Number.isFinite(containerWidth)) {
    return 50;
  }

  // Ensure minimum left/right constraints don't exceed container
  const safeMinLeft = Math.min(minLeftPx, containerWidth * 0.45);
  const safeMinRight = Math.min(minRightPx, containerWidth * 0.45);

  const clampedX = Math.max(safeMinLeft, Math.min(containerWidth - safeMinRight, pointerX));
  const rawPercent = (clampedX / containerWidth) * 100;
  return Math.round(rawPercent * 10) / 10;
}

export type UseSplitPaneOptions = {
  initialPercent?: number;
  minLeftPx?: number;
  minRightPx?: number;
  onResizeChange?: (percent: number, isCollapsed: boolean) => void;
};

export function useSplitPane({
  initialPercent = 50,
  minLeftPx = 320,
  minRightPx = 320,
  onResizeChange,
}: UseSplitPaneOptions = {}) {
  const containerRef = useRef<HTMLElement | null>(null);
  const [splitPercent, setSplitPercent] = useState<number>(() => {
    if (typeof window === "undefined") return initialPercent;
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY_SPLIT_PERCENT);
      if (stored) {
        const parsed = parseFloat(stored);
        if (Number.isFinite(parsed) && parsed >= 20 && parsed <= 80) {
          return parsed;
        }
      }
    } catch {
      // LocalStorage access failure fallback
    }
    return initialPercent;
  });

  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    try {
      return window.localStorage.getItem(STORAGE_KEY_COLLAPSED) === "true";
    } catch {
      return false;
    }
  });

  const [isDragging, setIsDragging] = useState(false);
  const lastExpandedPercentRef = useRef<number>(splitPercent);

  // Update last expanded percent when not collapsed
  useEffect(() => {
    if (!isCollapsed) {
      lastExpandedPercentRef.current = splitPercent;
    }
  }, [splitPercent, isCollapsed]);

  // Persist settings
  const persistPercent = useCallback((val: number) => {
    try {
      window.localStorage.setItem(STORAGE_KEY_SPLIT_PERCENT, String(val));
    } catch {
      // Ignore
    }
  }, []);

  const persistCollapsed = useCallback((val: boolean) => {
    try {
      window.localStorage.setItem(STORAGE_KEY_COLLAPSED, String(val));
    } catch {
      // Ignore
    }
  }, []);

  const handlePointerDown = useCallback((e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return; // Only primary button
    e.preventDefault();
    const target = e.currentTarget;
    target.setPointerCapture(e.pointerId);
    setIsDragging(true);
  }, []);

  const handlePointerMove = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>) => {
      if (!isDragging) return;
      const container = containerRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const pointerX = e.clientX - rect.left;
      const nextPercent = calculateClampedSplitPercent({
        containerWidth: rect.width,
        pointerX,
        minLeftPx,
        minRightPx,
      });

      setSplitPercent(nextPercent);
      if (isCollapsed) {
        setIsCollapsed(false);
        persistCollapsed(false);
      }
      onResizeChange?.(nextPercent, false);
    },
    [isDragging, isCollapsed, minLeftPx, minRightPx, onResizeChange, persistCollapsed],
  );

  const handlePointerUp = useCallback(
    (e: ReactPointerEvent<HTMLDivElement>) => {
      if (!isDragging) return;
      const target = e.currentTarget;
      try {
        target.releasePointerCapture(e.pointerId);
      } catch {
        // Safe release
      }
      setIsDragging(false);
      persistPercent(splitPercent);
      onResizeChange?.(splitPercent, isCollapsed);
    },
    [isDragging, splitPercent, isCollapsed, persistPercent, onResizeChange],
  );

  const handleDoubleClick = useCallback(() => {
    const balanced = SPLIT_PRESETS.balanced;
    setSplitPercent(balanced);
    setIsCollapsed(false);
    persistPercent(balanced);
    persistCollapsed(false);
    onResizeChange?.(balanced, false);
  }, [persistPercent, persistCollapsed, onResizeChange]);

  const toggleCollapse = useCallback(() => {
    setIsCollapsed((prev) => {
      const next = !prev;
      persistCollapsed(next);
      if (!next) {
        // Restoring
        const targetPercent = lastExpandedPercentRef.current || SPLIT_PRESETS.balanced;
        setSplitPercent(targetPercent);
        persistPercent(targetPercent);
        onResizeChange?.(targetPercent, false);
      } else {
        onResizeChange?.(splitPercent, true);
      }
      return next;
    });
  }, [persistCollapsed, persistPercent, splitPercent, onResizeChange]);

  const setPreset = useCallback(
    (preset: SplitPreset) => {
      const target = SPLIT_PRESETS[preset];
      setSplitPercent(target);
      setIsCollapsed(false);
      persistPercent(target);
      persistCollapsed(false);
      onResizeChange?.(target, false);
    },
    [persistPercent, persistCollapsed, onResizeChange],
  );

  const handleKeyDown = useCallback(
    (e: ReactKeyboardEvent<HTMLDivElement>) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        setSplitPercent((prev) => {
          const next = Math.max(20, Math.round((prev - 3) * 10) / 10);
          persistPercent(next);
          onResizeChange?.(next, isCollapsed);
          return next;
        });
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        setSplitPercent((prev) => {
          const next = Math.min(80, Math.round((prev + 3) * 10) / 10);
          persistPercent(next);
          onResizeChange?.(next, isCollapsed);
          return next;
        });
      } else if (e.key === "Home" || e.key === "Enter") {
        e.preventDefault();
        handleDoubleClick();
      } else if (e.key === "Escape") {
        e.preventDefault();
        toggleCollapse();
      }
    },
    [handleDoubleClick, toggleCollapse, isCollapsed, persistPercent, onResizeChange],
  );

  // Compute inline grid-template-columns style for desktop
  const gridStyle = useRef<CSSProperties>({});
  gridStyle.current = {
    gridTemplateColumns: isCollapsed
      ? "minmax(0, 1fr) auto 0px"
      : `minmax(${minLeftPx}px, ${splitPercent}%) auto minmax(${minRightPx}px, 1fr)`,
  };

  return {
    splitPercent,
    isCollapsed,
    isDragging,
    containerRef,
    gridStyle: gridStyle.current,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    handleDoubleClick,
    handleKeyDown,
    toggleCollapse,
    setPreset,
    setSplitPercent,
  };
}
