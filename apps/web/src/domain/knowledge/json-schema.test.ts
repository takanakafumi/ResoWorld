import { describe, expect, it } from "vitest";

import { KnowledgeDatasetJsonSchema } from "./json-schema";

describe("KnowledgeDatasetJsonSchema", () => {
  it("exports a Draft 2020-12 JSON Schema", () => {
    expect(KnowledgeDatasetJsonSchema.$schema).toBe(
      "https://json-schema.org/draft/2020-12/schema",
    );
    expect(KnowledgeDatasetJsonSchema.type).toBe("object");
    expect(KnowledgeDatasetJsonSchema.properties).toHaveProperty("claims");
  });
});
