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
      primarySpotId: "spot-kido",
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

  it("does not leak museum or sibling-shrine spotIds/observedSpotIds into unvisited concrete place entities", () => {
    const museumClaim = {
      ...validClaimFixture,
      id: "claim-museum-ushikubi",
      subject: { name: "大野城市歴史資料展示室", type: "Place" as const },
      object: {
        kind: "entity" as const,
        entity: { name: "牛頸須恵器窯跡群の一大窯業生産基盤", type: "Concept" as const },
      },
      places: [{ name: "大野城市歴史資料展示室", role: "observed_place" as const }],
    };
    const hetsumiyaClaim = {
      ...validClaimFixture,
      id: "claim-hetsumiya-triad",
      subject: { name: "宗像三女神", type: "Group" as const },
      places: [
        { name: "宗像大社", role: "observed_place" as const },
        { name: "大島", role: "subject_place" as const },
      ],
    };

    const spots = [
      {
        id: "spot-onojo-history-museum",
        name: "大野城市歴史資料展示室",
        region: "福岡",
        kind: "資料館",
        latitude: 33.536,
        longitude: 130.479,
        claimIds: [museumClaim.id],
        mapRole: "visited-place" as const,
      },
      {
        id: "munakata-taisha",
        name: "宗像大社 辺津宮",
        region: "福岡",
        kind: "神社",
        latitude: 33.831,
        longitude: 130.514,
        claimIds: [hetsumiyaClaim.id],
        mapRole: "visited-place" as const,
      },
    ];

    const links = buildLensExplorationLinksByIdentity(
      [museumClaim, hetsumiyaClaim],
      spots,
      [
        {
          id: "ushikubi-kilns",
          kind: "place",
          label: "牛頸須恵器窯跡群",
          aliases: ["牛頸窯跡群"],
          coordinates: { latitude: 33.498, longitude: 130.485 },
        },
        {
          id: "munakata-nakatsumiya",
          kind: "place",
          label: "宗像大社 中津宮",
          aliases: ["中津宮", "大島（中津宮）"],
          coordinates: { latitude: 33.9004, longitude: 130.4328 },
        },
        {
          id: "okitsumiya-yohai",
          kind: "place",
          label: "宗像大社 沖津宮遥拝所",
          aliases: ["沖津宮遥拝所"],
          coordinates: { latitude: 33.9083, longitude: 130.4167 },
        },
        {
          id: "oshima-munakata",
          kind: "place",
          label: "大島",
          aliases: ["筑前大島"],
          coordinates: { latitude: 33.9022, longitude: 130.4286 },
        },
        {
          id: "munakata-hetsumiya",
          kind: "place",
          label: "宗像大社 辺津宮",
          aliases: ["辺津宮"],
          primarySpotId: "munakata-taisha",
          coordinates: { latitude: 33.831, longitude: 130.514 },
        },
      ],
    );

    // Unvisited concrete places keep contextual claimIds if referenced, but NEVER inherit foreign spotIds/observedSpotIds
    expect(links.get("ushikubi-kilns")?.spotIds ?? []).toEqual([]);
    expect(links.get("ushikubi-kilns")?.observedSpotIds ?? []).toEqual([]);
    expect(links.get("munakata-nakatsumiya")?.spotIds ?? []).toEqual([]);
    expect(links.get("munakata-nakatsumiya")?.observedSpotIds ?? []).toEqual([]);
    expect(links.get("okitsumiya-yohai")?.spotIds ?? []).toEqual([]);
    expect(links.get("okitsumiya-yohai")?.observedSpotIds ?? []).toEqual([]);
    expect(links.get("oshima-munakata")?.spotIds ?? []).toEqual([]);
    expect(links.get("oshima-munakata")?.observedSpotIds ?? []).toEqual([]);

    // Declared visited Hetsumiya still resolves cleanly
    expect(links.get("munakata-hetsumiya")?.primarySpotId).toBe("munakata-taisha");
    expect(links.get("munakata-hetsumiya")?.spotIds).toContain("munakata-taisha");
  });
});
