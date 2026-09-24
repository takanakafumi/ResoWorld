import { describe, expect, it } from "vitest";

import { buildLensTimelineEntries } from "./assertion-presentation";
import { munakataOkinoshimaSacredLandscapePack } from "./munakata-okinoshima-pack";
import { projectLensPreset } from "./projection";

describe("munakataOkinoshimaSacredLandscapePack", () => {
  it("separates archaeological evidence from institutional history", () => {
    const timeline = projectLensPreset(munakataOkinoshimaSacredLandscapePack, "munakata-okinoshima-history");
    const entries = buildLensTimelineEntries(timeline.edges, timeline.nodes);

    expect(entries.map((entry) => entry.timeLabel)).toEqual([
      "4世紀～9世紀末（約300–899年）",
      "4世紀後半以降（約350–899年）",
      "古墳時代を中心とする対外交流期（約350–599年）",
      "寛平6年（894年）",
      "昭和8年（1933年）",
    ]);
    expect(entries[2].labels).toEqual(["ヤマト王権", "宗像氏"]);
    expect(new Set(timeline.edges.map((edge) => edge.evidenceBasis))).toEqual(
      new Set(["modern-documentation", "institutional-tradition"]),
    );
  });

  it("keeps current enshrinement outside the ancient ritual timeline", () => {
    const timeline = projectLensPreset(munakataOkinoshimaSacredLandscapePack, "munakata-okinoshima-history");
    const current = projectLensPreset(munakataOkinoshimaSacredLandscapePack, "munakata-three-shrines");

    expect(timeline.edges.some((edge) => edge.relationFamily === "enshrinement")).toBe(false);
    expect(current.edges.filter((edge) => edge.relationFamily === "enshrinement")).toHaveLength(3);
    expect(current.edges.every((edge) => edge.historicalTime === null)).toBe(true);
  });
});
