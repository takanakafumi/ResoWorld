import { describe, expect, it } from "vitest";

import { validClaimFixture } from "@/domain/knowledge/fixtures";
import type { ReviewAtlasSpot } from "@/domain/review/types";

import { hasRegisteredLensMaterial, resolveLensTopics, selectLensTopicForSpot } from "./topic-resolver";

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

  it("does not keep a manual topic selection when the selected spot changes", () => {
    const topics = resolveLensTopics({
      perspectiveId: "politics",
      claims: [claim("claim-yamatai", "卑弥呼"), claim("claim-hagi", "高杉晋作")],
      spots,
      selectedSpotId: "spot-yamatai",
    });

    const selected = selectLensTopicForSpot(
      topics,
      { spotId: "spot-hagi", topicId: "hagi-domain-politics" },
      "spot-yamatai",
    );

    expect(selected?.id).toBe("yamatai-politics");
    expect(selected?.directlyConnectedToSelection).toBe(true);
  });

  it("keeps a manual topic selection while the selected spot stays the same", () => {
    const topics = resolveLensTopics({
      perspectiveId: "politics",
      claims: [claim("claim-yamatai", "卑弥呼"), claim("claim-hagi", "高杉晋作")],
      spots,
      selectedSpotId: "spot-yamatai",
    });

    expect(selectLensTopicForSpot(
      topics,
      { spotId: "spot-yamatai", topicId: "hagi-domain-politics" },
      "spot-yamatai",
    )?.id).toBe("hagi-domain-politics");
  });
});
