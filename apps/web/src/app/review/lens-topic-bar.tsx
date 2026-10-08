"use client";

import type { ResolvedLensTopic } from "@/domain/lenses/topic-resolver";
import styles from "./atlas.module.css";

export type LensTopicBarProps = {
  topics: readonly ResolvedLensTopic[];
  selectedTopicId: string;
  onSelectTopic: (topicId: string) => void;
  lensLabel?: string;
};

export function LensTopicBar({
  topics,
  selectedTopicId,
  onSelectTopic,
  lensLabel = "TOPIC",
}: LensTopicBarProps) {
  if (topics.length <= 1) return null;

  return (
    <nav className={styles.contextualLensTopics} aria-label={`${lensLabel}で見るテーマ`}>
      <span>TOPIC</span>
      {topics.map((topic) => {
        const isActive = topic.id === selectedTopicId;
        const badgeText = topic.directlyConnectedToSelection
          ? "選択地点に接続"
          : topic.claimIds.length > 0 || topic.spotIds.length > 0
          ? `${topic.spotIds.length}地点・${topic.claimIds.length}件の記録`
          : "未訪問の探索網";

        return (
          <button
            type="button"
            key={topic.id}
            data-active={isActive}
            onClick={() => onSelectTopic(topic.id)}
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
    </nav>
  );
}
