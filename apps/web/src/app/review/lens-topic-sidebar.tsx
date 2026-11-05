"use client";

import { memo, useMemo, useState } from "react";
import type { ResolvedLensTopic } from "@/domain/lenses/topic-resolver";
import styles from "./atlas.module.css";

export type LensTopicSidebarProps = {
  topics: readonly ResolvedLensTopic[];
  selectedTopicId: string;
  onSelectTopic: (topicId: string) => void;
  lensLabel?: string;
};

function getTopicIcon(topic: ResolvedLensTopic): string {
  const text = `${topic.id} ${topic.label} ${topic.focusLabel} ${topic.focus}`.toLowerCase();
  if (text.includes("defense") || text.includes("castle") || text.includes("mizuki") || text.includes("防衛") || text.includes("山城") || text.includes("水城")) {
    return "🛡️";
  }
  if (text.includes("yayoi") || text.includes("na-") || text.includes("fumi") || text.includes("弥生") || text.includes("環濠") || text.includes("奴国")) {
    return "🌾";
  }
  if (text.includes("genpei") || text.includes("dannoura") || text.includes("heike") || text.includes("源平") || text.includes("壇ノ浦") || text.includes("合戦")) {
    return "⚔️";
  }
  if (text.includes("shikinaisha") || text.includes("shrine") || text.includes("式内社") || text.includes("神社") || text.includes("八幡")) {
    return "⛩️";
  }
  if (text.includes("marine") || text.includes("munakata") || text.includes("ocean") || text.includes("sea") || text.includes("宗像") || text.includes("海人") || text.includes("航路")) {
    return "⚓";
  }
  if (text.includes("myth") || text.includes("genealogy") || text.includes("kunitsukami") || text.includes("神話") || text.includes("系譜") || text.includes("出雲")) {
    return "👑";
  }
  if (text.includes("bakumatsu") || text.includes("ishin") || text.includes("shoka") || text.includes("幕末") || text.includes("志士") || text.includes("松下村塾")) {
    return "📜";
  }
  if (text.includes("route") || text.includes("highway") || text.includes("街道") || text.includes("官道") || text.includes("東征")) {
    return "🧭";
  }
  return "🏷️";
}

export const LensTopicSidebar = memo(function LensTopicSidebar({
  topics,
  selectedTopicId,
  onSelectTopic,
  lensLabel = "TOPIC",
}: LensTopicSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const activeTopicId = selectedTopicId || (topics[0]?.id ?? "");

  if (topics.length <= 1) return null;

  return (
    <aside
      className={`${styles.lensTopicSidebar} ${isCollapsed ? styles.lensTopicSidebarCollapsed : ""}`}
      aria-label={`${lensLabel}のトピック目次`}
    >
      <div className={styles.lensTopicSidebarHeader}>
        {!isCollapsed && (
          <div className={styles.lensTopicSidebarHeaderTitle}>
            <span className={styles.lensTopicSidebarBadge}>INDEX</span>
            <span className={styles.lensTopicSidebarCount}>全{topics.length}件</span>
          </div>
        )}
        <button
          type="button"
          className={styles.lensTopicSidebarToggleBtn}
          onClick={() => setIsCollapsed(!isCollapsed)}
          aria-label={isCollapsed ? "トピック目次を展開" : "トピック目次を折りたたむ"}
          title={isCollapsed ? "トピック目次を展開 (全幅でタイトルを表示)" : "トピック目次をスリム化 (認知図を広く表示)"}
        >
          {isCollapsed ? "▶" : "◀"}
        </button>
      </div>

      <nav className={styles.lensTopicSidebarList} role="tablist" aria-label="トピック一覧">
        {topics.map((topic) => {
          const isActive = topic.id === activeTopicId;
          const icon = getTopicIcon(topic);
          const badgeText = topic.directlyConnectedToSelection
            ? "選択地点"
            : topic.spotIds.length > 0
              ? `${topic.spotIds.length}地点`
              : "未訪";

          return (
            <button
              type="button"
              key={topic.id}
              role="tab"
              aria-selected={isActive}
              data-active={isActive}
              className={styles.lensTopicSidebarItem}
              onClick={() => onSelectTopic(topic.id)}
              title={`${topic.label} (${topic.focusLabel} / ${topic.archetypeLabel} / ${topic.spotIds.length}地点)`}
            >
              <div className={styles.lensTopicSidebarItemIconCol}>
                <span className={styles.lensTopicSidebarItemIcon} aria-hidden="true">
                  {icon}
                </span>
                {isCollapsed && (
                  <span className={styles.lensTopicSidebarItemMiniCount}>
                    {topic.spotIds.length}
                  </span>
                )}
              </div>

              {!isCollapsed && (
                <div className={styles.lensTopicSidebarItemBody}>
                  <div className={styles.lensTopicSidebarItemMeta}>
                    <span className={styles.lensTopicSidebarItemFocus}>
                      {topic.focusLabel}
                    </span>
                    <span className={styles.lensTopicSidebarItemBadge}>
                      {badgeText}
                    </span>
                  </div>
                  <strong className={styles.lensTopicSidebarItemTitle}>
                    {topic.label}
                  </strong>
                  <div className={styles.lensTopicSidebarItemFooter}>
                    <span className={styles.lensTopicSidebarItemArchetype}>
                      {topic.archetypeLabel}
                    </span>
                  </div>
                </div>
              )}
            </button>
          );
        })}
      </nav>
    </aside>
  );
});
