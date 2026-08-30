import { describe, expect, it } from "vitest";

import { buildCodexExplorationBrief } from "./codex-brief";

describe("buildCodexExplorationBrief", () => {
  it("contains the bounded research fields and no private graph identifiers", () => {
    const brief = buildCodexExplorationBrief({
      id: "suggestion-a",
      targetName: "候補A",
      actionType: "field_visit",
      question: "何がつながるか？",
      missingInformation: "比較資料",
      expectedObservation: "現地解説",
    });

    expect(brief).toContain("suggestion-a");
    expect(brief).toContain("何がつながるか？");
    expect(brief).toContain("出典URL");
    expect(brief).not.toContain("claimIds");
    expect(brief).not.toContain("anchorSpotIds");
    expect(brief).not.toContain("passage.quote");
  });
});
