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
            <strong>{topic.label}</strong>
            <small>{badgeText}</small>
          </button>
        );
      })}
    </nav>
  );
}
