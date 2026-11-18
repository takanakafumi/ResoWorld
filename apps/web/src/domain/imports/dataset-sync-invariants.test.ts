import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { ClaimSchema } from "../knowledge/schema";

describe("Dataset Bidirectional Sync & Security Invariants (Rule 19)", () => {
  const repoRoot = path.resolve(__dirname, "../../../../..");
  const localDatasetPath = path.resolve(repoRoot, "data/imports/tomono-review-draft.json");
  const localAtlasPath = path.resolve(repoRoot, "data/imports/review/travel-atlas.yamatai.json");
  const publishedDatasetPath = path.resolve(repoRoot, "apps/web/src/data/published-review-dataset.json");

  const FORBIDDEN_PATTERNS: ReadonlyArray<{ name: string; pattern: RegExp }> = [
    { name: "Windows user home path", pattern: /[A-Za-z]:\\\\?Users\\\\?/i },
    { name: "macOS user home path", pattern: /\/Users\/[a-z0-9._-]+/i },
    { name: "Local workstation username", pattern: /\bjet11\b/i },
    { name: "Gemini / Google API key literal", pattern: /\bAIza[0-9A-Za-z_-]{20,}/ },
    { name: "GitHub personal access token literal", pattern: /\b(?:ghp|gho|ghu|ghs)_[0-9A-Za-z]{20,}/ },
    { name: "Private env secret key identifier", pattern: /\b(?:GEMINI_API_KEY|OPENAI_API_KEY)\b\s*[:=]\s*["']?[A-Za-z0-9_-]{8,}/ },
  ];

  it("enforces 100% parity between master data/imports files and published-review-dataset.json", () => {
    expect(fs.existsSync(publishedDatasetPath), "published-review-dataset.json must exist").toBe(true);
    expect(fs.existsSync(localDatasetPath), "data/imports/tomono-review-draft.json must exist").toBe(true);
    expect(fs.existsSync(localAtlasPath), "data/imports/review/travel-atlas.yamatai.json must exist").toBe(true);

    const published = JSON.parse(fs.readFileSync(publishedDatasetPath, "utf8")) as {
      documents: unknown[];
      claims: unknown[];
      atlas: unknown;
    };
    const localDataset = JSON.parse(fs.readFileSync(localDatasetPath, "utf8")) as {
      documents: unknown[];
      claims: unknown[];
    };
    const localAtlas = JSON.parse(fs.readFileSync(localAtlasPath, "utf8")) as unknown;

    expect(localDataset.documents).toEqual(published.documents);
    expect(localDataset.claims).toEqual(published.claims);
    expect(localAtlas).toEqual(published.atlas);
  });

  it("verifies tracked dataset JSON files contain no local OS paths or secret tokens", () => {
    for (const filePath of [localDatasetPath, localAtlasPath, publishedDatasetPath]) {
      const raw = fs.readFileSync(filePath, "utf8");
      for (const { name, pattern } of FORBIDDEN_PATTERNS) {
        expect(pattern.test(raw), `${path.basename(filePath)} leaked ${name}`).toBe(false);
      }
    }
  });

  it("enforces Rule 9 & Rule 16: no spot kind or name contains status-polluting candidate vocabulary", () => {
    const published = JSON.parse(fs.readFileSync(publishedDatasetPath, "utf8")) as {
      atlas?: { spots?: Array<{ id: string; name: string; kind: string }> };
    };
    const spots = published.atlas?.spots ?? [];
    expect(spots.length).toBeGreaterThan(0);

    for (const spot of spots) {
      expect(
        /候補|未定|要確認/.test(spot.kind),
        `Spot ${spot.id} (${spot.name}) has status-polluting kind: "${spot.kind}"`,
      ).toBe(false);
      expect(
        /候補|未定|要確認/.test(spot.name),
        `Spot ${spot.id} has status-polluting name: "${spot.name}"`,
      ).toBe(false);
    }
  });

  it("enforces Issue #43: all published claims satisfy ClaimSchema and temporalScope × historicalTime orthogonality", () => {
    const published = JSON.parse(fs.readFileSync(publishedDatasetPath, "utf8")) as {
      claims: unknown[];
    };
    expect(published.claims.length).toBeGreaterThan(0);

    for (const rawClaim of published.claims) {
      const parsed = ClaimSchema.parse(rawClaim);
      if (parsed.temporalScope === "historical_target") {
        expect(parsed.historicalTime).not.toBeNull();
        if (parsed.historicalTime?.kind === "named") {
          expect(/^(?:旅の\d+日目|今回の三日間|現代・令和（現地観察）|現代)$/.test(parsed.historicalTime.label)).toBe(false);
        }
      } else {
        expect(parsed.historicalTime).toBeNull();
      }
    }
  });
});
