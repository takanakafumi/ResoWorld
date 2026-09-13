import { describe, expect, it } from "vitest";

import {
  ClaimExtractionJsonSchema,
  CLAIM_EXTRACTION_INSTRUCTIONS,
  CLAIM_EXTRACTION_PROMPT_VERSION,
} from "./prompt";

function assertStrictObjects(node: unknown) {
  if (Array.isArray(node)) {
    node.forEach(assertStrictObjects);
    return;
  }
  if (!node || typeof node !== "object") return;

  const schema = node as Record<string, unknown>;
  if (schema.type === "object") {
    const propertyNames = Object.keys(
      (schema.properties as Record<string, unknown> | undefined) ?? {},
    ).sort();
    const required = [...((schema.required as string[] | undefined) ?? [])].sort();
    expect(required).toEqual(propertyNames);
    expect(schema.additionalProperties).toBe(false);
  }
  Object.values(schema).forEach(assertStrictObjects);
}

describe("claim extraction prompt", () => {
  it("makes every object field required for strict Structured Outputs", () => {
    expect(ClaimExtractionJsonSchema).not.toHaveProperty("$schema");
    assertStrictObjects(ClaimExtractionJsonSchema);
  });

  it("keeps every explicitly visited place when a claim summarizes a list", () => {
    expect(CLAIM_EXTRACTION_PROMPT_VERSION).toBe("2026-09-13.1");
    expect(CLAIM_EXTRACTION_INSTRUCTIONS).toContain("placesへ1地点ずつ列挙");
    expect(CLAIM_EXTRACTION_INSTRUCTIONS).toContain("市町村などの代表地点だけへ丸めない");
    expect(CLAIM_EXTRACTION_INSTRUCTIONS).toContain("同じClaimのplacesへそれぞれ含める");
    expect(CLAIM_EXTRACTION_INSTRUCTIONS).toContain("intended_place");
  });
});
