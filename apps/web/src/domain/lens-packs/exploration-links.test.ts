import { describe, expect, it } from "vitest";

import { validClaimFixture } from "@/domain/knowledge/fixtures";

import { buildLensExplorationLinks, buildLensExplorationLinksByIdentity, hasLensExplorationContext } from "./exploration-links";

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
      observedSpotIds: ["spot-munakata"],
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

  it("links imported names and aliases when stable IDs are not available yet", () => {
    const claim = {
      ...validClaimFixture,
      subject: { name: "桂小五郎", type: "Person" as const },
      places: [{ name: "木戸孝允旧宅", role: "observed_place" as const }],
    };
    const links = buildLensExplorationLinksByIdentity(
      [claim],
      [{ id: "spot-kido", name: "木戸孝允旧宅", region: "萩", kind: "史跡", latitude: 34.4, longitude: 131.4, claimIds: [claim.id] }],
      [{ id: "kido-takayoshi", label: "木戸孝允", aliases: ["桂小五郎"] }],
    );

    expect(links.get("kido-takayoshi")).toEqual({
      claimIds: [claim.id],
      spotIds: ["spot-kido"],
      observedSpotIds: ["spot-kido"],
    });
  });

  it("does not mark a LENS entity visited from the spot label alone", () => {
    const links = buildLensExplorationLinksByIdentity(
      [validClaimFixture],
      [{ id: "spot-hagi", name: "松下村塾", region: "萩", kind: "史跡", latitude: 34.4, longitude: 131.4, claimIds: [validClaimFixture.id] }],
      [{ id: "shokasonjuku", label: "松下村塾", aliases: [] }],
    );

    expect(links.size).toBe(0);
  });

  it("links only an explicit Yamatai hypothesis alias, not a generic Kyushu name", () => {
    const hypothesis = {
      ...validClaimFixture,
      id: "claim-yamatai-kyushu",
      subject: { name: "邪馬台国九州説候補地", type: "Place" as const },
    };
    const unrelated = {
      ...validClaimFixture,
      id: "claim-kyushu-facility",
      subject: { name: "九州歴史資料館", type: "Place" as const },
    };
    const links = buildLensExplorationLinksByIdentity(
      [hypothesis, unrelated],
      [],
      [{ id: "northern-kyushu", label: "北部九州の候補地域", aliases: ["邪馬台国九州説候補地"] }],
    );

    expect(links.get("northern-kyushu")?.claimIds).toEqual(["claim-yamatai-kyushu"]);
  });

  it("links an imported Toma polity Claim without inventing a route edge", () => {
    const claim = { ...validClaimFixture, id: "claim-toma", subject: { name: "投馬国", type: "Place" as const } };
    const links = buildLensExplorationLinksByIdentity(
      [claim],
      [],
      [{ id: "toma-state", label: "投馬国", aliases: [] }],
    );
    expect(links.get("toma-state")?.claimIds).toEqual(["claim-toma"]);
  });

  it("does not leak another spot sharing the same Claim into an entry-only Lens", () => {
    const claim = {
      ...validClaimFixture,
      id: "claim-asakura-context",
      subject: { name: "朝倉地域", type: "Place" as const },
      places: [{ name: "浄心院", role: "observed_place" as const }],
    };
    const links = buildLensExplorationLinksByIdentity(
      [claim],
      [{ id: "spot-joshinin", name: "浄心院", region: "朝倉", kind: "寺院", latitude: 33.39, longitude: 130.65, claimIds: [claim.id] }],
      [{ id: "asakura-region", label: "朝倉地域", aliases: ["朝倉"] }],
      { entryOnly: true },
    );

    expect(links.get("asakura-region")).toEqual({
      claimIds: [claim.id],
      spotIds: [],
      observedSpotIds: [],
    });
  });
  it("reports whether the current exploration scope supports a Lens topic", () => {
    expect(hasLensExplorationContext(new Map())).toBe(false);
    expect(hasLensExplorationContext(new Map([["unlinked", { claimIds: [], spotIds: [], observedSpotIds: [] }]]))).toBe(false);
    expect(hasLensExplorationContext(new Map([["linked", { claimIds: ["claim-a"], spotIds: [], observedSpotIds: [] }]]))).toBe(true);
  });
});
