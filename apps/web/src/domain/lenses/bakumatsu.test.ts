import { describe, expect, it } from "vitest";

import { validClaimFixture } from "@/domain/knowledge/fixtures";

import { buildBakumatsuThreads, hasBakumatsuLensMaterial } from "./bakumatsu";

function claim(id: string, statement: string, places: string[]) {
  return {
    ...structuredClone(validClaimFixture),
    id,
    statement,
    places: places.map((name) => ({ name, role: "observed_place" as const })),
  };
}

describe("bakumatsu lens", () => {
  it("groups travel claims without inventing historical assertions", () => {
    const claims = [
      claim("claim-school", "明倫館で藩校への関心が深まった。", ["明倫館", "萩"]),
      claim("claim-industry", "萩反射炉と造船所跡を訪れた。", ["萩反射炉", "恵美須ヶ鼻造船所跡"]),
      claim("claim-person", "高杉晋作に関する展示を見た。", ["東行記念館"]),
    ];

    const threads = buildBakumatsuThreads(claims);
    expect(threads.map((thread) => thread.id)).toEqual([
      "education",
      "industry",
      "politics",
    ]);
    expect(threads[1].placeNames).toContain("萩反射炉");
    expect(hasBakumatsuLensMaterial(claims)).toBe(true);
  });
});
