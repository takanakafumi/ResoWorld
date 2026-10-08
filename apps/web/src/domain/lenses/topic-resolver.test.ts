import { describe, expect, it } from "vitest";

import { validClaimFixture } from "@/domain/knowledge/fixtures";
import type { ReviewAtlasSpot } from "@/domain/review/types";

import { hasRegisteredLensMaterial, resolveLensTopics, resolveStratumTopics, selectLensTopic } from "./topic-resolver";

function claim(id: string, subjectName: string) {
  return {
    ...validClaimFixture,
    id,
    statement: `${subjectName}について考えた。`,
    subject: { ...validClaimFixture.subject, id: `entity-${id}`, name: subjectName },
    evidence: [{ ...validClaimFixture.evidence[0], id: `evidence-${id}` }],
  };
}

const spots: ReviewAtlasSpot[] = [
  { id: "spot-yamatai", name: "邪馬台国関連地", region: "九州", kind: "遺跡", latitude: 33, longitude: 130, claimIds: ["claim-yamatai"] },
  { id: "spot-hagi", name: "高杉晋作誕生地", region: "萩", kind: "史跡", latitude: 34.4, longitude: 131.4, claimIds: ["claim-hagi"] },
];

describe("resolveLensTopics", () => {
  it("makes a route Lens available from a stable Pack Entity even without Atlas Connections", () => {
    const routeClaim = claim("claim-toma", "投馬国");
    routeClaim.subject.id = "toma-state";
    expect(hasRegisteredLensMaterial({ lensId: "route", claims: [routeClaim], spots: [] })).toBe(true);
  });

  it("resolves topics through the same registry contract for every Lens perspective", () => {
    const cases = [
      { perspectiveId: "mythology" as const, subjectId: "munakata-triad", subjectName: "宗像三女神", topicId: "munakata-genealogy" },
      { perspectiveId: "religion" as const, subjectId: "munakata-hetsumiya", subjectName: "宗像大社 辺津宮", topicId: "munakata-three-shrines" },
      { perspectiveId: "route" as const, subjectId: "toma-state", subjectName: "投馬国", topicId: "wajinden-route-comparison" },
      { perspectiveId: "politics" as const, subjectId: "himiko", subjectName: "卑弥呼", topicId: "yamatai-politics" },
      { perspectiveId: "people" as const, subjectId: "kido-takayoshi", subjectName: "木戸孝允", topicId: "ishin-figures-network" },
    ];

    for (const item of cases) {
      const candidate = claim(`claim-${item.perspectiveId}`, item.subjectName);
      candidate.subject.id = item.subjectId;
      expect(resolveLensTopics({
        perspectiveId: item.perspectiveId,
        claims: [candidate],
        spots: [],
      }).map((topic) => topic.id)).toContain(item.topicId);
    }
  });

  it("prioritizes the topic connected to the selected spot", () => {
    const topics = resolveLensTopics({
      perspectiveId: "politics",
      claims: [claim("claim-yamatai", "卑弥呼"), claim("claim-hagi", "高杉晋作")],
      spots,
      selectedSpotId: "spot-hagi",
    });

    expect(topics.map((topic) => topic.id)).toEqual(["hagi-domain-politics", "yamatai-politics"]);
    expect(topics[0].directlyConnectedToSelection).toBe(true);
  });

  it("returns only topics supported by the current journey claims", () => {
    const topics = resolveLensTopics({
      perspectiveId: "politics",
      claims: [claim("claim-yamatai", "卑弥呼")],
      spots: [spots[0]],
    });

    expect(topics.map((topic) => topic.id)).toEqual(["yamatai-politics"]);
  });

  it("allows resolving unvisited registered topics when includeUnvisited is true", () => {
    const topics = resolveLensTopics({
      perspectiveId: "politics",
      claims: [claim("claim-yamatai", "卑弥呼")],
      spots: [spots[0]],
      includeUnvisited: true,
    });

    expect(topics[0].id).toBe("yamatai-politics");
    expect(topics.map((t) => t.id)).toContain("dazaifu-defense-preset");
  });

  it("offers the Asakura social structure only from its entry material", () => {
    const asakuraClaim = claim("claim-hiratsuka", "平塚川添遺跡");
    const topics = resolveLensTopics({
      perspectiveId: "politics",
      claims: [asakuraClaim],
      spots: [{ id: "spot-hiratsuka", name: "平塚川添遺跡", region: "朝倉", kind: "遺跡", latitude: 33.4, longitude: 130.65, claimIds: [asakuraClaim.id] }],
      selectedSpotId: "spot-hiratsuka",
    });

    expect(topics).toContainEqual(expect.objectContaining({
      id: "asakura-social-structure",
      renderer: "pack-relationship",
      directlyConnectedToSelection: true,
    }));
  });

  it("connects Onamuchi Shrine in Asakura directly to the Izumo Kunitsukami consolidated topic", () => {
    const onamuchiClaim = claim("claim-onamuchi", "大己貴神社");
    onamuchiClaim.subject.id = "onamuchi-shrine";
    const onamuchiSpot: ReviewAtlasSpot = {
      id: "spot-onamuchi",
      name: "大己貴神社",
      region: "朝倉",
      kind: "神社",
      latitude: 33.44,
      longitude: 130.65,
      claimIds: [onamuchiClaim.id],
    };

    const topics = resolveLensTopics({
      perspectiveId: "mythology",
      claims: [onamuchiClaim],
      spots: [onamuchiSpot],
      selectedSpotId: "spot-onamuchi",
    });

    const izumoTopic = topics.find((t) => t.id === "izumo-kunitsukami-preset");
    expect(izumoTopic).toBeDefined();
    expect(izumoTopic?.label).toBe("出雲国譲り神話と大己貴・国津神系譜");
    expect(izumoTopic?.directlyConnectedToSelection).toBe(true);
    expect(izumoTopic?.spotIds).toContain("spot-onamuchi");
  });

  it("projects the Miyajima and Misen exploration into religion and route topics", () => {
    const miyajimaClaim = claim("claim-miyajima", "宮島");
    const misenClaim = claim("claim-misen", "弥山");
    const claims = [miyajimaClaim, misenClaim];

    expect(resolveLensTopics({ perspectiveId: "religion", claims, spots: [] })).toContainEqual(
      expect.objectContaining({ id: "miyajima-sacred-relations", packId: "miyajima-misen-sacred-landscape" }),
    );
    expect(resolveLensTopics({ perspectiveId: "route", claims, spots: [] })).toContainEqual(
      expect.objectContaining({ id: "miyajima-current-paths", packId: "miyajima-misen-sacred-landscape" }),
    );
    expect(resolveLensTopics({ perspectiveId: "politics", claims, spots: [] })).toContainEqual(
      expect.objectContaining({ id: "miyajima-patronage-and-space", packId: "miyajima-misen-sacred-landscape" }),
    );
  });

  it("does not substitute an unrelated fixed topic", () => {
    expect(resolveLensTopics({
      perspectiveId: "politics",
      claims: [claim("claim-other", "無関係な対象")],
      spots: [],
    })).toEqual([]);
  });

  it("does not activate a topic from a peripheral node without a root subject", () => {
    expect(resolveLensTopics({
      perspectiveId: "politics",
      claims: [claim("claim-wei", "魏")],
      spots: [],
    })).toEqual([]);
  });

  it("does not activate a topic when a root is mentioned only as the object", () => {
    const contextualClaim = claim("claim-context", "探索者");
    contextualClaim.object = {
      kind: "entity",
      entity: { id: "yamatai-state", name: "邪馬台国", type: "Concept" },
    };

    expect(resolveLensTopics({
      perspectiveId: "politics",
      claims: [contextualClaim],
      spots: [],
    })).toEqual([]);
  });

  it("keeps a manually selected topic when a Lens node changes the map selection", () => {
    const topics = resolveLensTopics({
      perspectiveId: "politics",
      claims: [claim("claim-yamatai", "卑弥呼"), claim("claim-hagi", "高杉晋作")],
      spots,
      selectedSpotId: "spot-yamatai",
    });

    expect(selectLensTopic(topics, "hagi-domain-politics")?.id).toBe("hagi-domain-politics");
  });

  it("falls back to the highest-ranked topic when the manual topic is no longer available", () => {
    const topics = resolveLensTopics({
      perspectiveId: "politics",
      claims: [claim("claim-yamatai", "卑弥呼")],
      spots: [spots[0]],
      selectedSpotId: "spot-yamatai",
    });

    expect(selectLensTopic(topics, "hagi-domain-politics")?.id).toBe("yamatai-politics");
  });

  it("resolves religion topics and connects directly when Munakata Shrine is selected", () => {
    const munakataClaim = claim("claim-munakata", "宗像大社 辺津宮");
    munakataClaim.subject.id = "munakata-hetsumiya";
    const munakataSpot: ReviewAtlasSpot = {
      id: "spot-munakata",
      name: "宗像大社 辺津宮",
      region: "福岡県",
      kind: "神社",
      latitude: 33.8,
      longitude: 130.5,
      claimIds: ["claim-munakata"],
    };

    const topics = resolveLensTopics({
      perspectiveId: "religion",
      claims: [munakataClaim],
      spots: [munakataSpot],
      selectedSpotId: "spot-munakata",
    });

    const sacredTopic = topics.find((topic) => topic.id === "munakata-three-shrines");
    expect(sacredTopic).toBeDefined();
    expect(sacredTopic?.directlyConnectedToSelection).toBe(true);
    expect(sacredTopic?.spotIds).toContain("spot-munakata");
  });

  it("strictly filters out 0-activity topics in default mode (Approach 1: travel-first)", () => {
    // Only Northern Kyushu mythology claim
    const munakataClaim = claim("claim-munakata", "宗像三女神");
    munakataClaim.subject.id = "munakata-triad";

    const defaultTopics = resolveLensTopics({
      perspectiveId: "mythology",
      claims: [munakataClaim],
      spots: [{ id: "spot-munakata", name: "宗像大社 辺津宮", region: "宗像", kind: "神社", latitude: 33.8, longitude: 130.5, claimIds: [munakataClaim.id] }],
      includeUnvisited: false,
    });

    // Munakata genealogy is active
    expect(defaultTopics.map((t) => t.id)).toContain("munakata-genealogy");
    // Completely unvisited mythology topics (e.g. Izumo Kunitsukami, Hyuga) MUST NOT be present
    expect(defaultTopics.map((t) => t.id)).not.toContain("izumo-kunitsukami-preset");
    expect(defaultTopics.map((t) => t.id)).not.toContain("hyuga-mythology-preset");

    // But when includeUnvisited is explicitly true (Approach 2: knowledge-first), they are present
    const explicitTopics = resolveLensTopics({
      perspectiveId: "mythology",
      claims: [munakataClaim],
      spots: [{ id: "spot-munakata", name: "宗像大社 辺津宮", region: "宗像", kind: "神社", latitude: 33.8, longitude: 130.5, claimIds: [munakataClaim.id] }],
      includeUnvisited: true,
    });
    expect(explicitTopics.map((t) => t.id)).toContain("izumo-kunitsukami-preset");
    expect(explicitTopics.map((t) => t.id)).toContain("hyuga-mythology-preset");
    // And the active topic is ranked first
    expect(explicitTopics[0].id).toBe("munakata-genealogy");
  });

  it("preserves narrative and structural features on resolved topics", () => {
    const topics = resolveLensTopics({
      perspectiveId: "mythology",
      claims: [],
      spots: [],
      includeUnvisited: true,
    });

    const izumo = topics.find((t) => t.id === "izumo-kunitsukami-preset");
    expect(izumo?.features).toEqual(["narrative", "structural"]);

    const jinmu = topics.find((t) => t.id === "jinmu-yamato-conquest-preset");
    expect(jinmu?.features).toEqual(["narrative"]);

    const marine = topics.find((t) => t.id === "marine-deities-preset");
    expect(marine?.features).toEqual(["structural"]);
  });

  it("excludes chronological stratum topics from regular lens topics", () => {
    const topics = resolveLensTopics({
      perspectiveId: "religion",
      claims: [],
      spots: [],
      includeUnvisited: true,
    });

    const topicIds = topics.map((t) => t.id);
    expect(topicIds).not.toContain("religion-history");
    expect(topicIds).not.toContain("religion-syncretism");
    expect(topicIds).not.toContain("religion-concepts");
    expect(topicIds).toContain("archaic-local-shrines");
  });

  it("provides chronological stratum topics via resolveStratumTopics()", () => {
    const stratumTopics = resolveStratumTopics();
    expect(stratumTopics.length).toBeGreaterThan(0);
    expect(stratumTopics.every((t) => t.isStratum === true)).toBe(true);

    const stratumIds = stratumTopics.map((t) => t.id);
    expect(stratumIds).toContain("religion-history");
    expect(stratumIds).toContain("religion-syncretism");
    expect(stratumIds).toContain("religion-concepts");
    expect(stratumIds).not.toContain("archaic-local-shrines");
  });
});
