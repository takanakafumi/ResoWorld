import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import {
  buildCodexCompatibleSchema,
  buildCodexExtractionArgs,
  resolveCodexExecutable,
} from "./codex";

describe("Codex CLI claim extraction", () => {
  it("uses an ephemeral read-only structured-output run", () => {
    expect(buildCodexExtractionArgs("schema.json", "output.json", "gpt-5.6-sol")).toEqual(
      expect.arrayContaining([
        "exec", "--ephemeral", "--ignore-user-config", "--sandbox", "read-only",
        "--model", "gpt-5.6-sol", "--output-schema", "schema.json",
        "--output-last-message", "output.json",
      ]),
    );
    expect(
      buildCodexExtractionArgs("schema.json", "output.json", "gpt-5.6-sol"),
    ).toContain('model_reasoning_effort="low"');
  });
  it("converts unsupported oneOf branches for structured output", () => {
    const schema = JSON.stringify(buildCodexCompatibleSchema());
    expect(schema).not.toContain('"oneOf"');
    expect(schema).toContain('"anyOf"');
    expect(schema).not.toContain('"format"');
  });
  it("falls back to the PATH command when a versioned app path disappeared", async () => {
    await expect(
      resolveCodexExecutable("Z:\missing-codex-version\codex.exe"),
    ).resolves.toBe("codex");
  });
});
