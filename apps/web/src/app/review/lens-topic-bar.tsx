"use client";

import { useEffect, useState } from "react";
import type { ResolvedLensTopic } from "@/domain/lenses/topic-resolver";
import styles from "./atlas.module.css";

export type LensTopicBarProps = {
  topics: readonly ResolvedLensTopic[];
  selectedTopicId: string;
  onSelectTopic: (topicId: string) => void;
  lensLabel?: string;
  defaultExpanded?: boolean;
};

export function LensTopicBar({
  topics,
  selectedTopicId,
  onSelectTopic,
  lensLabel = "TOPIC",
  defaultExpanded = true,
}: LensTopicBarProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [optimisticTopicId, setOptimisticTopicId] = useState<string | null>(null);

  useEffect(() => {
    if (optimisticTopicId && optimisticTopicId === selectedTopicId) {
      setOptimisticTopicId(null);
    }
  }, [selectedTopicId, optimisticTopicId]);

  if (topics.length <= 1) return null;

  const currentTopicId = optimisticTopicId ?? selectedTopicId;
  const activeTopic = topics.find((t) => t.id === currentTopicId) ?? topics[0];

  if (!isExpanded) {
    return (
      <div className={styles.contextualLensTopicsCollapsed} aria-label={`${lensLabel}で見るテーマ`}>
        <div className={styles.collapsedTopicMeta}>
          <span className={styles.collapsedTopicBadge}>TOPIC</span>
          {activeTopic?.focusLabel && (
            <span className={`${styles.topicTag} ${styles.topicTagFocus}`}>
              {activeTopic.focusLabel}
            </span>
          )}
          <strong className={styles.collapsedTopicTitle}>{activeTopic?.label}</strong>
          {activeTopic?.archetypeLabel && (
            <span className={styles.topicArchetypePill}>
              {activeTopic.archetypeLabel}
            </span>
          )}
        </div>
        <button
          type="button"
          className={styles.topicExpandButton}
          onClick={() => setIsExpanded(true)}
          aria-label="TOPIC一覧を展開"
        >
          切替 ({topics.length}) ▾
        </button>
      </div>
    );
  }

  return (
    <nav className={styles.contextualLensTopics} aria-label={`${lensLabel}で見るテーマ`}>
      <div className={styles.topicBarHeader}>
        <span>TOPIC（全{topics.length}件 · クリックで即時切替）</span>
        <button
          type="button"
          className={styles.topicCollapseButton}
          onClick={() => setIsExpanded(false)}
          aria-label="TOPIC一覧を折りたたむ"
        >
          折りたたむ ▴
        </button>
      </div>
      <div className={styles.topicButtonList}>
        {topics.map((topic) => {
          const isActive = topic.id === currentTopicId;
          const badgeText = topic.directlyConnectedToSelection
            ? "選択地点に接続"
            : topic.claimIds.length > 0 || topic.spotIds.length > 0
            ? `${topic.spotIds.length}地点`
            : "未訪問";

          return (
            <button
              type="button"
              key={topic.id}
              data-active={isActive}
              onClick={() => {
                // Instantly update active indicator, then trigger transition
                setOptimisticTopicId(topic.id);
                onSelectTopic(topic.id);
              }}
            >
              {topic.focusLabel && (
                <span className={`${styles.topicTag} ${styles.topicTagFocus}`}>
                  {topic.focusLabel}
                </span>
              )}
              {topic.features?.map((feature) => (
                <span
                  key={feature}
                  className={`${styles.topicTag} ${
                    feature === "narrative" ? styles.topicTagNarrative : styles.topicTagStructural
                  }`}
                >
                  {feature === "narrative" ? "物語" : "構造"}
                </span>
              ))}
              <strong>{topic.label}</strong>
              <small>{badgeText}</small>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
