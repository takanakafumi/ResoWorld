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
        return (
          <button
            key={cluster.id}
            type="button"
            role="tab"
            aria-selected={isSelected}
            className={styles.routePhaseTab}
            data-active={isSelected}
            onClick={() => onSelectScopeCluster?.(cluster.id)}
            title={cluster.description}
          >
            <span className={styles.routePhaseIndicator} />
            <span className={styles.routePhaseLabel}>{cluster.label}</span>
          </button>
        );
      })}
    </div>
  );
}
