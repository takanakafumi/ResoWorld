"use client";

import { useEffect, useState } from "react";
import type { ReviewAtlasConnection } from "@/domain/review/types";

export type PositionStatus = "candidate" | "confirmed" | "rejected";
export type ConnectionStatus = ReviewAtlasConnection["initialStatus"];

export function usePositionStatuses(datasetId: string) {
  const storageKey = `resoworld-place-positions:${datasetId}`;
  const [statuses, setStatuses] = useState<Record<string, PositionStatus>>({});
  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const stored = localStorage.getItem(storageKey);
        if (stored) setStatuses(JSON.parse(stored) as Record<string, PositionStatus>);
      } catch {
        // A damaged local preference must not block the review workspace.
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, [storageKey]);
  const updateStatus = (spotId: string, status: PositionStatus) => {
    setStatuses((current) => {
      const next = { ...current, [spotId]: status };
      localStorage.setItem(storageKey, JSON.stringify(next));
      return next;
    });
  };
  return { statuses, updateStatus };
}

export function useConnectionStatuses(datasetId: string) {
  const storageKey = `resoworld-connections:${datasetId}`;
  const [statuses, setStatuses] = useState<Record<string, ConnectionStatus>>({});
  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const stored = localStorage.getItem(storageKey);
        if (stored) setStatuses(JSON.parse(stored) as Record<string, ConnectionStatus>);
      } catch {
        // A damaged local preference must not block the Atlas.
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, [storageKey]);
  const updateStatus = (connectionId: string, status: ConnectionStatus) => {
    setStatuses((current) => {
      const next = { ...current, [connectionId]: status };
      localStorage.setItem(storageKey, JSON.stringify(next));
      return next;
    });
  };
  return { statuses, updateStatus };
}
