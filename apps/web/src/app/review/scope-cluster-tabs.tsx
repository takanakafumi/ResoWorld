"use client";

import type { TopicScopeCluster } from "@/domain/lens-packs/knowledge-registry";
import styles from "./atlas.module.css";

export function ScopeClusterTabs({
  scopeClusters,
  activeScopeClusterId,
  onSelectScopeCluster,
}: {
  scopeClusters?: readonly TopicScopeCluster[];
  activeScopeClusterId?: string | null;
  onSelectScopeCluster?: (id: string) => void;
}) {
  if (!scopeClusters || scopeClusters.length <= 1) return null;

  return (
    <div className={styles.routePhaseTabs} role="tablist" aria-label="空間スケール切替">
      {scopeClusters.map((cluster) => {
        const isSelected = activeScopeClusterId === cluster.id;
        const color = "#38bdf8"; // Vibrant Cyan
        return (
          <button
            key={cluster.id}
            type="button"
            role="tab"
            aria-selected={isSelected}
            className={styles.routePhaseTab}
            data-active={isSelected}
            style={{
              borderColor: isSelected ? color : "rgba(255, 255, 255, 0.14)",
              background: isSelected ? "rgba(56, 189, 248, 0.2)" : "rgba(10, 26, 30, 0.65)",
              color: isSelected ? "#ffffff" : "var(--muted, #94a3b8)",
              boxShadow: isSelected ? "0 0 12px rgba(56, 189, 248, 0.35)" : "none",
            }}
            onClick={() => onSelectScopeCluster?.(cluster.id)}
            title={cluster.description}
          >
            <span
              className={styles.routePhaseIndicator}
              style={{
                backgroundColor: isSelected ? color : "rgba(255, 255, 255, 0.3)",
                boxShadow: isSelected ? `0 0 8px ${color}` : "none",
              }}
            />
            <span className={styles.routePhaseLabel}>{cluster.label}</span>
            {cluster.connectionIds && cluster.connectionIds.length > 0 && (
              <small
                className={styles.routePhaseCount}
                style={{
                  color: isSelected ? "#7dd3fc" : "rgba(255, 255, 255, 0.5)",
                }}
              >
                ({cluster.connectionIds.length}軸)
              </small>
            )}
          </button>
        );
      })}
    </div>
  );
}
