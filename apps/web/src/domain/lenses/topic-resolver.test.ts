import { describe, expect, it } from "vitest";

import { validClaimFixture } from "@/domain/knowledge/fixtures";
import type { ReviewAtlasSpot } from "@/domain/review/types";

import { resolveLensTopics } from "./topic-resolver";

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
});
