import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { buildCodexCompatibleSchema, buildCodexExtractionArgs } from "./codex";

describe("Codex CLI claim extraction", () => {
  it("uses an ephemeral read-only structured-output run", () => {
    expect(buildCodexExtractionArgs("schema.json", "output.json", "gpt-5.6-sol")).toEqual(
      expect.arrayContaining([
        "exec", "--ephemeral", "--ignore-user-config", "--sandbox", "read-only",
        "--model", "gpt-5.6-sol", "--output-schema", "schema.json",
        "--output-last-message", "output.json",
      ]),
    );
  });
  it("converts unsupported oneOf branches for structured output", () => {
    const schema = JSON.stringify(buildCodexCompatibleSchema());
    expect(schema).not.toContain('"oneOf"');
    expect(schema).toContain('"anyOf"');
    expect(schema).not.toContain('"format"');
  });
});
