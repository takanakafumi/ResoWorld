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
    icon: "✨",
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

export function getEntityKindMeta(
  kind?: string,
  entityOrLabel?: string | { label?: string; aliases?: string[] },
): EntityKindMeta {
  const base = (!kind ? undefined : ENTITY_KIND_META[kind]) ?? {
    label: kind ?? "要素",
    icon: "🔹",
    color: "var(--muted)",
    bg: "rgba(255, 255, 255, 0.08)",
    border: "rgba(255, 255, 255, 0.2)",
  };

  if (!entityOrLabel) return base;

  const text = typeof entityOrLabel === "string"
    ? entityOrLabel
    : `${entityOrLabel.label ?? ""} ${(entityOrLabel.aliases ?? []).join(" ")}`;

  // 1. Shrines vs fortresses/ruins vs general places
  if (kind === "place") {
    const isShrine = /神社|神宮|大社|宮|社|本宮|別宮|奥宮|中津宮|辺津宮|沖津宮|遥拝所|斎宮/.test(text);
    if (isShrine) {
      return {
        label: "神社・祭祀地",
        icon: "⛩️",
        color: "#f87171",
        bg: "rgba(248, 113, 113, 0.14)",
        border: "rgba(248, 113, 113, 0.35)",
      };
    }
    const isFortressOrRuins = /城|山城|柵|府|館|要塞|遺跡|古墳|砲台|台場/.test(text);
    if (isFortressOrRuins) {
      return {
        label: "史跡・要塞",
        icon: "🏛️",
        color: "#34d399",
        bg: "rgba(52, 211, 153, 0.14)",
        border: "rgba(52, 211, 153, 0.35)",
      };
    }
  }

  // 2. Divine regalia / weapons in concepts
  if (kind === "concept") {
    if (/剣|刀|鏡|玉|勾玉|神器|矛|弓/.test(text)) {
      return {
        label: "神宝・神器",
        icon: "⚔️",
        color: "#38bdf8",
        bg: "rgba(56, 189, 248, 0.14)",
        border: "rgba(56, 189, 248, 0.35)",
      };
    }
  }

  return base;
}

export interface NodeVisualTier {
  tier: 1 | 2 | 3;
  height: number;
  fontSize: number;
  isProminent: boolean;
  borderWidth: number;
  badgeLabel?: string;
}

export function getNodeVisualTier(options: {
  isRootOrCore?: boolean;
  degree?: number;
  level?: number;
}): NodeVisualTier {
  if (options.isRootOrCore || options.level === 0) {
    return {
      tier: 1,
      height: 34,
      fontSize: 12,
      isProminent: true,
      borderWidth: 2.2,
      badgeLabel: "中核",
    };
  }
  if (options.level === 1 || (options.degree ?? 2) >= 3) {
    return {
      tier: 2,
      height: 28,
      fontSize: 11,
      isProminent: false,
      borderWidth: 1.2,
    };
  }
  return {
    tier: 3,
    height: 26,
    fontSize: 10,
    isProminent: false,
    borderWidth: 1,
  };
}

