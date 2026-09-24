import { describe, expect, it } from "vitest";

import { orderSpotsByJourney } from "./journeys";
import type { ReviewAtlasSpot } from "./types";

const spots: ReviewAtlasSpot[] = [
  { id: "spot-a", name: "A", region: "R", kind: "K", latitude: 0, longitude: 0, claimIds: [] },
  { id: "spot-b", name: "B", region: "R", kind: "K", latitude: 1, longitude: 1, claimIds: [] },
  { id: "spot-c", name: "C", region: "R", kind: "K", latitude: 2, longitude: 2, claimIds: [] },
];

describe("orderSpotsByJourney", () => {
  it("preserves the reviewed Journey order instead of Atlas storage order", () => {
    expect(orderSpotsByJourney(spots, ["spot-c", "spot-a", "spot-b"]).map(({ id }) => id))
      .toEqual(["spot-c", "spot-a", "spot-b"]);
  });

  it("ignores unknown references so dataset diagnostics can report them separately", () => {
    expect(orderSpotsByJourney(spots, ["spot-b", "missing", "spot-a"]).map(({ id }) => id))
      .toEqual(["spot-b", "spot-a"]);
  });
});
