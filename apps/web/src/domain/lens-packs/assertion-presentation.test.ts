import { describe, expect, it } from "vitest";

import { miyajimaMisenSacredLandscapePack } from "./miyajima-misen-pack";
import {
  buildLensTimelineEntries,
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

  it("orders timeline entries by editorial sequence without inventing dates", () => {
    const relations = miyajimaMisenSacredLandscapePack.assertions.filter(
      (assertion) => assertion.viewpointIds.includes("miyajima-shrine-history"),
    );

    expect(buildLensTimelineEntries(relations, miyajimaMisenSacredLandscapePack.entities)
      .map(({ timeLabel, labels }) => [timeLabel, labels[0]])).toEqual([
      ["平清盛在世期", "平清盛による日吉山王の勧請"],
      ["治承4年（1180年）", "高倉上皇の滝宮神社参詣（1180年）"],
      ["明治維新以前", "粟島神社"],
      ["明治維新後", "粟島神社の現在地への移転（明治維新後）"],
    ]);
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
