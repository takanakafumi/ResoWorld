import { describe, expect, it } from "vitest";

import { validClaimFixture } from "@/domain/knowledge/fixtures";

import { buildLensExplorationLinks } from "./exploration-links";

describe("buildLensExplorationLinks", () => {
  it("links spots and claims to visible knowledge entities by stable ID", () => {
    const claim = {
      ...validClaimFixture,
      subject: { ...validClaimFixture.subject, id: "munakata-taisha" },
      places: [{ entityId: "munakata-taisha", name: "宗像大社", role: "observed_place" as const }],
    };
    const links = buildLensExplorationLinks(
      [claim],
      [{ id: "spot-munakata", name: "宗像大社", region: "福岡", kind: "神社", latitude: 33.8, longitude: 130.5, claimIds: [claim.id] }],
      ["munakata-taisha"],
    );

    expect(links.get("munakata-taisha")).toEqual({
      claimIds: [claim.id],
      spotIds: ["spot-munakata"],
    });
  });

  it("does not connect labels without matching IDs", () => {
    const links = buildLensExplorationLinks(
      [validClaimFixture],
      [{ id: "spot-munakata", name: "宗像大社", region: "福岡", kind: "神社", latitude: 33.8, longitude: 130.5, claimIds: [validClaimFixture.id] }],
      ["munakata-taisha"],
    );
    expect(links.size).toBe(0);
  });
});
