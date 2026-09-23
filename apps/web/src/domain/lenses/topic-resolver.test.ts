import { describe, expect, it } from "vitest";

import { validClaimFixture } from "@/domain/knowledge/fixtures";
import type { ReviewAtlasSpot } from "@/domain/review/types";

import { hasRegisteredLensMaterial, resolveLensTopics, selectLensTopic } from "./topic-resolver";

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
      { perspectiveId: "religion" as const, subjectId: "munakata-taisha", subjectName: "宗像大社", topicId: "religion-syncretism" },
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
});
