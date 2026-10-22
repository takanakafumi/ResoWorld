export interface EntityKindMeta {
  label: string;
  icon: string;
  color: string;
  bg: string;
  border: string;
}

export const ENTITY_KIND_META: Record<string, EntityKindMeta> = {
  deity: {
    label: "神格",
    icon: "⛩️",
    color: "#f472b6",
    bg: "rgba(244, 114, 182, 0.14)",
    border: "rgba(244, 114, 182, 0.35)",
  },
  place: {
    label: "史跡・場所",
    icon: "📍",
    color: "#34d399",
    bg: "rgba(52, 211, 153, 0.14)",
    border: "rgba(52, 211, 153, 0.35)",
  },
  person: {
    label: "人物",
    icon: "👤",
    color: "#fbbf24",
    bg: "rgba(251, 191, 36, 0.14)",
    border: "rgba(251, 191, 36, 0.35)",
  },
  polity: {
    label: "統治・勢力",
    icon: "🏛️",
    color: "#a78bfa",
    bg: "rgba(167, 139, 250, 0.14)",
    border: "rgba(167, 139, 250, 0.35)",
  },
  group: {
    label: "集団・氏族",
    icon: "👥",
    color: "#2dd4bf",
    bg: "rgba(45, 212, 191, 0.14)",
    border: "rgba(45, 212, 191, 0.35)",
  },
  concept: {
    label: "制度・概念",
    icon: "💡",
    color: "#38bdf8",
    bg: "rgba(56, 189, 248, 0.14)",
    border: "rgba(56, 189, 248, 0.35)",
  },
  event: {
    label: "歴史事変",
    icon: "⚡",
    color: "#fb923c",
    bg: "rgba(251, 146, 60, 0.14)",
    border: "rgba(251, 146, 60, 0.35)",
  },
  tradition: {
    label: "信仰・伝統",
    icon: "📿",
    color: "#e879f9",
    bg: "rgba(232, 121, 249, 0.14)",
    border: "rgba(232, 121, 249, 0.35)",
  },
  text: {
    label: "典拠史料",
    icon: "📜",
    color: "#94a3b8",
    bg: "rgba(148, 163, 184, 0.14)",
    border: "rgba(148, 163, 184, 0.35)",
  },
};

export function getEntityKindMeta(kind?: string): EntityKindMeta {
  if (!kind) {
    return {
      label: "要素",
      icon: "🔹",
      color: "var(--muted)",
      bg: "rgba(255, 255, 255, 0.08)",
      border: "rgba(255, 255, 255, 0.2)",
    };
  }
  return (
    ENTITY_KIND_META[kind] ?? {
      label: kind,
      icon: "🔹",
      color: "var(--muted)",
      bg: "rgba(255, 255, 255, 0.08)",
      border: "rgba(255, 255, 255, 0.2)",
    }
  );
}
