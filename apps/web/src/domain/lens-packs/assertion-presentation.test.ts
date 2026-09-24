import { describe, expect, it } from "vitest";

import { miyajimaMisenSacredLandscapePack } from "./miyajima-misen-pack";
import {
  lensAssertionEvidenceSummaries,
  lensHistoricalTimeLabel,
} from "./assertion-presentation";

describe("lens assertion presentation", () => {
  it("formats exact, approximate, named, and unknown chronology", () => {
    expect(lensHistoricalTimeLabel({ kind: "calendar", label: "治承4年", startYear: 1180, approximate: false })).toBe("治承4年（1180年）");
    expect(lensHistoricalTimeLabel({ kind: "calendar", startYear: 200, endYear: 300, approximate: true })).toBe("約200–300年");
    expect(lensHistoricalTimeLabel({ kind: "named", label: "明治維新後", precision: "broad-range" })).toBe("明治維新後");
    expect(lensHistoricalTimeLabel({ kind: "unknown" })).toBe("時期不明");
  });

  it("deduplicates matching chronology and evidence summaries", () => {
    const relations = miyajimaMisenSacredLandscapePack.assertions.filter(
      (assertion) => assertion.id === "miyajima-024" || assertion.id === "miyajima-025",
    );

    expect(lensAssertionEvidenceSummaries(relations)).toEqual([
      "対象時期：治承4年（1180年） / 典拠：史料記述（現代資料による紹介）",
    ]);
  });

  it("omits assertions whose temporal and evidence metadata is unspecified", () => {
    expect(lensAssertionEvidenceSummaries([
      miyajimaMisenSacredLandscapePack.assertions.find(
        (assertion) => assertion.id === "miyajima-001",
      )!,
    ])).toEqual([]);
  });
});
