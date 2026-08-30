import { describe, expect, it } from "vitest";

import { ClaimExtractionJsonSchema } from "./prompt";

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

describe("ClaimExtractionJsonSchema", () => {
  it("makes every object field required for strict Structured Outputs", () => {
    expect(ClaimExtractionJsonSchema).not.toHaveProperty("$schema");
    assertStrictObjects(ClaimExtractionJsonSchema);
  });
});

