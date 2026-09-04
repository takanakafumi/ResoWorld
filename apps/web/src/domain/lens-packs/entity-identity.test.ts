import { describe, expect, it } from "vitest";

import { lensEntityNamesMatch } from "./entity-identity";

describe("lensEntityNamesMatch", () => {
  it("matches normalized aliases and qualified proper names", () => {
    expect(lensEntityNamesMatch("髙祖神社", "髙祖神社")).toBe(true);
    expect(lensEntityNamesMatch("宗像大社 辺津宮", "宗像大社")).toBe(true);
  });

  it("does not expand short regional names by substring", () => {
    expect(lensEntityNamesMatch("福岡", "福岡・博多平野周辺")).toBe(false);
    expect(lensEntityNamesMatch("山口", "山口県の政治史")).toBe(false);
    expect(lensEntityNamesMatch("萩", "萩反射炉")).toBe(false);
  });
});

